/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IdentityProvider, User } from '@authup/core-kit';
import { MappingSynchronizationMode, isValidUserEmail, isValidUserName } from '@authup/core-kit';
import type { JWTClaims } from '@authup/kit';
import {
    createNanoID,
    hasOwnProperty,
    toArray,
    toArrayElement,
} from '@authup/kit';
import { clone, isObject } from 'smob';
import type { DataSource, Repository } from 'typeorm';
import type { IdentityProviderFlowIdentity } from '../identity-provider';
import { IdentityProviderAttributeMappingEntity } from '../identity-provider-attribute-mapping';
import { IdentityProviderPermissionMappingEntity } from '../identity-provider-permission-mapping';
import { IdentityProviderRoleMappingEntity } from '../identity-provider-role-mapping';
import type { UserEntity } from '../user';
import { UserRepository } from '../user';
import { IdentityProviderAccountEntity } from './entity';

type UserCreateContext = {
    names: string[],
    emails: string[]
};

type ClaimAttribute = {
    value: string[] | string,
    mode?: `${MappingSynchronizationMode}` | null
};

export class IdentityProviderAccountManger {
    protected dataSource : DataSource;

    protected provider : IdentityProvider;

    protected userRepository: UserRepository;

    protected userAttributes : (keyof User)[] = [
        'first_name',
        'last_name',
        'avatar',
        'cover',
        'display_name',
    ];

    protected providerAccountRepository : Repository<IdentityProviderAccountEntity>;

    constructor(
        dataSource: DataSource,
        provider: IdentityProvider,
    ) {
        this.dataSource = dataSource;
        this.provider = provider;

        this.userRepository = new UserRepository(dataSource);
        this.providerAccountRepository = dataSource.getRepository(IdentityProviderAccountEntity);
    }

    async saveByIdentity(identity: IdentityProviderFlowIdentity) : Promise<IdentityProviderAccountEntity> {
        let account = await this.providerAccountRepository.findOne({
            where: {
                provider_user_id: identity.id,
                provider_id: this.provider.id,
            },
            relations: ['user'],
        });

        let user : UserEntity;

        if (account) {
            user = await this.updateUserByIdentity(account.user, identity);
        } else {
            user = await this.createUserFromIdentity(identity);

            account = this.providerAccountRepository.create({
                provider_id: this.provider.id,
                provider_user_id: identity.id,
                provider_user_name: user.name, // todo: parse identity.name
                user_id: user.id,
                user,
            });
        }

        await this.saveRoles(user.id, identity);
        await this.savePermissions(user.id, identity);

        return account;
    }

    protected async saveRoles(userId: string, identity: IdentityProviderFlowIdentity) {
        const providerRoleRepository = this.dataSource.getRepository(IdentityProviderRoleMappingEntity);
        const entities = await providerRoleRepository.findBy({
            provider_id: this.provider.id,
        });

        const roleIds : string[] = [];
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            if (!entity.name || !entity.value) {
                roleIds.push(entity.role_id);
                continue;
            }

            const value = this.getMappingValueByClaims(
                identity.claims,
                entity.name,
                entity.value,
                entity.value_is_regex,
            );

            if (value) {
                if (Array.isArray(value)) {
                    if (value.length > 0) {
                        roleIds.push(entity.role_id);
                    }
                } else {
                    roleIds.push(entity.role_id);
                }

                continue;
            }

            if (entity.synchronization_mode === MappingSynchronizationMode.ONCE) {
                roleIds.push(entity.role_id);
            }
        }

        if (roleIds.length > 0) {
            await this.userRepository.syncRoles(
                userId,
                roleIds,
            );
        }
    }

    protected async savePermissions(userId: string, identity: IdentityProviderFlowIdentity) {
        const providerRoleRepository = this.dataSource.getRepository(IdentityProviderPermissionMappingEntity);
        const entities = await providerRoleRepository.findBy({
            provider_id: this.provider.id,
        });

        const ids : string[] = [];
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            if (!entity.name || !entity.value) {
                ids.push(entity.permission_id);
                continue;
            }

            const value = this.getMappingValueByClaims(
                identity.claims,
                entity.name,
                entity.value,
                entity.value_is_regex,
            );

            if (value) {
                if (Array.isArray(value)) {
                    if (value.length > 0) {
                        ids.push(entity.permission_id);
                    }
                } else {
                    ids.push(entity.permission_id);
                }

                continue;
            }

            if (entity.synchronization_mode === MappingSynchronizationMode.ONCE) {
                ids.push(entity.permission_id);
            }
        }

        if (ids.length > 0) {
            await this.userRepository.syncPermissions(
                userId,
                ids,
            );
        }
    }

    protected async getAttributesFromIdentity(identity: IdentityProviderFlowIdentity) : Promise<Record<string, ClaimAttribute>> {
        const repository = this.dataSource.getRepository(IdentityProviderAttributeMappingEntity);
        const entities = await repository.findBy({
            provider_id: this.provider.id,
        });

        const attributes : Record<string, ClaimAttribute> = {};

        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];

            const claimValues = this.getMappingValueByClaims(
                identity.claims,
                entity.source_name,
                entity.source_value,
                entity.source_value_is_regex,
            );

            if (!claimValues) {
                continue;
            }

            if (entity.target_value) {
                attributes[entity.target_name] = {
                    value: [entity.target_value],
                    mode: entity.synchronization_mode,
                };
            } else {
                attributes[entity.target_name] = {
                    value: claimValues,
                    mode: entity.synchronization_mode,
                };
            }
        }

        return attributes;
    }

    protected async updateUserByIdentity(user: UserEntity, identity: IdentityProviderFlowIdentity) : Promise<UserEntity> {
        const claimAttributes = await this.getAttributesFromIdentity(identity);
        const extra = await this.userRepository.findExtraAttributesByPrimaryColumn(user.id);

        const columnNames = this.userRepository.metadata.columns.map(
            (column) => column.propertyName,
        );

        const claimAttributeKeys = Object.keys(claimAttributes);
        for (let i = 0; i < claimAttributeKeys.length; i++) {
            const attributeKey = claimAttributeKeys[i];
            const attribute = claimAttributes[attributeKey];

            const mode = attribute.mode || MappingSynchronizationMode.ALWAYS;

            const index = columnNames.indexOf(attributeKey);
            if (index === -1) {
                if (extra[attributeKey]) {
                    if (mode === MappingSynchronizationMode.ONCE) {
                        continue;
                    }
                }

                // todo: run validation on attribute value
                extra[attributeKey] = toArrayElement(attribute.value);
            } else {
                const isAllowed = this.userAttributes.includes(attributeKey);
                if (!isAllowed) {
                    continue;
                }

                if (user[attributeKey]) {
                    if (mode === MappingSynchronizationMode.ONCE) {
                        continue;
                    }
                }

                // todo: run validation on attribute value
                user[attributeKey] = toArrayElement(attribute.value);
            }
        }

        await this.userRepository.saveWithAttributes(user, extra);

        return user;
    }

    protected async createUserFromIdentity(
        identity: IdentityProviderFlowIdentity,
    ) : Promise<UserEntity> {
        const claimAttributes = await this.getAttributesFromIdentity(identity);

        const names = toArray(identity.name);
        const mails = toArray(identity.email);

        const columnNames = this.userRepository.metadata.columns.map(
            (column) => column.propertyName,
        );

        const user = this.userRepository.create({});
        const extra : Record<string, any> = {};

        const claimAttributeKeys = Object.keys(claimAttributes);
        for (let i = 0; i < claimAttributeKeys.length; i++) {
            const attributeKey = claimAttributeKeys[i];
            const attribute = claimAttributes[attributeKey];

            const index = columnNames.indexOf(attributeKey);
            if (index === -1) {
                // todo: run validation on attribute value
                extra[attributeKey] = toArrayElement(attribute.value);
            } else {
                const isAllowed = this.userAttributes.includes(attributeKey);
                if (!isAllowed) {
                    continue;
                }

                switch (attributeKey) {
                    case 'name': {
                        if (Array.isArray(attribute.value)) {
                            names.push(...attribute.value);
                        } else {
                            names.push(attribute.value);
                        }
                        break;
                    }
                    case 'email': {
                        if (Array.isArray(attribute.value)) {
                            mails.push(...attribute.value);
                        } else {
                            mails.push(attribute.value);
                        }
                        break;
                    }
                    default: {
                        // todo: run validation on attribute value
                        user[attributeKey] = toArrayElement(attribute.value);
                        break;
                    }
                }
            }
        }

        return this.tryToCreateUser(user, extra, {
            names,
            emails: mails,
        });
    }

    protected async tryToCreateUser(
        user: UserEntity,
        extraAttributes: Record<string, any>,
        context: UserCreateContext,
    ) {
        while (!user.name && context.names.length > 0) {
            if (isValidUserName(context.names[0])) {
                [user.name] = context.names;
                break;
            }

            context.names.shift();
        }

        let nameLocked = true;
        if (!user.name) {
            user.name = createNanoID('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_', 30);
            nameLocked = false;
        }

        while (!user.email && context.emails.length > 0) {
            if (isValidUserEmail(context.emails[0])) {
                [user.email] = context.emails;
                break;
            }

            context.emails.shift();
        }

        // todo: if base.email or base.name is undefined, throw error

        try {
            user.display_name = user.display_name || user.name;
            user.name_locked = nameLocked;
            user.realm_id = this.provider.realm_id;
            user.active = true;

            await this.userRepository.saveWithAttributes(user, extraAttributes);

            return user;
        } catch (e) {
            if (isObject(e)) {
                const code : string | undefined = hasOwnProperty(e, 'code') && typeof e.code === 'string' ?
                    e.code :
                    undefined;

                if (
                    code === 'ER_DUP_ENTRY' ||
                    code === 'SQLITE_CONSTRAINT_UNIQUE'
                ) {
                    user.name = undefined;
                    return this.tryToCreateUser(user, extraAttributes, context);
                }
            }

            throw e;
        }
    }

    private getMappingValueByClaims(
        claims: JWTClaims,
        mappingKey: string,
        mappingValue?: string,
        mappingValueIsRegex?: boolean,
    ) : string | string[] | undefined {
        const path = mappingKey.split('\\.');
        let raw = clone(claims);
        for (let i = 0; i < path.length; i++) {
            if (!isObject(raw)) {
                continue;
            }
            raw = raw[path[i]];
        }

        if (!raw) {
            return undefined;
        }

        let value : string | string[];
        if (Array.isArray(raw)) {
            value = raw.filter(Boolean)
                .map((r) => `${r}`);
        } else {
            value = `${raw}`;
        }

        if (!mappingValue) {
            return value;
        }

        if (mappingValueIsRegex) {
            const regex = new RegExp(mappingValue);
            if (Array.isArray(value)) {
                const output : string[] = [];

                for (let j = 0; j < value.length; j++) {
                    if (regex.test(value[j])) {
                        output.push(value[j]);
                    }
                }

                return output;
            }

            if (regex.test(value)) {
                return value;
            }

            return undefined;
        }

        if (Array.isArray(value)) {
            const output : string[] = [];

            for (let j = 0; j < value.length; j++) {
                if (value[j] === mappingValue) {
                    output.push(value[j]);
                }
            }

            return output;
        }

        if (value === mappingValue) {
            return value;
        }

        return undefined;
    }
}

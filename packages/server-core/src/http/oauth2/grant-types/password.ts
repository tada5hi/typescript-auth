/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { OAuth2TokenGrantResponse } from '@authup/specs';
import { OAuth2SubKind } from '@authup/specs';
import type { IdentityProviderAccount } from '@authup/core-kit';
import {
    IdentityProviderProtocol, ScopeName, UserError,
} from '@authup/core-kit';
import { useRequestBody } from '@routup/basic/body';
import type { Request } from 'routup';
import { getRequestIP, useRequestParam } from 'routup';
import type { FindOptionsWhere } from 'typeorm';
import { useDataSource } from 'typeorm-extension';
import type {
    IdentityProviderEntity,
} from '../../../database/domains';
import type {
    IdentityProviderIdentity,
    LdapIdentityProviderFlowOptions,
} from '../../../domains';
import {
    IdentityProviderRepository,
    UserEntity,
    UserRepository,
    resolveRealm,
} from '../../../database/domains';
import {
    LdapIdentityProviderFlow,
} from '../../../domains';
import { IdentityProviderAccountService } from '../../../services';
import { buildOAuth2BearerTokenResponse } from '../response';
import { AbstractGrant } from './abstract';
import type { Grant } from './type';

export class PasswordGrantType extends AbstractGrant implements Grant {
    async run(request: Request) : Promise<OAuth2TokenGrantResponse> {
        const user = await this.validate(request);

        const {
            token: accessToken,
            payload: accessTokenPayload,
        } = await this.issueAccessToken({
            remoteAddress: getRequestIP(request, { trustProxy: true }),
            scope: ScopeName.GLOBAL,
            sub: user.id,
            subKind: OAuth2SubKind.USER,
            realmId: user.realm.id,
            realmName: user.realm.name,
        });

        const {
            token: refreshToken,
            payload: refreshTokenPayload,
        } = await this.issueRefreshToken(accessTokenPayload);

        return buildOAuth2BearerTokenResponse({
            accessToken,
            accessTokenPayload,
            refreshToken,
            refreshTokenPayload,
        });
    }

    async validate(request: Request) : Promise<UserEntity> {
        const { username, password, realm_id: requestRealmId } = useRequestBody(request);

        const realm = await resolveRealm(
            useRequestParam(request, 'realmId') || requestRealmId,
        );

        const dataSource = await useDataSource();
        const repository = new UserRepository(dataSource);
        let realmId : undefined | string;
        if (realm && realm.id) {
            realmId = realm.id;
        }

        let entity = await repository.verifyCredentials(
            username,
            password,
            realmId,
        );

        if (!entity) {
            entity = await this.verifyCredentialsByLDAP(username, password, realmId);
        }

        if (!entity) {
            throw UserError.credentialsInvalid();
        }

        if (!entity.active) {
            throw UserError.inactive();
        }

        return entity;
    }

    protected async verifyCredentialsByLDAP(user: string, password: string, realmId?: string) : Promise<UserEntity> {
        const dataSource = await useDataSource();
        const repository = new IdentityProviderRepository(dataSource);

        const where: FindOptionsWhere<IdentityProviderEntity> = {
            protocol: IdentityProviderProtocol.LDAP,
        };

        if (realmId) {
            where.realm_id = realmId;
        }

        const entities = await repository.findManyWithEA<LdapIdentityProviderFlowOptions>(
            {
                where,
            },
        );

        let manager : IdentityProviderAccountService | undefined;
        let account : IdentityProviderAccount | undefined;
        let identity: IdentityProviderIdentity | undefined;

        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];

            if (entity.protocol !== IdentityProviderProtocol.LDAP) {
                continue;
            }

            const flow = new LdapIdentityProviderFlow(entity);

            try {
                identity = await flow.getIdentityForCredentials(user, password);
                await flow.unbind();
            } catch (e) {
                await flow.unbind();
                continue;
            }

            manager = new IdentityProviderAccountService(dataSource, entity);
            account = await manager.save(identity);
            break;
        }

        if (!account) {
            return undefined;
        }

        if (
            account.user &&
            account.user.realm
        ) {
            return account.user as UserEntity;
        }

        const userRepository = dataSource.getRepository(UserEntity);

        return userRepository.findOne({
            where: {
                id: account.user_id,
            },
            relations: ['realm'],
        });
    }
}

/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionName } from '@authup/core-kit';
import { useRequestQuery } from '@routup/basic/query';
import type { Request, Response } from 'routup';
import { send } from 'routup';
import {
    applyQuery, useDataSource,
} from 'typeorm-extension';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { RolePermissionEntity } from '../../../../domains';
import { useRequestEnv, useRequestParamID } from '../../../request';

/**
 * Receive user permissions of a specific user.
 *
 * @param req
 * @param res
 */
export async function getManyRolePermissionRouteHandler(req: Request, res: Response) : Promise<any> {
    const ability = useRequestEnv(req, 'abilities');
    const hasAbility = await ability.hasOneOf([
        PermissionName.ROLE_PERMISSION_DELETE,
        PermissionName.ROLE_PERMISSION_READ,
    ]);
    if (!hasAbility) {
        throw new ForbiddenError();
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(RolePermissionEntity);
    const query = repository.createQueryBuilder('rolePermission');

    const { pagination } = applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'rolePermission',
        filters: {
            allowed: ['role_id', 'permission_id'],
        },
        pagination: {
            maxLimit: 50,
        },
    });

    const [entities, total] = await query.getManyAndCount();

    return send(res, {
        data: entities,
        meta: {
            total,
            ...pagination,
        },
    });
}

// ---------------------------------------------------------------------------------

/**
 * Receive a specific permission of a specific user.
 *
 * @param req
 * @param res
 */
export async function getOneRolePermissionRouteHandler(req: Request, res: Response) : Promise<any> {
    const ability = useRequestEnv(req, 'abilities');
    const hasAbility = await ability.hasOneOf([
        PermissionName.ROLE_PERMISSION_DELETE,
        PermissionName.ROLE_PERMISSION_READ,
    ]);
    if (!hasAbility) {
        throw new ForbiddenError();
    }

    const id = useRequestParamID(req);

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(RolePermissionEntity);
    const entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    return send(res, entity);
}

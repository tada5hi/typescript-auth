/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    applyQuery, useDataSource,
} from 'typeorm-extension';
import { NotFoundError } from '@ebec/http';
import { ExpressRequest, ExpressResponse } from '../../../type';
import { UserPermissionEntity } from '../../../../domains';

/**
 * Receive user permissions of a specific user.
 *
 * @param req
 * @param res
 */
export async function getManyUserPermissionRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const dataSource = await useDataSource();
    const robotPermissionRepository = dataSource.getRepository(UserPermissionEntity);
    const query = robotPermissionRepository.createQueryBuilder('userPermission');

    const { pagination } = applyQuery(query, req.query, {
        defaultAlias: 'userPermission',
        filters: {
            allowed: ['user_id', 'permission_id'],
        },
        pagination: {
            maxLimit: 50,
        },
    });

    const [entities, total] = await query.getManyAndCount();

    return res.respond({
        data: {
            data: entities,
            meta: {
                total,
                ...pagination,
            },
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
export async function getOneUserPermissionRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    const dataSource = await useDataSource();
    const robotPermissionRepository = dataSource.getRepository(UserPermissionEntity);
    const entity = await robotPermissionRepository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    return res.respond({ data: entity });
}

/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isPropertySet } from '@authup/kit';
import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionName, isRealmResourceWritable } from '@authup/core-kit';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { enforceUniquenessForDatabaseEntity } from '../../../../database';
import { ClientEntity } from '../../../../domains';
import { useRequestEnv } from '../../../utils';
import { buildRequestValidationErrorMessage } from '../../../validation';
import { ClientRequestValidator } from '../utils';
import { RequestHandlerOperation } from '../../../request';

export async function updateClientRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const ability = useRequestEnv(req, 'abilities');
    if (!ability.has(PermissionName.CLIENT_EDIT)) {
        throw new ForbiddenError();
    }

    const validator = new ClientRequestValidator();
    const data = await validator.execute(req, {
        group: RequestHandlerOperation.UPDATE,
    });

    if (isPropertySet(data, 'realm_id')) {
        if (!isRealmResourceWritable(useRequestEnv(req, 'realm'), data.realm_id)) {
            throw new BadRequestError(buildRequestValidationErrorMessage('realm_id'));
        }
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ClientEntity);

    let entity = await repository.findOneBy({ id });
    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.realm_id)) {
        throw new ForbiddenError();
    }

    await enforceUniquenessForDatabaseEntity(ClientEntity, data, {
        id: entity.id,
    });

    entity = repository.merge(entity, data);

    await repository.save(entity);

    return sendAccepted(res, entity);
}

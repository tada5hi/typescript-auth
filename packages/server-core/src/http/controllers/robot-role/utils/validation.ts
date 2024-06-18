/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, validationResult } from 'express-validator';
import type { Request } from 'routup';
import type { RobotRoleEntity } from '../../../../domains';
import { RobotEntity, RoleEntity } from '../../../../domains';
import type { ExpressValidationResult } from '../../../validation';
import {
    RequestValidationError,
    extendExpressValidationResultWithRelation,
    initExpressValidationResult, matchedValidationData,
} from '../../../validation';
import { RequestHandlerOperation } from '../../../request';

export async function runRobotRoleValidation(
    req: Request,
    operation: `${RequestHandlerOperation.CREATE}` | `${RequestHandlerOperation.UPDATE}`,
) : Promise<ExpressValidationResult<RobotRoleEntity>> {
    const result : ExpressValidationResult<RobotRoleEntity> = initExpressValidationResult();

    if (operation === RequestHandlerOperation.CREATE) {
        await check('robot_id')
            .exists()
            .isUUID()
            .run(req);

        await check('role_id')
            .exists()
            .isUUID()
            .run(req);
    }

    // ----------------------------------------------

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new RequestValidationError(validation);
    }

    result.data = matchedValidationData(req, { includeOptionals: true });

    // ----------------------------------------------

    await extendExpressValidationResultWithRelation(result, RoleEntity, {
        id: 'role_realm_id',
        entity: 'role',
    });

    await extendExpressValidationResultWithRelation(result, RobotEntity, {
        id: 'robot_id',
        entity: 'robot',
    });

    // ----------------------------------------------

    return result;
}

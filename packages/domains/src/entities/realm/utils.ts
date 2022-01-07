/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Brackets, SelectQueryBuilder } from 'typeorm';
import { MASTER_REALM_ID } from './constants';

export function onlyRealmPermittedQueryResources<T>(
    query: SelectQueryBuilder<T>,
    realmId: string,
    queryField: string | string[] = 'realm_id',
) : void {
    if (realmId === MASTER_REALM_ID) return;

    query.andWhere(new Brackets((qb) => {
        if (Array.isArray(queryField)) {
            for (let i = 0; i < queryField.length; i++) {
                qb.orWhere(`${queryField[i]} = :realm${i}`, { [`realm${i}`]: realmId });
            }
        } else {
            qb.where(`${queryField} = :realm`, { realm: realmId });
        }
    }));
}

/**
 * Check if owner realm is permitted for resource realm.
 *
 * @param realmId
 * @param resourceRealmId
 */
export function isPermittedForResourceRealm(
    realmId?: string,
    resourceRealmId?: string,
) : boolean {
    if (!realmId) return false;

    if (realmId === MASTER_REALM_ID) return true;

    return realmId === resourceRealmId;
}

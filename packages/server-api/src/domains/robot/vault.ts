/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Robot } from '@authup/core';
import {
    hasClient,
    hasClientFailedWithStausCode,
    useClient,
} from '@hapic/vault';

export async function createRobotVaultEngine() {
    if (!hasClient()) {
        return;
    }

    const client = useClient();

    await client.mount.create({
        path: 'robots',
        data: {
            type: 'kv',
            options: {
                version: 1,
            },
        },
    });
}

export async function saveRobotCredentialsToVault(entity: Pick<Robot, 'id' | 'secret' | 'name'>) {
    if (!hasClient()) {
        return;
    }

    const client = useClient();

    try {
        await client.keyValueV1.create({
            mount: 'robots',
            path: entity.name,
            data: {
                id: entity.id,
                secret: entity.secret,
            },
        });
    } catch (e) {
        if (hasClientFailedWithStausCode(e, 404)) {
            await createRobotVaultEngine();
            return;
        }

        throw e;
    }
}

export async function removeRobotCredentialsFromVault(entity: Pick<Robot, 'name'>) {
    if (!hasClient()) {
        return;
    }

    const client = useClient();

    try {
        await client.keyValueV1.delete({
            mount: 'robots',
            path: entity.name,
        });
    } catch (e) {
        if (hasClientFailedWithStausCode(e, 404)) {
            return;
        }

        throw e;
    }
}

export async function findRobotCredentialsInVault(
    entity: Pick<Robot, 'name'>,
) : Promise<Pick<Robot, 'id' | 'secret'> | undefined> {
    if (!hasClient()) {
        return undefined;
    }

    const client = useClient();

    try {
        const response = await client.keyValueV1.getOne({
            mount: 'robots',
            path: entity.name,
        });
        if (response && response.data) {
            return response.data as Robot;
        }

        return undefined;
    } catch (e) {
        if (hasClientFailedWithStausCode(e, 404)) {
            return undefined;
        }

        throw e;
    }
}

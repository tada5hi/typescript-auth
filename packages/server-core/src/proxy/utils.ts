/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Agent } from 'https';
import { parseProxyConnectionString } from '@authup/core';
import { getProxyForUrl } from 'proxy-from-env';
import { ProxyClient } from './module';

type ClientOptions = {
    agent?: ((url: URL) => Agent) | Agent
};

export async function buildHTTPClientConfigForProxy(
    url: string,
) : Promise<ClientOptions> {
    const connectionString = getProxyForUrl(url);
    if (connectionString) {
        const connectionDetails = parseProxyConnectionString(connectionString);
        const proxyClient = new ProxyClient({
            host: connectionDetails.host,
            port: connectionDetails.port || 3128,
            ...(connectionDetails.auth.username ? { user: connectionDetails.auth.username } : {}),
            ...(connectionDetails.auth.password ? { password: connectionDetails.auth.password } : {}),
        });

        const agent = await proxyClient.createAgent(url);

        return {
            agent,
        };
    }

    return {};
}

/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildConfig } from '@authup/client-web-config';
import { Container } from '@authup/config';
import { defineNuxtModule } from 'nuxt/kit';

export default defineNuxtModule({
    meta: {
        name: 'config',
    },
    setup: async (_options, nuxt) => {
        const container = new Container();
        await container.loadFromPath(nuxt.options.rootDir);

        const config = buildConfig({
            data: container.get({
                group: 'client',
                id: 'web',
            }),
            env: true,
        });

        if (config.apiUrl) {
            nuxt.options.runtimeConfig.public.apiUrl = config.apiUrl;
        }

        if (config.publicUrl) {
            nuxt.options.runtimeConfig.public.publicUrl = config.publicUrl;
        }
    },
});

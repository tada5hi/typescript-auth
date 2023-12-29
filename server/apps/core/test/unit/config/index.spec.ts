/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    unsetConfig, useConfig,
} from '../../../src';

describe('src/config/*.ts', () => {
    it('should set & use config', async () => {
        const config = useConfig();

        expect(config).toBeDefined();
        expect(config.middlewareBody).toBeTruthy();

        config.middlewareBody = false;

        expect(config).toBeDefined();
        expect(config.middlewareBody).toBeFalsy();

        unsetConfig();
    });
});

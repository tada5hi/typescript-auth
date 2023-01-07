/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Router, send } from 'routup';
import cors from 'cors';
import { createMetricsRouteHandler, registerControllers } from '../controllers';

import { errorMiddleware, registerMiddlewares } from '../middleware';

export function createRouter() : Router {
    const router = new Router();

    router.use(cors({
        origin(origin, callback) {
            callback(null, true);
        },
        credentials: true,
    }));

    router.get('/metrics', createMetricsRouteHandler);

    registerMiddlewares(router);
    registerControllers(router);

    // needs to be last :/
    router.use(errorMiddleware);

    return router;
}

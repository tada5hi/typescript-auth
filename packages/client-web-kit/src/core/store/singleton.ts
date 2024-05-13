/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Pinia } from 'pinia';
import type { App } from 'vue';
import { inject } from '../inject';
import { provide } from '../provide';
import type { Store, StoreDefinition } from './types';

export const StoreSymbol = Symbol.for('AuthupStore');

export function useStore(pinia?: Pinia, app?: App) : Store {
    const instance = injectStore(app);
    if (!instance) {
        throw new Error('The store has not been injected in the app context.');
    }

    return instance(pinia);
}

export function injectStore(app?: App) : StoreDefinition {
    const instance = inject<StoreDefinition>(StoreSymbol, app);
    if (!instance) {
        throw new Error('The store has not been injected in the app context.');
    }

    return instance;
}

export function hasStore(app?: App) : boolean {
    return !!inject(StoreSymbol, app);
}

export function provideStore(store: StoreDefinition, app?: App) {
    provide(StoreSymbol, store, app);
}

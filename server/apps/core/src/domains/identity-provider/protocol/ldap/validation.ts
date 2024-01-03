/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { LdapIdentityProvider } from '@authup/core';
import type { Request } from 'routup';

export function validateLdapIdentityProviderProtocol(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    req: Request,
) : LdapIdentityProvider {
    throw new Error('Not implemented');
}

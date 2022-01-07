/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum PermissionID {
    PERMISSION_MANAGE = 'permission_manage',

    CLIENT_ADD = 'client_add',
    CLIENT_DROP = 'client_drop',
    CLIENT_EDIT = 'client_edit',

    REALM_ADD = 'realm_add',
    REALM_DROP = 'realm_drop',
    REALM_EDIT = 'realm_edit',

    USER_ADD = 'user_add',
    USER_DROP = 'user_drop',
    USER_EDIT = 'user_edit',

    USER_PERMISSION_ADD = 'user_permission_add',
    USER_PERMISSION_DROP = 'user_permission_drop',

    USER_ROLE_ADD = 'user_role_add',
    USER_ROLE_DROP = 'user_role_drop',
    USER_ROLE_EDIT = 'user_role_edit',

    ROLE_ADD = 'role_add',
    ROLE_DROP = 'role_drop',
    ROLE_EDIT = 'role_edit',

    ROLE_PERMISSION_ADD = 'role_permission_add',
    ROLE_PERMISSION_DROP = 'role_permission_drop',

    PROVIDER_ADD = 'provider_add',
    PROVIDER_DROP = 'provider_drop',
    PROVIDER_EDIT = 'provider_edit',
}

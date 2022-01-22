/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/* istanbul ignore next */
import {
    OAuth2AccessTokenGrant,
    OAuth2ServerError, Oauth2TokenResponse,
} from '@typescript-auth/domains';
import { ExpressRequest, ExpressResponse } from '../../../type';
import { TokenRouteCreateContext } from './type';
import { determineRequestTokenGrantType } from '../../../oauth2/grant-types/utils/determine';
import { Grant, GrantContext } from '../../../oauth2/grant-types/type';
import { PasswordGrantType, RobotCredentialsGrantType } from '../../../oauth2';
import { RefreshTokenGrantType } from '../../../oauth2/grant-types/refresh-token';

export async function createTokenRouteHandler(
    req: ExpressRequest,
    res: ExpressResponse,
    context: TokenRouteCreateContext,
) : Promise<any> {
    const grantType = determineRequestTokenGrantType(req);
    if (!grantType) {
        throw OAuth2ServerError.invalidGrant();
    }

    let grant : Grant | undefined;

    const grantContext : GrantContext = {
        request: req,
        selfUrl: context.selfUrl,
        keyPairOptions: {
            directory: context.writableDirectoryPath,
        },

    };
    switch (grantType) {
        case OAuth2AccessTokenGrant.ROBOT_CREDENTIALS: {
            grant = new RobotCredentialsGrantType(grantContext);
            break;
        }
        case OAuth2AccessTokenGrant.PASSWORD: {
            grant = new PasswordGrantType(grantContext);
            break;
        }
        case OAuth2AccessTokenGrant.REFRESH_TOKEN: {
            grant = new RefreshTokenGrantType(grantContext);
            break;
        }
    }

    const tokenResponse : Oauth2TokenResponse = await grant.run();

    return res.respond({
        data: tokenResponse,
    });
}

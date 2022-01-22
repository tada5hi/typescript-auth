/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    OAuth2AccessTokenSubKind, OAuth2ServerError,
    Oauth2TokenResponse,
} from '@typescript-auth/domains';
import { getCustomRepository } from 'typeorm';
import { AbstractGrant } from './abstract-grant';
import { UserEntity, UserRepository } from '../../../domains';
import { OAuth2BearerTokenResponse } from '../response';
import { Grant } from './type';

export class PasswordGrantType extends AbstractGrant implements Grant {
    async run() : Promise<Oauth2TokenResponse> {
        const user = await this.validate();

        const accessToken = await this.issueAccessToken({
            entity: {
                type: OAuth2AccessTokenSubKind.USER,
                data: user,
            },
        });

        const refreshToken = await this.issueRefreshToken(accessToken);

        const response = new OAuth2BearerTokenResponse({
            accessToken,
            refreshToken,
            keyPairOptions: this.context.keyPairOptions,
        });

        return response.build();
    }

    async validate() : Promise<UserEntity> {
        const { username, password } = this.context.request.body;

        const repository = getCustomRepository<UserRepository>(UserRepository);

        const entity = await repository.verifyCredentials(username, password);

        if (typeof entity === 'undefined') {
            throw OAuth2ServerError.invalidCredentials();
        }

        return entity;
    }
}

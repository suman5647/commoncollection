import { v1 as uuidv1 } from 'uuid';
import * as jwt from 'jsonwebtoken';
import { keys } from '../config/keys';
import { User } from '../data/user';
import * as _ from 'lodash';

export class JwtAuthUtil {

    async refreshToken(apiToken: string) {
        if (!apiToken) {
            let status = 403;
            let message = 'missing authorization header';
            return { status: status, message: message };
        }
        var loginRequest: any = await this.verifyToken(apiToken);
        if (!loginRequest) {
            let status = 403;
            let message = 'Forbidden';
            return { status: status, message: message };
        }
        return await this.CreateTokens(loginRequest);
    }

    async issueToken(userObj: User) {
        try {
            var res = this.CreateTokens(userObj);
            return res;
        }
        catch (err) {
            throw err;
        }
    }

    async emailToken(userObj: User) {
        try {
            var res = this.createEmailToken(userObj);
            return res;
        }
        catch (err) {
            throw err;
        }
    }

    async forgotToken(userObj: User) {
        try {
            var res = this.createForgotPwdToken(userObj);
            return res;
        }
        catch (err) {
            throw err;
        }
    }

    async verifyToken(apiToken: string) {
        try {
            return jwt.verify(apiToken, keys.jwt.secret);
        }
        catch (err) {
            return;
        }
    }

    //createTokens will create both issueToken and refreshToken
    private CreateTokens(user: User) {
        const GUID_access = uuidv1();
        const iat_val = Math.floor(Date.now() / 1000);
        const exp_val = Math.floor(Date.now() / 1000) + (60 * 60 * 8); // 8 hrs from now  
        var issueTokenClaims = {
            tenantId: user.tenantId ? user.tenantId : 'cc',
            email: user.email,
            role: user.role,
            language: user.language,
            nbf: iat_val,
            iat: iat_val,
            exp: exp_val,
            sub: "access",
            iss: "cc",
            aud: "cc",
            jti: GUID_access
        }

        const refresh_exp_val = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30); // 30 days from now
        const GUID_refresh = uuidv1();
        const refreshTokenClaims = {
            tenantId: user.tenantId ? user.tenantId : 'cc',
            email: user.email,
            role: user.role,
            language: user.language,
            nbf: iat_val,
            iat: iat_val,
            exp: refresh_exp_val,
            sub: "refresh",
            iss: "cc",
            aud: "cc",
            jti: GUID_refresh,
        };

        const access_token = jwt.sign(issueTokenClaims, keys.jwt.secret, {
            algorithm: 'HS256'
        });
        const refresh_token = jwt.sign(refreshTokenClaims, keys.jwt.secret, {
            algorithm: 'HS256'
        });

        return { access_token: access_token, refresh_token: refresh_token };
    }

    //emailToken for email verification(new users registeration)
    private createEmailToken(user: User) {
        const GUID_email = uuidv1();
        const iat_val = Math.floor(Date.now() / 1000);
        const exp_val = Math.floor(Date.now() / 1000) + (60 * 60 * 8); // 8 hrs from now   
        const emailTokenClaims = {
            tenantId: user.tenantId,
            email: user.email,
            role: user.role,
            language: user.language,
            iat: iat_val,
            exp: exp_val,
            sub: "email",
            iss: "cc",
            aud: "cc",
            jti: GUID_email,
        }
        var email_token = jwt.sign(emailTokenClaims, keys.jwt.secret, {
            algorithm: 'HS256'
        });

        return { email_token: email_token }
    }

    //forgotToken for forgot password
    private createForgotPwdToken(user: User) {
        const GUID_email = uuidv1();
        const iat_val = Math.floor(Date.now() / 1000);
        const exp_val = Math.floor(Date.now() / 1000) + (60 * 60 * 8); // 8 hrs from now   
        const forgotTokenClaims = {
            tenantId: user.tenantId,
            email: user.email,
            role: user.role,
            language: user.language,
            iat: iat_val,
            exp: exp_val,
            sub: "forgot",
            iss: "cc",
            aud: "cc",
            jti: GUID_email,
        }
        var forgot_token = jwt.sign(forgotTokenClaims, keys.jwt.secret, {
            algorithm: 'HS256'
        });

        return { forgot_token: forgot_token }
    }
}

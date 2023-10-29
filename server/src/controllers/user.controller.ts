import { Request, Response } from 'express';
import { UserOperations } from '../platform/user.operations';
import { RatingData } from '../data/rating';
import * as passport from 'passport';
import { JwtAuthUtil } from '../platform/jwt.operations';

export class UserController {

    constructor() {
    }

    async registerUser(req: any, res: any) {
        try {
            let { fullName, firstName, lastName, email, mobile, password } = req.body;
            //check all firstName, lastName, email, mobile are defined not
            if (!firstName || !lastName || !email || !password ||
                firstName == undefined || lastName == undefined || email == undefined ||
                password == undefined) {
                if (!fullName) {
                    fullName = firstName + ' ' + lastName;
                }
                res.statusCode = 400;
                res.send({ status: 400, data: 'Bad Request' });
                return;
            }
            const userOps = new UserOperations(req, res);
            let dataResults = await userOps.regsiterUser(req, res, firstName, lastName, email, mobile, password);
            res.statusCode = dataResults.status;
            res.send(dataResults);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async issueToken(req: any, res: any) {
        try {
            if (!req.body.email || !req.body.password || req.body.email == undefined || req.body.password == undefined) {
                res.statusCode = 400;
                res.send({ status: 400, data: { message: "badRequest" } });
                return;
            }
            const userOps = new UserOperations(req, res);
            await userOps.issueToken(req, res);
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }

    async refreshToken(req: any, res: any) {
        try {
            const refreshtoken = req.headers['authorization'];
            if (!refreshtoken || refreshtoken == undefined) {
                res.statusCode = 400;
                res.send({ status: 400, data: { message: "badRequest" } });
                return;
            }
            const tokenResponse = await new JwtAuthUtil().refreshToken(refreshtoken);
            res.statusCode = 200;
            res.send({ status: 200, data: tokenResponse });
            return;
        }
        catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }

    async welcomeMsg(req: Request, res: Response) {
        try {
            let authorization = req.headers['authorization']
            if (!authorization || authorization === undefined) {
                res.statusCode = 400;
                res.send({ status: 400, data: { message: "badRequest" } });
                return;
            }

            const jwtverify: any = await new JwtAuthUtil().verifyToken(authorization);
            var emailId = jwtverify.email;
            const userOps = new UserOperations(req, res);
            let dataResults = await userOps.welcomeProfile(emailId);
            res.statusCode = dataResults.status;
            res.send(dataResults);
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async activateToken(req: any, res: any) {
        try {
            let jwtverify: any = await new JwtAuthUtil().verifyToken(req.query.token);
            if (!jwtverify || jwtverify == undefined) {
                res.statusCode = 400;
                res.send({ status: 400, data: { message: "badRequest" } });
                return;
            }
            let emailId = jwtverify.email;
            const userOps = new UserOperations(req, res);
            let dataResults = await userOps.activateToken(req, res, emailId);
            res.statusCode = dataResults.status;
            res.redirect(`/login?message=userActivated`);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.redirect(`/login?message=userActivationFailed`);
            return;
        }
    }

    async forgotPassword(req: any, res: any) {
        try {
            const { email } = req.body;
            if (!email || email == undefined) {
                res.statusCode = 400;
                res.send({ status: 400, data: { message: "badRequest" } });
                return;
            }
            const userOps = new UserOperations(req, res);
            let dataResults = await userOps.forgotPassword(req, res, email);
            res.statusCode = dataResults.status;
            res.send(dataResults);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async setPasswordURL(req: any, res: any) {
        try {

            let jwtverify: any = await new JwtAuthUtil().verifyToken(req.query.resettoken);
            if (!jwtverify || jwtverify == undefined) {
                res.statusCode = 400;
                res.send({ status: 400, data: { message: "badRequest" } });
                return;
            }
            //dev url for forgot password 
            res.redirect(`/resetpassword?resettoken=${req.query.resettoken}`);
        }
        catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async setPassword(req: any, res: any) {
        try {
            const { newPassword, newPassword2 } = req.body;
            //check both newpassword and newpassword2 are defined 
            if (!newPassword || !newPassword2 || newPassword == undefined || newPassword2 == undefined) {
                res.statusCode = 400;
                res.send({ status: 400, data: { message: "badRequest" } });
                return;
            }
            const jwtverify: any = await new JwtAuthUtil().verifyToken(req.query.resettoken);
            let emailId = jwtverify.email;
            const userOps = new UserOperations(req, res);
            let dataResults = await userOps.setPassword(req, res, emailId, newPassword);
            res.statusCode = dataResults.status;
            res.send(dataResults);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async changePassword(req: any, res: any) {
        try {
            const authorization = req.headers['authorization'];
            if (!authorization || authorization === undefined) {
                res.statusCode = 400;
                res.send({ status: 400, data: { message: "badRequest" } });
                return;
            }
            const jwtverify: any = await new JwtAuthUtil().verifyToken(authorization);
            var emailId = jwtverify.email;
            if (jwtverify.provider == 'facebook' || jwtverify.provider == 'google') {
                const message = res.__('notCustomizedUser', jwtverify.provider);
                res.statusCode = 400;
                res.send({
                    status: 400,
                    data: { message: message }
                });
                return;
            }
            const { oldPassword, newPassword, newPassword2 } = req.body.password;
            if (!oldPassword || !newPassword || !newPassword2 || oldPassword == undefined
                || newPassword == undefined || newPassword2 == undefined) {
                res.statusCode = 400;
                res.send({ status: 400, data: { message: "badRequest" } });
                return;
            }
            const userOps = new UserOperations(req, res);
            let dataResults = await userOps.changePassword(req, res, emailId, oldPassword, newPassword);
            res.statusCode = dataResults.status;
            res.send(dataResults);
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async updateAddress(req: Request, res: Response) {
        try {
            const authorization = req.headers['authorization'];
            if (!authorization || authorization === undefined) {
                res.statusCode = 400;
                res.send({ status: 400, data: { message: "badRequest" } });
                return;
            }
            const jwtverify: any = await new JwtAuthUtil().verifyToken(authorization);
            var emailId = jwtverify.email;
            const userOps = new UserOperations(req, res);
            let dataResults = await userOps.updateAddress(req, res, emailId);
            res.send(dataResults);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async myProfile(req: any, res: any) {
        try {
            let authorization = req.headers['authorization']
            if (!authorization || authorization === undefined) {
                res.statusCode = 400;
                res.send({ status: 400, data: { message: "badRequest" } });
                return;
            }

            const jwtverify: any = await new JwtAuthUtil().verifyToken(authorization);
            var emailId = jwtverify.email;
            const userOps = new UserOperations(req, res);
            let dataResults = await userOps.myProfile(req, res, emailId);
            res.statusCode = dataResults.status;
            res.send(dataResults);
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async putMyStory(req: any, res: any) {
        try {
            let authorization = req.headers['authorization']
            if (!authorization || authorization === undefined) {
                res.statusCode = 400;
                res.send({ status: 400, data: { message: "badRequest" } });
                return;
            }

            const jwtverify: any = await new JwtAuthUtil().verifyToken(authorization);
            let emailId = jwtverify.email;
            let myStory = req.body.myStory;
            if (!myStory || myStory == undefined) {
                res.statusCode = 400;
                res.send({ status: 400, data: { message: "badRequest" } });
                return;
            }
            const userOps = new UserOperations(req, res);
            let dataResults = await userOps.putMyStory(emailId, myStory);
            res.statusCode = dataResults.status;
            res.send(dataResults);
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async uploadPhoto(req: any, res: any) {
        try {
            const file = req.file;
            if (file == undefined || !file) {
                res.statusCode = 400;
                res.send({ status: 400, data: 'Bad Request' });
                return;
            }

            const userOps = new UserOperations(req, res);
            let dataResults = await userOps.uploadProfilePhoto(req, res, file);
            res.statusCode = dataResults.status;
            res.send(dataResults);
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async adminLogin(req: Request, res: Response) {

    }

    async deleteFacebookUser(req: Request, res: Response) {
        try {
            let signedRequest = req.body.signedRequest;
            const userOps = new UserOperations(req, res);
            let dataResults = await userOps.facebookUserDeletion(signedRequest);
            res.statusCode = dataResults.status;
            res.send(dataResults);
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async checkUserStatus(req: Request, res: Response) {
        try {
            let userId = req.query.id as string;
            const userOps = new UserOperations(req, res);
            let dataResults = await userOps.checkFacebookUser(userId);
            res.statusCode = dataResults.status;
            res.send(dataResults);
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }
}

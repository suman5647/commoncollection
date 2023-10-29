import { Request, Response } from 'express';
import { BaseAPIOperations } from './base.operations';
import { UserService } from '../services/user.service';
import { localizationService } from '../services/localization.service';
import { JwtAuthUtil } from './jwt.operations';
import { BenefactorPubData, BeneficiaryPubData, BenefactorData, BeneficiaryData, User, UserLite, RoleTypes } from "../data/user";
import { AuthProviders, Currency } from '../data/common';
import * as passport from 'passport';
import { OrderService } from '../services/order.service';
import { CaseService } from '../services/case.service';
import { emailSendService } from '../services/email.service';
import { v1 as uuidv1 } from 'uuid';
import { data } from 'data_seeding/case.data.seed';
import { FileOperations } from './file.operations';
import { ImageOperations } from "../platform/image.operations";
import { keys } from '../config/keys';
import { CaseRatingService } from '../services/rating.service';
import { S3Data, SocialMediaData } from '../data/keys';
import { decryptData } from '../services/crypto.service'
import * as crypto from 'crypto';

let uservice: UserService = new UserService();
let emailService: emailSendService = new emailSendService();
let localizeService: localizationService = new localizationService();
let fileOperations: FileOperations = new FileOperations();
let imgops: ImageOperations = new ImageOperations();
let cservice: CaseService = new CaseService();
let oservice: OrderService = new OrderService();
let ratingService: CaseRatingService = new CaseRatingService();

//getting decrypted keys
var s3keys: S3Data;
if (keys.files.isEncrypted) {
    s3keys = decryptData(keys.files.key);
}

var facebookKeys: SocialMediaData;
if (keys.facebook.isEncrypted) {
    facebookKeys = decryptData(keys.facebook.key);
}

export class UserOperations extends BaseAPIOperations {
    constructor(req: Request, res: Response) {
        super(req, res);
    }

    get registerFields() {
        return {
            tenantId: 1,
            basic: 1,
            authProviders: 1,
            email: 1
        }
    }

    get profileFields() {
        return {
            email: 1,
            basic: this.profilePhotoProjectAttachmentMap,
            phone: 1,
            language: 1,
            address: 1,
            reqProfile: 1,
            verification: 1,
            baseCurrency: 1,
            authProviders: 1
        }
    }

    get profilePhotoProjectAttachmentMap() {
        return {
            "userId": "$basic.userId",
            "firstName": "$basic.firstName",
            "lastName": "$basic.lastName",
            "profilePhoto": { "$concat": [s3keys.url, "$basic.profilePhoto"] },
            "language": "$basic.language"
        };
    }

    get activateEmailFileds() {
        return {
            tenantId: 1,
            'verification.emailVerified': 1,
            _id: 0
        }
    }

    get checkForgotFields() {
        return {
            tenantId: 1,
            authProviders: 1,
            email: 1,
            basic: 1,
            language: 1
        }
    }

    get checkPasswordFields() {
        return {
            authProviders: 1,
            email: 1,
            _id: 0
        }
    }

    get checkEmailFileds() {
        return {
            authProviders: 1,
            email: 1,
            _id: 0
        }
    }

    get myStoryFields() {
        return {
            reqProfile: 1,
            email: 1,
            _id: 0
        }
    }

    async regsiterUser(req: any, res: any, firstName, lastName, email, mobile, password) {
        let register = await uservice.findOneSelect({ tenantId: this.tenantId, email: email }, this.registerFields);
        let updateNewAuthProv;
        if (register) {
            for (let i = 0; i < register.authProviders.length; i++) {
                if (register.authProviders[i].provider == 'Local') {
                    const message = res.__('emailRegistered', register.email);
                    return { status: 500, data: { message } };
                }
            }

            for (let i = 0; i < register.authProviders.length; i++) {
                if (register.authProviders[i].provider == 'Facebook' || register.authProviders[i].provider == 'Google') {
                    let getPassword = await uservice.createPassword(password);
                    updateNewAuthProv = await uservice.updatePart({ email: email }, {
                        $set: {
                            basic: { userId: email, firstName: firstName, lastName: lastName, profilePhoto: register.basic.profilePhoto, language: 'en-us', baseCurrency: Currency.USD }
                        },
                        $push: { authProviders: { provider: AuthProviders.Local, userid: email, phash: getPassword.hash, psalt: getPassword.salt } }
                    });
                    const message = res.__('createdUser');
                    return { status: 200, data: message };
                }
            }
        } else {
            const newUser: User = {
                tenantId: this.tenantId, email: email, phone: mobile, role: RoleTypes.Standard, basic: {
                    userId: email, firstName: firstName, lastName: lastName,
                }, authProviders: [{ provider: AuthProviders.Local }], verification: { emailVerified: false }, baseCurrency: Currency.USD
            } as User;
            //hash Password
            let getPassword = await uservice.createPassword(password);
            newUser.authProviders[0].phash = getPassword.hash;
            newUser.authProviders[0].psalt = getPassword.salt;
            let createUser = await uservice.create(newUser);
            const emailToken = await new JwtAuthUtil().emailToken(createUser);
            let url = this.urlHelper(req.headers.referer);
            await emailService.sendNewUserEmail(url, createUser, emailToken.email_token);
            const message = res.__('createdUser');
            return { status: 200, data: message };
        }
    }

    async issueToken(req, res) {
        passport.authenticate('local', { session: false }, function (err, user, info) {
            if (err || !user) {
                res.statusCode = 500;
                const x = info.message.split(" ");
                const message = res.__(x[0], x[1], x[1]);
                res.send({ status: 500, data: { message } });
                return;
            }
            req.login(user, { session: false }, async function (err) {
                if (err) {
                    res.statusCode = 500;
                    res.send({
                        status: 500,
                        data: { message: 'unhandledError' + err }
                    });
                    return;
                }

                var tokenResponse = await new JwtAuthUtil().issueToken(user);
                res.statusCode = 200;
                res.send({ status: 200, data: tokenResponse });
                return;
            });
        })(req, res);
    }

    async activateToken(req, res, emailId: string) {
        let activateEmail: any = await uservice.findOneSelect({ tenantId: this.tenantId, email: emailId }, this.activateEmailFileds);
        if (activateEmail) {
            if (activateEmail.verification.emailVerified == true) {
                const message = res.__('emailAlreadyVerified');
                return { status: 200, data: { message } };
            }
            uservice.updatePart({ email: emailId }, { $set: { verification: { emailVerified: true } } });
            const message = res.__('emailVerified');
            return { status: 200, data: message }
        }
    }

    async forgotPassword(req, res, emailId: string) {
        let checkEmail: any = await uservice.findOneSelect({ tenantId: this.tenantId, email: emailId }, this.checkForgotFields);
        if (checkEmail) {
            for (let i = 0; i < checkEmail.authProviders.length; i++) {
                if (checkEmail.authProviders[i].provider == 'Local') {
                    const resetToken = await new JwtAuthUtil().forgotToken(checkEmail);
                    let url = this.urlHelper(req.headers.referer);
                    await emailService.sendForgotEmail(url, checkEmail, resetToken.forgot_token);
                    const message = res.__('emailSentForResettingPassword');
                    return { status: 200, data: message };
                }
                if (checkEmail.authProviders[i].provider == 'Facebook' || checkEmail.authProviders[i].provider == 'Google') {
                    const message = res.__('userCannotResetPassword', checkEmail.authProviders[i].provider);
                    return { status: 500, data: { message } };
                }
            }

        } else {
            const message = res.__('emailNotRegistered', emailId);
            return { status: 500, data: { message } };
        }
    }


    async setPassword(req, res, emailId: string, newPassword: string) {
        let checkEmail: any = await uservice.findOneSelect({ tenantId: this.tenantId, email: emailId }, this.checkEmailFileds)
        let authProvidersIndex;
        if (checkEmail) {
            let getHashPassword = await uservice.createPassword(newPassword);
            for (let i = 0; i < checkEmail.authProviders.length; i++) {
                if (checkEmail.authProviders[i].provider == 'Local') {
                    authProvidersIndex = i;
                }
            }
            let hash = getHashPassword.hash;
            let salt = getHashPassword.salt;
            let updatePassword: any = await uservice.updatePart({ tenantId: this.tenantId, email: emailId }, { authProvider: [authProvidersIndex], $set: { "authProviders.$[].phash": hash, "authProviders.$[].psalt": salt } });
            if (updatePassword.nModified) {
                const message = res.__('passwordUpdated');
                return { status: 200, data: message };
            } else {
                return { status: 500, data: { message: 'Internal Error' } };
            }
        } else {
            const message = res.__('emailNotRegistered', emailId);
            return { status: 500, data: { message } };
        }
    }

    async changePassword(req, res, emailId, oldPassword, newPassword) {
        let checkEmail: any = await uservice.findOneSelect({ tenantId: this.tenantId, email: emailId }, this.checkPasswordFields);
        if (checkEmail) {
            let dataBasePassword;
            let authProvidersIndex;
            for (let i = 0; i < checkEmail.authProviders.length; i++) {
                if (checkEmail.authProviders[i].provider == 'Local') {
                    dataBasePassword = checkEmail.authProviders[i].phash;
                    authProvidersIndex = i;
                } else {
                    const message = res.__('notCustomizedUser', checkEmail.authProviders[i].provider);
                    return {
                        status: 500,
                        data: { message }
                    };
                }
            }

            //check if the new password matches with already existing password    
            let isMatch = await uservice.comparePassword(newPassword, dataBasePassword);
            if (isMatch.compare) {
                const message = res.__('passwordAlreadyUsed');
                return { status: 500, data: { message } };
            }
            //check if the old password matches with already existing password and change newpassword  
            let isMatch2 = await uservice.comparePassword(oldPassword, dataBasePassword);
            if (isMatch2.compare) {
                //bcrypt the new password and update to datebase 
                let getHashPassword = await uservice.createPassword(newPassword);
                let hash = getHashPassword.hash;
                let salt = getHashPassword.salt;
                let changePassword: any = await uservice.updatePart({ tenantId: this.tenantId, email: emailId }, { authProvider: [authProvidersIndex], $set: { "authProviders.$[].phash": hash, "authProviders.$[].psalt": salt } })
                if (changePassword.nModified) {
                    const message = res.__('passwordChangedSuccessfully');
                    return { status: 200, data: message };
                }
            } else {
                const message = res.__('invalidOldPassword');
                return { status: 500, data: { message } };
            }
        }
    }

    async updateAddress(req, res, emailId) {
        let checkEmail: any = await uservice.findOneSelect({ tenantId: this.tenantId, email: emailId }, this.checkPasswordFields);
        if (checkEmail) {
            let dataBasePassword;
            let authProvidersIndex;
            // for (let i = 0; i < checkEmail.authProviders.length; i++) {
            //     if (checkEmail.authProviders[i].provider == 'Local') {
            //         dataBasePassword = checkEmail.authProviders[i].phash;
            //         authProvidersIndex = i;
            //     } else {
            //         const message = res.__('notCustomizedUser', checkEmail.authProviders[i].provider);
            //         return {
            //             status: 500,
            //             data: { message }
            //         };
            //     }
            // }
            const updateDocument = {
                $set: {
                    address: req.body.address,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    "reqProfile.socialMedialLinks": req.body.socialMedialLinks,
                    baseCurrency: req.body.baseCurrency,
                    "verification.currencyUpdated": true,
                    "verification.currencyUpdatedOn": Date.now()

                }
            };
            const caseUpdated: any = await uservice.updateMany({ tenantId: this.tenantId, email: emailId }, updateDocument);
        }
    }
    async myProfile(req, res, emailId: string) {

        let user = await uservice.findAggregate([
            {
                "$match": {
                    "$and": [
                        { "tenantId": this.tenantId },
                        { "email": emailId },
                    ]
                }
            },
            {
                "$project": this.profileFields
            }
        ]);
        if (user) {
            const profileDetails = await uservice.getProfile(user[0]);
            console.log(profileDetails);
            return { status: 200, data: profileDetails };
        }
    }

    async welcomeProfile(emailId: string) {
        let user = await uservice.findOneSelect({ tenantId: this.tenantId, email: this.userId }, 'basic.firstName');
        if (user) {
            const profileDetails = await uservice.getFirstName(user);
            return { status: 200, data: profileDetails };
        }
    }

    async uploadProfilePhoto(req, res, file: any) {
        let emailId = this.userId;
        let user = await uservice.findOne({ tenantId: this.tenantId, email: emailId }) as User;
        if (user) {
            let key = this.tenantId + '_profilephoto_' + uuidv1();
            let thumbnailBuffer = await imgops.resize(file.buffer, 200);
            let uploadResults = await fileOperations.uploadFile(key, file.mimetype, thumbnailBuffer, user.basic.userId);  //original photo with 200X200 dimension upload to s3

            //update the user details(only profilePhoto)
            let saveProfliePhoto: any = await uservice.updatePart({ tenantId: this.tenantId, email: emailId }, {
                $set: { 'basic.profilePhoto': uploadResults.Key }
            });

            //update the caseRatings(only profilePhoto)
            let updateCaseRatings: any = await ratingService.updateMany({ tenantId: this.tenantId, 'user.userId': emailId }, {
                $set: { 'user.profilePhoto': uploadResults.Key }
            });

            //update the case details(only profilePhoto) if the user is beneficiary
            let updateCaseBenficiary;
            if (user.reqProfile) {
                updateCaseBenficiary = await cservice.updateMany({ tenantId: this.tenantId, 'beneficiary.userId': emailId }, {
                    $set: { 'beneficiary.profilePhoto': uploadResults.Key }
                });
            }

            //update the case details(only profilePhoto), order details(only profilePhoto) if the user is donor/benefactor
            let updateCaseBenfactor;
            let updateOrderBenfactor;
            if (user.donorProfile) {
                updateCaseBenfactor = await cservice.updateMany({ tenantId: this.tenantId, donations: { "$elemMatch": { "user.userId": emailId } } }, {
                    $set: { 'donations.$.user.profilePhoto': uploadResults.Key }
                });
                updateOrderBenfactor = await oservice.updateMany({ tenantId: this.tenantId, 'user.userId': emailId }, {
                    $set: { 'user.profilePhoto': uploadResults.Key }
                });
            }

            if (user.reqProfile) {
                if (saveProfliePhoto.nModified && updateCaseBenficiary.nModified) {
                    let dataMessage = await localizeService.localizeContactMeOutro('profilePhotoChanged', this.language);
                    return ({ status: 200, data: dataMessage });
                } else {
                    let dataMessage = await localizeService.localizeContactMeOutro('profilePhotoChangeError', this.language);
                    return ({ status: 500, data: { message: dataMessage } });
                }
            }
            else if (user.donorProfile) {
                if (saveProfliePhoto.nModified && updateCaseBenfactor.nModified && updateOrderBenfactor.nModified) {
                    let dataMessage = await localizeService.localizeContactMeOutro('profilePhotoChanged', this.language);
                    return ({ status: 200, data: dataMessage });
                } else {
                    let dataMessage = await localizeService.localizeContactMeOutro('profilePhotoChangeError', this.language);
                    return ({ status: 500, data: { message: dataMessage } });
                }
            } else {
                if (saveProfliePhoto.nModified) {
                    let dataMessage = await localizeService.localizeContactMeOutro('profilePhotoChanged', this.language);
                    return ({ status: 200, data: dataMessage });
                } else {
                    let dataMessage = await localizeService.localizeContactMeOutro('profilePhotoChangeError', this.language);
                    return ({ status: 500, data: { message: dataMessage } });
                }
            }

        } else {
            let dataMessage = await localizeService.localizeIntro('profilePhotoChangeError', this.language, emailId);
            return ({ status: 500, data: { message: dataMessage } });
        }
    }

    async putMyStory(emailId: string, myStory: string) {
        let user = await uservice.findOneSelect({ tenantId: this.tenantId, email: this.userId }, this.myStoryFields);
        if (user.email != emailId) {
            return { status: 400, data: { message: "badRequest" } };
        }
        if (user) {
            let saveDescritpion: any = await uservice.updatePart({ tenantId: this.tenantId, email: this.userId }, {
                $set: { 'reqProfile.description': myStory }
            });
            if (saveDescritpion.nModified) {
                let dataMessage = await localizeService.localizeContactMeOutro('myStoryUpdated', this.language);
                return ({ status: 200, data: dataMessage });
            } else {
                let dataMessage = await localizeService.localizeContactMeOutro('myStoryFailed', this.language);
                return ({ status: 500, data: { message: dataMessage } });
            }
        }
    }

    async googleRedirect(req, res) {
        passport.authenticate('google', { session: false }, function (err, user, info) {
            if (err) {
                res.statusCode = 401;
                res.send({ status: 401, data: { message: info.message } });
                return;
            }

            req.login(user, { session: false }, async function (err) {
                if (err) {
                    res.statusCode = 500;
                    res.send({
                        status: 500,
                        data: { message: 'unhandledError', err }
                    });
                    return;
                }

                var tokenRespone = await new JwtAuthUtil().issueToken(user);
                res.statusCode = 200;
                res.send({ status: 200, data: tokenRespone });
                return;
            });
        })(req, res);
    }

    async facebookUserDeletion(signedRequest: string) {
        let userData = this.parseFacebookSignedRequest(signedRequest);
        let user = await uservice.updatePart({},
            {
                $pull: { 'authProviders': { 'provider': userData.userid } }
            });

        let data = {
            url: `${process.env.APPURL}/api/v1/auth/facebook/userdelete?id=${userData.userid}`,
            confirmation_code: `facebook_user_${userData.userid}`
        };
        return ({ status: 200, data: data });
    }

    async checkFacebookUser(userId: string) {
        let user = await uservice.findOneSelect({
            authProviders: { $elemMatch: { userid: userId, provider: AuthProviders.Facebook } },
        }, {
            email: 1
        });
        if (user == null) {
            return ({ status: 404, data: 'No user found' });
        } else {
            return ({ status: 200, data: 'user found' });
        }
    }

    private parseFacebookSignedRequest(signedRequest: string) {
        var encoded_data = signedRequest.split('.', 2);
        // decode the data
        var sig = encoded_data[0];
        var json = this.facebookBase64Decode(encoded_data[1]);
        var data = JSON.parse(json);
        if (!data.algorithm || data.algorithm.toUpperCase() != 'HMAC-SHA256') {
            throw Error('Unknown algorithm: ' + data.algorithm + '. Expected HMAC-SHA256');
        }
        var expected_sig = crypto.createHmac('sha256', facebookKeys.clientSecret).update(encoded_data[1]).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace('=', '');
        if (sig !== expected_sig) {
            throw Error('Invalid signature: ' + sig + '. Expected ' + expected_sig);
        }
        return data;
    }
    private facebookBase64Decode(data) {
        while (data.length % 4 !== 0) {
            data += '=';
        }
        data = data.replace(/-/g, '+').replace(/_/g, '/');
        return new Buffer(data, 'base64').toString('utf-8');
    }

    private urlHelper(url: string) {
        if (url.includes("localhost")) {
            return "http://localhost:3000";
        } else {
            let requiredUrl;
            requiredUrl = url.split('.com/')[0] + ".com";
            return requiredUrl;
        }
    }
}
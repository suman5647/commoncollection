import * as passport from 'passport';
import * as passportFacebook from 'passport-facebook';
import * as passportLocal from 'passport-local';
import * as passportGoogle from 'passport-google-oauth2';
import { keys } from './keys';
import { Request, Response, NextFunction } from "express";
import * as bcrypt from 'bcryptjs';
import { UserService } from "../services/user.service";
import { AuthProviders, Currency } from "../data/common";
import { User, RoleTypes } from "../data/user";
import * as request from 'request';
import { v1 as uuidv1 } from 'uuid';
import * as aws from 'aws-sdk';
import { AuditLogSevice } from '../services/auditLog.service';
import { AuditData } from '../config/common';
import { S3Data, SocialMediaData } from '../data/keys';
import { decryptData } from '../services/crypto.service';
const auditLog: AuditLogSevice = new AuditLogSevice();

//getting decrypted keys
var s3keys: S3Data;
if (keys.files.isEncrypted) {
  s3keys = decryptData(keys.files.key);
}
//getting decrypted keys
var facebookKeys: SocialMediaData;
if (keys.facebook.isEncrypted) {
  facebookKeys = decryptData(keys.facebook.key);
}
//getting decrypted keys
var googleKeys: SocialMediaData;
if (keys.google.isEncrypted) {
  googleKeys = decryptData(keys.google.key);
}
const s3 = new aws.S3({
  accessKeyId: s3keys.accessKeyId,
  secretAccessKey: s3keys.secretAccessKey,
});

const LocalStrategy = passportLocal.Strategy;
const FacebookStrategy = passportFacebook.Strategy;
const GoogleStrategy = passportGoogle.Strategy;
let uservice: UserService = new UserService();

const bucketPath: string = s3keys.documentsPath;
passport.serializeUser((user, done) => {
  done(undefined, user);
});

passport.deserializeUser((id: string, done) => {
  uservice.findById(id).then(qt => {
    done(true, qt);
  }).catch(err => {
  });
});

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: "email" }, async (emailId, password, done) => {
  let user = await uservice.findOneSelect({ email: emailId }, 'language tenantId email role verification authProviders')
  if (!user) {
    return done(undefined, false, { message: `emailNotRegistered ${emailId}` });
  }

  if (!user.verification.emailVerified) {
    return done(undefined, false, { message: 'emailNotVerified' });
  }

  if (user.authProviders.length == 1) {
    let i = 0;
    if (user.authProviders[i].provider == 'Local') {
      let isMatch = await uservice.comparePassword(password, user.authProviders[i].phash);
      if (isMatch.compare) {
        return done(undefined, user);
      }
      return done(undefined, false, { message: 'InvalidEmailorPassword' });
    }
    if (user.authProviders[i].provider == 'Facebook' || user.authProviders[i].provider == 'Google') {
      return done(undefined, false, { message: `emailRegisteredWithThridParty ${user.authProviders[i].provider}` });
    }
  }

  if (user.authProviders.length > 1) {
    for (let i = 0; i < user.authProviders.length; i++) {
      if (user.authProviders[i].provider == 'Local') {
        let isMatch = await uservice.comparePassword(password, user.authProviders[i].phash);
        if (isMatch) {
          return done(undefined, user);
        }
        return done(undefined, false, { message: 'InvalidEmailorPassword' });
      }
    }
    for (let i = 0; i < user.authProviders.length; i++) {
      if (user.authProviders[i].provider == 'Facebook' || user.authProviders[i].provider == 'Google') {
        return done(undefined, false, { message: `emailRegisteredWithThridParty ${user.authProviders[i].provider}` });
      }
    }
  }

  bcrypt.compare(password, user.authProviders[0].phash, (err: Error, isMatch: boolean) => {
    if (err) { return done(err); }
    if (isMatch) {
      return done(undefined, user);
    }
    return done(undefined, false, { message: 'InvalidEmailorPassword' });
  });
}));

/**
* Sign in with Facebook.
*
**/
passport.use(new FacebookStrategy({
  clientID: facebookKeys.clientID,
  clientSecret: facebookKeys.clientSecret,
  callbackURL: `${process.env.APPURL}/api/v1/auth/facebook/redirect`,
  profileFields: ['id', 'displayName', 'email', 'first_name', 'last_name', 'picture.type(large)'],
  passReqToCallback: true
}, async (req: any, accessToken, refreshToken, profile, done) => {
  let results = profile;
  //audit logs
  let auditLogData = AuditData('Facebook login success', profile.emails[0].value, 200, results);
  let createLog = await auditLog.create(auditLogData);
  let existingUser = await uservice.findOneSelect({ email: profile.emails[0].value }, 'email authProviders');
  let url = `https://graph.facebook.com/${profile.id}/picture?type=large`;
  let options = {
    url: url,
    method: "get",
    encoding: null
  };
  if (existingUser) {
    for (let i = 0; i < existingUser.authProviders.length; i++) {
      if (existingUser.authProviders[i].provider == AuthProviders.Facebook) {
        return done(undefined, existingUser);
      }
    }
    let key = 'cc_profilephoto_' + uuidv1();
    uploadUrl(options, key);
    let updateNewAuthProv = await uservice.updatePart({ email: profile.emails[0].value }, {
      $set: {
        basic: { userId: profile.emails[0].value, firstName: profile.name.givenName, lastName: profile.name.familyName, profilePhoto: key, language: 'en-us', baseCurrency: Currency.USD },
        $push: { authProviders: { provider: AuthProviders.Facebook, userid: profile.id } }
      }
    });
    return done(undefined, updateNewAuthProv);
  } else {
    let key = 'cc_profilephoto_' + uuidv1();
    uploadUrl(options, key);
    const newUser: User = {
      tenantId: 'cc', email: profile.emails[0].value, role: RoleTypes.Standard, basic: {
        userId: profile.emails[0].value, firstName: profile.name.givenName, lastName: profile.name.familyName, profilePhoto: key
      }, authProviders: [{ provider: AuthProviders.Facebook, userid: profile.id }], verification: { activated: true, emailVerified: true, phoneVerified: true }, baseCurrency: Currency.USD
    } as User;
    let newur = await uservice.create(newUser)
    return done(undefined, newur);
  }
}));

/**
* Sign in with Google.
*/
passport.use(new GoogleStrategy({
  clientID: googleKeys.clientID,
  clientSecret: googleKeys.clientSecret,
  callbackURL: `${process.env.APPURL}/api/v1/auth/google/redirect`,
  passReqToCallback: true,
  scope: ['email', 'profile']
}, async (req: any, accessToken, refreshToken, profile, done) => {
  let results = profile;
  //audit logs
  let auditLogData = AuditData('Google login success', profile.emails[0].value, 200, results);
  let createLog = await auditLog.create(auditLogData);
  let existingUser = await uservice.findOneSelect({ email: profile.emails[0].value }, 'email authProviders');
  let url = profile.photos[0].value;
  let options = {
    url: url,
    method: "get",
    encoding: null
  };
  if (existingUser) {
    for (let i = 0; i < existingUser.authProviders.length; i++) {
      if (existingUser.authProviders[i].provider == AuthProviders.Google) {
        return done(undefined, existingUser);
      }
    }
    let key = 'cc_profilephoto_' + uuidv1();
    uploadUrl(options, key);
    let updateNewAuthProv = await uservice.updatePart({ email: profile.emails[0].value }, {
      $set: { basic: { userId: profile.emails[0].value, firstName: profile.name.givenName, lastName: profile.name.familyName, profilePhoto: key, language: 'en-us' }, baseCurrency: Currency.USD },
      $push: { authProviders: { provider: AuthProviders.Google, userid: profile.id } }
    });
    return done(undefined, updateNewAuthProv);
  } else {
    let key = 'cc_profilephoto_' + uuidv1();
    uploadUrl(options, key);
    const newUser: User = {
      tenantId: 'cc', email: profile.emails[0].value, role: RoleTypes.Standard, basic: {
        userId: profile.emails[0].value, firstName: profile.name.givenName, lastName: profile.name.familyName, profilePhoto: key, language: 'en-us'
      }, authProviders: [{ provider: AuthProviders.Google, userid: profile.id }], verification: { activated: true, emailVerified: true, phoneVerified: true }, baseCurrency: Currency.USD
    } as User;
    let newur = await uservice.create(newUser);
    return done(undefined, newur);
  }
}));

/**
* Login Required middleware.
*/
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.json({
    status: 401,
    msg: 'User not logged in'
  })
  // res.redirect("/api/auth/signin");
};

function uploadUrl(options, key) {
  request(options, async function (error, response, body) {
    if (error || response.statusCode !== 200) {
    } else {
      // let thumbnailBuffer = imgops.resize(body, 200);
      s3.putObject({
        Body: body,
        Key: key,
        Bucket: bucketPath,
        ContentType: 'image/png',
      }, function (error, data) {

        if (error) {
        } else {
        }
      });
    }
  });
}
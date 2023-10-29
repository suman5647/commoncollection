import { Schema } from 'mongoose';
import { IDocumentModel } from '../data/base';
import { User } from '../data/user';
import { Languages } from '../data/common';
import { basicSchema, profileSchema, cryptoAccount, addressSchema, locationSchema } from './common';

export interface UserModel extends IDocumentModel<User>, User {
}

var authproviderSchema: Schema = new Schema({
    provider: String,
    userid: String,
    phash: String,
    psalt: String
});

var verificationSchema: Schema = new Schema({
    activated: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    photoVerified: { type: Boolean, default: false },
    addressVerified: { type: Boolean, default: false },
    currencyUpdated: { type: Boolean, default: false },
    activatedOn: { type: Date },
    emailVerifiedOn: { type: Date },
    phoneVerifiedOn: { type: Date },
    photoVerifiedOn: { type: Date },
    addressVerifiedOn: { type: Date },
    currencyUpdatedOn:{ type: Date, default: new Date() }
});

var RatingSummarySchema: Schema = new Schema({
    count: Number,
    recentUpdate: Date,
    average: Number
});

export var userSchema: Schema = new Schema();

userSchema.add({
    tenantId: String,
    email: String,
    phone: String,
    language: { type: String, default: Languages.US },
    role: String,
    basic: { type: basicSchema },
    address: { type: addressSchema },
    location: { type: locationSchema },
    reqProfile: { type: profileSchema },
    donorProfile: { type: profileSchema },
    authProviders: [{ type: authproviderSchema }],
    verification: { type: verificationSchema },
    accounts: [{ type: cryptoAccount}],
    rating: { type: RatingSummarySchema },
    socketId: String,
    baseCurrency: String
});

export default userSchema;
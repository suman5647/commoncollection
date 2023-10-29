import { Schema } from 'mongoose';
import { Languages, ContactTypes, PaymentTypes } from "../data/common";

export const cryptoCurrencyList: string[] = ['BTC', 'LTC'];
export var addressSchema: Schema = new Schema({
    language: { type: String, default: Languages.US },
    country: String,
    state: String,
    city: String,
    place: String,
    addressLine1: String,
    addressLine2: String,
    pincode: String,
});

export var locationSchema: Schema = new Schema({
    longitude: Number,
    latitude: Number
});

export var itemDataSchema: Schema = new Schema({
    code: String,
    text: String
});

export var contactSchema: Schema = new Schema({
    contactType: { type: Number, default: ContactTypes.Default },
    firstName: String,
    lastName: String,
    phone: String,
    email: String
});

export var cryptoAccount: Schema = new Schema({
    accountId: String,
    accountType: {type: String, default: PaymentTypes.DirectCrypto}
});

export var basicSchema: Schema = new Schema({
    userId: String,
    firstName: String,
    lastName: String,
    profilePhoto: String,
    language: String
});

export var profileSchema: Schema = new Schema({
    description: String,
    socialMedialLinks: [{ type: itemDataSchema }],
    occupation: String
});

export var TransactionAccount:Schema = new Schema ({
    referenceName: String, 
    accountHoldername: String,
    accountType: { type : PaymentTypes},
    kycId: String, 
    accountId: String,
})
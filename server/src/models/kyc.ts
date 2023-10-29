import { Schema, Mongoose } from 'mongoose';
import { IDocumentModel } from '../data/base';
import { KYC, KycDocument, KycState, KYCStatus, KYCType } from '../data/kyc';
import { basicSchema } from './common';

export interface KYCModel extends IDocumentModel<KYC>, KYC {
}

export var kycSchema: Schema = new Schema();


var KycStateSchema: Schema = new Schema({
    status: String,
    statusOn: Date,
    statusBy: basicSchema,
    note: String,
});

var KycDocumentSchema: Schema = new Schema({
    kycTypeType: String,
    fileType: String,
    title: String,
    uniqueName: String,
    status: String,
    states: [{ type: KycStateSchema }]
});

kycSchema.add({
    tenantId: String,
    accountId: String,
    expireOn: Date,
    user: basicSchema,
    documents: [{ type: KycDocumentSchema }],
    states: [{ type: KycStateSchema }],
});

export default kycSchema;


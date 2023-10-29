import { Schema } from 'mongoose';

import { IDocumentModel } from '../data/base';
import { AdminStatus, Case, CasePhotoStatus, CaseStatus } from '../data/case';
import { FileModes, FileTypes, PaymentTypes } from '../data/common';
import { addressSchema, basicSchema, locationSchema } from './common';

export interface CaseModel extends IDocumentModel<Case>, Case {
}

var CaseLocaleSchema: Schema = new Schema({
    lang: String,
    title: String,
    description: String,
});

var CaseDocumentSchema: Schema = new Schema({
    fileType: { type: FileTypes },
    fileMode: { type: FileModes },
    title: String,
    uniqueName: String,
    status: { type: CasePhotoStatus, default: CasePhotoStatus.Active}
});

var OrderLiteSchme: Schema = new Schema({
    orderId: String,
    currency: String,
    amount: Number,
    status: String,
});

var CaseDonationSchema: Schema = new Schema({
    user: { type: basicSchema },
    order: { type: OrderLiteSchme }
});

var RatingSummarySchema: Schema = new Schema({
    count: Number,
    recentUpdate: Date,
    average: Number
});

var ReportAbuseSummary: Schema = new Schema({
    count: Number,
    recentUpdate: Date
});

var AccountDetails: Schema = new Schema({
    accountType: { type: PaymentTypes },
    accountId: String,
    currency: String
})

export var caseSchema: Schema = new Schema();

caseSchema.add({
    tenantId: String,
    caseId: { type: String },
    revision: { type: Number, default: 1 },
    isagent: { type: Boolean, default: false },
    isactive: { type: Boolean, default: true },
    content: [{ type: CaseLocaleSchema }],
    address: { type: addressSchema },
    location: { type: locationSchema },
    status: { type: CaseStatus, default: CaseStatus.Draft },
    createdOn: Date,
    publishedOn: Date,
    completedOn: Date,
    agentCommission: { type: Number },
    agentCommissionPercent: { type: Number },
    baseCurrency: String,
    amount: Number,
    accountDetails: [{ type: AccountDetails }],
    attachments: [{ type: CaseDocumentSchema }],
    beneficiary: { type: basicSchema },
    donations: [{ type: CaseDonationSchema }],
    rating: { type: RatingSummarySchema },
    reportAbuse: { type: ReportAbuseSummary },
    category: [{ type: String }],
    tags: [{ type: String }],
    adminStatus: { type: AdminStatus, default: AdminStatus.Pending },
    adminComments: String,
    adminCommentOn: Date,
    isLocked: Boolean,
    lockedUntil: Date,
    lockedBy: String,
    lockId: String,
});

export default caseSchema;
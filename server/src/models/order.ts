import { Schema } from 'mongoose';

import { IDocumentModel } from '../data/base';
import { PaymentTypes } from '../data/common';
import { Order, OrderStatus } from '../data/order';
import { basicSchema, TransactionAccount } from './common';

export interface OrderModel extends IDocumentModel<Order>, Order {
}

var OrderBreakdownSchema: Schema = new Schema({
    name: String,
    amount: Number
});

var RatesSchema: Schema = new Schema({
    rate: Number,
    currency: String
});

var RatesSetSchema: Schema = new Schema({
    beneficiaryRate: RatesSchema,
    benefactorRate: RatesSchema,
    caseRate: RatesSchema,
    txnRate: RatesSchema
});

const orderSchemaOptions = {
    timestamps: { createdAt: 'created', updatedAt: 'modified' }
};

const txnSchemaOptions = {
    timestamps: { createdAt: 'created', updatedAt: false }
};


var OrderTransactionSchema: Schema = new Schema({
    currency: String,
    amount: Number,
    trnReference: String,
    trnHash: String,
    walletAddress: String,
    status: String,
    orderRate: RatesSetSchema,
}, txnSchemaOptions);


var orderSchema: Schema = new Schema({}, orderSchemaOptions);

orderSchema.add({
    tenantId: String,
    orderId: String,
    caseId: String,
    currency: String,
    amount: Number,
    status: { type: OrderStatus },
    merchantStatus: String,
    merchantReferenceId: String,
    merchantName: String,
    merchantRateStr: String,
    merchantRate: Number,
    orderRate: { type: RatesSetSchema },
    paymentType: { type: String, default: PaymentTypes.DirectCrypto },
    breakdown: [{ type: OrderBreakdownSchema }],
    user: { type: basicSchema },
    transactions: [{ type: OrderTransactionSchema }],
    comments: String,
    receiverAccount: { type: TransactionAccount },
    isLocked: Boolean,
    LockedUntil: Date,
    LockedBy: String,
    merchantMinersFees: Number,
    ccMinersFees: Number,
});

export default orderSchema;



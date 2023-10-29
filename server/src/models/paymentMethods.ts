import { Schema } from 'mongoose';
import { IDocumentModel } from '../data/base';
import { paymentMethods } from '../data/paymentMethods';

export interface paymentMethodsModel extends IDocumentModel<paymentMethods>, paymentMethods {
}

var currenciesObj: Schema = new Schema({
    name: String,
    isActive: Boolean,
})
var paymentMethodsObj: Schema = new Schema({
    name: String,
    isActive: Boolean,
    currenciesAccepted: [{type: currenciesObj}] 
});
var paymentMethodsSchema: Schema = new Schema();

paymentMethodsSchema.add({
    tenantId: String,
    paymentMethods: [{ type: paymentMethodsObj }],
    addedOn : Date
});

export default paymentMethodsSchema;
//{BANK, 0}
//{Crypto, 0}

//{BTC, 0, 1},
//{LTC, 0, 1},
//{USD, 0, 0},
//{USD, 0, 0},
//{USD, 0, 0},
//{USD, 0, 0},
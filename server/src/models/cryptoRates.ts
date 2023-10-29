import { Schema } from 'mongoose';
import { IDocumentModel } from '../data/base';
import { CryptoRates } from '../data/cryptoRates';

export interface CryptoRatesModel extends IDocumentModel<CryptoRates>, CryptoRates {
}

var BitgoInternalResponse: Schema = new Schema({
    blockchain: Object,
    currencies: Object,
    coin: String
})
var CryptoRatesSchema: Schema = new Schema();

CryptoRatesSchema.add({
    //__invalid_name__24h_avg
    // '24h_avg': Number,
    // total_vol: Number,
    // timestamp: Number,
    // last: Number,
    // bid: Number,
    // ask: Number,
    // cacheTime: Number,
    // monthlyLow: Number,
    // monthlyHigh: Number,
    // prevDayLow: Number,
    // prevDayHigh: Number,
    // lastHourLow: Number,
    // lastHourHigh: Number,
    latest: { type: BitgoInternalResponse }
});

export default CryptoRatesSchema;
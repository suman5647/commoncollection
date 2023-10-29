import { IModel, ITenantModel, IDocumentModel } from './base';
export interface BitgoInternalResponse {
    blockchain: object;
    currencies: object;
    coin: string;
}
export interface CryptoRates extends IModel, ITenantModel, IDocumentModel<CryptoRates> {
    // '24h_avg': number;
    // total_vol: number;
    // timestamp: number;
    // last: number;
    // bid: number;
    // ask: number;
    // cacheTime: number;
    // monthlyLow: number;
    // monthlyHigh: number;
    // prevDayLow: number;
    // prevDayHigh: number;
    // lastHourLow: number;
    // lastHourHigh: number;
    latest: BitgoInternalResponse
}
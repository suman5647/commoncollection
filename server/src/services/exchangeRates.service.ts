import { keys } from '../config/keys';
import { BitgoOperations } from '../platform/bitgoAPI';
import { FiatRates } from '../data/fiatRates';
import * as axios from 'axios';
import { RateObj, RateResult, RateSet, ResponseData } from '../data/common';
import { FiatRatesSevice, CryptoRatesService } from '../services/rates.service';
import { CacheService } from '../services/cache.service';
import { coinValue, currentTimeStamp } from '../config/common';
import { AuditLogSevice } from '../services/auditLog.service';
import { AuditData } from '../config/common';
import { openExchangeRatesData } from '../data/keys';
import { decryptData } from './crypto.service';

const auditLog: AuditLogSevice = new AuditLogSevice();
const cacheOps: CacheService = new CacheService();
const fiatRatesOps: FiatRatesSevice = new FiatRatesSevice();
const cryptoRatesOps: CryptoRatesService = new CryptoRatesService();
const twelveHrs = 12;
var openExchangeData: openExchangeRatesData;
if (keys.openExchangeRates.isEncrypted) {
    openExchangeData = decryptData(keys.openExchangeRates.key);
}
export class ExchangeRatesSerivce {

    //Ex1: USD / BTC Here USD is the base, BTC is quote
    //Ex2: BTC / USD Here BTC is the base, USD is quote
    async calculateRates(base: string, quote: string) {
        try {
            let isFiatBase;
            let isDigitalBase;
            let isFiatQuote;
            let isDigitalQuote;

            isFiatBase = keys.FiatCurrencies.includes(base);
            isFiatQuote = keys.FiatCurrencies.includes(quote);

            isDigitalBase = keys.DigitalCurrencies.includes(base);
            isDigitalQuote = keys.DigitalCurrencies.includes(quote);
            //isFiatBase and isDigitalQuote are true then Fiat to Crypto rates USD, BTC
            if (isFiatBase && isDigitalQuote) {
                let cryptoEurRate = await this.getBtcEurRate(quote);
                let eurRates = await this.eurExchangeRates();
                let baseRateValue = eurRates.data[base];
                let oneEurBtcRate = 1 / cryptoEurRate;  // 1Eur per Btc , 1EUR = 1 / EurBTCValue 
                let oneBaseEurRate = 1 / baseRateValue; //1Basevalue per Eur, 1USD = ? EUR
                let fiatQuoteValue = this.formatCryptoAmount(oneEurBtcRate * oneBaseEurRate); //1USD in BTC
                let result: RateObj = {
                    baseRateValue,
                    fiatQuoteValue,
                    cryptoEurRate
                }
                return { data: result, status: 200 };
            }

            //isFiatQuote and isDigitalBase are true then Crypto to Fiat rates BTC, USD
            else if (isDigitalBase && isFiatQuote) {
                let cryptoEurRate = await this.getBtcEurRate(base);
                let eurRates = await this.eurExchangeRates();
                let baseRateValue = eurRates.data[quote];
                let cryptoQuoteValue = this.formatFiatAmount(cryptoEurRate * baseRateValue); //1BTC in USD
                let result: RateObj = {
                    baseRateValue,
                    cryptoQuoteValue,
                    cryptoEurRate
                }
                return { data: result, status: 200 };
            }

            //isFiatBase and isFiatQQuote are true then Fiat to Fiat rates USD, INR
            else if (isFiatBase && isFiatQuote) {
                let eurRates = await this.eurExchangeRates();
                let baseRateValue = eurRates.data[base]; //USD value
                let quoteRateValue = eurRates.data[quote]; //INR value
                let oneBaseEurRate = 1 / baseRateValue; // 1BaseValue per Eur, 1 USD = ? EUR
                let oneQuoteEurRate = 1 / quoteRateValue; // 1QuoteValue per Eur, 1 INR = ? EUR
                let baseQuoteValue = oneBaseEurRate * 1 / oneQuoteEurRate; //USD PER INR rate
                let result: RateObj = {
                    baseRateValue,
                    baseQuoteValue,
                    quoteRateValue
                }
                return { data: result, status: 200 };
            }

            //isDigitalBase and isDigitalQuote are true then Crypto to Crypto rates BTC, LTC
            else if (isDigitalBase && isDigitalQuote) {
                let cryptoBaseEurRate = await this.getBtcEurRate(base);
                let cryptoQuoteEurRate = await this.getBtcEurRate(quote);
                let baseQuoteValue = cryptoBaseEurRate * 1 / cryptoQuoteEurRate;
                let result: RateObj = {
                    cryptoBaseEurRate,
                    baseQuoteValue,
                    cryptoQuoteEurRate
                }
                return { data: result, status: 200 };
            }
            else {
                let results: RateObj;
                return { data: results, status: 500 }
            }

        } catch (err) {
            let results: RateObj;
            return ({ status: 500, data: results });
        }
    }

    //todo promise to object
    async ratesSet(baseCurrency: string, caseCurrency: string, beneficiaryCurrency: string, benefactorCurrency: string, txnCurrency: string, paymentType: string, orderId, orderStatus, userName): Promise<RateSet> {
        try {
            let caseQuote = caseCurrency;
            //get the case rates
            let caseRatesResult = await this.calculateRates(baseCurrency, caseQuote);
            let caseRates = caseRatesResult.data;
            let caseRateResults = new RateResult();
            caseRateResults.copyInfo(caseRates);
            //get the beneficiary rates
            let beneficiaryRatesResult = await this.calculateRates(baseCurrency, beneficiaryCurrency);
            let beneficiaryRates = beneficiaryRatesResult.data;
            let beneficiaryRateResults = new RateResult();
            beneficiaryRateResults.copyInfo(beneficiaryRates);
            //get the benefactor rates
            let benefactorRatesResult = await this.calculateRates(baseCurrency, benefactorCurrency);
            let benefactorRates = benefactorRatesResult.data;
            var benefactorRateResults = new RateResult();
            benefactorRateResults.copyInfo(benefactorRates);
            //get the Trx rates
            let TrxRatesResult = await this.calculateRates(baseCurrency, txnCurrency);
            let Trxrates = TrxRatesResult.data;
            var TrxRateResults = new RateResult();
            TrxRateResults.copyInfo(Trxrates);
            let rateSet: RateSet;
            if (paymentType.localeCompare('Crypto') == 0) {
                rateSet = {
                    caseRate: caseRateResults.cryptoQuoteValue,
                    benefactorRate: benefactorRateResults.cryptoQuoteValue,
                    beneficiaryRate: beneficiaryRateResults.cryptoQuoteValue,
                    txnRate: TrxRateResults.cryptoQuoteValue === undefined ? TrxRateResults.cryptoQuoteEurRate : TrxRateResults.cryptoQuoteValue
                } as RateSet;
            } else {
                rateSet = {
                    caseRate: caseRateResults.baseQuoteValue,
                    benefactorRate: benefactorRateResults.baseQuoteValue,
                    beneficiaryRate: beneficiaryRateResults.baseQuoteValue,
                    txnRate: TrxRateResults.baseQuoteValue
                } as RateSet;
            }
            let auditLogData = AuditData(`Get RatesSet for orderId ${orderId} at status ${orderStatus}`, userName, 200, rateSet);
            let createLog = await auditLog.create(auditLogData);
            return rateSet;
        } catch (err) {
            let rateSet = {
                caseRate: 0,
                benefactorRate: 0,
                beneficiaryRate: 0,
                txnRate: 0
            } as RateSet;
            return rateSet;
        }
    }

    /////////////////////////*****Helpers*****///////////////////
    private async eurExchangeRates() {
        //1.check cache if not available 
        //2.get from db, check timestamp is less than or equal to 12 hrs is yes get from db and store in cache if not
        //3.get it from openexchangerates api and store in db, cache with time diff of currenttimestamp and ratestimestamp
        let getCache = await cacheOps.getCache('openExchangeRate');
        //getCache is undefined 
        if (getCache == undefined) {
            //get openExchangeRates from DB and check timestamp
            //openexchange timestamp
            let rates = await fiatRatesOps.findAggregate([
                { "$sort": { "_id": -1 } },
                { "$limit": 1 },
                { "$project": { "timestamp": 1, "rates": 1, "_id": 1 } }]);
            if (rates.length > 0) {
                let ratesTimestamp = rates[0].timestamp;
                let currentTimestamp = currentTimeStamp();
                let timestampDiff = currentTimestamp - ratesTimestamp;
                let hrs = this.convertSecToHrs(timestampDiff);
                if (rates[0].rates != null && hrs <= twelveHrs) {
                    //setCache
                    let setCache = await cacheOps.setCache('openExchangeRate', rates[0].rates, keys.cacheExpirySeconds);
                    return { data: rates[0].rates, status: 200 };
                }
                else {
                    let quoteRate = await this.getEurRates();
                    if (quoteRate && quoteRate != null) {
                        let insertRate = await fiatRatesOps.create(quoteRate);
                        let ratesTimestamp = quoteRate.timestamp; //api timestamp
                        let currentTimestamp = currentTimeStamp(); // current timestamp
                        let timestampDiff = currentTimestamp - ratesTimestamp;
                        let hrs = this.convertSecToHrs(timestampDiff);
                        let cacheTime = this.convertHrsToSec(twelveHrs - hrs);
                        //setCache
                        let setCache = await cacheOps.setCache('openExchangeRate', quoteRate.rates, cacheTime);
                        return { data: quoteRate.rates, status: 200 };
                    }
                }
            } else {
                let quoteRate = await this.getEurRates();
                if (quoteRate && quoteRate != null) {
                    let insertRate = await fiatRatesOps.create(quoteRate);
                    let ratesTimestamp = quoteRate.timestamp; //api timestamp
                    let currentTimestamp = currentTimeStamp(); // current timestamp
                    let timestampDiff = currentTimestamp - ratesTimestamp;
                    let hrs = this.convertSecToHrs(timestampDiff);
                    let cacheTime = this.convertHrsToSec(twelveHrs - hrs);
                    //setCache
                    let setCache = await cacheOps.setCache('openExchangeRate', quoteRate.rates, cacheTime);
                    return { data: quoteRate.rates, status: 200 };
                } else {
                    return { data: null, status: 500 };
                }
            }
        } else {
            return { data: getCache, status: 200 };
        }
    }

    //To get openexchangeRate for BaseCurrency 
    private async getEurRates() {
        let ratesUrl = openExchangeData.url + "latest.json?app_id=" + openExchangeData.KeyId + "&base=" + keys.baseCurrency;
        let ratesData = await this.openExchangeRates(ratesUrl);
        if (ratesData.status == 200) {
            let fiatRate = ratesData.data;
            let auditLogData = AuditData('OpenExchangeRates response', '', ratesData.status, ratesData.data);
            let createLog = await auditLog.create(auditLogData);
            return fiatRate;
        } else {
            let auditLogData = AuditData('OpenExchangeRates error response', '', ratesData.status, ratesData.data);
            let createLog = await auditLog.create(auditLogData);
            return ratesData.data;
        }
    }

    //openExchangeRates get API
    private async openExchangeRates(url: string): Promise<ResponseData<FiatRates>> {
        const response = await axios.default.get<FiatRates>(url)
            .then(async (response) => {
                const result = response.data;
                return { data: result, status: 200 };
            }).catch(async (error) => {
                return { data: error, status: 500 };
            })
        return response;
    }

    //Bitgo markets api 1BTC/EUR Rate or 1LTC/EUR Rate
    private async getBtcEurRate(coin: string) {
        //setcache to 1sec and no checking to db
        if (coin.localeCompare('BTC') == 0) {
            let getCache = await cacheOps.getCache('bitgoBtcExchangeRates');
            if (getCache == undefined) {
                const bitgoOps: BitgoOperations = new BitgoOperations();
                let cryptoRates = await bitgoOps.getRates(coin, 'system');
                if (cryptoRates.status == 200) {
                    let insertRate = await cryptoRatesOps.create(cryptoRates.data); //entire data push to db
                    let latestCurrencies = cryptoRates.data.latest.currencies[keys.baseCurrency];
                    let setCache = await cacheOps.setCache('bitgoBtcExchangeRates', latestCurrencies, 1);
                    return latestCurrencies.ask;
                }
            } else {
                return getCache.ask;
            }
        }
        if (coin.localeCompare('LTC') == 0) {
            let getCache = await cacheOps.getCache('bitgoLtcExchangeRates');
            if (getCache == undefined) {
                const bitgoOps: BitgoOperations = new BitgoOperations();
                let cryptoRates = await bitgoOps.getRates(coin, 'system'); // todo system
                if (cryptoRates.status == 200) {
                    let insertRate = await cryptoRatesOps.create(cryptoRates.data);//entire data push to db
                    let latestCurrencies = cryptoRates.data.latest.currencies[keys.baseCurrency];
                    let setCache = await cacheOps.setCache('bitgoLtcExchangeRates', latestCurrencies, 1);
                    return latestCurrencies.ask;
                }
            } else {
                return getCache.ask;
            }
        }
        if (coin.localeCompare('BCH') == 0) {
            let getCache = await cacheOps.getCache('bitgoBchExchangeRates');
            if (getCache == undefined) {
                const bitgoOps: BitgoOperations = new BitgoOperations();
                let cryptoRates = await bitgoOps.getRates(coin, 'system'); // todo system
                if (cryptoRates.status == 200) {
                    let insertRate = await cryptoRatesOps.create(cryptoRates.data);//entire data push to db
                    let latestCurrencies = cryptoRates.data.latest.currencies[keys.baseCurrency];
                    let setCache = await cacheOps.setCache('bitgoBchExchangeRates', latestCurrencies, 1);
                    return latestCurrencies.ask;
                }
            } else {
                return getCache.ask;
            }
        }
    }

    //Round the cryptoAmount to 8 decimals
    private formatCryptoAmount(x: number): number {
        return Number(Number.parseFloat(x.toString()).toFixed(8));
    }

    //Round the fiatAmount to 2 decimals
    private formatFiatAmount(x: number): number {
        return Number(Number.parseFloat(x.toString()).toFixed(2));
    }

    //convert seconds to hours
    private convertSecToHrs(s: number) {
        var h = Math.floor(s / 3600);
        return h;
    }
    //convert seconds to hours
    private convertHrsToSec(h: number) {
        var h = Math.floor(h * 3600);
        return h;
    }
    //convert seconds to minutes
    private convertSecToMins(s: number) {
        var h = Math.floor(s / 60);
        return h;
    }
    //convert minutes to seconds
    private convertMinsToSecs(s: number) {
        var h = Math.floor(s / 60);
        return h;
    }
    // //add minutes to current time
    // private AddMinutes(m: number): Number {
    //     let newDt = new Date();
    //     let timestamp = Math.round(newDt.setMinutes(newDt.getMinutes() + m) / milliSeconds);
    //     return timestamp;
    // }
    // //add hours to current time
    // private AddHours(h: number): Number {
    //     let newDt = new Date();
    //     let timestamp = Math.round(newDt.setHours(newDt.getHours() + h) / milliSeconds);
    //     return timestamp;
    // }
    //1591265491
    //BTC = INR Rates, 1BTC = 7500000INR 
    //BTC = USD Rates, 1BTC = 8639 EUR
    //BTC = DKK Rates, 1DKK = 62000 DKK
    // private async CryptoToFiatRates(fiat: string, crypto: string, cryptoAmount: number) {
    //     let btcEurRate = await this.getBtcEurRate(crypto);
    //     return btcEurRate;
    // }

    //Fiat to Crypto conversion(OpenExchangeRates(BaseCurrency))
    //100 USD => BTC => 1USD = 0.000098BTC THEN 100 USD = 100*0.000098 BTC(openExchangeRates(USD))
    //100 INR => BTC => 1INR = 0.00000013BTC THEN 100INR = 100*0.00000013 BTC(openExchangeRates(INR)) 
    //100 DKK => BTC => 1DKK = 0.0000027BTC THEN 100DKK = 100*0.0000027 BTC(openExchangeRates(DKK)) 
    //100 EUR => BTC => 1EURR = 0.000075BTC THEN 100EUR = 100*0.000075 BTC(openExchangeRates(EUR)) 

    //Crypto to Fiat conversion(BitgoApi or Kraken)
    //0.0003BTC => INR => 1BTC = 761388.14 INR THEN 0.0003BTC = 0.0003BTC*761388.14 INR
    //0.0003BTC => USD => 1BTC = 10171.17 USD THEN 0.0003BTC = 0.0003BTC*10171.17 USD

    //FIAT:USD, CRYPTO: BTC => 1USD = 0.000099 BTC
    //FIAT:INR, CRYPTO: BTC => 1INR = 0.0000013 BTC
    //FIAT:EUR, CRYPTO: BTC => 1EUR = 0.00011 BTC
    ////////////////////////////////////////////
    //1USD = ?BTC
    //1INR = ?BTC
    //1INR = ?LTC
    //1DKK = ?LTC
    //1.Openexchagerates of EUR, get one 1 EUR per USD value (USD/BTC)
    //2.GetBTCEUR rates from bitgo
    //3.Calculate 1USD to BTC value
    ////////////////////////////////////////////
    //1BTC = ? INR 
    //1BTC = ? DKK 67.805,46 DKK/BTC
    //1BTC = ? EUR
    //1LTC = ? INR
    //1.GetBTCEur value from bitgo(BTC/INR)
    //2.Openexchange value of Eur, get one 1 EUR per INR value
    //3.calculate 1BTC to INR value
    /**
     *  latest: {
    blockchain: Object,
    currencies:Object,
    coin: string
  }
    */
}

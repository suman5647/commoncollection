import { ServiceBase } from "./base";
import FiatRatesSchema, { FiatRatesModel } from "../models/fiatRates";
import {FiatRates } from "../data/fiatRates";
import { RepositoryBase } from "../repository/base";
import { CryptoRates } from "../data/cryptoRates";
import CryptoRatesSchema, { CryptoRatesModel } from "../models/cryptoRates";

export class FiatRatesSevice extends ServiceBase<FiatRates, FiatRatesModel> {
    constructor() {
        super(FiatRatesSchema, "fiatRates");
    }

    // add extra methods here
    test() { };
}

export class CryptoRatesService extends ServiceBase<CryptoRates, CryptoRatesModel>  {
    constructor() {
        super(CryptoRatesSchema, "cryptoRates");
    }

    // add extra methods here
    test() { };
}
import { Request, Response } from 'express';
import { ExchangeRatesSerivce } from '../services/exchangeRates.service';
import { getEnvValue } from '../config/common';
import { keys } from '../config/keys';
import { AuditData, coinValue } from '../config/common';
const exchange: ExchangeRatesSerivce = new ExchangeRatesSerivce();
export class ExchangeRatesController {

    constructor() {
    }

    async getRates(req: Request, res: Response) {
        try {
            let base = req.params.base;
            let quote = req.params.quote;
            let rates = await exchange.calculateRates(base, quote);
            if (rates.status == 200) {
                res.statusCode = rates.status;
                res.send(rates);
            } else {
                res.statusCode = rates.status;
                res.send(rates);
            }
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

}
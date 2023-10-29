import { search } from '../config/common';
import { keys } from '../config/keys';
import { IAccountDetails, PaymentTypes } from '../data/common';
import { Order } from '../data/order';
import { User } from '../data/user';
import { cryptoCurrencyList } from '../models/common';
import { ExchangeRatesSerivce } from './exchangeRates.service';
import { sendCoins } from './sendCoinsToReceiver.service';
import { OrderService } from '../services/order.service';

const sendCoinsService: sendCoins = new sendCoins();
const exchangeService: ExchangeRatesSerivce = new ExchangeRatesSerivce();
let oservice: OrderService = new OrderService();

export class OrderPayoutService {

    async singleOrderPayout(order: Order, userLite: User, accountDetails: IAccountDetails[]) {
        try {
            let donationObj = search('donationAmount', order.breakdown);
            let amount: number = donationObj.amount;
            let donationTx = order.transactions[order.transactions.length - 1];
            let accountCryptoAddress = accountDetails[accountDetails.length - 1].accountId;
            let accountCurrency = accountDetails[accountDetails.length - 1].currency;
            let acccountType = accountDetails[accountDetails.length - 1].accountType;
            let payoutAmount: FormatedValue;

            //If accountType is Direct crypto then process payout else other payment Types are not yet introduced only crypto payouts 
            if (acccountType === PaymentTypes.DirectCrypto) {
                if (this.isUserCurrencyCrypto(accountCurrency)) {
                    payoutAmount = await this.getPayoutAmount(amount, accountCurrency, donationTx.currency);
                    let amountformated;
                    let amountInSato: number;
                    let breakdowns = [];
                    //if order is a merchant processed order
                    if (order.merchantRate !== undefined && order.merchantReferenceId !== undefined) {
                        amountformated = (payoutAmount.amount / order.merchantRate);
                        let minerFees = Number(Number(order.merchantMinersFees).toPrecision());
                        amountformated -= minerFees;
                        let merchantMinerFees = await this.getMinerFeesvalue(order.merchantMinersFees, donationTx.currency, order.currency);

                        //pushing the merchantMinersFees breakdown
                        breakdowns.push({
                            "name": "merchantMinersFees",
                            "amount": merchantMinerFees
                        });
                    } else {
                        amountformated = payoutAmount.amount;
                        // amountInSato = Math.floor(amountformated * keys.BTCTxUnits);
                    }
                    const finalPayout = await this.amountCCAfterMinerFees(amountformated, payoutAmount.currency);
                    amountInSato = Math.floor(finalPayout.payoutAmount * keys.BTCTxUnits);
                    let ccMinerFees = await this.getMinerFeesvalue(finalPayout.minerFees, payoutAmount.currency, order.currency);
                    //pushing the ccMinerFees breakdown
                    breakdowns.push({
                        "name": "ccMinerFees",
                        "amount": ccMinerFees
                    });
                    console.log('breakdowns', breakdowns);
                    let updatedBreakDown = await oservice.updatePart({ orderId: order.orderId }, {
                        $push: {
                            breakdown: breakdowns
                        }
                    });
                    let payoutOrder = await sendCoinsService.processPayout(payoutAmount.currency, amountInSato, 0, accountCryptoAddress, userLite.userid);
                    return payoutOrder;
                } else {
                    let results = {
                        status: 500,
                        data: 'Currently user provided currency is not servered.'
                    };
                    return results;
                }
            } else {
                let results = {
                    status: 500,
                    data: 'Currently order payout happens in Crypto only.'
                };
                return results;
            }
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, Error: err } };
        }
    }
    /*
    async multipleOrdersPayout(orderId: string[], userLite: User, accountDetails: IAccountDetails[]) {
        try {
            let donationObj = search('donationAmount', order.breakdown);
            let amount: number = donationObj.amount;
            let donationTx = order.transactions[order.transactions.length - 1];
            let accountCryptoAddress = accountDetails[accountDetails.length - 1].accountId;
            let accountCurrency = accountDetails[accountDetails.length - 1].currency;
            let acccountType = accountDetails[accountDetails.length - 1].accountType;
            let payoutAmount: number;

            //If accountType is Direct crypto then process payout else other payment Types are not yet introduced only crypto payouts 
            if (acccountType === PaymentTypes.DirectCrypto) {
                if (this.isUserCurrencyCrypto(accountCurrency)) {
                    payoutAmount = await this.getPayoutAmount(amount, accountCurrency, donationTx.currency);
                    console.log('payoutAmount', payoutAmount);
                    let amountformated;
                    //if order is a merchant processed order
                    if (order.merchantRate !== undefined && order.merchantReferenceId !== undefined) {
                        amountformated = (payoutAmount / order.merchantRate);
                    } else {
                        amountformated = payoutAmount;
                    }
                    console.log('amountformated', amountformated);
                    const amountInSato: number = Math.floor(amountformated * keys.BTCTxUnits);
                    console.log('amountInSato', amountInSato);
                    let payoutOrder = await sendCoinsService.processPayout(donationTx.currency, amountInSato, 0, accountCryptoAddress, userLite.userid);
                    return payoutOrder;
                } else {
                    let results = {
                        status: 500,
                        data: 'Currently user provided currency is not servered.'
                    };
                    return results;
                }
            } else {
                let results = {
                    status: 500,
                    data: 'Currently order payout happens in Crypto only.'
                };
                return results;
            }
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, Error: err } };
        }
    }*/

    async isCurrenciesMatch(userCurrency: string, donationCurrency: string) {
        if (userCurrency === donationCurrency)
            return true;
        else
            return false;

    }

    async isUserCurrencyCrypto(userCurrency: string) {
        if (cryptoCurrencyList.includes(userCurrency))
            return true;
        else
            return false;
    }

    async getPayoutAmount(amount: number, userCurrency: string, donationCurrency: string): Promise<FormatedValue> {
        let currencyData = await this.isCurrenciesMatch(userCurrency, donationCurrency);
        switch (currencyData) {
            case true:
                let data = {
                    amount: amount,
                    currency: donationCurrency
                };
                return data;
            case false:
                //Convert the amount into userCurrency i.e.LTC
                if (userCurrency === 'LTC' && donationCurrency === 'BTC') {
                    let conversionValue = await exchangeService.calculateRates(userCurrency, donationCurrency);
                    let conversionAmount = amount / conversionValue.data.baseQuoteValue;
                    let data = {
                        amount: conversionAmount,
                        currency: userCurrency
                    }
                    return data;
                }
                //Convert the amount into userCurrency i.e.BTC
                else if (userCurrency === 'BTC' && donationCurrency === 'LTC') {
                    let conversionValue = await exchangeService.calculateRates(userCurrency, donationCurrency);
                    let conversionAmount = amount / conversionValue.data.baseQuoteValue;
                    let data = {
                        amount: conversionAmount,
                        currency: userCurrency
                    }
                    return data;
                }
            default:
                break;
        }
    }

    async amountCCAfterMinerFees(payoutAmount, payoutCurrency) {
        if (payoutCurrency === 'LTC') {
            let minerFees = keys.MINERFEES.litecoin;
            let amount = payoutAmount - minerFees;
            return {
                payoutAmount: amount,
                minerFees: minerFees
            };
        } else if (payoutCurrency === 'BTC') {
            let minerFees = keys.MINERFEES.bitcoin;
            let amount = payoutAmount - minerFees;
            return {
                payoutAmount: amount,
                minerFees: minerFees
            }
        }
    }

    async getMinerFeesvalue(minerFees: number, baseCurrency: string, cryptoCurrency: string) {
        let conversionValue = await exchangeService.calculateRates(baseCurrency, cryptoCurrency);
        let minerFeesAmount = Number((conversionValue.data.cryptoQuoteValue * minerFees).toFixed(2));
        return minerFeesAmount;
    }



}

export interface FormatedValue {
    amount: number;
    currency: string;
}
import { paymentMethodsService } from '../services/paymentMethods.service'
import { paymentMethods, currenciesObj, paymentMethodsObj } from '../data/paymentMethods';
import { search } from '../config/common';
let paymentMethods: paymentMethodsService = new paymentMethodsService();

async function addPaymentMethods() {


    //Bank paymentMethods
    let bankCurrencies = [
        {
            name: 'DKK',
            isActive: false
        } as currenciesObj,
        {
            name: 'EUR',
            isActive: false
        } as currenciesObj,
        {
            name: 'GBP',
            isActive: false
        } as currenciesObj,
    ];

    let bankPaymentObj = {
        name: 'Bank',
        isActive: false,
        currenciesAccepted: bankCurrencies
    } as paymentMethodsObj;

    //Crypto paymentMethod
    let cryptoCurrencies = [
        {
            name: 'BTC',
            isActive: true
        } as currenciesObj,
        {
            name: 'LTC',
            isActive: true
        } as currenciesObj,
    ]

    let cryptoPaymentObj = {
        name: 'Crypto',
        isActive: true,
        currenciesAccepted: cryptoCurrencies
    } as paymentMethodsObj;

    //CreditCard Currencies
    let creditCardCurrencies = [
        //{ name: 'AED', isActive: false } as currenciesObj,
        { name: 'ARS', isActive: false } as currenciesObj,
        { name: 'AUD', isActive: false } as currenciesObj,
        { name: 'BHD', isActive: false } as currenciesObj,
        { name: 'CAD', isActive: false } as currenciesObj,
        { name: 'CHF', isActive: false } as currenciesObj,
        { name: 'CLP', isActive: false } as currenciesObj,
        { name: 'CNY', isActive: false } as currenciesObj,
        { name: 'CRC', isActive: false } as currenciesObj,
        { name: 'CZK', isActive: false } as currenciesObj,
        { name: 'DKK', isActive: false } as currenciesObj,
        { name: 'EUR', isActive: false } as currenciesObj,
        { name: 'GBP', isActive: false } as currenciesObj,
        { name: 'GEL', isActive: false } as currenciesObj,
        { name: 'GTQ', isActive: false } as currenciesObj,
        { name: 'HKD', isActive: false } as currenciesObj,
        { name: 'HUF', isActive: false } as currenciesObj,
        { name: 'INR', isActive: false } as currenciesObj,
        { name: 'JOD', isActive: false } as currenciesObj,
        { name: 'JPY', isActive: false } as currenciesObj,
        { name: 'KRW', isActive: false } as currenciesObj,
        { name: 'KWD', isActive: false } as currenciesObj,
        { name: 'KZT', isActive: false } as currenciesObj,
        { name: 'MDL', isActive: false } as currenciesObj,
        { name: 'MXN', isActive: false } as currenciesObj,
        { name: 'NOK', isActive: false } as currenciesObj,
        { name: 'NZD', isActive: false } as currenciesObj,
        { name: 'PHP', isActive: false } as currenciesObj,
        { name: 'RSD', isActive: false } as currenciesObj,
        { name: 'SEK', isActive: false } as currenciesObj,
        { name: 'SGD', isActive: false } as currenciesObj,
        { name: 'TWD', isActive: false } as currenciesObj,
        { name: 'USD', isActive: false } as currenciesObj,
        { name: 'VND', isActive: false } as currenciesObj,
        { name: 'ZAR', isActive: false } as currenciesObj
    ]

    let creditCardPaymentObj = {
        name: 'CreditCard',
        isActive: false,
        currenciesAccepted: creditCardCurrencies
    } as paymentMethodsObj;

    let allPaymentMethods = [bankPaymentObj, cryptoPaymentObj, creditCardPaymentObj];
    let payments = {
        tenantId: 'cc',
        paymentMethods: allPaymentMethods,
        addedOn: new Date()
    } as paymentMethods;
    let addPaymentsMeth = await paymentMethods.create(payments);
}

//addPaymentMethods()

async function getActivePaymentMethods() {
    //let getActivePaymentMethods = await paymentMethods.findOneSelect({ tenantId: 'cc', paymentMethods: { $elemMatch: { isActive: true } } }, { paymentMethods: 1 })
    // let getActivePaymentMethods = await paymentMethods.findAggregate([
    //     { $sort: { "addedOn": -1 } },
    //     { $unwind: '$paymentMethods' },
    //     { $match: { 'paymentMethods.isActive': true } },
    //     { 
    //         $group: {
    //             _id: "$_id",
    //             addedOn: {$last: "$addedOn" },
    //             paymentMethods: {$first: "$paymentMethods" },
    //         }
    //     },
    //     {
    //         $project: {
    //             paymentMethods: 1,
    //             addedOn: 1
    //         }
    //     }
    // ])
    //let getActivePaymentMethods = await paymentMethods.findOneSelect({ tenantId: 'cc', addedOn: -1}, { paymentMethods: 1 })
    let bool: Boolean = true;
    let getActivePaymentMethods = await paymentMethods.findLatest({ paymentMethods: { $elemMatch: { name: 'Bank' } } });
    let paymentMethod: paymentMethodsObj[] = getActivePaymentMethods.paymentMethods;
    let activePayments = [];

    for (let i = 0; i < paymentMethod.length; i++) {
        let j = 0
        if (paymentMethod[i].isActive == false) {
            continue;
        }
        else {
            let payment = {
                name: paymentMethod[i].name,
                currencies: paymentMethod[i].currenciesAccepted
            }
            activePayments.push(payment);
            j++;
        }
    }
    
    let requiredPayments = [];
    for (let i = 0; i < activePayments.length; i++) {
        let method = activePayments[i].currencies;
        let currencies = [];
        for (let j = 0; j < method.length; j++) {
            if (method[j].isActive == false)
                continue;
            else {
                currencies.push(method[j].name);
            }
        }
        let paymentMethod = {
            name: activePayments[i].name,
            activeCurrencies: currencies
        }
        requiredPayments.push(paymentMethod);
    }
    console.log(requiredPayments);
}
getActivePaymentMethods();


/**
 * paymentMethods:
 *[{
 * name: 'Bank'
 * currencies: ['DKK','EUR']
 * },
 * {
 * name: 'Crypto'
 * currencies: ['BTC','LTC']
 * }]
 *
 */

// let curr = ['AED', 'ARS', 'AUD', 'BHD', 'CAD', 'CHF', 'CLP', 'CNY', 'CRC', 'CZK', 'DKK', 'EUR', 'GBP', 'GEL', 'GTQ', 'HKD', 'HUF', 'INR', 'JOD', 'JPY', 'KRW', 'KWD', 'KZT', 'MDL', 'MXN', 'NOK', 'NZD', 'PHP', 'RSD', 'SEK', 'SGD', 'TWD', 'USD', 'VND', 'ZAR']

// let currObj = [];

// curr.forEach(element => {
//     let obj =
//     {
//         name: element,
//         isActive: false
//     }
//     currObj.push(obj);
// });

// console.log(currObj)
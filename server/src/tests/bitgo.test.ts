import { BitgoAPIWrapper } from '../platform/bitgo.operations';
import { BitgoOperations } from '../platform/bitgoAPI';
import { keys } from '../config/keys';
import { ExchangeRatesSerivce } from '../services/exchangeRates.service';
import { CryptoRatesService } from '../services/rates.service'
import * as request from 'request';
import { CacheService } from '../services/cache.service';
import { FiatRatesSevice } from '../services/rates.service';
import { setTimeout } from 'timers';
import { OrderService } from '../services/order.service';
import { emailSendService } from '../services/email.service';
import {sendCoins} from '../services/sendCoinsToReceiver.service';
import { BitgoData } from '../data/keys';
import { decryptData } from '../services/crypto.service'; 

var Bitgo: BitgoData;
if(keys.bitGo.isEncrypted){
    Bitgo = decryptData(keys.bitGo.key);
}

process.env.NODE_ENV = 'test';
const cryptoRatesOps: CryptoRatesService = new CryptoRatesService();
const cacheOps: CacheService = new CacheService();
const coin = '/api/v2/tbtc';
const bitgo: BitgoAPIWrapper = new BitgoAPIWrapper();
const bitGoMain: BitgoOperations = new BitgoOperations();
const ratesOps: FiatRatesSevice = new FiatRatesSevice();
const exchange: ExchangeRatesSerivce = new ExchangeRatesSerivce();
let oservice: OrderService = new OrderService();
let sendCoinsOps: sendCoins = new sendCoins();
const amountInSato: number =  0.0032*keys.BTCTxUnits; //in sathosi
console.log(amountInSato);
sendCoinsOps.processPayout('BTC', amountInSato, 0, 'mnYbExhbUDTeLEyQCs3uU55gEYcL9J48rV', 'sunkuomkarsai@gmail.com').then((data) => {
console.log(data);
})
// bitgo.getWallet(coin).then(async(d) => {
//      console.log(d)
// });
// "hostname": "test.bitgo.com",
//     "path": coin + '/wallet/' + keys.bitGo.walletId,
//tbtc/wallet/5ecb4c1b3509617b016bf873dd6424d4/tx/ad3226c409d73a638a1bb7cbdb12c414bbce99e2346a10624906c50b0e4421f5
const options = {
    "method": "GET",
    "headers": {
        'Authorization': "Bearer " + Bitgo.accessToken,
    }
}
const options1 = {
    "method": "POST",
    "headers": {
        'Authorization': "Bearer " + Bitgo.accessToken,
    },
}
const postData = {
    count: 1,
    label: 'sample'
}

// bitGoMain.getWalletDetails('BTC').then((data) => {
//     console.log(data);
// }
// )
// bitGoMain.unlock().then((data) => {
//     let response = data;
//     console.log(response.data.session.unlock)
//     let currentDateTime = new Date();
//     let bitgoUnlockExpiry = response.data.session.unlock.expires;
//     console.log('current dateTime:', currentDateTime);
//     console.log('bitgo dateTime:', bitgoUnlockExpiry);
//     if (fn_DateCompare(bitgoUnlockExpiry, currentDateTime) < 0) {
//         console.log(fn_DateCompare(bitgoUnlockExpiry, currentDateTime)); // t1, t2 => 1 
//         console.log(fn_DateCompare(currentDateTime, bitgoUnlockExpiry)); // t1, t2 => -1
//     }
// })

function fn_DateCompare(DateA, DateB) {     // this function is good for dates > 01/01/1970
    var a = new Date(DateA);
    var b = new Date(DateB);
    let msDateA = Date.UTC(a.getFullYear(), a.getMonth() + 1, a.getDate(), a.getHours(), a.getMinutes(), a.getSeconds());
    let msDateB = Date.UTC(b.getFullYear(), b.getMonth() + 1, b.getDate(), b.getHours(), b.getMinutes(), b.getSeconds());
    if (parseFloat(msDateA.toString()) < parseFloat(msDateB.toString()))
        return -1;  // lt
    else if (parseFloat(msDateA.toString()) == parseFloat(msDateB.toString()))
        return 0;  // eq
    else if (parseFloat(msDateA.toString()) > parseFloat(msDateB.toString()))
        return 1;  // gt
    else
        return null;  // error
}
// var dates = {
//     convert: function (d) {
//         // Converts the date in d to a date-object. The input can be:
//         //   a date object: returned without modification
//         //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
//         //   a number     : Interpreted as number of milliseconds
//         //                  since 1 Jan 1970 (a timestamp) 
//         //   a string     : Any format supported by the javascript engine, like
//         //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
//         //  an object     : Interpreted as an object with year, month and date
//         //                  attributes.  **NOTE** month is 0-11.
//         return (
//             d.constructor === Date ? d :
//                 d.constructor === Array ? new Date(d[0], d[1], d[2]) :
//                     d.constructor === Number ? new Date(d) :
//                         d.constructor === String ? new Date(d) :
//                             typeof d === "object" ? new Date(d.year, d.month, d.date) :
//                                 NaN
//         );
//     },
//     compare: function (a:any, b: any) {
//         // Compare two dates (could be of any type supported by the convert
//         // function above) and returns:
//         //  -1 : if a < b
//         //   0 : if a = b
//         //   1 : if a > b
//         // NaN : if a or b is an illegal date
//         // NOTE: The code inside isFinite does an assignment (=).
//         return (
//             isFinite(a = this.convert(a).valueOf()) &&
//                 isFinite(b = this.convert(b).valueOf()) 
//                 ? (a>b) - (a<b) :
//                 NaN
//         );
//     },
//     inRange: function (d, start, end) {
//         // Checks if date in d is between dates in start and end.
//         // Returns a boolean or NaN:
//         //    true  : if d is between start and end (inclusive)
//         //    false : if d is before start or after end
//         //    NaN   : if one or more of the dates is illegal.
//         // NOTE: The code inside isFinite does an assignment (=).
//         return (
//             isFinite(d = this.convert(d).valueOf()) &&
//                 isFinite(start = this.convert(start).valueOf()) &&
//                 isFinite(end = this.convert(end).valueOf()) ?
//                 start <= d && d <= end :
//                 NaN
//         );
//     }
// }
// function AddHours(h: number): Number {
//     let newDt = new Date();
//     let timestamp = Math.round(newDt.setHours(newDt.getHours() + h) / 1000);
//     return timestamp;
// }
// let n = AddHours(12);
// console.log(n);
//////////*************/
/*cacheOps.setCache('name', 'Omkar', '2minutes').then((data)=>{
    console.log(data);
    cacheOps.getTTl('name').then((data)=> {
        console.log('1:',data);
    })
    cacheOps.setCache('name2', 'Sunku', '1hours').then((data)=>{
        cacheOps.getTTl('name2').then((data)=> {
            console.log('2:',data);
        })
    })
    cacheOps.setCache('name3', 'Sunku', 300).then((data)=>{
        cacheOps.getTTl('name3').then((data)=> {
            console.log('3:',data);
        })
    })
    setTimeout(timeFunc,80000)
})
function timeFunc(){
    console.log('fucn called')
    cacheOps.getCache('name').then((data)=>{
        console.log(data);
    })
}
//  exchange.getBtcEurRate('tbtc').then((data)=>{
//     console.log(data);
//  })
// async function call(){
// let getCryptoRates = await cryptoRatesOps.findAggregate([
//     { "$match": { "latest.coin": 'tltc' } },
//     { "$sort": { "_id": -1 } },
//     { "$limit": 1 }]);
//     console.log(getCryptoRates[0]);
// }
// call();
//bitgo.getAPI()
//bitgo.getAPI('api/v2/tbtc/wallet/'+keys.bitGo.walletId, options);
//bitgo.postAPI('api/v2/tbtc/wallet/' + keys.bitGo.walletId + '/address', options1, postData);
//bitgo.getAPI('api/v2/user/session', options);
//bitGoMain.getWalletDetails('tbtc');
//  bitGoMain.getTransaction('tbtc','ad3226c409d73a638a1bb7cbdb12c414bbce99e2346a10624906c50b0e4421f5').then((txDetails) =>{
//     console.log(txDetails);
//     console.log(txDetails.data.outputs);
//  });
//Rates
// exchange.FiatToCryptoRates('DKK','BTC', 100).then((data)=>{
//     //console.log(data);
// })
// exchange.FiatToCryptoRates('INR','BTC', 150).then((data)=>{
//     //console.log(data);
// })
// exchange.FiatToCryptoRates('USD','BTC', 100).then((data)=>{
//     console.log(data); //1EUR/USD VALUE
// })
// ratesOps.findAggregate([
//     { "$sort": { "_id": -1 } },
//     { "$limit": 1 },
//     { "$project": { "timestamp": 1, "rates": 1 } }]
// ).then((data) => {
//     console.log(data[0].rates);
// });
// exchange.getBtcEurRate('TBTC').then((data)=>{
//     console.log(data);
// })
// let digitalCurrencies = keys.TestNetDigitalCurrencies.length;
// let fiatCurrencies = keys.FiatCurrencies.length;
// console.log('fiat:', fiatCurrencies);
// console.log('digital:', digitalCurrencies);
// console.log(keys.FiatCurrencies.includes('USD'));
// console.log(keys.FiatCurrencies.includes('INR'));
// console.log(keys.TestNetDigitalCurrencies.includes('BTC'));
// console.log(keys.TestNetDigitalCurrencies.includes('ETH'))
// console.log(keys.TestNetDigitalCurrencies.includes('LTC'))
// cacheOps.getCache('openExchangeRate').then((data) => {
//     if (data != undefined)
//         console.log('getData',data);
//     else {
//         cacheOps.setCache('getRates', { 'Sunku': 25 }).then((data) => {
//             console.log('set data', data);
//             cacheOps.getCache('getRates').then((data) =>{
//                 console.log('data1:',data);
//             })
//         })
//     }
// })
// exchange.eurExchangeRates().then((data)=>{
//     console.log('return value:', data)
// })
// exchange.CryptoToFiatRates('USD', 'TLTC', 0.00987986).then((data) => {
//     console.log(data);
// })
// exchange.CryptoToFiatRates('INR', 'TBTC', 0.0001974363).then((data) => {
//     //console.log(data);
// })
// exchange.CryptoToFiatRates('EUR', 'TBTC', 0.0001974363).then((data) => {
//   //  console.log(data);
// })
// exchange.CryptoToFiatRates('DKK', 'TBTC', 0.0001974363).then((data) => {
//     //console.log(data);
// })
// bitGoMain.getRates('tbtc').then((rates)=>{
//      let rate = rates.data;
//      let currenciesRates = rate.latest.currencies;
//      console.log('curreciesRates:', currenciesRates);
// })
//bitGoMain.getSession();
//bitGoMain.createWalletAddress('tbtc',1, 'title');
//bitGoMain.unlock();
///--------------------
/*const wallet = fetch(keys.bitGo.testUrl + coin + '/wallet/' + keys.bitGo.walletId, {
   method: 'GET',
   headers: {
       'Authorization': "Bearer " + keys.bitGo.accessToken,
   }
}).then(res => {
   console.log(res);
})
//-----------
var options = {
   host: keys.bitGo.testUrl+coin + '/wallet/'+ keys.bitGo.walletId,
   method: 'GET',
   headers: {
       'Authorization': "Bearer " + keys.bitGo.accessToken,
   }
}
var req = https.get(options, function(res) {
   console.log(res);
 });
 */
// bitgoOps.WalletBalance().then(async (data) => {
//     console.log('data:', data);
//     const address: string = 'mnYbExhbUDTeLEyQCs3uU55gEYcL9J48rV'; 
//     const amount: number =  0.0032;
//     const amountInSato: number =  0.0032*1e8; //in sathosi
//     const walletBalance : number = parseInt(data)/1e8;
//     console.log('walletBalance:',walletBalance);
//     console.log('amountToSend:',amount);
//     console.log('amountToSendInSato:',amountInSato);
//     if(walletBalance > amount){

//             bitgoOps.SendCoins(address, amountInSato).then(async(data)=> {
//                 console.log(data);
//             });
//     }
// }
// )
// bitgoOps.CreateWalletAddress(1,'casetitle01').then(async(address)=>{
//     console.log('address:',address);
// })

// id: '5ec4c75fce9cab2f035219f8286ea006',
//   address: '2N1uEMXqgiBHeCvzFXhkPnhQQtcheVrZT3i',
//   chain: 10,
//   index: 271,
//   coin: 'tbtc',
//   wallet: '5dedd79f3877683406f6ceabdd051c09',
//   label: 'casetitle01'
//------------------------------------
// id: '5ec4c7d325458b2c0093ddb420f52955',
//   address: '2N3MNXVwxWCS886tRjBKsZukVNf99BusGcb',
//   chain: 10,
//   index: 272,
//   coin: 'tbtc',
//   wallet: '5dedd79f3877683406f6ceabdd051c09',
//   label: 'casetitle01',

// public async SendCoins(address: string, amount: number) {
//     const walletInstance = await this.basecoin.wallets().get({ id: walletId }, function (err, wallet) {
//         if (err) { console.log("Error getting wallet!"); console.dir(err); return process.exit(-1); }
//         console.log("Balance is: " + (wallet.balance() / 1e8).toFixed(4));

//         wallet.send({ address: address, amount: amount, walletPassphrase: walletPassphrase, minConfirms: 0 },
//             function (err, result) {
//                 if (err) { console.log("Error sending coins!"); console.dir(err); return process.exit(-1); }

//                 console.dir(result);
//                 process.exit(0);
//             }
//         );
//     })
//-------BitgoRates from Db -------
// let getCryptoRates = await cryptoRatesOps.findAggregate([
//     { "$match": { "latest.coin": coin } },
//     { "$sort": { "_id": -1 } },
//     { "$limit": 1 }]);
// let date = new Date();
// let ratesTimestamp = getCryptoRates[0].schema;
// let currentDateTimeStamp = this.AddMinutes(1);
// console.log(currentDateTimeStamp);
// // let timestampDiff = currentDateTimeStamp.valueOf() - ratesTimestamp;
// //rates called within 1min take from db else call api store it in db
// // if (getCryptoRates != null && timestampDiff <= minSeconds) {
// //return getCryptoRates[0].ask;
// //} else {
// const bitgoOps: BitgoOperations = new BitgoOperations();
// let cryptoRates = await bitgoOps.getRates(coin);
// if (cryptoRates.status == 200) {
//     let insertRate = await cryptoRatesOps.create(cryptoRates.data);//entire data push db
//     let latestCurrencies = cryptoRates.data.latest.currencies[keys.baseCurrency];
//     let setCache = await cacheOps.setCache('bitgoRates', latestCurrencies, 1);
//     return latestCurrencies.ask;
// }
/*
coinFor(coin: string) {
    let actualCoin: string;
    let getHostName: string = this._data.getHostname();
    if (getHostName.localeCompare('localhost') == 0 || getHostName.localeCompare('test.commoncollection.com') == 0 || getHostName.localeCompare('81bd065a885f.ngrok.io') == 0) {
      if (coin.localeCompare('BTC') == 0) {
        actualCoin = 'TBTC'
      }
      if (coin.localeCompare('LTC') == 0) {
        actualCoin = 'TLTC'
      }
    }
    if (getHostName.localeCompare('commoncollection.com') == 0) {
      if (coin.localeCompare('BTC') == 0) {
        actualCoin = 'BTC'
      } if (coin.localeCompare('BTC') == 0) {
        actualCoin = 'LTC'
      }
    }
    return actualCoin;
  }
*/
// oservice.findOneSelect({ orderId: 'bcd13e67-8989-4221-a151-b71af2815dd6' },
//     {
//         orderId: 1,
//         tenantId: 1,
//         caseId: 1,
//         currency: 1,
//         amount: 1,
//         user: 1,
//         breakdown: 1
//     }).then((data) => {
//         console.log(data);
//         let resultObj = search('donationAmount', data.breakdown)
//         console.log(resultObj);
//         console.log(resultObj.amount);
//     })

// function search(nameKey, myArray) {
//     for (var i = 0; i < myArray.length; i++) {
//         if (myArray[i].name === nameKey) {
//             return myArray[i];
//         }
//     }
// }

//send received donation email
// let emailService: emailSendService = new emailSendService();
// async function sendingEmails() {
//     //let send = await emailService.donationReceived('sunkuomkarsai@gmail.com', 'Omkar', 'en-us', 'test12345', '0.00045 BTC', 'BANGALORE');
//     let send = await emailService.contactMe('sunkuomkarsai@gmail.com','omkar','en-us','Hello sai','sunkuomkarsai5@gmail.com','Sunku','7093635254');
//     console.log(send);
// }
// sendingEmails();
import { encryptData, decryptData } from '../services/crypto.service';
import { keys } from '../config/keys';
// var smtp = {
//     host: 'send.one.com',
//     port: 465,
//     secure: true,
//     auth: {
//         user: 'info@commoncollection.com',
//         pass: 'mgymwFtVjz'
//     },
//     tls: {
//         rejectUnauthorized: false
//     },
//     defaultFrom: 'info@commoncollection.com',
//     defaultTo: 'info@commoncollection.com',
// }

// var openExchangeRates = {
//     KeyId: 'bb98f485025944c6a0e93cdded367b55',
//     url: 'https://openexchangerates.org/api/',
// }

// var google= {
//     clientID: '914505347416-pkgeslnios07kr36gjmrp303dlo6lo7d.apps.googleusercontent.com',
//     clientSecret: 'W7OiyngmhVu5k-Qz9rqrqiQc',
// }

// var encrytedTextgoogle = encryptData(google);
// console.log(`Encrypted text google- ${encrytedTextgoogle}`);

// var facebook = {
//     clientID: '770077230573359',
//     clientSecret: '166e6e74c1eea15d3818002b56058c07',
// }

// var encrytedTextfacebook = encryptData(facebook);
// console.log(`Encrypted text facebook- ${encrytedTextfacebook}`);
// var files = {
//     accessKeyId: 'AKIAIZ45GVVEPCOOEH4Q',
//     secretAccessKey: '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',
//     documentsPath: 'commoncollection-test',
//     url: 'https://commoncollection-test.s3.eu-west-3.amazonaws.com/'
// };

// var encrytedTextfiles = encryptData(files);
// console.log(`Encrypted text facebook- ${encrytedTextfiles}`);

// console.log(`Decrypted text: `);
// console.log(decryptData(keys.google.key));  

console.log(`Decrypted text: bitgo `);
console.log(decryptData(keys.bitGo.key));  
//add this file to .gitignore
import * as i18n from 'i18n';
import * as dotenv from 'dotenv';
dotenv.config();

export var keys = {
    google: {
        isEncrypted: true,
        key: process.env.GOOGLE
    },
    facebook: {
        isEncrypted: true,
        key: process.env.FACEBOOK
    },
    files: {
        isEncrypted: true,
        key: 'y+RN/fAovFjBVN3OJnk2Dw==:NvBZvDm+54L5UZHxOHigCT1RyOd6xiOkRr2RBwPFpcfG8nL46nF7zVU//x2u05pmrmQapWvZGip04O729rKvGn4Es0gUVmMxDv3nZ9mC8K1fRknvR1InpmRFyUeziZmEKXgvrmyAXMV/9wsEgm/xYV2ex5iHpQ/irEnlNRpEW7zjSjvzXjELH8PCvWgo0ify1q9mN83lZmukPdoA9rPrOhv+cp9+q799S9eG6ulvwPjfmeTtwkL4f3wWcbhUUNqWVvXyZerODuj49zojxrdCXg=='
    },
    jwt: {
        secret:process.env.SECRET,
        tokenLife: 900,
        refreshTokenLife: 86400,
        isEncrypted: false
    },
    localMongoDB: {
        database: process.env.MONGODB_URL,
    },
    smtp: {
        key: 'ijB12+a5FcjLDZl2o2TsFA==:4hsyZJ6GGnM4Bi5lyVkRjspuptgZL7OqhMKd4ROa7vL62BERn64T7W8RJvxI/aRxPgPx2TSZk8NFqbeovYH+Se0m+C72kD6LD62y3MJ06aDtAoGMiKfKJJskoFJrzz7Mw+F3ibvFzHkNBlfrTvCKao7hMYCGZsgvtW54J8592sJlRDIHya+UjgE2XM+QnEjbSn+lw1K2MhevSGEGWLVhaL1bwwlkRqInTN8kLokELvpVjnpY+IHA4LaSrSRj3QoDY7TBq8c4OHi+Oga7PHWpOwnHk1bVNHGTpTIw9pXcFCmcHtH/F8HD0PFlrDeX4/eV',
        isEncrypted: true
    },
    Roles: {
        Standard: 'Standard',
        CustomerSupport: 'Support',
        Admin: 'Admin',
        SuperAdmin: 'SuperAdmin'
    },
    i18n: i18n.configure({
        // setup some locales - other locales default to en silently
        locales: ['en', 'da', 'fr'],

        // where to store json files - defaults to './locales'
        directory: __dirname + '/locales',

        // enable object notation
        objectNotation: true,

        // you may alter a site wide default locale
        defaultLocale: 'en',

        // setting extension of json files - defaults to '.json' (you might want to set this to '.js' according to webtranslateit)
        // extension: '.js'
    }),
    tenantMappping: {
        'default': 'cc',
        'localhost:3000': 'cc',
        'commoncollection': 'cc'
    },
    bitGo: {
        key: 'XA3dEVuzCBUoP4rw7PCNfA==:RW3VsqkLnqF1KMVc0ArynqbmYB4RwPk6VlOQry2fmOhVFWYvlQlUbZqb0ZjZSseyXN/rvd5b6IhP8y/Bw4iAPdr3GTTZZFxWcVhwDQrgpKqzGgtHwcP4zarDDfk+oeYTiaazvlK2wPkhax1HkqSfnZwUj+tzUQ7iqUtHRAacblQIxmiqr2vTTEGHZsNk5W1o7jtNBRY0Humtqa7H71+FRSUxHGitAZmUYiPDzljL8VejlB/jLVrtFljCF/UYJtdxsXxrIiHnqiN1Jd5G6IYsboCZeyq96xFZHZbXSA+xs/QagV7mD6BvPBI/j9qjQ1/efoMPsN5RvXDZ6UrOf797S0YFbJtvr7MaKOy6sCBD1SMVNZf9ssSD5uB/X4RBWMOhriIy5ZPDMZBnf+rdv/+xoGTNSpOjDvmghI0qhyF7h7Kup8UvelsFgSi394ChCJqrTkrO5oTkAWSUpxEuKSQ5tx381kMwBOVILOZYhVbIEEiHmV4D14B1jGvxs/a8fbsE6tkOaY8xXoKu5vFQ1oYh0+dZgm4oWSQyFk83E/lc6htTCvdCiLRmnB7PSwOe44TykdLt/fAatK7b5IT7ntLpwW4Xa2lLTXAW8F9L7r7lELo=',
        isEncrypted: true
    },
    openExchangeRates: {
        key: '/0FKuoWG5CyQDHE7fukRpg==:CTv9N3ahJ09pTXxDf9EpyXofhjlLvxbTB0bDqXXOl8QJl4Z2OzuVhezWCVUoX0aw6WchJBLRHvCLqZvse1M0XtTN+BFCYn1NuGED5yYUr83qNSXW0npKi5hLZHzQwaFj',
        isEncrypted: true,
    },
    baseCurrency: 'EUR',
    cacheExpirySeconds: 3600,  //1hour,
    secFor12Hrs: 43200, //12hours
    TestNetDigitalCurrencies: ['TBTC', 'TLTC', 'TBCH'],
    MainNetDigitalCurrencies: ['BTC', 'LTC', 'BCH'],
    DigitalCurrencies: ['BTC', 'LTC', 'BCH'],
    FiatCurrencies: ['AED', 'ARS', 'AUD', 'BHD', 'CAD', 'CHF', 'CLP', 'CNY', 'CRC', 'CZK', 'DKK', 'EUR', 'GBP', 'GEL', 'GTQ', 'HKD', 'HUF', 'INR', 'JOD', 'JPY', 'KRW', 'KWD', 'KZT', 'MDL', 'MXN', 'NOK', 'NZD', 'PHP', 'RSD', 'SEK', 'SGD', 'TWD', 'USD', 'VND', 'ZAR'],
    BTCTxUnits: 100000000,
    APPURL: process.env.APPURL, 
    MONNIBASEURL: process.env.MONNIBASEURL,
    MINERFEES: {
        bitcoin: 0.00033,
        litecoin: 0.00021 
    }
}
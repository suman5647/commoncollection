

export interface S3Data {
    accessKeyId: string,
    secretAccessKey: string,
    documentsPath: string,
    url: string
}

export interface SocialMediaData {
    clientID: string,
    clientSecret: string,
}

export interface SMTPData {
    host: string,
    port: number,
    secure: boolean,
    auth: Credentials,
    tls: TLSData
    defaultFrom: string,
    defaultTo: string,
}

export interface Credentials {
    user: string,
    pass: string
}

export interface TLSData {
    rejectUnauthorized: boolean
}

export interface BitgoData {
    testWalletIds: WalletIds,
    mainWalletIds: WalletIds,
    accessToken: string,
    walletPassphrase: string,
    totpKey: string,
    testUrl: string,
    prodUrl: string,
}

export interface WalletIds {
    btc?: string,
    ltc?: string,
    bch?: string
}

export interface openExchangeRatesData {
    KeyId: string;
    url: String,
}
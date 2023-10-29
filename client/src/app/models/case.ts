import { GeoLocation, FileTypes, Address } from '../core/models/common';
import { UserLite, OrderLite } from './user.model';

export interface CaseStatus {
    caseStatus: String;
}

export interface CaseDocument {
    fileType: String;
    fileMode?: number;
    title: String;
    uniqueName: String;
    thumb: String;
    original: String;
    status: String;
}
export interface CaseDonate {
    qrcodeImg?: string;
    amount: string;
    address: string;
    coin: string,
    sellCurrency?: string;
    monniUrl?: string;
    orderId: string;
    returnUrl?: string; 
}

export interface CaseContent {
    lang: string;
    title: string;
    description: string;
}

export interface CaseDonation {
    user: UserLite;
    order: OrderLite;
    totalDonated?: number;
}
export interface RatingSummary {
    count: number;
    average: number;
}
export interface CryptoRatesResponse {
    baseRateValue: number;
    btcQuoteValue: number;
    btcEurRate: number;
}
export interface FiatRatesResponse {
    baseRateValue: number;
    fiatQuoteValue?: number;
    btcEurRate?: number;
    baseQuoteValue?: number;
    quoteRateValue?: number;
    cryptoBaseEurRate?: number,
    cryptoQuoteEurRate?: number;
    cryptoQuoteValue?: number,
    cryptoEurRate?: number;
}
export interface Case {
    caseId: string;
    createdOn?: string;
    agentCommission?: number;
    donationPercentage?: number;
    status?: string;
    location: GeoLocation[];
    beneficiary: UserLite;
    attachments: CaseDocument[];
    content: CaseContent[];
    donations?: CaseDonation[];
    address?: Address;
    rating?: RatingSummary;
    totalCaseDonation: number;
    accountDetails: IAccountDetails[],
    baseCurrency: string
}

export interface CaseCreate {
    agentCommission?: number;
    location?: GeoLocation;
    attachments?: CaseDocument[];
    content?: CaseContent[];
    address?: Address
    isagent: boolean; // false
    amount: number;
    agentCommissionPercent?: number;
    beneficiary: UserLite
    rating?: RatingSummary;
    accountDetails: IAccountDetails[];
    baseCurrency: string;
}

export interface Donors {

    sortedDonors?: CaseDonation[];
}

export interface IAccountDetails {
    accountType: PaymentTypes;
    accountId: string;
    currency: string;
}

export interface CaseLite {
    sortedDonors: CaseDonation[];
    getCaseDetails: Case;
}

export interface DonateResponse {
    caseId: string;
    txHash: string;
    orderId: string;
}

export interface CurrenciesReq {
    base: string;
    quote: string;
}

export enum PaymentTypes {
    BTC = 'BTC',
    LTC = 'LTC',
    // DirectCrypto = 'DirectCrypto',
    CC = 'CC',
    BankDirect = 'BankDirect'
}
export interface DonationConfirmation {
    txHash: string,
    isPaid: boolean
    caseId: string;
    orderId: string;
}

export enum CasePhotoStatus {
    Obsolete = "Obsolete",
}
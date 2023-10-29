import { UserLite } from './user';

export enum AuthProviders {
    Local = 'Local',
    Facebook = 'Facebook',
    Google = 'Google'
}
export enum ContactTypes {
    Default,
    Business,
    Permanent,
    Residant
}
export enum FileTypes {
    ImagePng = 'image/png',
    ImageJpg = 'image/jpg',
    VideoUrl = 'video/url'
}
export enum FileModes {
    Standard,
    Youtube
}

//todo move to constants (low priority)
export enum Currency {
    BTC = 'BTC',
    LTC = 'LTC',
    USD = 'USD',
    DKK = 'DKK',
    INR = 'INR',
    EUR = 'EUR'
}
//todo move to constants (low priority)
export enum PaymentTypes {
    // BTC = 'BTC',
    // LTC = 'LTC',
    DirectCrypto = 'DirectCrypto',
    CC = 'CC',
    BankDirect = 'BankDirect'
}
export enum Languages {
    US = 'en-us',
    DK = 'da-dk',
    FR = 'en-fr'
}
export interface CCFileInfo {
    Location: string;
    ETag: string;
    Bucket: string;
    Key: string;
}
export interface ContactData {
    tenantId: string;
    userId: string; // person's unique userId'

    name: string;
    email: string;
    phone: string;
    message: string;

    readOn: Date;

    createdOn: Date;
    sendOn: Date;
    lastRetryOn: Date;
    lastFailedOn: Date;
}

export interface ItemData {
    code: string;
    text: string;
}
export interface GeoLocation {
    longitude: number;
    latitude: number;
}
export interface Contact {
    contactType: ContactTypes;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
}
export interface Address {
    // contactType: ContactTypes;
    language: Languages;
    country: string;
    state: string;
    city: string;
    place: string;
    addressLine1: string;
    addressLine2: string;
    pincode: string;
}

export interface IAccountDetails {
    accountType: PaymentTypes;
    accountId: string;
    currency: string;
}
export interface AccountLite extends IAccountDetails {
    referenceName: string;
    accountHoldername: string;
    accountType: PaymentTypes;
    kycId: string; // kyc refernece
    accountId: string;
}
export interface TransactionAccount extends AccountLite, IAccountDetails {
    referenceName: string; // 
    accountHoldername: string;
    accountType: PaymentTypes;
    kycId: string; // kyc refernece
    accountId: string;
}
export interface CryptoAccount extends IAccountDetails {
    accountType: PaymentTypes;
    accountId: string;
    // cryptoAddress: string; // CryptoAddress
}
export interface CreditCardAccount extends IAccountDetails {
    accountType: PaymentTypes;
    accountId: string;
    // cardNumber: string; // last 4/5 digits XXXXXXXXXXXX12345
    cardType: string;

}
export interface BankAccount extends IAccountDetails {
    accountType: PaymentTypes;
    accountId: string;
    // accountNumber: string;
    swift: string;
    iban: string;
    bic: string;
    ukSortCode: string;
    bsbCode: string;
    regNumber: string;

    currency: string;
    bankName: string;
    bankAddress: string;
}

export interface ResponseData<T> {
    status: number;
    data: T;
}
export interface PagedMetaData {
    next: string;
    prev: string;
    totalItems: number;
}

export const defaultPageLength: number = 10;
export class PageResponseHelper {
    /**
     * builds paginated response
     * @param baseUrl base url without any page data
     * @param perPage page length
     * @param page current page
     * @param results result
     * @param totalRecords total record count in collection/table
     */
    buildPageResponse<T>(baseUrl: string, perPage: number = defaultPageLength, currentPage: number, results: T[], totalItems): PagedResponseData<T> {
        let maxPages: number = defaultPageLength
        let hasData: boolean = results.length > 0;
        // calculate total pages
        let totalPages = Math.ceil(totalItems / perPage);
        if (baseUrl.indexOf('?') <= 0) baseUrl = baseUrl + '?';
        // ensure current page isn't out of range
        if (currentPage < 1) {
            currentPage = 1;
        } else {
            currentPage = currentPage + 1;
        }

        let startPage: number, endPage: number;
        if (totalPages <= maxPages) {
            // total pages less than max so show all pages
            startPage = 1;
            endPage = totalPages;
        } else {
            // total pages more than max so calculate start and end pages
            let maxPagesBeforeCurrentPage = Math.floor(maxPages / 2);
            let maxPagesAfterCurrentPage = Math.ceil(maxPages / 2) - 1;
            if (currentPage <= maxPagesBeforeCurrentPage) {
                // current page near the start
                startPage = 1;
                endPage = maxPages;
            } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
                // current page near the end
                startPage = totalPages - maxPages + 1;
                endPage = totalPages;
            } else {
                // current page somewhere in the middle
                startPage = currentPage - maxPagesBeforeCurrentPage;
                endPage = currentPage + maxPagesAfterCurrentPage;
            }
        }

        // return object with all pager properties required by the view
        let resp: PagedResponseData<T> = {
            status: hasData ? 200 : 404,
            data: results,
            meta: {
                // (baseUrl + `page=` + (currentPage - 1) + `&perPage=` + pageSize),
                next: (currentPage >= endPage) ? undefined : (baseUrl + `page=` + (currentPage + 1) + `&perPage=` + perPage),  //2  ==2
                prev: (currentPage == startPage) ? undefined : (baseUrl + `page=` + (currentPage - 1) + `&perPage=` + perPage), // 2 ==1
                totalItems: totalItems,
            }
        };

        return resp;
    }
}

export class ResponseResults {
    buildResponse<T>(results: T): ResponseData<T> {
        let resp: ResponseData<T> = {
            status: 200,
            data: results
        }
        return resp;
    }
}

export class BeneficiaryCaseResponseResults {
    buildResponse<T>(results: T[], casesLenght: number, totalDonationReceived: number): CasesResponseData<T> {

        let resp: CasesResponseData<T> = {
            status: 200,
            data: results,
            meta: {
                totalDonationReceived: totalDonationReceived,
                totalManagingCases: casesLenght
            }
        }
        return resp;
    }
}
export class BenefactorDonationResponseResults {
    buildResponse<T>(results: T[], casesLenght: number, allCasesDonations: number): DonationsResponseData<T> {

        let resp: DonationsResponseData<T> = {
            status: 200,
            data: results,
            meta: {
                totalDonationDonated: allCasesDonations,
                totalDonatedCases: casesLenght
            }
        }
        return resp;
    }
}
export interface PagedResponseData<T> {
    status: number;
    data: T[];
    meta: PagedMetaData;
}
export interface ErrorData {
    message: string;
    error: string;
}
export interface ErrorResponse {
    status: number;
    data: ErrorData;
    // meta: PagedMetaData;
}

export interface CasesResponseData<T> {
    status: number;
    data: T[];
    meta: CasesMetaData
}

export interface DonationsResponseData<T> {
    status: number;
    data: T[];
    meta: DonationsMetaData
}

export interface CasesMetaData {
    totalDonationReceived: number;
    totalManagingCases: number;
}

export interface DonationsMetaData {
    totalDonationDonated: number;
    totalDonatedCases: number;
}

export interface TransactionList {
    amount: number;
    currency: string;
    orderId: string;
    blockchainHash?: string;
    userId: string;
    name: string;
    caseId: string;
    caseTitle: string;
    donatedDate: Date;
    basic: UserLite,
    baseCurrency: string;
    beneficiary: UserLite;
    orderStatus: string;
}

export interface RateObj {
    baseRateValue?: number,
    cryptoQuoteValue?: number,
    cryptoEurRate?: number,
    baseQuoteValue?: number,
    quoteRateValue?: number,
    cryptoBaseEurRate?: number,
    cryptoQuoteEurRate?: number,
    fiatQuoteValue?: number
}

export class RateResult {
    baseRateValue?: number;
    cryptoQuoteValue?: number;
    cryptoEurRate?: number;
    baseQuoteValue?: number;
    quoteRateValue?: number;
    cryptoBaseEurRate?: number;
    cryptoQuoteEurRate?: number;
    fiatQuoteValue?: number

    copyInfo(rateObj: any) {
        this.baseQuoteValue = rateObj.baseQuoteValue;
        this.baseRateValue = rateObj.baseRateValue;
        this.cryptoBaseEurRate = rateObj.cryptoBaseEurRate;
        this.cryptoEurRate = rateObj.cryptoEurRate;
        this.cryptoQuoteEurRate = rateObj.cryptoQuoteEurRate;
        this.cryptoQuoteValue = rateObj.cryptoQuoteValue;
        this.fiatQuoteValue = rateObj.fiatQuoteValue;
        this.quoteRateValue = rateObj.quoteRateValue;
    }
}

export interface RateSet {
    caseRate: number;
    benefactorRate: number,
    beneficiaryRate: number,
    txnRate: number
}
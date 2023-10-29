export interface Order {
    tenantId: string;
    orderId: string;
    caseId: string;
    status: OrderStatus;
    merchantStatus?: string; // Order status provided by merchant and merchant name "{MerchantName} {OrderStatus updated by Merchant}"
    merchantReferenceId?: string; //OrderId of merchant for example Monni orderId
    merchantName?: string;
    orderRate: RatesSet; //Latest rate at which the order is received to CC wallet
    amount: number;
    merchantRate: Number;
    merchantRateStr: string;
    receiverAccount: TransactionAccount;
    paymentType: PaymentTypes,
    breakdown: OrderBreakdown[],
    user: UserLite,
    transactions: OrderTransaction[],
    created: Date,
    comments: string, // new variable to save comments while donating
    modified: Date
}

export enum OrderStatus {
    Quoted = "Quoted",
    Paid = "Paid",
    Completed = "Completed",
    OrderCancelled = "OrderCancelled",
}

export interface Rates {
    rate: number;
    currency: string;
}

export interface RatesSet {
    beneficiaryRate: Rates;
    benefactorRate: Rates;
    caseRate: Rates;
    txnRate: Rates;
}

export interface OrderTransaction {
    currency: Currency;
    amount: number;
    trnReference: string;
    trnHash: string;
    walletAddress: string; //added new variable to store walletAddress
    created: Date;
    status: string; //Status for each tx object
    orderRate: RatesSet;    
    txLink? : string;
    addressLink?: string;
    orderId?: string;
}

export enum PaymentTypes {
    // BTC = 'BTC',
    // LTC = 'LTC',
    DirectCrypto = 'DirectCrypto',
    CC = 'CC',
    BankDirect = 'BankDirect'
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

export interface OrderBreakdown {
    name: string;
    amount: number;
}

export interface UserLite {
    userId: string;
    firstName: string;
    lastName: string;
    profilePhoto: string;
    language: string;
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
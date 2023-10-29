import { IDocumentModel, IModel, ITenantModel } from './base';
import { Currency, PaymentTypes, TransactionAccount } from './common';
import { UserLite } from './user';

/*Status,Type(NA:buy/sell),TermsAgreed
Quoted,QuoteSource,Rate,Amount,BTC,Currency,CommissionPercent,CardNumber,PaymentType,
CryptoAddress,AccountNumber,SwiftBIC,IBAN,Reg,CCRG,MinerFee,BCCAddress,
ReceiverName,ReceiverRef,ReceiverText,CurrencyCode,
WireType,WireCost,Note,ExtRef,TransactionHash,PaymentGatewayType,RateBase,Ratehome,RateBooks,
TxSecret,CardApproved,RiskScore,IpCode,CCUserIdentity,TxSecretVerificationAttempt,
Approved,ApprovedBy,Name,Name,Email,IP,CountryCode,SiteId,Referer,Origin,PartnerId,Direction,*/
/*Trnmethod,TrnType,ExRef,Amount,Currency,Info,Completed,FromAccount,ToAccount,Reconsiled,Exported*/
export interface OrderLite {
    orderId: string;
    currency: Currency;
    amount: number;
    status: OrderStatus;
}
export enum OrderStatus {
    //Cancel = "Cancel",
    Quoted = "Quoted",
    //Paying = "Paying",
    Paid = "Paid",
    // KYCApprovalPending = "KYCApprovalPending",
    // KYCApproved = "KYCApproved",
    // KYCDeclined = "KYCDeclined",
    // AMLApprovalPending = "AMLApprovalPending",
    // AMLApproved = "AMLApproved",
    // AMLDeclined = "AMLDeclined",
    // Sending = "Sending",
    // PayoutAwaitsapproval = "PayoutAwaitsapproval",
    // SendingAborted = "SendingAborted",
    //Sent = "Sent",
    // Releasingpayment = "Releasingpayment",
    // ReleasingpaymentAborted = "ReleasingpaymentAborted",
    // Releasedpayment = "Releasedpayment",
    Completed = "Completed",
    // PayoutApproved = "PayoutApproved",
    // PaymentAborted = "PaymentAborted",
    // CaptureErrored = "CaptureErrored",
    // ComplianceOfficerApproval = "ComplianceOfficerApproval",
    // CustomerResponsePending = "CustomerResponsePending",
    OrderCancelled = "OrderCancelled",
    // KYCDecline = "KYCDecline",
    ReleaseErrored = "ReleaseErrored"
}



export interface OrderBreakdown {
    name: string;
    amount: number;
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

export enum LockStatus {
    Locked = "Locked",
    NotLocked = "NotLocked"
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
}
export interface Order extends OrderLite, IModel, ITenantModel, IDocumentModel<Order> {
    tenantId: string;
    orderId: string;
    caseId: string;
    status: OrderStatus;
    merchantStatus?: string; // Order status provided by merchant and merchant name "{MerchantName} {OrderStatus updated by Merchant}"
    merchantReferenceId?: string; //OrderId of merchant for example Monni orderId
    merchantName?: string;
    orderRate: RatesSet; //Latest rate at which the order is received to CC wallet
    amount: number;
    merchantRateStr: string; // Merchant rate with currency
    merchantRate: number;
    receiverAccount: TransactionAccount;
    paymentType: PaymentTypes,
    breakdown: OrderBreakdown[],
    user: UserLite,
    transactions: OrderTransaction[],
    created: Date,
    comments: string, // new variable to save comments while donating
    modified: Date,
    isLocked: boolean,
    LockedUntil: Date,
    LockedBy: string,
    merchantMinersFees: number,
    ccMinersFees: number,
}
export interface TransactionData extends IModel, ITenantModel, IDocumentModel<TransactionData> {
    tenantId: string;
    caseId: string;
    // trnReference: string;
    order: any;
    trnInfo: any;
}


export interface MerchantTransactionsLite {
    OrderId: number;
    Type: string;
    ExtRef: string;
    Amount: number
    Currency: string;
    PaidToAddress: string;
}
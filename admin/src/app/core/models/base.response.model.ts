import { UserLite } from "src/app/models/user.model";

export interface ErrorData {
  message: string;
  error: string;
}

export interface PageData {
  next: string;
  prev: string;
  totalItems: number;
}

export interface ErrorResponseData {
  status: number;
  ErrorData: ErrorData;
}

export interface ResponseData<T> {
  status: number;
  data: T;
  meta: PageData;
}

export interface CaseCounts {
  adminPendingCases: number;
  activeCases: number;
}

export interface NotifyResponseData<T> {
  status: number;
  data: T;
  meta: PageData;
  username: string;
}

export interface PageResponseData<T> {
  status: number;
  data: T[];
  meta: PageData;
}

export interface CasesMetaData {
  totalDonationReceived: number;
  totalManagingCases: number;
}

export interface DonationsMetaData {
  totalDonationDonated: number;
  totalDonatedCases: number;
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
 export interface BitcoinAddressResponse {
  status: number;
  data: boolean;
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
  basic : UserLite;
  baseCurrency?: string;
  orderStatus: string;
 }
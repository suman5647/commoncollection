import { IModel, ITenantModel, IDocumentModel } from './base';
import { AuthProviders, Languages, TransactionAccount, IAccountDetails, ItemData, GeoLocation, Address, ContactData } from './common';
import { RatingSummary } from "../data/rating";
import { CaseLocale, CaseDocument, CaseDonation, Case} from "../data/case";

export enum RoleTypes {
    Standard = 'Standard',
    CustomerSupport = 'Support',
    Admin = 'Admin',
    SuperAdmin = 'SuperAdmin'
}
export interface UserLite {
    userId: string;
    firstName: string;
    lastName: string;
    profilePhoto: string;
    language: string;
}

export interface PubUserData {
    socialMedialLinks: ItemData[];
    description: string;
}
export interface BeneficiaryData extends PubUserData {
}
export interface BenefactorData extends PubUserData {
    occupation: string;
}
export interface UserAuthProvider extends PubUserData {
    provider: AuthProviders;
    userid: string;
    phash?: string;
    psalt?: string;
}
export interface UserVerification {
    activated: boolean;
    activatedOn: Date;

    emailVerified: boolean;
    emailVerifiedOn: Date;

    phoneVerified: boolean;
    phoneVerifiedOn: Date;

    photoVerified: boolean;
    photoVerifiedOn: Date;

    addressVerified: boolean;
    addressVerifiedOn: Date;

    currencyUpdated: boolean;
    currencyUpdatedOn: Date;
}
export interface User extends IModel, ITenantModel, IDocumentModel<User> {
    tenantId: string;
    email: string;
    phone: string;
    language: Languages;
    role: RoleTypes;
    basic: UserLite
    reqProfile: BeneficiaryData;
    donorProfile: BenefactorData;
    authProviders: UserAuthProvider[];
    verification: UserVerification;
    accounts: IAccountDetails[]; // TransactionAccount[]
    address: Address;
    location: GeoLocation;
    rating: RatingSummary;
    socketId: string;
    baseCurrency: string; //introduced for socket.io to broadcast to specific user
    userid: string;
}

export interface BeneficiaryUser extends User {
    reqProfile: BeneficiaryData;
}

export interface BenefactorUser extends User {
    donorProfile: BenefactorData;
}

export interface BeneficiaryProfile {
    basic: UserLite
    verification: UserVerification;
    address: Address;
    location: GeoLocation;
    rating: RatingSummary;
    reqProfile: BeneficiaryData;
}

export interface BenefactorProfile {
    basic: UserLite,
    donorProfile: BenefactorData;
}

export interface BenefactorPubData<T> {
    status: number;
    data: T
}

export interface BeneficiaryPubData<T> {
    status: number;
    data: T
}

export interface BenefactorCaseDonationList {
    caseId: string;
    content: CaseLocale[];
    attachments: CaseDocument[];
    donations: CaseDonation;
    donationPercentage: number;
}

export interface AdminUser extends User {

}
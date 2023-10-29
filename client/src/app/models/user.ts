import { Case, RatingSummary } from './case';
import { UserLite } from './user.model';
import { ItemData, Address, GeoLocation } from '../core/models/common';

export class User {
    fullName: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    password: string;
    confirmPassword: string;
}

export interface Contact {
    name: string
    email: string;
    phone: string;
    message: string;
}

export interface Page {
    page: number;
    perPage: number;
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

export interface Beneficiary {
    basic: UserLite
    verification: UserVerification;
    address?: Address;
    location?: GeoLocation;
    rating?: RatingSummary;
    reqProfile?: BeneficiaryData;
    baseCurrency: string;
}
export interface BeneficiaryLite {

    firstName: string;
    lastName: string;
    address: Address;
    socialMedialLinks: ItemData[];
    baseCurrency: string;
}
export interface Benefactor {
    basic: UserLite;
    donorProfile: BenefactorData;
    address?: Address;
    location?: GeoLocation;
    rating?: RatingSummary;
    baseCurrency: string;
}
export interface totalDonation {
    amount: number;
}

export interface Cases {
    allCases: Case,
}

export interface ProfileLite {
    details: UserLite;
}

export interface TokenLite {
    access_token: string;
    refresh_token: string;
}

export interface authProvider {
    provider: String,
    userid: String,
    phash: String,
    psalt: String
};
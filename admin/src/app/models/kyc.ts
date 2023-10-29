import { UserLite } from "./user.model";

export enum KYCStatus {
    Requested = "Requested",
    Uploaded = "Uploaded",
    Approved = "Approved",
    OnHold = "OnHold",
    Rejected = "Rejected",
    Obsolete = "Obsolete",
}
export enum KYCType {
    PhotoID = "PhotoID",
    ProofOfRecidency = "ProofOfRecidency",
    CardApproval = "CardApproval",
}
export interface KycDocument {
    kycTypeType: KYCType;
    fileType: FileTypes;
    title: string;
    base64?: string;
    uniqueName: string;
    states: KycState[];
    status:string
}
export interface KycState {
    status: KYCStatus;
    statusOn: Date;
    statusBy: UserLite;
    note: string;
}
export interface KYC {
    tenantId: string;
    accountId: string; // the kycs for specific account
    expireOn: Date; // kyc valid till
    user: UserLite;
    documents: KycDocument[];
    status: KYCStatus;
    states: KycState[]
}

export enum FileTypes {
    ImagePng = 'image/png',
    ImageJpg = 'image/jpg',
    VideoUrl = 'video/url'
}
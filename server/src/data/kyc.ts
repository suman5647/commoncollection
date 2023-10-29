import { IModel, ITenantModel, IDocumentModel } from './base';
import { FileTypes } from "./common";
import { TenantLite } from './tenant';
import { UserLite } from './user';

/*
Type,Order,File,Note,UniqueFileName,OrgFileName,Requested,Uploaded,
Rejected/by,Approved/By,Obsolete/By,OnHold/By
*/
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
    uniqueName: string;
    status: KYCStatus;
    base64?: string; //to store base64 of the image while passing to client
    states: KycState[]
}
export interface KycState {
    status: KYCStatus;
    statusOn: Date;
    statusBy: UserLite;
    note: string;
}
export interface KYC extends IModel, ITenantModel, IDocumentModel<KYC> {
    tenantId: string;
    accountId: string; // the kycs for specific account
    expireOn: Date; // kyc valid till
    user: UserLite;
    documents: KycDocument[];
    states: KycState[]
}
import { IModel, ITenantModel, IDocumentModel } from './base';
import { Address, GeoLocation, FileTypes, FileModes, AccountLite, IAccountDetails } from './common';
import { UserLite } from './user';
import { OrderLite } from './order';
import { RatingSummary } from './rating';
import { ReportAbuseSummary } from './reportabuse';
import { keys } from '../config/keys';

export enum CaseStatus {
    Draft = "Draft",
    Open = "Open",
    Completed = "Completed",
    Obsolete = "Obsolete",
}

export enum AdminStatus {
    Pending = "Pending",
    Modification = "Modification",
    Verified = "Verified",
    Due = "Due",
    Rejected = "Rejected"
}

export enum CasePhotoStatus {
    Obsolete = "Obsolete",
    Active = "Active"
}

export interface CaseLocale {
    lang: string;
    title: string;
    description: string;
}
export interface CaseDocument {
    fileType: FileTypes;
    fileMode: FileModes;
    title: string;
    uniqueName: string;
    status: CasePhotoStatus

    /**
     * original image url, pupulate this using CaseUtil.UpdateCaseDoc
     */
    original: string;
    /**
     * thumb image url, pupulate this using CaseUtil.UpdateCaseDoc
     */
    thumb: string;
}
export interface CaseDonation {
    user: UserLite;
    order: OrderLite;
}


export interface Case extends IModel, ITenantModel, IDocumentModel<Case>, ICaseCreate, ILockTxn {
    tenantId: string;
    caseId: string;
    revision: number;
    isactive: boolean;
    content: CaseLocale[];
    address: Address;
    location: GeoLocation;
    status: CaseStatus;
    createdOn: Date;
    publishedOn: Date;
    completedOn: Date;
    isagent: boolean; // false
    baseCurrency: string; // ?, from tenant?
    amount: number;
    agentCommission?: number;
    adminStatus: AdminStatus;
    adminComments: string;
    adminCommentOn: Date;
    //agentCommissionPercent?: number;
    /**
        reciver account details (multiple) for donation
    */
    accountDetails: IAccountDetails[];
    attachments: CaseDocument[]
    beneficiary: UserLite;
    donations: CaseDonation[];
    rating: RatingSummary;
    reportAbuse: ReportAbuseSummary;
    category: string[];
    tags: string[];
    totalCaseDonation: number;
}

export interface ILockTxn {
    isLocked: boolean;
    lockedUntil: Date;
    lockedBy: string;
    lockId: string;
}

export class LockTxn implements ILockTxn {
    isLocked: boolean;
    lockedUntil: Date;
    lockedBy: string;
    lockId: string;
    // private _value: string;

    // public get myId(): string {
    //     return this._value;
    // }
    // public set myId(v: string) {
    //     this._value = v;
    // }
}

export interface ICaseCreate {
    content: CaseLocale[];
    address: Address;
    location: GeoLocation;
    isagent: boolean; // false
    baseCurrency: string; // ?, from tenant?
    amount: number;
    agentCommission?: number;
    rating: RatingSummary;
    attachments: CaseDocument[];
    accountDetails: IAccountDetails[]
}
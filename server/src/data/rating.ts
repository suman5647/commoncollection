import { IModel, ITenantModel, IDocumentModel } from './base';
import { UserLite } from './user';

export interface RatingSummary {
    count: number;
    recentUpdate: Date;
    average: number;
}
export interface Rating extends IModel, ITenantModel, IDocumentModel<Rating> {
    tenantId: string;
    rating: number;
    rateOn: Date;
    comments: string;
    user: UserLite;
    status: RatingStatus
}

export interface CaseRating extends Rating, IModel, ITenantModel, IDocumentModel<Rating> {
    caseId: string; // caseId
    caseTitle: string,
    benficiaryId: string; // beneficiary
}
export interface UserRating extends Rating, IModel, ITenantModel, IDocumentModel<Rating> {
    userId: string; // userId
    caseId: string; // caseId
}

export class RatingData {
    rating: number;
    comments: string;
}

export enum RatingStatus {
    Obsolete = "Obsolete",
    Active = "Active"
}
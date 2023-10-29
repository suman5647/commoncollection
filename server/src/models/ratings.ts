import { Schema } from 'mongoose';

import { IDocumentModel } from '../data/base';
import { CaseRating, Rating, RatingStatus, UserRating } from '../data/rating';
import { basicSchema } from './common';

export interface RatingModel extends IDocumentModel<Rating>, Rating {
}
export interface CaseRatingModel extends IDocumentModel<CaseRating>, CaseRating, RatingModel {
}
export interface UserRatingModel extends IDocumentModel<UserRating>, UserRating, RatingModel {
}

export var ratingSchema: Schema = new Schema();

ratingSchema.add({
    tenantId: String,
    caseId: { type: String, required: false },
    caseTitle: { type: String, required: false },
    benficiaryId: { type: String, required: false },
    userId: { type: String, required: false },
    rating: Number,
    rateOn: Date,
    comments: String,
    user: { type: basicSchema },
    status: { type: RatingStatus, default: RatingStatus.Active }
})

export default ratingSchema;


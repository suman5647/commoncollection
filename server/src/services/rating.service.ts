import { ServiceBase } from "./base";
import ratingSchema, { RatingModel, CaseRatingModel, UserRatingModel } from "../models/ratings";
import { Rating, CaseRating, UserRating } from "../data/rating";
import { RepositoryBase } from "../repository/base";

export class CaseRatingService extends ServiceBase<CaseRating, CaseRatingModel> {
    constructor() {
        super(ratingSchema, "caseratings");
    }

    // add extra methods here
    test() { };
}

export class UserRatingService extends ServiceBase<UserRating, UserRatingModel> {
    constructor() {
        super(ratingSchema, "userratings");
    }

    // add extra methods here
    test() { };
}
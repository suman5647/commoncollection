import { UserLite } from './user.model';

export interface Rating {
    caseId: String;
    caseTitle: String;
    rating: number;
    comments: String;
    rateOn: String;
    user: UserLite;
    status: String
}

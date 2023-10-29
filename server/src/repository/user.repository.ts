import UserSchema, { UserModel } from '../models/user';
import { User } from '../data/user';
import { RepositoryBase } from './base';

export class UserRepository extends RepositoryBase<UserModel, User> {
    constructor() {
        super(UserSchema, "user");
    }

    // Add additional repository methods if required
}
import { ServiceBase } from "./base";
import userSchema, { UserModel } from "../models/user";
import { User } from "../data/user";
import * as bcrypt from 'bcryptjs';
import { RepositoryBase } from "../repository/base";

export class UserService extends ServiceBase<User, UserModel> {
    constructor() {
        super(userSchema, "user");
    }

    // add extra methods here
    test() {
        // Non request and respone things here
    };

    // creating a hash for the password
    createPassword = async function (password: string) {

        let generatedHash;
        let generatedSalt;

        generatedSalt = bcrypt.genSaltSync(10);
        generatedHash = bcrypt.hashSync(password, generatedSalt)

        return { hash: generatedHash, salt: generatedSalt }
    }

    comparePassword = async function (userPassowrd, dateBasePassword) {
        let compare = await bcrypt.compare(userPassowrd, dateBasePassword);
        return { compare };
    }

    getProfile = function (user: User) {
        const profile = {
            email: user.email,
            firstName: user.basic.firstName,
            lastName: user.basic.lastName,
            phone: user.phone,
            profilePhoto: user.basic.profilePhoto,
            language: user.language,
            addressLine1: '',
            addressLine2: '',
            city: '',
            country: '',
            pinCode: '',
            state: '',
            place: '',
            reqProfile: user.reqProfile,
            verification: user.verification,
            baseCurrency: user.baseCurrency,
            userId: user.basic.userId,
            authProvider: user.authProviders
        }
        if (user.address != undefined && user.address != null) {
            profile.addressLine1 = user.address.addressLine1 == undefined ? null : user.address.addressLine1;
            profile.addressLine2 = user.address.addressLine2 == undefined ? null : user.address.addressLine2
            profile.city = user.address.city == undefined ? null : user.address.city;
            profile.state = user.address.state == undefined ? null : user.address.state;
            profile.place = user.address.place == undefined ? null : user.address.place;
            profile.country = user.address.country == undefined ? null : user.address.country;
            profile.pinCode = user.address.pincode == undefined ? null : user.address.pincode
        }
        return profile;
    }

    getFirstName = function (user: User) {
        const profile = user.basic.firstName;
        return profile;
    }
}
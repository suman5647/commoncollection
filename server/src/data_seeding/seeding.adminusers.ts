import { UserService } from '../services/user.service';
import * as users_data from './adminuser.data.seed';

let uservice: UserService = new UserService();
let users = users_data.data;

async function createAdminUsers() {
    for (var j = 0; j < users.length; j++) {
        let auser = await uservice.findOne({ email: users[j].email });
        if (!auser) {
            users[j].verification.activated = users[j].verification.addressVerified = users[j].verification.emailVerified = users[j].verification.phoneVerified = users[j].verification.photoVerified = true;
            users[j].verification.activatedOn = users[j].verification.addressVerifiedOn = users[j].verification.emailVerifiedOn = users[j].verification.phoneVerifiedOn = users[j].verification.photoVerifiedOn = new Date();

            // set password
            let password = `${users[j].basic.firstName}123`
            console.log(password);
            let getHashPassword = await uservice.createPassword(password);
            users[j].authProviders[0].phash = getHashPassword.hash;
            users[j].authProviders[0].psalt = getHashPassword.salt;

            let u1 = await uservice.create(users[j]);
            users[j]._id = u1._id;
            auser = u1;
        }
    }
}

let createUserPromise = createAdminUsers();
Promise.all([createUserPromise]).then(
    (res) => {
        console.log('completed!!!');
        console.log(res);
        process.exit(0);
    },
    (rej) => {
        console.log('rejected!!!');
        console.log(rej);
        process.exit(1);
    }).catch(
        (err) => {
            console.log('unhandled exception!!!');
            console.log(err);
            process.exit(1);
        }
    );
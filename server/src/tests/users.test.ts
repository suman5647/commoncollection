import { User, BeneficiaryUser, BenefactorUser, RoleTypes, UserAuthProvider, UserLite, UserVerification } from '../data/user';
import { Tenant } from '../data/tenant';
import { Address, GeoLocation, Contact, ContactTypes, AuthProviders, Currency, Languages, CryptoAccount, PaymentTypes } from '../data/common';
import { UserService } from "../services/user.service";
import {UserOperations} from '../platform/user.operations';

let uservice: UserService = new UserService();

let user01 = { tenantId: 'cc', email: 'omkar@blocktech.dk', phone: '7093635254', language: Languages.US, role: RoleTypes.Standard, basic: { userId: 'omkar@blocktech.dk', firstName: 'Omkar', lastName: 'Sai Sunku', profilePhoto: 'omkar_profile_photo', language: Languages.US.toString(), } as UserLite, address: { addressLine1: 'Outskirts', addressLine2: 'Halli', city: 'Yelanka', country: 'India', language: Languages.US, pincode: '560105', place: 'Bangalore', state: 'Karnataka' } as Address, location: { latitude: 10.9301487, longitude: 76.5877228 }, authProviders: [{ provider: AuthProviders.Local, phash: 'tobecreated', userid: 'om@blocktech.dk' } as UserAuthProvider], verification: { activated: true, emailVerified: true, phoneVerified: true } as UserVerification, donorProfile: { description: "I am a Software Developer and Blockchain Developer with 2+ years experience. Currenctly focusing on Blockchain, AI, ML and cloud based Solutions", occupation: "Blockchain Developer" }, reqProfile: { description: "I am a Blockchain Developer with 3+ years of experience. Currenctly focusing on Blockchain.", socialMedialLinks: [{ code: "FB", text: "https://www.facebook.com/omkarsunku" }] }, rating: { count: 0, recentUpdate: new Date('2009-07-20T10:00:21'), average: 0 }, accounts: [{ accountId: 'QjYjsYmmuWPhYxt8hGjKx3cRH841rNv7w1', accountType: PaymentTypes.DirectCrypto } as CryptoAccount] } as BenefactorUser;
let user02 = { tenantId: 'cc', email: 'sunkuomkarsai@gmail.com', phone: '7093635254', language: Languages.US, role: RoleTypes.Standard, basic: { userId: 'sunkuomkarsai@gmail.com', firstName: 'Omkar', lastName: 'Sai Sunku', profilePhoto: 'omkar_profile_photo', language: Languages.US.toString(), } as UserLite, address: { addressLine1: 'Outskirts', addressLine2: 'Halli', city: 'Yelanka', country: 'India', language: Languages.US, pincode: '560105', place: 'Bangalore', state: 'Karnataka' } as Address, location: { latitude: 10.9301487, longitude: 76.5877228 }, authProviders: [{ provider: AuthProviders.Local, phash: 'tobecreated', userid: 'om@blocktech.dk' } as UserAuthProvider], verification: { activated: true, emailVerified: true, phoneVerified: true } as UserVerification, donorProfile: { description: "I am a Software Developer and Blockchain Developer with 2+ years experience. Currenctly focusing on Blockchain, AI, ML and cloud based Solutions", occupation: "Blockchain Developer" }, reqProfile: { description: "I am a Blockchain Developer with 3+ years of experience. Currenctly focusing on Blockchain.", socialMedialLinks: [{ code: "FB", text: "https://www.facebook.com/omkarsunku" }] }, rating: { count: 0, recentUpdate: new Date('2009-07-20T10:00:21'), average: 0 }, accounts: [{ accountId: 'QjYjsYmmuWPhYxt8hGjKx3cRH841rNv7w1', accountType: PaymentTypes.DirectCrypto } as CryptoAccount] } as BenefactorUser;
let user03 = { tenantId: 'cc', email: 'sunkuomkarsai5@gmail.com', phone: '7093635254', language: Languages.US, role: RoleTypes.Standard, basic: { userId: 'sunkuomkarsai5@gmail.com', firstName: 'Omkar', lastName: 'Sai Sunku', profilePhoto: 'omkar_profile_photo', language: Languages.US.toString(), } as UserLite, address: { addressLine1: 'Outskirts', addressLine2: 'Halli', city: 'Yelanka', country: 'India', language: Languages.US, pincode: '560105', place: 'Bangalore', state: 'Karnataka' } as Address, location: { latitude: 10.9301487, longitude: 76.5877228 }, authProviders: [{ provider: AuthProviders.Local, phash: 'tobecreated', userid: 'om@blocktech.dk' } as UserAuthProvider], verification: { activated: true, emailVerified: true, phoneVerified: true } as UserVerification, donorProfile: { description: "I am a Software Developer and Blockchain Developer with 2+ years experience. Currenctly focusing on Blockchain, AI, ML and cloud based Solutions", occupation: "Blockchain Developer" }, reqProfile: { description: "I am a Blockchain Developer with 3+ years of experience. Currenctly focusing on Blockchain.", socialMedialLinks: [{ code: "FB", text: "https://www.facebook.com/omkarsunku" }] }, rating: { count: 0, recentUpdate: new Date('2009-07-20T10:00:21'), average: 0 }, accounts: [{ accountId: 'QjYjsYmmuWPhYxt8hGjKx3cRH841rNv7w1', accountType: PaymentTypes.DirectCrypto } as CryptoAccount] } as BenefactorUser;
let user04 = { tenantId: 'cc', email: 'sunkuomkarsai.wemoveideas@gmail.com', phone: '7093635254', language: Languages.US, role: RoleTypes.Standard, basic: { userId: 'sunkuomkarsai.wemoveideas@gmail.com', firstName: 'Omkar', lastName: 'Sai Sunku', profilePhoto: 'omkar_profile_photo', language: Languages.US.toString(), } as UserLite, address: { addressLine1: 'Outskirts', addressLine2: 'Halli', city: 'Yelanka', country: 'India', language: Languages.US, pincode: '560105', place: 'Bangalore', state: 'Karnataka' } as Address, location: { latitude: 10.9301487, longitude: 76.5877228 }, authProviders: [{ provider: AuthProviders.Local, phash: 'tobecreated', userid: 'om@blocktech.dk' } as UserAuthProvider], verification: { activated: true, emailVerified: true, phoneVerified: true } as UserVerification, donorProfile: { description: "I am a Software Developer and Blockchain Developer with 2+ years experience. Currenctly focusing on Blockchain, AI, ML and cloud based Solutions", occupation: "Blockchain Developer" }, reqProfile: { description: "I am a Blockchain Developer with 3+ years of experience. Currenctly focusing on Blockchain.", socialMedialLinks: [{ code: "FB", text: "https://www.facebook.com/omkarsunku" }] }, rating: { count: 0, recentUpdate: new Date('2009-07-20T10:00:21'), average: 0 }, accounts: [{ accountId: 'QjYjsYmmuWPhYxt8hGjKx3cRH841rNv7w1', accountType: PaymentTypes.DirectCrypto } as CryptoAccount] } as BenefactorUser;
let user10 = { tenantId: 'cc', email: 'tgm@blocktech.dk', phone: '9686622751', language: Languages.DK, role: RoleTypes.Standard, basic: { userId: 'tgm@blocktech.dk', firstName: 'Thorkild', lastName: 'Grothe-Moller', profilePhoto: 'thorkild_profile_photo', language: Languages.DK.toString(), } as UserLite, address: { addressLine1: 'Outskirts', addressLine2: 'Halli', city: 'Yelanka', country: 'India', language: Languages.DK, pincode: '560108', place: 'Bangalore', state: 'Karnataka' } as Address, location: { latitude: 16.9301487, longitude: 71.2282567 },authProviders: [{ provider: AuthProviders.Local, phash: 'tobecreated', userid: 'annette@blocktech.dk' } as UserAuthProvider], verification: { activated: true, emailVerified: true, phoneVerified: true } as UserVerification, donorProfile: { description: "I am a Co-founder and currently focusing on Blockchain.", occupation: "Director of Technology and Projects, Co-founder of Blocktech.dk & WeMoveIdeas India" },rating: { count: 0, recentUpdate: new Date('2009-07-20T10:00:24'), average: 0 },accounts: [{ accountId: 'QjYjsYmmuWPhYxt8hGjKx3cRH841rNv7w1', accountType: PaymentTypes.DirectCrypto } as CryptoAccount] } as BenefactorUser;

async function createUser() {
    let users = [user01, user02, user03, user04, user10];
    let profPhotos: string[] = [
        "cc_profilephoto_e05fcae3-1a22-4cb7-80b0-2a8087301402_thumb",
        "cc_profilephoto_1fcaae6f-fabc-4e02-8437-b6ee1a029667_thumb",
        "cc_profilephoto_2668acb5-51cb-4696-afed-26259dc29455_thumb",
        "cc_profilephoto_609cfff2-7523-48e9-987a-d6e6cb975ffc_thumb",
        "cc_profilephoto_abab5f00-89e8-40da-95bf-53db054d4870_thumb",
        "cc_profilephoto_9e383fc9-84ba-4f06-bc3e-f297dcd1f0b0_thumb",
        "cc_profilephoto_25db6e39-f996-49c0-b3ff-0b1c778a0b49_thumb",
        "cc_profilephoto_8d22cc91-afd3-455c-bee8-08a45605aad3_thumb",
        "cc_profilephoto_65858d53-36c9-43ff-a340-ea5d49f4fb05_thumb",
        "cc_profilephoto_1a5e0bce-9485-4d51-9b0c-dbad140cddbf_thumb",
        "cc_profilephoto_aa51763f-0b20-40e9-bddf-26f2f1efe0f1_thumb",
        "cc_profilephoto_13bbe442-956c-43c1-b4ed-b0e1321de72a_thumb",
        "cc_profilephoto_751d0f0b-a423-4b16-8f4c-d630fa64d8ec_thumb",
        "cc_profilephoto_eaacb20d-d6c9-4ec9-bfae-c78724fd1847_thumb"
    ];
    let perPhotoIndex = 0;
    for (var j = 0; j < users.length; j++) {
        let auser = await uservice.findOne({ email: users[j].email });
        if (!auser) {
            users[j].basic.profilePhoto = profPhotos[perPhotoIndex];
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
createUser();

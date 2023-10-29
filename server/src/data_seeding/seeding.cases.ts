import { v1 as uuidv1 } from 'uuid';

import { CaseDocument, CaseStatus } from '../data/case';
import { Currency, FileModes, FileTypes } from '../data/common';
import { CaseRating, UserRating } from '../data/rating';
import { CaseService } from '../services/case.service';
import { KYCService } from '../services/kyc.service';
import { OrderService } from '../services/order.service';
import { CaseRatingService, UserRatingService } from '../services/rating.service';
import { TenantService } from '../services/tenant.service';
import { UserService } from '../services/user.service';
import * as cases_data from './case.data.seed';
import * as tenants_data from './tenant.data.seed';
import * as users_data from './user.data.seed';

let tservice: TenantService = new TenantService();
let uservice: UserService = new UserService();
let cservice: CaseService = new CaseService();
let oservice: OrderService = new OrderService();
let kycservice: KYCService = new KYCService();
let ratingservice: CaseRatingService = new CaseRatingService();
let userRatingservice: UserRatingService = new UserRatingService();

let tenants = tenants_data.data;
let users = users_data.data;
let cases = cases_data.data;

let photos: string[] = [
    "cc_casephoto_9b3487d7-e5a9-4e89-8784-8426553f4019",
    "cc_casephoto_11df8ec8-f757-494c-8216-43a9a806841d",
    "cc_casephoto_9b565fdc-ba65-44c7-8c81-9cd9c7b704ba",
    "cc_casephoto_e935e961-a19b-4b28-ae85-48a1d5cba2f8",
    "cc_casephoto_122e2965-3045-4a6d-928a-c5ebcd1270ad",
    "cc_casephoto_f59110e3-82df-4e3d-8a65-8d09b66003d4",
    "cc_casephoto_64276aca-8461-4c01-b27a-7a3d230b48f8",
    "cc_casephoto_c053b33a-34b3-45b5-8ec7-8248025e7ce3",
    "cc_casephoto_723d2811-027e-424f-a8fd-e0c8579145ca",
    "cc_casephoto_9874f42f-6baf-4b44-a29b-55fb6da52bbd",
    "cc_casephoto_05bb9028-4b41-489d-a8cd-1c65863327a0",
    "cc_casephoto_d4f83ed0-92b4-4805-a7a2-a9fdc2248965",
    "cc_casephoto_fa32bdfb-8d8a-4ca8-8bb1-be58ac6cc1f6",
    "cc_casephoto_d15517d7-60e8-4f27-a2b7-ff1458e46000",
    "cc_casephoto_b2691fed-46c2-490b-b472-93599b9f289e",
    "cc_casephoto_e6b4b626-b061-461a-b5dc-7f0a12f19183",
    "cc_casephoto_6eb14932-a31c-4ba2-95a6-bd562c8e09e9",
    "cc_casephoto_62158923-774d-4fcd-93f5-6c2292fb4cae",
    "cc_casephoto_32f35842-0d9e-4e8f-8e81-3ad015b49d86",
    "cc_casephoto_5289791d-769e-4f60-9344-485d67762523",
    "cc_casephoto_c854e423-f666-4c7d-a381-20fe61e0dac4",
    "cc_casephoto_e605eab2-752b-452c-90a3-02b0d68d247a",
    "cc_casephoto_81ab9675-409e-472e-845c-93a4542b598b",
    "cc_casephoto_267826b8-a555-4859-9251-82cb9895a157",
    "cc_casephoto_d9c70d26-9e5c-4d4e-b5eb-4a0b64480581",
    "cc_casephoto_02b150af-4028-41f6-8a32-22c59bf460d3",
    "cc_casephoto_3e27a5b1-fa28-438d-b416-3362c1aa89d0",
    "cc_casephoto_b41dbafa-44a0-467f-991f-2c9ae5e06d2e",
    "cc_casephoto_9e104b1e-5714-4d56-8ff1-e4b215b0a8a7",
    "cc_casephoto_d933888b-1fc9-4f5e-814b-b5589d5835fc",
    "cc_casephoto_19bdc394-23d8-420f-8c74-785455a47c21",
    "cc_casephoto_99533aa1-9c82-4b45-85f4-c4c8ff32bfad",
    "cc_casephoto_cb5f05a9-88f7-4d5c-9126-8464918780e1",
    "cc_casephoto_7c9f2b5f-5d4d-45fd-b3f8-997e6df5a0c8"
];
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
let kycs: string[] = [
    "https://assets1.cleartax-cdn.com/s/img/2018/04/05172018/Aadhaar-card-sample-300x212.png",
    "https://support.instamojo.com/hc/article_attachments/204332305/PAN-card-sample.gif",
    "https://images.livemint.com/rf/Image-621x414/LiveMint/Period2/2018/07/03/Photos/Processed/pan-card.jpg",
    "https://static.toiimg.com/thumb/msid-63778316,width-640,resizemode-4/63778316.jpg",
    "https://static-news.moneycontrol.com/static-mcnews/2018/06/A_sample_of_Permanent_Account_Number_PAN_Card_1280x720-770x433.jpg",
    //"",
];

let sampleComments: string[] = ["Funtastic", "Gentlemen", "Always Smart", "Nice pic", "Smart Working", "Very well Social servered",
    "Very well Take cares", "Always the doing best", "Very nice work", "You are the best"];
let perPhotoIndex = 0;
let casePhotoIndex = 0;
let kycPhotoIndex = 0;

let benefiStartIndex = 0;
let benefiIndex = benefiStartIndex;
let maxBenefiIndex = 4;

let benefaStartIndex = 5;
let benefaIndex = benefaStartIndex;
let maxBenefaIndex = 9;

let pubUsrStartIndex = 10;
let pubUsrIndex = pubUsrStartIndex;
let maxPubUsrIndex = 14;

async function createCases() {
    for (var i = 0; i < tenants.length; i++) {
        let atenant = await tservice.findOne({ tenantId: tenants[i].tenantId });
        if (!atenant) {
            let t1 = await tservice.create(tenants[i]);
            tenants[i]._id = t1._id;
            atenant = t1;
        }
        let dtRated;
        let rndRating;
        perPhotoIndex = 0;
        for (var j = 0; j < users.length; j++) {
            let auser = await uservice.findOne({ email: users[j].email });
            if (!auser) {
                users[j].basic.profilePhoto = profPhotos[perPhotoIndex];
                users[j].verification.activated = users[j].verification.addressVerified = users[j].verification.emailVerified = users[j].verification.phoneVerified = users[j].verification.photoVerified  = true;
                users[j].verification.activatedOn = users[j].verification.addressVerifiedOn = users[j].verification.emailVerifiedOn = users[j].verification.phoneVerifiedOn = users[j].verification.photoVerifiedOn = new Date();
                users[j].verification.currencyUpdated =  false;
                users[j].baseCurrency = Currency.USD;

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

            perPhotoIndex++;
            if (perPhotoIndex >= profPhotos.length) perPhotoIndex = 0;

            //userratings
            let totalRating: number = 0;
            let latestRatedOn: Date = new Date();
            if (auser.rating && auser.rating.count > 0) {
                let dtN = new Date();
                for (var k = 0; k < auser.rating.count; k++) {
                    let pubUser = users[pubUsrIndex];
                    pubUsrIndex++;
                    if (pubUsrIndex > maxPubUsrIndex) pubUsrIndex = pubUsrStartIndex;
                    let pubUserBasic = pubUser.basic;
                    let rndRating = parseInt((Math.random() * (5 - 1) + 1).toString());
                    let rndRatingTimeHrsOn = Math.random() * ((24 * 60) - 1) + 1;
                    let dtRated = new Date(new Date().setHours(-rndRatingTimeHrsOn));

                    totalRating += rndRating;
                    if (k == 0) {
                        latestRatedOn = dtRated;
                    }
                    else if (latestRatedOn && dtRated > latestRatedOn) {
                        latestRatedOn = dtRated;
                    }

                    let randomNumber = parseInt((Math.random() * (sampleComments.length - 1)).toString());
                    let userId = auser.basic.userId;
                    let tenantId = auser.tenantId;
                    let userComments = sampleComments[randomNumber];
                    let urating: UserRating = {
                        tenantId: tenantId,
                        userId: userId,
                        rating: rndRating,
                        rateOn: dtRated,
                        comments: userComments,
                        user: pubUserBasic,
                    } as UserRating;

                    let nrating = await userRatingservice.create(urating);
                }

                let average = totalRating / auser.rating.count;
                let recentUpdate = latestRatedOn;
                let updaterating = await uservice.updatePart({ email: users[j].email }, { $set: { rating: { count: auser.rating.count, average: average, recentUpdate: recentUpdate } } });
            }
        }

        perPhotoIndex = 0;
        casePhotoIndex = 0;
        kycPhotoIndex = 0;
        for (var j = 0; j < cases.length; j++) {
            let acase = await cservice.findOne({ caseId: cases[j].caseId });
            if (!acase) {
                acase = cases[j];
                let benfiUser = users[benefiIndex];
                benefiIndex++;
                if (benefiIndex > maxBenefiIndex) benefiIndex = benefiStartIndex;
                let benfiUserBasic = benfiUser.basic;
                let benfiUserAcc = benfiUser.accounts[0];

                if (acase.status == CaseStatus.Open || acase.status == CaseStatus.Completed) {
                    // let kyc: KYC = {
                    //     tenantId: benfiUser.tenantId,
                    //     accountId: benfiUserAcc.accountId,
                    //     expireOn: new Date(2025, 12, 31),
                    //     user: benfiUserBasic,
                    //     documents: [{
                    //         kycTypeType: KYCType.ProofOfRecidency,
                    //         fileType: FileTypes.ImageJpg,
                    //         title: 'Proof Residency',
                    //         uniqueName: kycs[kycPhotoIndex],
                    //     } as KycDocument],
                    //     status: KYCStatus.Approved,
                    //     states: [{
                    //         status: KYCStatus.Uploaded,
                    //         statusOn: new Date(),
                    //         statusBy: benfiUserBasic,
                    //         note: 'self uploaded',
                    //     } as KycState,
                    //     {
                    //         status: KYCStatus.Approved,
                    //         statusOn: new Date(),
                    //         statusBy: benfiUserBasic,
                    //         note: 'self approval',
                    //     } as KycState]
                    // } as KYC;

                    // kycPhotoIndex++;
                    // if (kycPhotoIndex >= kycs.length) kycPhotoIndex = 0;

                    // let kyc1 = await kycservice.create(kyc);

                    let benfaUser = users[benefaIndex];
                    benefaIndex++;
                    if (benefaIndex > maxBenefaIndex) benefaIndex = benefaStartIndex;
                    let benfaUserBasic = benfaUser.basic;
                    let benfaUserAcc = benfiUser.accounts[0];

                    let caseId = acase.caseId;
                    let tenantId = acase.tenantId;
                    let orderId = uuidv1();
                    let tranId = uuidv1();
                    let tranref = uuidv1();
                    //***commiting the donation/order while seeding have any issue on display***//
                    // let caseamount = acase.amount / 2;
                    // let accountDetails1: TransactionAccount = {
                    //     referenceName: tranref,
                    //     accountHoldername: benfaUser.basic.firstName + ' ' + benfaUser.basic.lastName,
                    //     accountType: benfaUserAcc.accountType,
                    //     kycId: kyc1._id,
                    //     accountId: benfaUserAcc.accountId,
                    //     currency: ''
                    // };

                    // let order1: Order = {
                    //     tenantId: tenantId,
                    //     orderId: orderId,
                    //     caseId: caseId,
                    //     status: OrderStatus.Completed,
                    //     currency: Currency.USD,
                    //     amount: caseamount + (caseamount / 10),
                    //     receiverAccount: accountDetails1,
                    //     breakdown: [{
                    //         name: 'payout',
                    //         amount: (caseamount / 10)
                    //     } as OrderBreakdown, {
                    //         name: 'amount',
                    //         amount: caseamount
                    //     } as OrderBreakdown],
                    //     user: benfaUserBasic,
                    //     transactions: [{
                    //         currency: Currency.USD,
                    //         amount: (caseamount / 10),
                    //         trnReference: uuidv1(),
                    //         trnHash: uuidv1(),
                    //     } as OrderTransaction, {
                    //         currency: Currency.USD,
                    //         amount: caseamount,
                    //         trnReference: uuidv1(),
                    //         trnHash: uuidv1(),
                    //     } as OrderTransaction]
                    // } as Order;

                    //                    let norder = await oservice.create(order1);
                    // for (let i = 0; i < 2; i++) {
                    //     let benfaUser = users[benefaIndex];
                    //     benefaIndex++;
                    //     if (benefaIndex > maxBenefaIndex) benefaIndex = benefaStartIndex;
                    //     let benfaUserBasic = benfaUser.basic;
                    //     acase.donations[i] = {
                    //         user: benfaUserBasic,
                    //         order: {
                    //             currency: Currency.USD,
                    //             amount: Math.round((Math.random() * (5 - 1)) * 10 + j),  //j is main for loop value
                    //             status: OrderStatus.Completed,
                    //         },
                    //     } as CaseDonation;
                    // }

                    acase.beneficiary = benfiUserBasic;
                    let totalRating: number = 0;
                    let latestRatedOn: Date = new Date();
                    if (acase.rating && acase.rating.count > 0) {
                        let dtN = new Date();
                        for (var k = 0; k < acase.rating.count; k++) {
                            let pubUser = users[pubUsrIndex];
                            pubUsrIndex++;
                            if (pubUsrIndex > maxPubUsrIndex) pubUsrIndex = pubUsrStartIndex;
                            let pubUserBasic = pubUser.basic;
                            rndRating = parseInt((Math.random() * (5 - 1) + 1).toString());
                            let rndRatingTimeHrsOn = Math.random() * ((24 * 60) - 1) + 1;
                            dtRated = new Date(new Date().setHours(-rndRatingTimeHrsOn));

                            totalRating += rndRating;
                            if (k == 0) {
                                latestRatedOn = dtRated;
                            }
                            else if (latestRatedOn && dtRated > latestRatedOn) {
                                latestRatedOn = dtRated;
                            }

                            let crating: CaseRating = {
                                tenantId: tenantId,
                                caseId: caseId,
                                caseTitle: acase.content[0].title,
                                benficiaryId: acase.beneficiary.userId,
                                rating: rndRating,
                                rateOn: dtRated,
                                comments: acase.content[0].title + " - rating comment - " + k.toString(),
                                user: pubUserBasic,
                            } as CaseRating;
                            let nrating = await ratingservice.create(crating);

                            //updating user ratings
                            let userCount;
                            let userAverage;
                            let userUpdatedLatest;
                            let benefiLite; // get beneficiary lite object whose ratings to be updated 
                            benefiLite = await uservice.findOneSelect({ tenantId: 'cc', 'basic.userId': acase.beneficiary.userId, }, 'basic rating');
                            userCount = benefiLite.rating.count;
                            userAverage = benefiLite.rating.average;
                            //push the same ratings the to that particular case handling user(sum and avg with the existing ratings)  
                            userCount++;
                            userAverage = ((userAverage * benefiLite.rating.count) + Number(rndRating)) / userCount;
                            userUpdatedLatest = dtRated;

                            let urating = {
                                count: parseInt(userCount),
                                average: userAverage,
                                recentUpdate: userUpdatedLatest
                            };
                            let updateUser = await uservice.updatePart({ tenantId: 'cc', 'basic.userId': acase.beneficiary.userId }, { $set: { "rating": urating } });;
                        }

                        acase.rating.average = totalRating / acase.rating.count;
                        acase.rating.recentUpdate = latestRatedOn;
                    }
                }

                acase.beneficiary = benfiUserBasic;
                acase.accountDetails = [benfiUserAcc];
                for (let i = 0; i <= 3; i++) {
                    acase.attachments[i] = {
                        fileMode: FileModes.Standard,
                        fileType: FileTypes.ImageJpg,
                        title: acase.content[0].title,
                        uniqueName: photos[Math.floor(Math.random() * Math.floor(photos.length))],
                    } as CaseDocument;
                }

                casePhotoIndex++;
                if (casePhotoIndex >= photos.length) casePhotoIndex = 0;

                let c1 = await cservice.create(acase);
                cases[j]._id = c1._id;
                acase = cases[j];
            }
        }
    }
}

let createPromise = createCases();

Promise.all([createPromise]).then(
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
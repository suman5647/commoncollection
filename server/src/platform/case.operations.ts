import * as axios from 'axios';
import { Request, Response } from 'express';
import * as https from 'https';
import { v1 as uuidv1 } from 'uuid';

import { AuditData, dateFromObjectId, search } from '../config/common';
import { keys } from '../config/keys';
import { Case, CaseDonation, CasePhotoStatus, CaseStatus, ICaseCreate } from '../data/case';
import {
    BenefactorDonationResponseResults,
    BeneficiaryCaseResponseResults,
    CasesResponseData,
    Currency,
    DonationsResponseData,
    ErrorResponse,
    FileModes,
    Languages,
    PagedResponseData,
    PageResponseHelper,
    PaymentTypes,
    ResponseData,
    ResponseResults,
    TransactionAccount,
    TransactionList,
} from '../data/common';
import { S3Data } from '../data/keys';
import { MerchantTransactionsLite, Order, OrderBreakdown, OrderStatus, OrderTransaction, RatesSet } from '../data/order';
import { CaseRating, RatingData } from '../data/rating';
import {
    BenefactorProfile,
    BenefactorPubData,
    BeneficiaryProfile,
    BeneficiaryPubData,
    RoleTypes,
    User,
    UserLite,
} from '../data/user';
import { BitgoOperations } from '../platform/bitgoAPI';
import { Donations } from '../platform/donation.operations';
import { ImageOperations } from '../platform/image.operations';
import { AuditLogSevice } from '../services/auditLog.service';
import { CaseService } from '../services/case.service';
import { decryptData } from '../services/crypto.service';
import { emailSendService } from '../services/email.service';
import { ExchangeRatesSerivce } from '../services/exchangeRates.service';
import { localizationService } from '../services/localization.service';
import { OrderService } from '../services/order.service';
import { CaseRatingService } from '../services/rating.service';
import { TenantService } from '../services/tenant.service';
import { UserService } from '../services/user.service';
import { BaseAPIOperations } from './base.operations';
import { FileOperations } from './file.operations';

const exchange: ExchangeRatesSerivce = new ExchangeRatesSerivce();
const auditLog: AuditLogSevice = new AuditLogSevice();
let ratingService: CaseRatingService = new CaseRatingService();
let cservice: CaseService = new CaseService();
let uservice: UserService = new UserService();
let oservice: OrderService = new OrderService();
let tservice: TenantService = new TenantService();
let emailService: emailSendService = new emailSendService();
let localizeService: localizationService = new localizationService();
let fileOperations: FileOperations = new FileOperations();
let imgops: ImageOperations = new ImageOperations();
let donationOps: Donations = new Donations();
let bitgoOps: BitgoOperations = new BitgoOperations();
var s3keys: S3Data;
if (keys.files.isEncrypted) {
    s3keys = decryptData(keys.files.key);
}
export class CaseOperations extends BaseAPIOperations {
    constructor(req: Request, res: Response) {
        super(req, res);
    }

    get ratingLiteFields2() {
        return {
            rating: 1,
            comments: 1
        }
    }

    get caseRatingLiteFields() {
        return {
            tenantId: 1,
            caseId: 1,
            content: 1,
            revision: 1,
            beneficiary: 1,
            rating: 1,
            baseCurrency: 1
        };
    }

    get ratingLiteFields() {
        return {
            rating: 1,
        };
    }

    get userLiteRatingFields() {
        return {
            basic: 1,
            rating: 1,
            donorProfile: 1,
            reqProfile: 1,
            baseCurrency: 1
        };
    }

    get tenantFields() {
        return {
            baseLanguage: 1,
        }
    }

    get myCaseUpdateStatusFields() {
        return {
            content: 1,
            attachments: 1,
            accountDetails: 1,
            caseId: 1,
            isagent: 1,
            agentCommission: 1,
            status: 1
        }
    }

    get casesLiteFields() {
        return {
            caseId: 1,
            address: 1,
            location: 1,
            beneficiary: this.beneficiaryPhotoProjectAttachmentMap,
            status: 1,
            content: 1,
            adminStatus: 1,
            adminComments: 1,
            adminCommentOn: 1,
            attachments: this.caseProjectAttachmentMap,
        };
    }

    get caseLiteFields() {
        return {
            tenantId: 1,
            caseId: 1,
            revision: 1,
            isactive: 1,
            beneficiary: 1,
            content: 1,
            status: 1,
        };
    }

    get ratingFields() {
        return {
            caseId: 1,
            caseTitle: 1,
            rating: 1,
            comments: 1,
            rateOn: 1,
            user: 1,
            status: 1
        };
    }

    get projectBeneficiaryPublicFields() {
        return {
            basic: this.profilePhotoProjectAttachmentMap,
            'verification.emailVerified': 1,
            'verification.phoneVerified': 1,
            'verification.photoVerified': 1,
            'verification.addressVerified': 1,
            address: 1,
            location: 1,
            rating: 1,
            reqProfile: 1,
            donorProfile: 1,
            baseCurrency: 1
        };
    }

    get projectBenefactorPublicFields() {
        return {
            basic: this.profilePhotoProjectAttachmentMap,
            donorProfile: 1,
            location: 1,
            address: 1,
            baseCurrency: 1
        };
    }

    get beneficiaryCaseFields() {
        return {
            caseId: 1,
            content: 1,
            attachments: this.caseProjectAttachmentMap,
            address: 1,
            location: 1,
            status: 1,
            baseCurrency: 1
        }
    }

    get benefactorDonationFields() {
        return {
            caseId: 1,
            status: 1,
            attachments: this.caseProjectAttachmentMap,
            content: 1,
            donations: 1,
            address: 1,
            location: 1,
            baseCurrency: 1,
            beneficiary: 1,
            donationPercentage: { "$trunc": [{ "$multiply": [{ "$divide": ["$donations.order.amount", "$totalCaseDonation"] }, 100] }] }
        }
    }

    get benefactorDonationLite() {
        return {
            caseId: 1,
            donations: 1,
            content: 1,
            baseCurrency: 1,
            beneficiary: 1,
        }
    }

    get emailFields() {
        return {
            email: 1,
            basic: 1,
            language: 1,
            verification: 1,
        };
    }

    get projectCaseDetailFields() {
        return {
            caseId: 1,
            location: 1,
            status: 1,
            beneficiary: this.beneficiaryPhotoProjectAttachmentMap,
            content: 1,
            baseCurrency: 1,
            address: 1,
            agentCommission: 1,
            rating: 1,
            amount: 1,
            donations: this.donorPhotoProjectMap,
            attachments: this.caseProjectAttachmentMap,
            accountDetails: 1,
            totalCaseDonation: 1
        };
    }

    get projectCaseLiteFields() {
        return {
            content: 1,
            createdOn: 1,
            status: 1,
            caseId: 1,
            address: 1,
            amount: 1,
            isagent: 1,
            agentCommission: 1,
            attachments: this.caseProjectAttachmentMap,
            accountDetails: 1,
            location: 1
        };
    }


    get donorPhotoProjectMap() {
        return {
            "$map": {
                "input": "$donations",
                "as": "u",
                "in": {
                    "user": {
                        "userId": "$$u.user.userId",
                        "firstName": "$$u.user.firstName",
                        "lastName": "$$u.user.lastName",
                        "profilePhoto": { "$concat": [s3keys.url, "$$u.user.profilePhoto"] },
                        "language": "$$u.user.language"
                    },
                    "order": {
                        "currency": "$$u.order.currency",
                        "amount": "$$u.order.amount",
                        "status": "$$u.order.status",
                        "orderId": "$$u.order.orderId"
                    }
                }
            }
        };
    }

    get caseProjectAttachmentMap() {
        return {
            "$map": {
                "input": "$attachments",
                "as": "u",
                "in": {
                    "fileMode": "$$u.fileMode",
                    "fileType": "$$u.fileType",
                    "title": "$$u.title",
                    "uniqueName": "$$u.uniqueName",
                    "status": "$$u.status",
                    "thumb": { "$concat": [s3keys.url, "$$u.uniqueName", "_thumb"] },
                    "original": { "$concat": [s3keys.url, "$$u.uniqueName"] }
                }
            }
        };
    }

    get beneficiaryPhotoProjectAttachmentMap() {
        return {
            "userId": "$beneficiary.userId",
            "firstName": "$beneficiary.firstName",
            "lastName": "$beneficiary.lastName",
            "profilePhoto": { "$concat": [s3keys.url, "$beneficiary.profilePhoto"] },
            "language": "$beneficiary.language"
        };
    }

    get profilePhotoProjectAttachmentMap() {
        return {
            "userId": "$basic.userId",
            "firstName": "$basic.firstName",
            "lastName": "$basic.lastName",
            "profilePhoto": { "$concat": [s3keys.url, "$basic.profilePhoto"] },
            "language": "$basic.language"
        };
    }

    get orderTransactionLite() {
        return {
            _id: 1,
            transactions: 1,
            amount: 1,
            user: 1,
            currency: 1,
            basic: 1,
            breakdown: 1
        }
    }

    async saveCase(newCase: ICaseCreate) {
        if (!newCase.content || newCase.content.length !== 1
            || !newCase.content[0].title || newCase.content[0].title.length < 5 || newCase.content[0].title.length > 1000
            || !newCase.content[0].description || newCase.content[0].description.length < 10 || newCase.content[0].description.length > 5000) {
            return { status: 500, data: { message: 'Input validation failed content' } } as ErrorResponse;
        }

        if (newCase.address) {
            if (!newCase.address
                || !newCase.address.country || !newCase.address.city) {
                return { status: 500, data: { message: 'Input validation failed address' } } as ErrorResponse;
            }

            if (!!newCase.address.language) {
                newCase.address.language = Languages.US;
            }
        }

        let benefiLite: User = await uservice.findOneSelect({ tenantId: this.tenantId, 'basic.userId': this.userId }, this.userLiteRatingFields);

        let case1: Case = {
            tenantId: this.tenantId,
            beneficiary: benefiLite.basic,
            content: newCase.content,
            address: newCase.address,
            location: newCase.location,
            isagent: newCase.isagent === true,
            baseCurrency: newCase.baseCurrency ? newCase.baseCurrency : Currency.USD, // ?, fallback from tenant, otherwise default to system currency?
            agentCommission: newCase.isagent === true ? newCase.agentCommission : 0,
            amount: newCase.amount,
            status: CaseStatus.Draft,
            revision: 1,
            isactive: true,
            createdOn: new Date(),
            caseId: uuidv1() as string,
            rating: newCase.rating,
            accountDetails: newCase.accountDetails
            //category: [],
        } as Case;


        //checking the user has a reqProfile or not. If not will create a reqProfile  
        if (!benefiLite.reqProfile) {
            let reqProfile = {
                description: 'My description',
                socialMedialLinks: [{
                    code: 'FB',
                    text: 'facebook.com'
                }],
                occupation: 'My occupation'
            };

            let ratings = {
                count: 0,
                recentUpdate: '',
                average: 0
            }
            let updateUserProfile = await uservice.updatePart({ tenantId: this.tenantId, 'basic.userId': this.userId }, {
                $set: { reqProfile: reqProfile, rating: ratings }
            });
        }


        if (newCase.isagent === true) {
            case1.agentCommission = newCase.agentCommission;
        }

        let caseCreated = await cservice.create(case1);

        return { status: 200, data: caseCreated } as ResponseData<Case>;
    }

    async updateCase(id: string, caseData: ICaseCreate) {

        let caseDetails = await cservice.findOneSelect({ tenantId: this.tenantId, isactive: true, caseId: id }, this.caseLiteFields);

        if (!caseDetails) { // not found
            const dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryNoCases', this.language);
            return { status: 404, data: { message: dataMessage } };
        }

        if (caseDetails.beneficiary.userId !== this.userId) { // unauthorised/forbidden
            const dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryNotAllowed', this.language);
            return { status: 402, data: { message: dataMessage } };
        }
        if (caseDetails.status == CaseStatus.Draft) { // only draft status case can modify all the case details

            if (!caseData.content || caseData.content.length !== 1
                || !caseData.content[0].title || caseData.content[0].title.length < 5 || caseData.content[0].title.length > 1000
                || !caseData.content[0].description || caseData.content[0].description.length < 10 || caseData.content[0].description.length > 5000) {
                let dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryFailedInputContent', this.language);
                return { status: 500, data: { message: dataMessage } } as ErrorResponse;
            }

            if (caseData.address) {
                if (!caseData.address
                    || !caseData.address.country || !caseData.address.city) {
                    let dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryFailedInputAddress', this.language);
                    return { status: 500, data: { message: dataMessage } } as ErrorResponse;
                }

                if (!!caseData.address.language) {
                    caseData.address.language = Languages.US;
                }
            }

            const caseUpdated: any = await cservice.updatePart({ tenantId: caseDetails.tenantId, caseId: caseDetails.caseId, revision: caseDetails.revision }, {
                $set: {
                    content: caseData.content,
                    address: caseData.address,
                    // location: caseData.location,
                    isagent: caseData.isagent === true,
                    baseCurrency: caseData.baseCurrency ? caseData.baseCurrency : Currency.USD, // ?, fallback from tenant, otherwise default to system currency?
                    agentCommission: caseData.isagent === true ? caseData.agentCommission : 0,
                    amount: caseData.amount,
                    attachments: caseData.attachments,
                    accountDetails: caseData.accountDetails
                }
            });

            if (caseUpdated.nModified) {
                let dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryCaseDetailsSuccess', this.language);
                return { status: 200, data: dataMessage };
            } else {
                let dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryFailedtoUpdateCase', this.language);
                return { status: 500, data: { message: dataMessage } };
            }
        } else if (caseDetails.status == CaseStatus.Open) { //open case can upload and rearrange photos
            if (!caseData.attachments) {
                let dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryFailedInputPhotos', this.language);
                return { status: 500, data: { message: dataMessage } } as ErrorResponse;
            }
            const caseUpdated: any = await cservice.updatePart({ tenantId: caseDetails.tenantId, caseId: caseDetails.caseId, revision: caseDetails.revision }, {
                $set: {
                    attachments: caseData.attachments
                }
            });

            if (caseUpdated.nModified) {
                let dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryCaseDetailsSuccess', this.language);
                return { status: 200, data: dataMessage };
            } else {
                let dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryFailedtoUpdateCase', this.language);
                return { status: 500, data: { message: dataMessage } };
            }
        } else { //case which are other than draft or open stage are not allowed to modify
            const dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryOnlyDraftOpen', this.language);
            return { status: 500, data: { message: dataMessage } };
        }
    }

    async saveCaseRating(caseId: string, rating: RatingData) {
        // validate case existing caseId, and get beneficiaryId
        // this.userId
        let beneficiaryId: string; // get from case
        let caseRecentUpdate;
        let caseRatingCount;
        let caseRatingAverage: number = 0;
        let userAggregateRatingCount;
        let userAggregateRatingAverage: number = 0;
        let userUpdatedLatest;
        let benefiLite; // get beneficiary lite object whose ratings to be updated 
        let userLite; // get user lite object whose is posting ratings
        let caseTitle; // get the case title from case details

        let caseDetails = await cservice.findOneSelect({ tenantId: this.tenantId, status: [CaseStatus.Open, CaseStatus.Completed], caseId: caseId }, this.caseRatingLiteFields);
        if (!caseDetails) {
            let dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryCaseDoesNot', this.language);
            return { status: 500, data: { message: dataMessage } };
        }

        beneficiaryId = caseDetails.beneficiary.userId;
        caseRatingCount = caseDetails.rating.count;
        caseRatingAverage = caseDetails.rating.average;
        caseTitle = caseDetails.content[0].title;

        benefiLite = await uservice.findOneSelect({ tenantId: this.tenantId, 'basic.userId': beneficiaryId }, this.userLiteRatingFields);
        userAggregateRatingCount = benefiLite.rating.count;
        userAggregateRatingAverage = benefiLite.rating.average;
        userLite = await uservice.findOneSelect({ tenantId: this.tenantId, 'basic.userId': this.userId }, this.userLiteRatingFields);
        let rateOn = new Date();
        //Creating ratings into userrating and caserating collections

        let newRating = Number(rating.rating);
        let updatedCaseRating: CaseRating;
        let caseRatingLite = await ratingService.findOneSelect({ tenantId: this.tenantId, 'user.userId': this.userId, caseId: caseId }, this.ratingLiteFields);
        if (this.userId == beneficiaryId) {
            let dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryNotAllowedRatings', this.language);
            return { status: 500, data: { message: dataMessage } };
        }
        if (caseRatingLite) {
            updatedCaseRating = await ratingService.updatePart({ tenantId: this.tenantId, _id: caseRatingLite._id },
                {
                    $set:
                    {
                        rating: Number(rating.rating),
                        comments: rating.comments,
                        rateOn: rateOn
                    }
                });

            // old:5 -> new:3 = 3 - 5 = (diference)-2
            // old:3 => new:5 = 5 - 3 = (diference)+2
            newRating = Number(rating.rating) - caseRatingLite.rating;
        }
        else {
            updatedCaseRating = await ratingService.create({
                caseId: caseId,
                caseTitle: caseTitle,
                tenantId: this.tenantId,
                benficiaryId: beneficiaryId,
                rating: Number(rating.rating),
                comments: rating.comments,
                user: userLite.basic,
                rateOn: rateOn
            } as CaseRating);

            userAggregateRatingCount++;
            caseRatingCount++;
        }

        userAggregateRatingAverage = ((userAggregateRatingAverage * benefiLite.rating.count) + (newRating)) / userAggregateRatingCount;
        userUpdatedLatest = rateOn;

        let urating = {
            count: parseInt(userAggregateRatingCount),
            average: userAggregateRatingAverage,
            recentUpdate: userUpdatedLatest
        };

        //update the same raings to the particular case(update average, recentUpdate, count)
        caseRatingAverage = ((caseRatingAverage * caseDetails.rating.count) + (newRating)) / caseRatingCount;
        caseRecentUpdate = rateOn;

        let crating = {
            count: parseInt(caseRatingCount),
            average: caseRatingAverage,
            recentUpdate: caseRecentUpdate
        }

        //Update 1 on user collection inside rating
        let updateUserRatings: any = await uservice.updatePart({ tenantId: this.tenantId, 'basic.userId': beneficiaryId }, { $set: { "rating": urating } });
        //update 2 on case collection inside rating
        let updateCaseRatings: any = await cservice.updatePart({ tenantId: this.tenantId, status: [CaseStatus.Open, CaseStatus.Completed], caseId: caseId }, { $set: { "rating": crating } });
        if (updatedCaseRating && updateUserRatings.ok && updateCaseRatings.ok) {
            let dataMessage = await localizeService.localizeContactMeOutro('Ratings.SuccessfullyPosted', this.language);
            return { status: 200, data: dataMessage };
        } else {
            return { status: 500, data: { message: 'Failed to update successfully :: ' + updatedCaseRating } };
        }
    }

    async getCaseRating(caseId: string) {
        let caseRatingLite = await ratingService.findOneSelect({ tenantId: this.tenantId, 'user.userId': this.userId, caseId: caseId }, this.ratingLiteFields2);
        if (caseRatingLite) {
            return { status: 200, data: caseRatingLite } as ResponseData<CaseRating>;
        } else {
            return { status: 200, data: [] };
        }
    }

    async getMyCases() {
        let casesLength = await cservice.findCount({ tenantId: this.tenantId, 'beneficiary.userId': this.userId });
        let caseLiteDetails = await cservice.findAggregate([
            {
                "$match": {
                    "$and": [
                        { "tenantId": this.tenantId },
                        { 'beneficiary.userId': this.userId },
                    ]
                }
            },
            { "$sort": {  "createdOn": -1 }  },
            {
                "$project": this.projectCaseLiteFields
            }
        ]);
        if (casesLength > 0) {
            return { status: 200, data: caseLiteDetails, meta: { totalItems: casesLength } } as PagedResponseData<Case>;
        } else {
            let dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryNoCases', this.language);
            return { status: 500, data: { message: dataMessage } }
        }
    }

    async getMyCaseDetails(caseId: string) {
        let caseDetails = await cservice.findAggregate([
            {
                "$match": {
                    "$and": [{ "tenantId": this.tenantId }, { 'beneficiary.userId': this.userId }, { caseId: caseId }]
                }
            },
            {
                "$project": this.projectCaseLiteFields
            }
        ]);
        if (caseDetails[0]) {
            return { status: 200, data: caseDetails[0] } as ResponseData<Case>;
        }
        else {
            let dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryCaseDoesNot', this.language);
            return { status: 500, data: { message: dataMessage } }
        }
    }

    async updateMyCaseStatus(caseId: string, caseStatus: string) {
        let caseDetails = await cservice.findOneSelect({ tenantId: this.tenantId, status: CaseStatus.Draft, caseId: caseId, 'beneficiary.userId': this.userId }, this.myCaseUpdateStatusFields);
        if (caseDetails) {
            if (caseDetails.content[0].title && caseDetails.content[0].description && caseDetails.attachments[0]) {
                if (!caseDetails.isagent) {  //check the case is non-agent
                    if (caseDetails.agentCommission == 0) {
                        return cservice.updateCaseStatus(caseId, caseStatus, this.tenantId);
                    } else {
                        let dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryAgentCommission', this.language);
                        return { status: 500, data: { message: dataMessage } };
                    }
                } else {
                    return cservice.updateCaseStatus(caseId, caseStatus, this.tenantId);
                }
            } else {
                let dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryRequiredAllDetails', this.language);
                return { status: 500, data: { message: dataMessage } };
            }
        } else {
            let dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryCaseDoesNot', this.language);
            return { status: 500, data: { message: dataMessage } }
        }
    }


    async uploadCasePhotos(caseId, file: any, req: any, res: Response) {
        let responseData = [];
        let tenantId = this.tenantId;
        let userId = this.userId;
        await file.map(async (item) => {
            let results = {};
            let key = tenantId + '_casephoto_' + uuidv1();
            let thumbnailBuffer = await imgops.resize(item.buffer, 200);
            await fileOperations.uploadFile(key, item.mimetype, item.buffer, userId);  //original photo upload to s3
            await fileOperations.uploadFile(key + '_thumb', item.mimetype, thumbnailBuffer, userId); //thumbnail photo upload to s3
            results = {
                fileMode: FileModes.Standard,
                fileType: item.mimetype,
                uniqueName: key,
                title: item.originalname,
            }
            responseData.push(results);
            if (responseData.length == file.length) {
                let uploadPhotos: any = await cservice.updatePart({ tenantId: tenantId, status: [CaseStatus.Draft, CaseStatus.Open], caseId: caseId, 'beneficiary.userId': userId }, {
                    $push: {
                        attachments: responseData
                    }
                });
                if (uploadPhotos.nModified) {
                    let dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryCasePhotoUploaded', this.language);
                    res.statusCode = 200;
                    res.send({ status: 200, data: dataMessage });
                    return;
                } else {
                    let dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryCasePhotoFailed', this.language);
                    res.statusCode = 500;
                    res.send({ status: 500, data: dataMessage });
                    return;
                }
            }
        });
    }

    async removeCasePhotos(fileKey: string, caseId: string) {
        try {
            let tenantId = this.tenantId;
            let userId = this.userId;
            let caseDetails = await cservice.findOneSelect({ tenantId: this.tenantId, isactive: true, caseId: caseId }, this.caseLiteFields);
            console.log(this.userId);
            console.log(this.role);
            console.log(this.role !== RoleTypes.Admin);
            console.log(this.role.toString().localeCompare(RoleTypes.Admin));
            if (this.role !== RoleTypes.Admin) {
                if (caseDetails.status !== CaseStatus.Draft) { // cannot remove the photos, only draft status case can be able to remove photos
                    const dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryOnlyDraft', this.language);
                    return { status: 500, data: { message: dataMessage } };
                }
            }
            await fileOperations.removeFile(fileKey, userId);  //to delete original
            await fileOperations.removeFile(fileKey + '_thumb', userId);   //to delete thumbnail
            let removePhoto;
            if (this.role === RoleTypes.Admin) {
                console.log('modified by admin');
                removePhoto = await cservice.updatePart({ tenantId: tenantId, caseId: caseId, attachments: { $elemMatch: { 'uniqueName': fileKey } } }, {
                    $set:
                    {
                        "attachments.$.status": CasePhotoStatus.Obsolete
                    }
                });
            } else {
                removePhoto = await cservice.updatePart({ tenantId: tenantId, status: CaseStatus.Draft, caseId: caseId, 'beneficiary.userId': userId }, {
                    $pull: { 'attachments': { uniqueName: fileKey } }
                });
            }
            console.log(removePhoto);
            if (removePhoto.nModified) {
                let dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryCasePhotoRemoved', this.language);
                return ({ status: 200, data: dataMessage });
            }

        } catch (err) {
            let dataMessage = await localizeService.localizeIntro('beneficiaryMessages.beneficiaryCasePhotoNotFoundError', this.language, err.code);
            return ({ status: 500, data: { message: dataMessage } });
        }
    }

    async viewAllCases(perPage: number, skip: number, page: number) {
        try {
            let casesLength = await cservice.findCount({ tenantId: this.tenantId, status: [CaseStatus.Open, CaseStatus.Completed], isactive: true });
            let allCases = await cservice.findAggregate([
                {
                    "$match": {
                        "$and": [
                            { "tenantId": this.tenantId },
                            { "status": { "$in": [CaseStatus.Open, CaseStatus.Completed] } },
                        ]
                    }
                },
                { "$skip": skip },
                { "$limit": perPage },
                {
                    "$project": this.casesLiteFields
                }
            ])
            let baseUrl = '/api/v1/cases';
            return new PageResponseHelper().buildPageResponse(baseUrl, perPage, page, allCases, casesLength);
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, Error: err } };
        }

    }

    async searchAllCases() {
        try {
            let allCases = await cservice.findAggregate([
                {
                    "$match": {
                        "$and": [
                            { "tenantId": this.tenantId },
                            { "status": { "$in": [CaseStatus.Open, CaseStatus.Completed] } },
                        ]
                    }
                },
                {
                    "$project": this.casesLiteFields
                }
            ])
            let resp = {
                data: allCases,
            };
            return resp;
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, Error: err } };
        }

    }

    async viewAllCasesSorted(perPage: number, skip: number, page: number) {
        try {
            let casesLength = await cservice.findCount({ tenantId: this.tenantId, status: [CaseStatus.Open, CaseStatus.Completed] });
            //sorting by both top rated and recently added
            let allCasesSorted = await cservice.findAggregate([
                {
                    "$match": {
                        "$and": [
                            { "tenantId": this.tenantId },
                            { "status": { "$in": [CaseStatus.Open, CaseStatus.Completed] } },
                        ]
                    }
                },
                { "$sort": { "rating.average": -1, "createdOn": -1 } },
                { "$skip": skip },
                { "$limit": perPage },
                {
                    "$project": this.casesLiteFields
                }]);
            var baseUrl = '/api/v1/sortedcases';
            return new PageResponseHelper().buildPageResponse(baseUrl, perPage, page, allCasesSorted, casesLength);
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, Error: err } };
        }
    }

    async getCase(caseId: string) {
        try {
            //todo getcases with donations which are paid or completed
            let caseStatus = await cservice.findOneSelect({ caseId: caseId }, { status: 1 });
            let getCaseDetails;
            if (caseStatus.status === CaseStatus.Draft && this.role === RoleTypes.Admin) {
                console.log(' iam heer')
                getCaseDetails = await cservice.findAggregate([
                    { $unwind: { path: "$donations", preserveNullAndEmptyArrays: true } },
                    {
                        "$match": {
                            "$and": [
                                { "tenantId": this.tenantId },
                                { "status": { "$in": [CaseStatus.Draft] } },
                                { "caseId": caseId }
                            ]
                        }
                    },
                    { $sort: { "donations.order.amount": -1 } },
                    {
                        $group: {
                            _id: "$_id",
                            caseId: { "$first": "$caseId" },
                            location: { "$first": "$location" },
                            status: { "$first": "$status" },
                            amount: { "$first": "$amount" },
                            beneficiary: { "$first": "$beneficiary" },
                            content: { "$first": "$content" },
                            baseCurrency: { "$first": "$baseCurrency" },
                            address: { "$first": "$address" },
                            agentCommission: { "$first": "$agentCommission" },
                            rating: { "$first": "$rating" },
                            attachments: { "$first": "$attachments" },
                            donations: { "$push": "$donations" },
                            accountDetails: { "$first": "$accountDetails" }
                            // totalCaseDonation: { "$sum": "$donations.order.amount" }
                        }
                    },
                    {
                        "$project": this.projectCaseDetailFields,
                    }
                ]);
            }
            else {
                getCaseDetails = await cservice.findAggregate([
                    { $unwind: { path: "$donations", preserveNullAndEmptyArrays: true } },
                    {
                        "$match": {
                            "$and": [
                                { "tenantId": this.tenantId },
                                { "status": { "$in": [CaseStatus.Open, CaseStatus.Completed] } },
                                { "caseId": caseId }
                            ]
                        }
                    },
                    { $sort: { "donations.order.amount": -1 } },
                    {
                        $group: {
                            _id: "$_id",
                            caseId: { "$first": "$caseId" },
                            location: { "$first": "$location" },
                            status: { "$first": "$status" },
                            amount: { "$first": "$amount" },
                            beneficiary: { "$first": "$beneficiary" },
                            content: { "$first": "$content" },
                            baseCurrency: { "$first": "$baseCurrency" },
                            address: { "$first": "$address" },
                            agentCommission: { "$first": "$agentCommission" },
                            rating: { "$first": "$rating" },
                            attachments: { "$first": "$attachments" },
                            donations: { "$push": "$donations" },
                            accountDetails: { "$first": "$accountDetails" }
                            // totalCaseDonation: { "$sum": "$donations.order.amount" }
                        }
                    },
                    {
                        "$project": this.projectCaseDetailFields,
                    }
                ]);
            }
            let donations = await this.filterOnlyPaidDonations(getCaseDetails[0].donations);
            if (donations.length > 0) {
                //replace the donations array with only paid, completed donations
                getCaseDetails[0].donations = donations;
            } else {
                //Donations array is empty then assign []
                getCaseDetails[0].donations = [];
            }
            //calculate sum of donations 
            let totalDonations = await this.sumCaseDonations(donations);
            getCaseDetails[0].totalCaseDonation = totalDonations;
            if (getCaseDetails[0]) {
                return { status: 200, data: getCaseDetails[0] };
            } else {
                let dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryNoCases', this.language);
                return { status: 500, data: { message: dataMessage } }
            }
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, Error: err } };
        }
    }

    async getCaseRatings(caseId: string, perPage: number, skip: number, page: number): Promise<PagedResponseData<CaseRating> | ErrorResponse> {
        try {
            const caseRatingUrl: string = '/api/v1/cases/' + caseId + '/rating';
            let casesLength = await ratingService.findCount({ tenantId: this.tenantId, caseId: caseId });
            let caseRatings = await ratingService.findPaginatedSkip(perPage, skip, { rateOn: -1 }, { tenantId: this.tenantId, caseId: caseId }, this.ratingFields);
            if (casesLength > 0) {
                return new PageResponseHelper().buildPageResponse(caseRatingUrl, perPage, page, caseRatings, casesLength);
            } else {
                return { status: 500, data: { message: 'No ratings and reviews', error: undefined }, meta: undefined };
            }
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, error: err }, meta: undefined };
        }
    }

    async getBeneficiaryProfile(userId: string): Promise<BeneficiaryPubData<BeneficiaryProfile> | ErrorResponse> {
        try {
            let benefiProfile = await uservice.findAggregate([
                {
                    "$match": {
                        "$and": [
                            { "tenantId": this.tenantId },
                            { "basic.userId": userId },
                        ]
                    }
                },
                {
                    "$project": this.projectBeneficiaryPublicFields
                }
            ])
            return new ResponseResults().buildResponse(benefiProfile[0]);
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, error: err } };
        }
    }

    async viewsAllBeneficiaryCases(beneficiaryId: string): Promise<CasesResponseData<Case> | ErrorResponse> {
        try {
            let casesLength = await cservice.findCount({ tenantId: this.tenantId, status: [CaseStatus.Open, CaseStatus.Completed], "beneficiary.userId": beneficiaryId });
            let allCases = await cservice.findAggregate([
                {
                    "$match": {
                        "$and": [
                            { "tenantId": this.tenantId, },
                            { "status": { "$in": [CaseStatus.Open, CaseStatus.Completed] } },
                            { "beneficiary.userId": beneficiaryId }
                        ]
                    }
                },
                {
                    "$project": this.beneficiaryCaseFields
                }
            ]);

            let allManagingCases = await this.getOnlyCaseIds(allCases);
            //Total doantion received from all the cases
            let totalDonationReceived = await cservice.findAggregate([
                {
                    "$match": {
                        "$and": [
                            { "tenantId": this.tenantId },
                            {
                                "caseId": { "$in": allManagingCases }
                            }]
                    },
                },
                { $unwind: { path: "$donations", preserveNullAndEmptyArrays: true } },
                {
                    "$group": {
                        _id: "null",
                        //   totalCaseDonation: { "$sum": "$donations.order.amount" }
                        donations: { "$push": "$donations" }
                    }
                },
            ]);

            let paidCasesDonations = await this.filterOnlyPaidDonations(totalDonationReceived[0].donations);
            let allCasesDonations = await this.sumBeneificaryDonations(paidCasesDonations);
            return new BeneficiaryCaseResponseResults().buildResponse(allCases, casesLength, allCasesDonations);
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, error: err } };
        }
    }

    async getBeneficiaryRatings(userId: string, perPage: number, skip: number, page: number): Promise<PagedResponseData<CaseRating> | ErrorResponse> {
        try {
            const caseRatingUrl: string = '/api/v1/beneficiary/' + userId + '/ratings';
            let casesLength = await ratingService.findCount({ tenantId: this.tenantId, benficiaryId: userId });
            let caseRatings = await ratingService.findPaginatedSkip(perPage, skip, { rateOn: -1 }, { tenantId: this.tenantId, benficiaryId: userId }, this.ratingFields);
            return new PageResponseHelper().buildPageResponse(caseRatingUrl, perPage, page, caseRatings, casesLength);
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, error: err }, meta: undefined };
        }
    }

    async sendEmailtoBeneficiary(senderName: string, senderEmail: string, senderPhone: string, senderMessage: string, beneficiaryEmailId: string) {
        try {
            let tenantProfile = await tservice.findOneSelect({ tenantId: this.tenantId }, this.tenantFields);
            let tenantLanguage: string = tenantProfile.baseLanguage;
            let benefiProfile = await uservice.findOneSelect({ tenantId: this.tenantId, 'email': beneficiaryEmailId }, this.emailFields);
            let dataResults;
            //check the benefiprofile exist
            if (benefiProfile) {
                let emailVerified = benefiProfile.verification.emailVerified;
                let benefiEmail: string = benefiProfile.email;
                let benefiLanguage: string = benefiProfile.language;
                let benefiName: string = benefiProfile.basic.firstName;
                let sendMail;

                //Check the email is verified and send the email, else return could not send message
                if (emailVerified) {
                    sendMail = await emailService.contactMe(benefiEmail, benefiName, benefiLanguage, senderMessage, senderEmail, senderName, senderPhone);
                } else {
                    dataResults = await localizeService.localizeContactMeOutro('contactMeFailed.benefiFailedMessage', tenantLanguage);
                    return { status: 500, data: { message: dataResults } };
                }

                //Check the status from mail sending results and localization the data to client
                if (sendMail.status == 200) {
                    dataResults = await localizeService.localizeContactMeOutro('contactMeSuccess.benefiSuccessMessage', tenantLanguage);
                    return { status: sendMail.status, data: dataResults };
                } else {
                    return { status: sendMail.status, data: sendMail.data };
                }
            } else {
                dataResults = await localizeService.localizeContactMeOutro('contactMeFailed.benefiNotFound', tenantLanguage);
                return { status: 500, data: { message: dataResults } };
            }
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, error: err } };
        }
    }

    async getBenefactorProfile(userId: string): Promise<BenefactorPubData<BenefactorProfile> | ErrorResponse> {
        try {
            let benefactorProfile = await uservice.findAggregate([
                {
                    "$match": {
                        "$and": [
                            { "tenantId": this.tenantId },
                            { 'basic.userId': userId },
                        ]
                    }
                },
                {
                    "$project": this.projectBenefactorPublicFields
                }
            ])
            return new ResponseResults().buildResponse(benefactorProfile[0]);
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, error: err } };
        }
    }

    async viewsAllDonationCases(benefactorId: string): Promise<DonationsResponseData<Case> | ErrorResponse> {
        try {
            let casesLength = await cservice.findCount({ tenantId: this.tenantId, status: [CaseStatus.Open, CaseStatus.Completed], "donations.user.userId": benefactorId });
            let allDonations = await cservice.findAggregate([
                {
                    "$addFields": {
                        "totalCaseDonation": {
                            "$reduce": {
                                "input": "$donations",
                                "initialValue": 0,
                                "in": { "$add": ["$$value", "$$this.order.amount"] }
                            }
                        },
                        "numberOfDonations": {
                            "$size": "$donations"
                        }
                    }
                },
                { "$unwind": "$donations" },
                {
                    "$match": {
                        "$and": [
                            { "tenantId": this.tenantId },
                            { "donations.user.userId": benefactorId },
                            { "donations.order.status": { "$in": [OrderStatus.Paid, OrderStatus.Completed] } },
                            {
                                "status": { "$in": [CaseStatus.Open, CaseStatus.Completed] }
                            }]
                    },
                },
                {
                    "$group": {
                        _id: "null",
                        caseId: { "$first": "$caseId" },
                        location: { "$first": "$location" },
                        status: { "$first": "$status" },
                        beneficiary: { "$first": "$beneficiary" },
                        content: { "$first": "$content" },
                        baseCurrency: { "$first": "$baseCurrency" },
                        address: { "$first": "$address" },
                        agentCommission: { "$first": "$agentCommission" },
                        rating: { "$first": "$rating" },
                        attachments: { "$first": "$attachments" },
                        donations: { "$push": "$donations" }
                    }
                },
                {
                    "$project": this.benefactorDonationFields
                },

            ]);
            let allDonatedCases = await cservice.findAggregate([
                { "$unwind": "$donations" },
                {
                    "$match": {
                        "$and": [
                            { "tenantId": this.tenantId },
                            { "donations.user.userId": benefactorId },
                            { "donations.order.status": { "$in": [OrderStatus.Paid, OrderStatus.Completed] } },
                            {
                                "status": { "$in": [CaseStatus.Open, CaseStatus.Completed] }
                            }]
                    },
                },
                {
                    "$project": this.benefactorDonationFields
                },

            ]);
            let allUserDonations: any[] = [];
            allUserDonations.push(allDonations[0].donations);
            let paidDonations = await this.filterOnlyPaidDonations(allUserDonations[0]);
            let allCasesDonations = await this.sumBenafactorDonations(paidDonations);
            return new BenefactorDonationResponseResults().buildResponse(allDonatedCases, casesLength, allCasesDonations);
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, error: err } };
        }
    }

    async sendEmailtoBenefactor(senderName: string, senderEmail: string, senderPhone: string, senderMessage: string, benefactorEmailId: string) {
        try {
            let tenantProfile = await tservice.findOneSelect({ tenantId: this.tenantId }, this.tenantFields);
            let tenantLanguage: string = tenantProfile.baseLanguage;
            let dataResults;
            let benefactorProfile = await uservice.findOneSelect({ tenantId: this.tenantId, 'email': benefactorEmailId }, this.emailFields);
            //check the benefactor exists
            if (benefactorProfile) {
                let emailVerified = benefactorProfile.verification.emailVerified;
                let benefaEmail: string = benefactorProfile.email;
                let benefaLanguage: string = benefactorProfile.language;
                let benefaName: string = benefactorProfile.basic.firstName;
                let sendMail;
                //Check the email is verified and send the email, else return could not send message
                if (emailVerified) {
                    sendMail = await emailService.contactMe(benefaEmail, benefaName, benefaLanguage, senderMessage, senderEmail, senderName, senderPhone);
                } else {
                    dataResults = await localizeService.localizeContactMeOutro('contactMeFailed.benefaFailedMessage', tenantLanguage);
                    return { status: 500, data: { messgae: dataResults } };
                }

                //Check the status from mail sending results and localization the data to client
                if (sendMail.status == 200) {
                    dataResults = await localizeService.localizeContactMeOutro('contactMeSuccess.benefaSuccessMessage', tenantLanguage);
                    return { status: sendMail.status, data: dataResults };
                } else {
                    return { status: sendMail.status, data: sendMail.data };
                }
            } else {
                dataResults = await localizeService.localizeContactMeOutro('contactMeFailed.benefaNotFound', tenantLanguage);
                return { status: 500, data: { message: dataResults } };
            }
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, Error: err } };
        }
    }

    async createCaseDonate(caseId: string, coin: string, amount: number, tipAmount: number, totalAmount: number, paymentType: string, comments?: string, isAnonyms?: boolean, anonymsValue?: string, sellCurrency?: string) {
        try {
            let caseDetails = await cservice.findOneSelect({ tenantId: this.tenantId, isactive: true, caseId: caseId }, this.caseRatingLiteFields);
            let userLite;
            let orderItem: Order;
            if (!caseDetails) { // not found
                const dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryCaseDoesNot', this.language);
                return { status: 404, data: { message: dataMessage } };
            }
            let beneficiaryId = caseDetails.beneficiary.userId;
            //person who is donating
            userLite = await uservice.findOneSelect({ tenantId: this.tenantId, 'basic.userId': this.userId }, this.userLiteRatingFields);
            if (this.userId == beneficiaryId) {
                let dataMessage = await localizeService.localizeContactMeOutro('Beneficiary not allowed to donate', this.language);
                return { status: 500, data: { message: dataMessage } };
            }

            //beneficiary currency
            let beneficiaryDetails = await uservice.findOneSelect({ tenantId: this.tenantId, 'basic.userId': this.userId }, { baseCurrency: 1 });
            // creating a anonymousUser object if user pays as anonymous
            let anonymousUser = {
                "userId": userLite.basic.userId,
                "firstName": anonymsValue, //User given value
                "lastName": 'Anonymous',
                "profilePhoto": 'cc_profilephoto_5f2732d2-b0ed-4a37-9632-af44e9f82ff7', //anonymous photo
                "language": "en-us"
            };

            let newOrderId = await this.getUniqueOrderId();
            let orderData = {
                "currency": coin,
                "amount": amount, //only donation amount
                "status": OrderStatus.Quoted,
                "orderId": newOrderId.toString()
            };

            //donor account details 
            let accountDetails: TransactionAccount = {
                referenceName: '',
                accountHoldername: userLite.basic.firstName,
                accountType: PaymentTypes.DirectCrypto,
                kycId: '',
                accountId: '',
                currency: coin
            };
            let walletAddress;
            let data;
            let donationCoin: string;
            let txnCurrency: string;
            if (paymentType === 'Crypto') {
                donationCoin = coin;
                txnCurrency = Currency.EUR;  // if crypto donation then trnCurrecny and txnRate are saved in EUR
            } else if (paymentType === 'Bank' || paymentType === 'Credit Card') {
                donationCoin = sellCurrency;
                txnCurrency = coin;
            }
            let bitgoResponse = await donationOps.createDonation(donationCoin, totalAmount, caseId, userLite.basic.userId);
            walletAddress = bitgoResponse.data.address;
            if (paymentType === 'Crypto') {
                if (bitgoResponse.status == 200) {
                    data = {
                        qrcodeImg: bitgoResponse.data.qrcodeImg,
                        amount: bitgoResponse.data.amount, //amount in satoshi
                        address: walletAddress,
                        coin: bitgoResponse.data.coin,
                    }
                }
            } else if (paymentType === 'Bank' || paymentType === 'Credit Card') {
                data = {
                    amount: totalAmount, //amount in fiat
                    address: walletAddress,
                    coin: coin,
                    sellCurrency: sellCurrency,
                }
            }

            let base = coin;
            let caseCurrency = caseDetails.baseCurrency;
            let benefactorCurrency: string = userLite.baseCurrency;
            let beneficiaryCurrency = beneficiaryDetails.baseCurrency;
            let orderId = orderData.orderId;
            let orderStatus = orderData.status;
            let userId = userLite.basic.email;
            //get the latest rates
            let latestRates = await exchange.ratesSet(base, caseCurrency, beneficiaryCurrency, benefactorCurrency, txnCurrency, paymentType, orderId, orderStatus, userId);
            let orderRateSet = {
                beneficiaryRate: {
                    rate: latestRates.beneficiaryRate,
                    currency: beneficiaryCurrency
                },
                benefactorRate: {
                    rate: latestRates.benefactorRate,
                    currency: benefactorCurrency
                },
                caseRate: {
                    rate: latestRates.caseRate,
                    currency: caseCurrency
                },
                txnRate: {
                    rate: latestRates.txnRate,
                    currency: txnCurrency
                },
            } as RatesSet;

            //create a order for new donation
            orderItem = {
                tenantId: caseDetails.tenantId,
                orderId: orderId,
                caseId: caseId,
                status: orderStatus,
                currency: coin,
                amount: totalAmount, //total amount for this order(donation + tip)
                receiverAccount: accountDetails,
                breakdown: [{
                    name: 'donationAmount', //Move to consts
                    amount: amount
                }, {
                    name: 'tipAmount',  //Move to consts
                    amount: tipAmount
                } as OrderBreakdown],
                user: userLite.basic,
                orderRate: orderRateSet,
                paymentType: paymentType,
                transactions: [{
                    currency: coin,
                    amount: amount,
                    trnReference: '',
                    trnHash: '',
                    walletAddress: walletAddress,
                    orderRate: orderRateSet,
                    status: orderStatus
                } as OrderTransaction],
                comments: comments,
            } as Order;
            let createOrder: Order = await oservice.create(orderItem);
            data.orderId = createOrder.orderId;
            //update the case push/add donations with user and order object
            let updateDonation: any = await cservice.updatePart({ tenantId: this.tenantId, status: [CaseStatus.Open], caseId: caseId, 'beneficiary.userId': beneficiaryId }, {
                $push: {
                    donations: {
                        user: isAnonyms ? anonymousUser : userLite.basic,
                        order: orderData
                    }
                }
            });

            let results = {
                status: 200,
                data: data
            };
            if (updateDonation.nModified) {
                return { status: results.status, data: results.data };
            } else {
                data = {
                    message: 'Failed to create order'
                }
                return { status: 500, data: data };
            }
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, Error: err } };
        }
    }

    async getCaseDonateInfo(caseId: string) {
        try {
            let caseDetails = await oservice.findOneSelect({ tenantId: this.tenantId, isactive: true, caseId: caseId }, { caseId: 1, amount: 1, transactions: 1 });
            if (caseDetails) {
                return { status: 200, data: caseDetails };
            } else {

            }
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, Error: err } };
        }

    }

    async getOrderInfo(orderId: string, merchantReferenceId: string, donationCurrency: string, donationAmount: string, orderStatus: string, merchantCode: string,) {
        try {
            let orderDetails = await oservice.findOneSelect({ orderId: orderId }, { orderId: 1, amount: 1, breakdown: 1 });
            if (orderDetails) {
                let updateOrder = await oservice.updatePart({ orderId: orderId }, {
                    $set: {
                        merchantStatus: `${orderStatus} updated by Merchant`,
                        merchantReferenceId: merchantReferenceId,
                        merchantName: merchantCode,
                        amount: Number(donationAmount),
                        currency: donationCurrency,
                        status: orderStatus
                    }
                });
                let resultObj = search('donationAmount', orderDetails.breakdown);
                let donationAmt: number = resultObj.amount;
                let updateCase;
                if (orderStatus == OrderStatus.Paid) {
                    //update case with order paid in donation array
                    updateCase = await cservice.updatePart({ caseId: orderDetails.caseId, donations: { $elemMatch: { 'order.orderId': orderId, 'order.status': OrderStatus.Quoted, 'order.amount': donationAmt } } },
                        {
                            $set:
                            {
                                "donations.$.order.status": OrderStatus.Paid
                            }
                        }
                    );
                }

                return { status: 200, data: orderDetails };
            } else {
                return { status: 200, data: { message: "No order found" } };
            }
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, Error: err } };
        }
    }

    async validateCryptoAddress(address: string, coin: string) {
        let bitGoOps: BitgoOperations = new BitgoOperations();
        let getWalletDetails = await bitGoOps.getWalletByAddress(coin, address, this.userId);
        let isValid = false;
        const Invalid = "Invalid";
        if (Invalid.localeCompare(getWalletDetails.data.name) == 0) {
            return { data: isValid, status: 200 }
        } else {
            isValid = true;
            return { data: isValid, status: 200 }
        }
    }

    //todo: parital done, remaining Converting all donation into BTC and send to end receiver, 
    //todo: send coins should only one order insteas case

    async sendCoinsToReveicer(caseId: string) {
        try {
            let getCaseDetails = await cservice.findOneSelect({ caseId: caseId }, { beneficiary: 1, accountDetails: 1, donations: 1, baseCurrency: 1 });
            // get all the donations which are in status paid(Direct crypto), sent(used monni app)
            let donations = await this.filterOnlyPaidDonations(getCaseDetails.donations);
            if (donations.length > 0) {
                getCaseDetails.donations = donations;
                let accountId = getCaseDetails.accountDetails[0].accountId;
                let totalDonation = 0;
                var totalAmount: number[];
                for (let i = 0; i < donations.length; i++) {
                    let getOrderDetails = await oservice.findOneSelect({ tenantId: 1 }, { orderId: donations[i].order.orderId });
                    // let response = BitgoOps.sendCoins('BTC',)
                    totalAmount[i] = getOrderDetails.breakdown[0].amount;
                    totalDonation += totalAmount[i];
                }
                bitgoOps.sendCoins("BTC", totalDonation, 6, accountId, getCaseDetails.beneficiary.userId);
            } else {
                //Donations array is empty then assign []
                getCaseDetails.donations = [];
            }
            if (getCaseDetails) {
                return { status: 200, data: getCaseDetails };
            } else {
                let dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryNoCases', this.language);
                return { status: 500, data: { message: dataMessage } }
            }
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, Error: err } };
        }
    }

    async checkPaymentStatus(caseId: string, cryptoAddress: string, amount: string, coin: string) {
        try {
            //Fetching the orderDetails
            //todo check user 
            let orderDetails = await oservice.findOneSelect({ amount: amount, transactions: { $elemMatch: { walletAddress: cryptoAddress } } },
                {
                    orderId: 1,
                    tenantId: 1,
                    caseId: 1,
                    currency: 1,
                    amount: 1,
                    user: 1,
                    breakdown: 1,
                    transactions: 1
                })
            if (orderDetails === null || orderDetails.transactions[0].trnHash.length == 0) {
                let results = {
                    status: OrderStatus.Quoted,
                    transactionHash: '',
                    isPaid: false
                }
                return { status: 200, data: results };
            } else {
                //Fetching the casedetails and dontaion object
                let caseDetailsAg = await cservice.findAggregate([
                    { "$unwind": "$donations" },
                    {
                        "$match": {
                            "$and": [
                                { "tenantId": this.tenantId },
                                { "donations.user.userId": orderDetails.user.userId },
                                { "donations.order.amount": orderDetails.breakdown[0].amount },
                                { "donations.order.status": OrderStatus.Paid },
                                { "donations.order.currency": coin },
                            ]
                        },
                    },
                    {
                        "$project": {
                            beneficiary: 1,
                            donations: 1
                        }
                    }
                ]);
                let trans: any = caseDetailsAg[0].donations;
                if (orderDetails && caseDetailsAg) {
                    let results = {
                        status: trans.status,
                        txHash: orderDetails.transactions[0].trnHash,
                        isPaid: true,
                        caseId: orderDetails.caseId,
                        orderId: orderDetails.orderId,
                    }
                    return { status: 200, data: results };
                }
            }
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, Error: err } };
        }
    }

    async getDonorDonations(benefactorId: string) {
        let allDonations = await cservice.findAggregate([
            {
                "$addFields": {
                    "totalCaseDonation": {
                        "$reduce": {
                            "input": "$donations",
                            "initialValue": 0,
                            "in": { "$add": ["$$value", "$$this.order.amount"] }
                        }
                    },
                    "numberOfDonations": {
                        "$size": "$donations"
                    }
                }
            },
            { "$unwind": "$donations" },
            {
                "$match": {
                    "$and": [
                        { "tenantId": this.tenantId },
                        { "donations.user.userId": benefactorId },
                        //{ "donations.order.status": { "$in": [OrderStatus.Paid, OrderStatus.Completed] } },
                        {
                            "status": { "$in": [CaseStatus.Open, CaseStatus.Completed] }
                        }]
                },
            },
            {
                "$project": this.benefactorDonationLite
            },
        ]);

        let result = allDonations;

        let transactionListResponse: TransactionList[] = [{
            amount: 0,
            userId: '',
            caseTitle: '',
            donatedDate: new Date(),
            caseId: '',
            currency: '',
            name: '',
            orderId: '',
            basic: {

            } as UserLite,
            baseCurrency: '',
            beneficiary: {} as UserLite,
            orderStatus: ''
        }];
        let j = 0;
        for (let i = 0; i < result.length; i++) {
            let donationObj: CaseDonation = <CaseDonation><unknown>result[i].donations;
            let transactionListObj: TransactionList = {
                amount: 0,
                userId: '',
                caseTitle: '',
                donatedDate: new Date(),
                caseId: '',
                currency: '',
                name: '',
                orderId: '',
                basic: {

                } as UserLite,
                baseCurrency: '',
                beneficiary: {} as UserLite,
                orderStatus: ''
            };
            let orderObj: Order;
            //skiping the orders which does not have orderId, 
            //as this is done because the early stage the donation object in the case collection does not have orderId saved
            //orderId is required to get the complete transaction details           
            if (donationObj.order.orderId == null || donationObj.order.orderId == undefined) {
                continue;
            } else {
                let orderId = donationObj.order.orderId;
                orderObj = await oservice.findOneSelect({ orderId: orderId }, this.orderTransactionLite);
            }
            let resultObj = search('donationAmount', orderObj.breakdown);
            let amt = resultObj.amount;
            //constructing required response for passing to client
            transactionListObj.amount = amt;
            let maxLength = orderObj.transactions.length;
            if (orderObj.transactions[maxLength - 1].trnHash != null) {
                transactionListObj.blockchainHash = orderObj.transactions[maxLength - 1].trnHash;
            }
            transactionListObj.caseId = result[i].caseId;
            transactionListObj.caseTitle = result[i].content[0].title;
            transactionListObj.currency = orderObj.currency;
            //getting object to Date, which provides the lastmodified Date
            transactionListObj.donatedDate = dateFromObjectId(orderObj._id);
            transactionListObj.name = orderObj.user.firstName;
            transactionListObj.orderId = donationObj.order.orderId;
            transactionListObj.userId = orderObj.user.userId;
            transactionListObj.basic = orderObj.user;
            transactionListObj.beneficiary = result[i].beneficiary;
            transactionListObj.orderStatus = donationObj.order.status;
            transactionListResponse[j] = transactionListObj;

            j++;
        }
        let sorted = await transactionListResponse.sort((a, b) => a.donatedDate < b.donatedDate ? 1 : a.donatedDate > b.donatedDate ? -1 : 0)
        return { status: 200, data: sorted };
    }

    async getReceiverDonations(userId: string) {

        let allCases = await cservice.findAggregate([
            {
                "$match": {
                    "$and": [
                        { "tenantId": this.tenantId, },
                        { "status": { "$in": [CaseStatus.Open, CaseStatus.Completed] } },
                        { "beneficiary.userId": userId }
                    ]
                }
            },
            {
                "$project": this.beneficiaryCaseFields
            }
        ]);

        let allManagingCases = await this.getOnlyCaseIds(allCases);
        //Total doantion received from all the cases
        let totalDonationReceived: any = await cservice.findAggregate([
            {
                "$addFields": {
                    "totalCaseDonation": {
                        "$reduce": {
                            "input": "$donations",
                            "initialValue": 0,
                            "in": { "$add": ["$$value", "$$this.order.amount"] }
                        }
                    },
                    "numberOfDonations": {
                        "$size": "$donations"
                    }
                }
            },
            {
                "$match": {
                    "$and": [
                        { "tenantId": this.tenantId },
                        {
                            "caseId": { "$in": allManagingCases }
                        }]
                },
            },
            { $unwind: { path: "$donations", preserveNullAndEmptyArrays: true } },
            {
                "$match": {
                    "$and": [
                        { "tenantId": this.tenantId },
                        //   { "donations.order.status": { "$in": [OrderStatus.Paid, OrderStatus.Completed] } },
                        {
                            "status": { "$in": [CaseStatus.Open, CaseStatus.Completed] }
                        }]
                },
            },
            {
                "$project": {
                    caseId: 1,
                    donations: 1,
                    content: 1,
                }
            },
        ]);
        let result = totalDonationReceived;
        let hasNoDonations = 0;
        let transactionListResponse: TransactionList[] = [{
            amount: 0,
            userId: '',
            caseTitle: '',
            donatedDate: new Date(),
            caseId: '',
            currency: '',
            name: '',
            orderId: '',
            basic: {

            } as UserLite,
            baseCurrency: '',
            beneficiary: {} as UserLite,
            orderStatus: ''
        }];
        let j = 0;
        for (let i = 0; i < result.length; i++) {
            let donationObj: CaseDonation = <CaseDonation><unknown>result[i].donations;
            if (donationObj != undefined) {
                let transactionListObj: TransactionList = {
                    amount: 0,
                    userId: '',
                    caseTitle: '',
                    donatedDate: new Date(),
                    caseId: '',
                    currency: '',
                    name: '',
                    orderId: '',
                    basic: {

                    } as UserLite,
                    baseCurrency: '',
                    beneficiary: {} as UserLite,
                    orderStatus: ''
                };
                let orderObj: Order;
                //skiping the orders which does not have orderId, 
                //as this is done because the early stage the donation object in the case collection does not have orderId saved
                //orderId is required to get the complete transaction details           
                if (donationObj.order.orderId == null || donationObj.order.orderId == undefined) {
                    continue;
                } else {
                    let orderId = donationObj.order.orderId;
                    orderObj = await oservice.findOneSelect({ orderId: orderId }, this.orderTransactionLite);
                }
                let resultObj = search('donationAmount', orderObj.breakdown);
                let amt = resultObj.amount;
                //constructing required response for passing to client
                transactionListObj.amount = amt;
                let maxLength = orderObj.transactions.length;
                if (orderObj.transactions[maxLength - 1].trnHash != null) {
                    transactionListObj.blockchainHash = orderObj.transactions[maxLength - 1].trnHash;
                }
                transactionListObj.caseId = result[i].caseId;
                transactionListObj.caseTitle = result[i].content[0].title;
                transactionListObj.currency = orderObj.currency;
                //getting object to Date, which provides the lastmodified Date
                transactionListObj.donatedDate = dateFromObjectId(orderObj._id);
                transactionListObj.name = orderObj.user.firstName;
                transactionListObj.orderId = donationObj.order.orderId;
                transactionListObj.userId = orderObj.user.userId;
                transactionListObj.basic = orderObj.user;
                transactionListObj.orderStatus = donationObj.order.status;
                transactionListResponse[j] = transactionListObj;
                j++;
            } else {
                hasNoDonations++;
                continue;
            }
        }
        if (hasNoDonations == result.length) {
            return { status: 200, data: 'No donations' };
        } else {
            let sorted = await transactionListResponse.sort((a, b) => a.donatedDate < b.donatedDate ? 1 : a.donatedDate > b.donatedDate ? -1 : 0)
            return { status: 200, data: sorted };
        }
    }



    async caseDonationsList(caseId: string) {
        let getCaseDetails = await cservice.findAggregate([
            { $unwind: { path: "$donations", preserveNullAndEmptyArrays: true } },
            {
                "$match": {
                    "$and": [
                        { "tenantId": this.tenantId },
                        { "status": { "$in": [CaseStatus.Open, CaseStatus.Completed] } },
                        { "caseId": caseId }
                    ]
                }
            },
            { $sort: { "donations.order.amount": -1 } },
            {
                $group: {
                    _id: "$_id",
                    donations: { "$push": "$donations" },
                    content: { "$first": "$content" },
                    // totalCaseDonation: { "$sum": "$donations.order.amount" }
                }
            },
            {
                "$project": {
                    donations: 1,
                    content: 1
                },
            }
        ]);
        let result = getCaseDetails[0].donations;
        //let transactionListResponse = await this.transactionList(result);
        let transactionListResponse: TransactionList[] = [{
            amount: 0,
            userId: '',
            caseTitle: '',
            donatedDate: new Date(),
            caseId: '',
            currency: '',
            name: '',
            orderId: '',
            basic: {

            } as UserLite,
            baseCurrency: '',
            beneficiary: {} as UserLite,
            orderStatus: ''
        }];
        let j = 0;
        for (let i = 0; i < result.length; i++) {
            let donationObj: CaseDonation = <CaseDonation><unknown>result[i];
            let transactionListObj: TransactionList = {
                amount: 0,
                userId: '',
                caseTitle: '',
                donatedDate: new Date(),
                caseId: '',
                currency: '',
                name: '',
                orderId: '',
                basic: {

                } as UserLite,
                baseCurrency: '',
                beneficiary: {} as UserLite,
                orderStatus: ''
            };
            let orderObj: Order;
            //skiping the orders which does not have orderId, 
            //as this is done because the early stage the donation object in the case collection does not have orderId saved
            //orderId is required to get the complete transaction details           
            if (donationObj.order.orderId == null || donationObj.order.orderId == undefined) {
                continue;
            } else {
                let orderId = donationObj.order.orderId;
                orderObj = await oservice.findOneSelect({ orderId: orderId }, this.orderTransactionLite);
            }
            let resultObj = search('donationAmount', orderObj.breakdown);
            let amt = resultObj.amount;
            //constructing required response for passing to client
            transactionListObj.amount = amt;
            let maxLength = orderObj.transactions.length;
            if (orderObj.transactions[maxLength - 1].trnHash != null) {
                transactionListObj.blockchainHash = orderObj.transactions[maxLength - 1].trnHash;
            }
            transactionListObj.caseId = caseId;
            transactionListObj.caseTitle = getCaseDetails[0].content[0].title;
            transactionListObj.currency = orderObj.currency;
            //getting object to Date, which provides the lastmodified Date
            transactionListObj.donatedDate = dateFromObjectId(orderObj._id);
            transactionListObj.name = orderObj.user.firstName;
            transactionListObj.orderId = donationObj.order.orderId;
            transactionListObj.userId = orderObj.user.userId;
            transactionListObj.basic = orderObj.user;
            transactionListObj.orderStatus = donationObj.order.status;
            transactionListResponse[j] = transactionListObj;
            j++;
        }
        let sorted = await transactionListResponse.sort((a, b) => a.donatedDate < b.donatedDate ? 1 : a.donatedDate > b.donatedDate ? -1 : 0)
        return { status: 200, data: sorted };
    }


    async caseBeneficiaryProfile(caseId: string): Promise<BeneficiaryPubData<BeneficiaryProfile> | ErrorResponse> {
        try {
            let userInfo = await cservice.findOneSelect({ caseId: caseId }, this.caseRatingLiteFields);
            let benefiProfile = await uservice.findAggregate([
                {
                    "$match": {
                        "$and": [
                            { "tenantId": this.tenantId },
                            { "basic.userId": userInfo.beneficiary.userId },
                        ]
                    }
                },
                {
                    "$project": {
                        basic: this.profilePhotoProjectAttachmentMap,
                        'verification.emailVerified': 1,
                        'verification.phoneVerified': 1,
                        'verification.photoVerified': 1,
                        'verification.addressVerified': 1,
                        location: 1,
                        address: 1,
                        reqProfile: 1
                    }
                }
            ]);
            return new ResponseResults().buildResponse(benefiProfile[0]);
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, error: err } };
        }
    }

    //todo: Monni update proper method name
    async UpdateOrder(orderId: string, referenceId: string, orderStatus: string, rateStr: string, rate: number,  minerFees: number, transactions?: MerchantTransactionsLite[]) {
        try {

            let orderDetails = await oservice.findOneSelect({ orderId: orderId, merchantReferenceId: referenceId }, { orderId: 1, amount: 1, user: 1, caseId: 1, currency: 1, paymentType: 1 });
            let caseDetails = await cservice.findOneSelect({ caseId: orderDetails.caseId }, { beneficiary: 1, baseCurrency: 1 });
            let newTx: OrderTransaction;
            let txnDate = new Date();
            if (transactions && transactions != undefined) {
                for (var i = 0; i < transactions.length; i++) {
                    var iterator = transactions[i];
                    if (iterator.Type === 'Outgoing') {
                        newTx = {
                            amount: iterator.Amount,
                            currency: iterator.Currency,
                            trnReference: '',
                            trnHash: iterator.ExtRef,
                            walletAddress: iterator.PaidToAddress,
                            status: OrderStatus.Paid,
                        } as OrderTransaction;

                    }
                }
            }

            if (orderDetails && orderStatus == OrderStatus.Completed) {
                //person who is donating
                let userLite = await uservice.findOneSelect({ 'basic.userId': orderDetails.user.userId }, this.userLiteRatingFields);
                //beneficiary currency
                let beneficiaryDetails = await uservice.findOneSelect({ 'basic.userId': caseDetails.beneficiary.userId }, { baseCurrency: 1 });
                let base = orderDetails.currency;
                let caseCurrency = caseDetails.baseCurrency;
                let benefactorCurrency = userLite.baseCurrency;
                let beneficiaryCurrency = beneficiaryDetails.baseCurrency;
                let orderId = orderDetails.orderId;
                let orderStatus = OrderStatus.Paid;
                let userId = orderDetails.user.userId;
                let txnCurrency = orderDetails.currency;
                let paymentType = orderDetails.paymentType;
                //get the latest rates
                let latestRates = await exchange.ratesSet(base, caseCurrency, beneficiaryCurrency, benefactorCurrency, txnCurrency, paymentType, orderId, orderStatus, userId);
                let orderRateSet = {
                    beneficiaryRate: {
                        rate: latestRates.beneficiaryRate,
                        currency: beneficiaryCurrency
                    },
                    benefactorRate: {
                        rate: latestRates.benefactorRate,
                        currency: benefactorCurrency
                    },
                    caseRate: {
                        rate: latestRates.caseRate,
                        currency: caseCurrency
                    },
                    txnRate: {
                        rate: latestRates.txnRate,
                        currency: txnCurrency
                    },
                } as RatesSet;
                newTx.orderRate = orderRateSet;
                let getOrderDetails = await this.getPaymentFromMonni(referenceId);
                if (getOrderDetails.status == 200) {
                    let updateOrder = await oservice.updatePart({ orderId: orderId }, {
                        $push: {
                            transactions: newTx
                        },
                        $set: {
                            merchantStatus: `${orderStatus} updated by Merchant`,
                            status: OrderStatus.Paid,
                            orderRate: orderRateSet,
                            merchantRate: rate,
                            merchantRateStr: rateStr,
                            merchantMinersFees: minerFees
                        }
                    });

                    //update case with order paid in donation array
                    let updateCase = await cservice.updatePart({ caseId: orderDetails.caseId, donations: { $elemMatch: { 'order.orderId': orderId, 'order.status': OrderStatus.Quoted } } },
                        {
                            $set:
                            {
                                "donations.$.order.status": OrderStatus.Paid
                            }
                        });
                    let emailService: emailSendService = new emailSendService();
                    let donationAmountStr = orderDetails.amount + ' ' + orderDetails.currency;
                    //email to benefactor
                    let sendEmail = await emailService.benefactorEmailDonationReceived(orderDetails.user.userId, orderDetails.user.firstName, orderDetails.user.language, orderDetails.orderId, donationAmountStr, orderDetails.caseId);
                    //email to beneficiary
                    let sendEmailtoBeneficiary = await emailService.beneficiaryEmailDonationReceived(caseDetails.beneficiary.userId, caseDetails.beneficiary.firstName, caseDetails.beneficiary.language, orderDetails.orderId, donationAmountStr, orderDetails.caseId);
                    return { status: 200, data: orderDetails };
                }
            } else {
                return { status: 200, data: { message: "No order found" } };
            }

        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, Error: err } };
        }

    }

    /*** Private Helpers ***/
    private async getOnlyCaseIds(cases: Case[]) {
        let caseId = [];
        for (let i = 0; i < cases.length; i++) {
            caseId.push(cases[i].caseId)
        }
        return caseId;
    }

    private async getPaymentFromMonni(orderId: string) {
        let url = process.env.MONNIBASEURL + `/api/v1/orders/${orderId}`;
        const httpsAgent = new https.Agent({
            rejectUnauthorized: false,
        });
        const response = await axios.default.get(url, { httpsAgent: httpsAgent }
        ).then(async (response) => {
            const result = JSON.stringify(response.data);
            let auditLogData = AuditData('Monni Get Response', "Monni", 200, response.data);
            let createLog = await auditLog.create(auditLogData);
            return { data: result, status: 200 };
        }).catch(async (error) => {
            return { data: error.response.data, status: 500 };
        })
        return response;
    }

    private async filterNotPaidDonations(donations: CaseDonation[]) {
        let paidDonations: CaseDonation[] = [];
        let j = 0;
        for (let i = 0; i < donations.length; i++) {
            if ((OrderStatus.Quoted).localeCompare(donations[i].order.status) == 0) {
                continue;
            }
            else {
                paidDonations[j] = donations[i];
                j++;
            }
        }
        return paidDonations;
    }

    private async filterOnlyPaidDonations(donations: CaseDonation[]) {
        let paidDonations: CaseDonation[] = [];
        let j = 0;
        for (let i = 0; i < donations.length; i++) {
            //if case donation is paid then add to array
            if ((OrderStatus.Paid).localeCompare(donations[i].order.status) == 0 || (OrderStatus.Completed).localeCompare(donations[i].order.status) == 0) {
                paidDonations[j] = donations[i];
                j++;
            }
            else {
                continue;
            }
        }
        return paidDonations;
    }

    private async sumOfDonations(donations: CaseDonation[], baseCurrency: string) {
        let paidDonations: CaseDonation[] = [];
        let totalDonations = 0;
        const exchange: ExchangeRatesSerivce = new ExchangeRatesSerivce();

        for (let i = 0; i < donations.length; i++) {
            paidDonations[i] = donations[i];
            let paidCurrency = paidDonations[i].order.currency;
            let paidAmount = paidDonations[i].order.amount;
            //baseCurrency and paidCurrency are different and paid currency is a digital currency
            if (paidCurrency !== baseCurrency && keys.DigitalCurrencies.includes(paidCurrency)) {
                let getRates = await exchange.calculateRates(paidCurrency, baseCurrency);
                let rateValue = getRates.data as CryptoRatesResponse;
                totalDonations = totalDonations + rateValue.cryptoQuoteValue * paidAmount;
            } //baseCurrency and paidCurrency are different and paidCurrency is a fiat currency
            else if (paidCurrency !== baseCurrency && keys.FiatCurrencies.includes(paidCurrency)) {
                let getRates = await exchange.calculateRates(paidCurrency, baseCurrency);
                let rateValue = getRates.data as FiatRatesResponse;
                totalDonations = totalDonations + rateValue.baseQuoteValue * paidAmount;
            } //baseCurrency and paidCurrency are same
            else {
                totalDonations = totalDonations + paidAmount;
            }
        }
        return totalDonations;
    }

    private async sumBenafactorDonations(donations: CaseDonation[]) {
        let paidDonations: CaseDonation[] = [];
        let totalDonations = 0;
        for (let i = 0; i < donations.length; i++) {
            let getOrderRates = await oservice.findOneSelect({ orderId: donations[i].order.orderId }, { orderRate: 1 });
            paidDonations[i] = donations[i];
            let paidAmount = paidDonations[i].order.amount;
            let benefactorRateValue = getOrderRates.orderRate.benefactorRate.rate;
            totalDonations = totalDonations + paidAmount * benefactorRateValue;
        }
        return totalDonations;
    }

    private async sumBeneificaryDonations(donations: CaseDonation[]) {
        let paidDonations: CaseDonation[] = [];
        let totalDonations = 0;
        for (let i = 0; i < donations.length; i++) {
            let getOrderRates = await oservice.findOneSelect({ orderId: donations[i].order.orderId }, { orderRate: 1 });
            paidDonations[i] = donations[i];
            let paidAmount = paidDonations[i].order.amount;
            let beneficiaryRateValue = getOrderRates.orderRate.beneficiaryRate.rate;
            totalDonations = totalDonations + paidAmount * beneficiaryRateValue;
        }
        return totalDonations;
    }

    private async sumCaseDonations(donations: CaseDonation[]) {
        let paidDonations: CaseDonation[] = [];
        let totalDonations = 0;
        for (let i = 0; i < donations.length; i++) {
            let getOrderRates = await oservice.findOneSelect({ orderId: donations[i].order.orderId }, { orderRate: 1 });
            paidDonations[i] = donations[i];
            let paidAmount = paidDonations[i].order.amount;
            let caseRateValue = getOrderRates.orderRate.caseRate.rate;
            totalDonations = totalDonations + paidAmount * caseRateValue;
        }
        return totalDonations;
    }

    private async getUniqueOrderId() {
        let orderId: number = 0;
        let idExists: boolean = true;
        let triedIds: Array<number> = [];
        do {
            do {
                orderId = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
            }
            while (triedIds.includes(orderId));
            triedIds.push(orderId);
            let hasOrderId = await oservice.findOneSelect({ orderId: orderId }, { orderId: 1 });
            if (hasOrderId == null) {
                idExists = false;
            }
        }
        while (idExists);
        return orderId;
    }
}

export interface CryptoRatesResponse {
    baseRateValue: number;
    cryptoQuoteValue: number;
    cryptoEurRate: number;
}

export interface FiatRatesResponse {
    baseRateValue: number;
    baseQuoteValue: number;
    quoteRateValue: number;
}


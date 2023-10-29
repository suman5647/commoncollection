import { Order, OrderStatus } from '../data/order';
import { Request, Response } from 'express';
import { v1 as uuidv1 } from 'uuid';

import { AuditData, resolveAdminStatus } from '../config/common';
import { keys } from '../config/keys';
import { AdminStatus, CaseDonation, CaseStatus, ILockTxn } from '../data/case';
import { PageResponseHelper } from '../data/common';
import { S3Data } from '../data/keys';
import { KYCType } from '../data/kyc';
import { RatingStatus } from '../data/rating';
import { RoleTypes, User } from '../data/user';
import { AdminService } from '../services/admin.service';
import { AuditLogSevice } from '../services/auditLog.service';
import { CaseService } from '../services/case.service';
import { decryptData } from '../services/crypto.service';
import { emailSendService } from '../services/email.service';
import { FileService } from '../services/file.service';
import { KYCService } from '../services/kyc.service';
import { localizationService } from '../services/localization.service';
import { OrderService } from '../services/order.service';
import { OrderPayoutService } from '../services/orderPayout.service';
import { CaseRatingService } from '../services/rating.service';
import { UserService } from '../services/user.service';
import { BaseAPIOperations } from './base.operations';

const auditLog: AuditLogSevice = new AuditLogSevice();

let sendingEmailService: emailSendService = new emailSendService();
let fileService: FileService = new FileService();
let uservice: UserService = new UserService();
let cservice: CaseService = new CaseService();
let aservice: AdminService = new AdminService();
let oservice: OrderService = new OrderService();
let rservice: CaseRatingService = new CaseRatingService();
let kycservice: KYCService = new KYCService();
let orderPayoutService: OrderPayoutService = new OrderPayoutService();
let localizeService: localizationService = new localizationService();

var s3keys: S3Data;
if (keys.files.isEncrypted) {
    s3keys = decryptData(keys.files.key);
}
export class AdminOperations extends BaseAPIOperations {
    constructor(req: Request, res: Response) {
        super(req, res);
    }

    get profilePhotoProjectAttachmentMap() {
        return {
            "userId": "$basic.userId",
            "firstName": "$basic.firstName",
            "lastName": "$basic.lastName",
            "language": "$basic.language"
        };
    }
    get profileFields() {
        return {
            email: 1,
            // basic: this.profilePhotoProjectAttachmentMap,
            phone: 1,
        }
    }
    get profileFieldsLite() {
        return {
            email: 1,
            basic: 1,
            phone: 1,
            verification: 1
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
            status: 1,
            beneficiary: 1
        }
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
            totalCaseDonation: 1
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

    get beneficiaryPhotoProjectAttachmentMap() {
        return {
            "userId": "$beneficiary.userId",
            "firstName": "$beneficiary.firstName",
            "lastName": "$beneficiary.lastName",
            "profilePhoto": { "$concat": [s3keys.url, "$beneficiary.profilePhoto"] },
            "language": "$beneficiary.language"
        };
    }

    get projectUserPublicFields() {
        return {
            basic: this.profilePhotoProjectAttachmentMap,
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
                    "thumb": { "$concat": [s3keys.url, "$$u.uniqueName", "_thumb"] },
                    "original": { "$concat": [s3keys.url, "$$u.uniqueName"] }
                }
            }
        };
    }
    get casesLiteFields() {
        return {
            caseId: 1,
            status: 1,
            content: 1,
            adminStatus: 1,
            adminComments: 1,
            adminCommentOn: 1,
        };
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

    get userLiteRatingFields() {
        return {
            basic: 1,
            rating: 1,
            donorProfile: 1,
            reqProfile: 1,
            baseCurrency: 1
        };
    }

    async getBeneficiaryList() {
        let beneficiaryLiteDetails = await aservice.findAggregate([
            {
                "$match": {
                    "$and": [
                        { "tenantId": this.tenantId }

                    ]
                }
            },
            {
                "$project": this.profileFields
            }
        ]);

        return { status: 200, data: beneficiaryLiteDetails };
    }

    async updateCaseAdminStatus(id: string, adminStatus: string, comment: string) {
        let caseDetails = await cservice.findOneSelect({ caseId: id }, this.myCaseUpdateStatusFields);
        let benefiLite: User = await uservice.findOneSelect({ tenantId: this.tenantId, 'basic.userId': caseDetails.beneficiary.userId }, this.profileFieldsLite);
        adminStatus = resolveAdminStatus(adminStatus);
        if (caseDetails) {
            return aservice.updateCaseStatus(id, adminStatus, comment, this.tenantId, benefiLite, caseDetails);
        }
        else {
            let dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryCaseDoesNot', this.language);
            return { status: 500, data: { message: dataMessage } }
        }
    }


    async updateCaseStatus(id: string, caseStatus: string, comment: string) {
        let caseDetails = await cservice.findOneSelect({ caseId: id }, this.myCaseUpdateStatusFields);
        let benefiLite: User = await uservice.findOneSelect({ tenantId: this.tenantId, 'basic.userId': caseDetails.beneficiary.userId }, this.profileFieldsLite);
        if (caseDetails) {
            return aservice.updateCaseStatus(id, caseStatus, comment, this.tenantId, benefiLite, caseDetails);
        }
        else {
            let dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryCaseDoesNot', this.language);
            return { status: 500, data: { message: dataMessage } }
        }
    }

    async updateIndentityStatus(id: string, IdentityStatus: boolean, type: string) {
        console.log("inside opert")
        var updatedIndentityStatus: any;
        let benefiLite: User = await uservice.findOneSelect({ tenantId: this.tenantId, 'basic.userId': id }, this.profileFieldsLite);
        if (benefiLite) {

            if (type == 'address') {
                updatedIndentityStatus = await uservice.updatePart({ tenantId: this.tenantId, 'basic.userId': id },
                    {
                        $set: {
                            'verification.addressVerified': IdentityStatus, 'verification.addressVerifiedOn': new Date()
                        }
                    });
            }
            //for any case status update
            else if (type == 'photo') {
                updatedIndentityStatus = await uservice.updatePart({ tenantId: this.tenantId, 'basic.userId': id },
                    {
                        $set: {
                            'verification.photoVerified': IdentityStatus, 'verification.photoVerifiedOn': new Date()
                        }
                    });
            }
            if (updatedIndentityStatus.nModified) {
                return { status: 200, data: "Updated Successfully" };
            }
            else {
                return { status: 500, data: { message: "Failed to Update" } }
            }
        }

    }

    async casesCount() {
        let activeCases = await cservice.findCount({
            adminStatus: AdminStatus.Verified,
            status: { "$in": [CaseStatus.Open, CaseStatus.Completed] }
        });
        let adminPendingCases = await cservice.findCount({
            adminStatus: { $nin: [AdminStatus.Verified] },
        });
        let caseCounts = {
            activeCases, adminPendingCases
        }
        return { status: 200, data: caseCounts };
    }

    async activeCases(perPage, skip, page) {
        try {
            let casesLength = await cservice.findCount({ tenantId: this.tenantId, status: [CaseStatus.Open, CaseStatus.Completed], adminStatus: AdminStatus.Verified, });
            //sorting by recently added
            let allCasesSorted = await cservice.findAggregate([
                {
                    "$match": {
                        "$and": [
                            { "tenantId": this.tenantId },
                            { "status": { "$in": [CaseStatus.Open, CaseStatus.Completed] } },
                            { "adminStatus": AdminStatus.Verified }
                        ]
                    }
                },
                { "$sort": { "createdOn": -1 } },
                { "$skip": skip },
                { "$limit": perPage },
                {
                    "$project": this.casesLiteFields
                }]);
            var baseUrl = '/api/v1/admin/activecases';
            return new PageResponseHelper().buildPageResponse(baseUrl, perPage, page, allCasesSorted, casesLength);
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, Error: err } };
        }
    }

    async pendingCases(perPage, skip, page) {
        try {
            let casesLength = await cservice.findCount({
                tenantId: this.tenantId,
                //  status: [CaseStatus.Open, CaseStatus.Completed],
                adminStatus: { $nin: [AdminStatus.Verified] }
            });
            //sorting by recently added
            let allCasesSorted = await cservice.findAggregate([
                {
                    "$match": {
                        "$and": [
                            { "tenantId": this.tenantId },
                            { "adminStatus": { $nin: [AdminStatus.Verified] } }
                        ]
                    }
                },
                { "$sort": { "createdOn": -1 } },
                { "$skip": skip },
                { "$limit": perPage },
                {
                    "$project": this.casesLiteFields
                }]);
            var baseUrl = '/api/v1/admin/pendingcases';
            return new PageResponseHelper().buildPageResponse(baseUrl, perPage, page, allCasesSorted, casesLength);
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, Error: err } };
        }
    }

    async getOrder(orderId) {
        try {
            let orderDetails = await oservice.findOneSelect({ orderId: orderId }, {});
            if (orderDetails) {
                return { status: 200, data: orderDetails };
            } else {
                return { status: 500, data: 'No order details found' };
            }

        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, Error: err } };
        }
    }

    async removeRatings(caseId, ratingId) {
        try {
            let rId: string = ratingId.toString();
            let caseRatings = await rservice.findById(rId);
            let caseRatingCount;
            let caseRatingAverage;
            let userAggregateRatingCount;
            let userAggregateRatingAverage;
            //get case rating to reduce from overall value
            let caseDetails = await cservice.findOneSelect({ tenantId: this.tenantId, status: [CaseStatus.Open, CaseStatus.Completed], caseId: caseId }, this.caseRatingLiteFields);
            caseRatingCount = caseDetails.rating.count;
            caseRatingAverage = caseDetails.rating.average;
            //get beneficiary rating to reduce  from overall value
            let benefiLite = await uservice.findOneSelect({ tenantId: this.tenantId, 'basic.userId': caseDetails.beneficiary.userId }, this.userLiteRatingFields);
            userAggregateRatingCount = benefiLite.rating.count;
            userAggregateRatingAverage = benefiLite.rating.average;
            userAggregateRatingCount--;
            userAggregateRatingAverage = ((userAggregateRatingAverage * benefiLite.rating.count) - (caseRatings.rating)) / userAggregateRatingCount;
            let urating = {
                count: parseInt(userAggregateRatingCount),
                average: userAggregateRatingAverage,
            };
            caseRatingCount--;
            if (caseRatingCount === 0) {
                caseRatingAverage = 0;
            } else {
                caseRatingAverage = ((caseRatingAverage * caseDetails.rating.count) - (caseRatings.rating)) / caseRatingCount;
            }
            let crating = {
                count: parseInt(caseRatingCount),
                average: caseRatingAverage,
            }
            if (caseRatings) {
                //Update 1 on user collection inside rating
                let updateUserRatings: any = await uservice.updatePart({ tenantId: this.tenantId, 'basic.userId': caseDetails.beneficiary.userId },
                    {
                        $set: {
                            rating: urating
                        }
                    });
                //update 2 on case collection inside rating
                let updateCaseRatings = await cservice.updatePart({ caseId: caseId }, {
                    $set: {
                        rating: crating
                    }
                });
                //update 3 on rating collection inside rating
                let removeRatings = await rservice.updatePart({ _id: rId, caseId: caseId }, {
                    $set: {
                        status: RatingStatus.Obsolete,
                    }
                });
                return { status: 200, data: 'Ratings removed successfully' };
            } else {
                return { status: 500, data: 'No Ratings found' };
            }
        }
        catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, Error: err } };
        }
    }

    async sendEmail(messageSubject, messageText, senderEmail) {
        try {
            let userLanguage = await uservice.findOneSelect({ email: senderEmail }, { "basic.language": 1, "basic.firstName": 1 });
            let sendMailResults = await sendingEmailService.sendMail(userLanguage.basic.firstName, senderEmail, messageSubject, messageText, userLanguage.basic.language);
            if (sendMailResults.status == 200) {
                return { status: 200, data: sendMailResults }
            } else {
                return { status: 500, data: sendMailResults }
            }
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, Error: err } };
        }

    }

    async uploadBeneficiaryKYC(userId: string, kycFiles: any, adminNotes: string, KYCType: string) {
        try {
            let tenantId = this.tenantId;
            let adminId = this.userId;
            let adminUserLite = await uservice.findOneSelect({ email: adminId }, { basic: 1 });
            let userLite = await uservice.findOneSelect({ email: userId }, { basic: 1 });
            let key = userLite.basic.firstName + '_kycs_' + uuidv1();
            let kycType = await this.resolveKycType(KYCType);
            let uploadKYC = await kycservice.uploadKyc(tenantId, key, userLite.basic, adminUserLite.basic, kycFiles, adminNotes, kycType);
            if (uploadKYC.status == 200) {
                return { status: uploadKYC.status, data: uploadKYC.data };
            } else {
                return { status: uploadKYC.status, data: uploadKYC.data };
            }
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, Error: err } };
        }
    }

    async getBeneficiaryKYC(userId: string) {
        try {
            let kycResults = await kycservice.findOneSelect({ "user.userId": userId }, {});
            if (kycResults) {
                return { status: 200, data: kycResults };
            } else {
                return { status: 500, data: 'No kyc docs found' };
            }
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, Error: err } };
        }
    }

    async getBeneficiaryPhoto(photoId: string) {
        try {
            //save the image buffer to local server 
            let saveFile = await fileService.readImage(photoId).then();
            return { status: 200, data: saveFile };

        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, Error: err } };
        }
    }

    async updateBeneficiaryKYC(userId: string, photoId: string, kycId: string, status: string, comments: string) {
        try {
            let adminId = this.userId;
            let adminUserLite = await uservice.findOneSelect({ email: adminId }, { basic: 1 });
            let updateKYCStatus = await kycservice.updateKYC(adminUserLite, userId, photoId, kycId, status, comments)
            return { status: updateKYCStatus.status, data: updateKYCStatus.data }
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, Error: err } };
        }
    }

    async payoutSingleOrder(orderId: string) {
        let adminId: string = this.userId;
        let getOrder: Order = await oservice.findOneSelect({ orderId: orderId }, {});
        let caseId: string = getOrder.caseId;
        let adminUserLite;
        let lockCaseAndGet; //: ILockTxn | string;
        let orderPayout
        try {
            if (getOrder) {
                //check case is available(not locked) and add a lock to case and get lock 
                adminUserLite = await uservice.findOneSelect({ email: adminId }, { basic: 1 });
                lockCaseAndGet = await this.lockCaseAndGet(caseId, adminUserLite.userid);
                let userLIte = await uservice.findOneSelect({ email: getOrder.user.userId }, {});
                if (lockCaseAndGet.isLocked && await this.IsLockValid(lockCaseAndGet, caseId)) {
                    //CHECK THE LOCK IS VALID 
                    let accountDetails = await cservice.findOneSelect({ caseId: getOrder.caseId }, { accountDetails: 1 });
                    if (getOrder.status === OrderStatus.Paid) {
                        //start payout here
                        orderPayout = await orderPayoutService.singleOrderPayout(getOrder, userLIte, accountDetails.accountDetails);
                        if (orderPayout.status == 200) {
                            //update order once payout is done 
                            let updateOrder = await oservice.updatePayoutOrder(getOrder, adminUserLite, orderPayout);
                            let auditLogData = AuditData('Payout to user processed successfully', userLIte.userid, orderPayout.status, orderPayout);
                            let createLog = await auditLog.create(auditLogData);
                            return orderPayout;
                        }
                        else {
                            let auditLogData = AuditData('Payout to user failed', userLIte.userid, orderPayout.status, orderPayout);
                            let createLog = await auditLog.create(auditLogData);
                            return orderPayout;
                        }
                    } else {
                        return { status: 500, data: `order could not processed because order is in status ${getOrder.status}` };
                    }
                } else {
                    let auditLogData = AuditData(`Order locked already ${orderId}`, userLIte.userid, 500,
                        JSON.parse(`Order locked ${orderId}. Order could not processed because order is locked. Order locked: ${getOrder.LockedUntil} by ${getOrder.LockedBy}, status ${getOrder.status}`));
                    let createLog = await auditLog.create(auditLogData);
                    return { status: 500, data: `order could not processed because order is locked status ${getOrder.status}` };
                }
            }
            else {
                return { status: 500, data: `order not found` };
            }
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, Error: err } };
        } finally {
            // unlock case 
            let lockOrder = await this.unlockCase(caseId, adminUserLite.userid, lockCaseAndGet);
            return orderPayout;
        }
    }

    async resolveKycType(kycType: string) {
        if (kycType === "Proof of Residence")
            return KYCType.ProofOfRecidency.toString();
        else if (kycType === "Proof of Identity")
            return KYCType.PhotoID.toString();
        else
            return KYCType.CardApproval.toString();
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

            return { status: 200, data: getCaseDetails };
            //calculate sum of donations          
        } catch (err) {
            return { status: 500, data: { message: 'Failed to invoke successfully :: ' + err, Error: err } };
        }
    }

    //Check is case locked
    async checkCaseUsable(caseId: string): Promise<boolean> {
        let caseUsable = await cservice.isCaseUsable(caseId);
        if (caseUsable) {
            return true;
        } else {
            return false;
        }
    }

    /***
    * Lock a case
    * CaseId: CaseId
    * UserId: UserId who is performing the unlock operation
    */
    async lockCaseAndGet(caseId: string, userId: string): Promise<ILockTxn | string> {
        let caseUsable = await this.checkCaseUsable(caseId);
        if (caseUsable) {
            let lockCase = await cservice.lockCase(caseId, userId);
            if (lockCase.status == 200) {
                return lockCase.data;
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    }

    /***
     * unlock case
     * CaseId: CaseId
     * UserId: UserId who is performing the unlock operation
     */
    async unlockCase(caseId: string, userId: string, lockObj: ILockTxn) {
        let unlockCase = await cservice.unlockCase(caseId, userId, lockObj);
        if (unlockCase.status == 200) {
            let lockData = {
                data: 'Order and case are unlocked.',
                status: 200
            }
            return lockData;
        } else {
            let lockData = {
                data: 'Order and case could not be unlocked. Please try again later.',
                status: 500
            }
            return lockData;
        }
    }

    async IsLockValid(lockCaseAndGet: ILockTxn, caseId: string) {
        let getOrder = await cservice.findOneSelect({ caseId: caseId }, {});
        if (getOrder.lockId == lockCaseAndGet.lockId) {
            {
                return true;
            }
        } else {
            false;
        }
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
}

export interface LockObj {
    data: ILockTxn,
}
import { Request, Response } from 'express';

import { AdminOperations } from '../platform/admin.operations';
import { pageCount } from '../services/page.service';

export class AdminController {

    constructor() {
    }

    async adminLogin(req: Request, res: Response) {

    }

    async activeCase(req: Request, res: Response) {
        try {
            //calcualting page, perPage and skip
            const pageOps = new pageCount();
            let pageResults = await pageOps.pageCalculations(req, res);
            let page = pageResults.page;
            let perPage = pageResults.perPage;
            let skip = pageResults.skip;

            const adminOps = new AdminOperations(req, res);
            let getAllCasesSorted = await adminOps.activeCases(perPage, skip, page);
            res.statusCode = getAllCasesSorted.status;
            res.send(getAllCasesSorted);
            return;
        }
        catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async pendingCases(req: Request, res: Response) {
        try {
            //calcualting page, perPage and skip
            const pageOps = new pageCount();
            let pageResults = await pageOps.pageCalculations(req, res);
            let page = pageResults.page;
            let perPage = pageResults.perPage;
            let skip = pageResults.skip;

            const adminOps = new AdminOperations(req, res);
            let getAllCasesSorted = await adminOps.pendingCases(perPage, skip, page);
            res.statusCode = getAllCasesSorted.status;
            res.send(getAllCasesSorted);
            return;
        }
        catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
            return;
        }
    }

    async getAllBeneficiaries(req: Request, res: Response) {
        try {
            const adminOps = new AdminOperations(req, res);
            let dataResults = await adminOps.getBeneficiaryList();
            res.send(dataResults);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }

    async updateAdminStatusForCase(req: Request, res: Response) {
        try {
            const caseId: string = req.params.id;
            const adminStatus: string = req.body.adminStatus;
            const adminComment: string = req.body.adminComments;
            if (adminStatus == undefined || !adminStatus) {
                res.statusCode = 400;
                res.send({ status: 400, data: 'Bad Request' });
                return;
            }

            const adminOps = new AdminOperations(req, res);
            let dataResults = await adminOps.updateCaseAdminStatus(caseId, adminStatus, adminComment)
            res.statusCode = dataResults.status;
            res.send(dataResults);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }

    async updateCaseStatusForCase(req: Request, res: Response) {
        try {
            const caseId: string = req.params.id;
            const caseStatus: string = req.body.caseStatus;
            const adminComment: string = req.body.adminComments;
            if (caseStatus == undefined || !caseStatus) {
                res.statusCode = 400;
                res.send({ status: 400, data: 'Bad Request' });
                return;
            }
            const adminOps = new AdminOperations(req, res);
            let dataResults = await adminOps.updateCaseStatus(caseId, caseStatus, adminComment)
            res.statusCode = dataResults.status;
            res.send(dataResults);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }
    async updateIdentityStatusForUser(req: Request, res: Response) {
        try {
            console.log("inside contr")
            const userId: string = req.params.id;
            console.log(req.body);
            console.log(userId);
            const identityStatus: boolean = req.body.identityStatus;
            const type: string = req.body.type;
            // if (identityStatus == undefined || !identityStatus) {
            //     res.statusCode = 400;
            //     res.send({ status: 400, data: 'Bad Request' });
            //     return;
            // }
            const adminOps = new AdminOperations(req, res);
            let dataResults = await adminOps.updateIndentityStatus(userId, identityStatus, type)
            res.statusCode = dataResults.status;
            res.send(dataResults);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }

    async getCasesCount(req: Request, res: Response) {
        try {
            const adminOps = new AdminOperations(req, res);
            let dataResults = await adminOps.casesCount();
            res.statusCode = dataResults.status;
            res.send(dataResults);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }

    async removeRatings(req: Request, res: Response) {
        try {
            const caseId: string = req.params.id;
            const ratingId: string = req.body.ratingId;
            if (ratingId == undefined || !ratingId) {
                res.statusCode = 400;
                res.send({ status: 400, data: 'Bad Request' });
                return;
            }
            const adminOps = new AdminOperations(req, res);
            let removeRatings = await adminOps.removeRatings(caseId, ratingId);
            res.statusCode = removeRatings.status;
            res.send(removeRatings);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }

    async getOrderDetails(req: Request, res: Response) {
        try {
            const orderId: string = req.params.id;
            if (orderId == undefined || !orderId) {
                res.statusCode = 400;
                res.send({ status: 400, data: 'Bad Request' });
                return;
            }
            const adminOps = new AdminOperations(req, res);
            let orderResult = await adminOps.getOrder(orderId);
            res.send(orderResult);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }


    async sendEmail(req: Request, res: Response) {
        try {
            let senderEmail = req.body.contactFormEmail;
            let messageSubject = req.body.contactFormSubjects;
            let messageText = req.body.contactFormMessage;

            if (senderEmail === '' || messageSubject === '' || messageText === '') {
                res.statusCode = 400;
                res.send({ status: 400, data: 'Bad Request' });
                return;
            }

            const adminOps = new AdminOperations(req, res);
            let sendMailResult = await adminOps.sendEmail(messageSubject, messageText, senderEmail);
            res.send(sendMailResult);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }

    }

    async uploadPhotos(req: any, res: Response) {
        try {
            const userId: string = req.params.id;
            const file = req.files;
            const adminNote = req.body.adminComment;
            const KYCType = req.body.kycType;
            if (file == undefined || !file) {
                res.statusCode = 400;
                res.send({ status: 400, data: 'Bad Request' });
                return;
            }
            console.log(KYCType);
            console.log(adminNote);
            const adminOps = new AdminOperations(req, res);
            let dataResults = await adminOps.uploadBeneficiaryKYC(userId, file, adminNote, KYCType);
            res.send(dataResults);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }

    async getKYCPhotos(req: Request, res: Response) {
        try {
            const userId: string = req.params.id;
            const adminOps = new AdminOperations(req, res);
            let dataResults = await adminOps.getBeneficiaryKYC(userId);
            res.send(dataResults);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }

    //get base64 of a specific photo
    async geBeneficiaryPhoto(req: any, res: Response) {
        try {
            const photoId: string = req.params.id;
            const adminOps = new AdminOperations(req, res);
            let dataResults = await adminOps.getBeneficiaryPhoto(photoId);
            res.send(dataResults);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }

    async updateBeneficiaryKYC(req: Request, res: Response) {
        try {
            const photoId: string = req.body.photoId;
            const kycId: string = req.body.kycId;
            const status: string = req.body.status;
            const comments: string = req.body.comments;
            const userId: string = req.params.id;
            const adminOps = new AdminOperations(req, res);
            console.log('photoId', photoId);
            console.log('kycId', kycId);
            console.log('status', status);
            console.log('comments', comments);
            console.log('userId', userId);
            let dataResults = await adminOps.updateBeneficiaryKYC(userId, photoId, kycId, status, comments);
            res.send(dataResults);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }


    async orderPayout(req: Request, res: Response) {
        try {
            const orderId: string = req.params.id;
            if (orderId == undefined || !orderId) {
                res.statusCode = 400;
                res.send({ status: 400, data: 'Bad Request' });
                return;
            }
            const adminOps = new AdminOperations(req, res);
            let dataResults = await adminOps.payoutSingleOrder(orderId);
            console.log('dataResults', dataResults);
            res.send(dataResults);
            return;
        } catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }

    async getCase(req: Request, res: Response) {
        try {
            const caseId = req.params.id;
            const adminOps = new AdminOperations(req, res);
            let getCase = await adminOps.getCase(caseId);
            res.statusCode = getCase.status
            res.send(getCase);
            return;
        }
        catch (err) {
            res.statusCode = 500;
            res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
        }
    }

}
import { Router } from 'express';
import * as multer from 'multer';

import { AdminController } from '../controllers/admin.controller';
import * as authorize from '../controllers/authorize';

const adminRouter: Router = Router();
const adminController: AdminController = new AdminController();
const All_BENEFICIARIES: string = '/beneficiarylist';
const ADMIN_STATUS_UPDATE: string = '/adminstatus/:id';
const CASE_STATUS_UPDATE: string = '/casestatus/:id';
const CASES_COUNT: string = '/casescount';
const ACTIVE_CASES_PATH: string = '/activecases';
const ADMIN_PENDING_CASES_PATH: string = '/pendingcases';
const REMOVE_RATINGS_PATH: string = '/removeratings/:id';
const ORDER_PATH: string = '/order/:id';
const CASE_DONATIONS: string = '/case/:id/donations';
const SEND_COINS_TO_RECEIVER: string = '/sendcoins/:id';
const SENDEMAIL_PATH: string = '/sendemail';
const BENEFICIARY_KYC_PATH: string = '/beneficiary/:id/kyc';
const BENEFICIARY_PHOTO_PATH: string = '/beneficiary/photo/:id';
const BENEFICIARY_KYC_UPDATE_PATH: string = '/beneficiary/:id/kyc';
const CASE_PATH: string = '/cases/:id';
const SINGLE_ORDER_PAYOUT: string = '/orders/:id';
const IDENTITY_STATUS: string = '/beneficiary/status/:id';
const VERIFY_IDENTITY: string = '/user/:id';

var storage = multer.memoryStorage({
    destination: function (req, file, callback) {
        callback(null, '');
    }
});

var multipleUpload = multer({ storage: storage }).array('file');
//var multipleUpload = multer({ storage: storage }).any();

adminRouter.get(ACTIVE_CASES_PATH, authorize.permitted('Admin'), adminController.activeCase);
adminRouter.get(ADMIN_PENDING_CASES_PATH, authorize.permitted('Admin'), adminController.pendingCases);
adminRouter.get(All_BENEFICIARIES, authorize.permitted('Admin'), adminController.getAllBeneficiaries);
adminRouter.put(ADMIN_STATUS_UPDATE, authorize.permitted('Admin'), adminController.updateAdminStatusForCase);
adminRouter.put(CASE_STATUS_UPDATE, authorize.permitted('Admin'), adminController.updateCaseStatusForCase);
adminRouter.get(CASES_COUNT, authorize.permitted('Admin'), adminController.getCasesCount);
adminRouter.put(REMOVE_RATINGS_PATH, authorize.permitted('Admin'), adminController.removeRatings);
adminRouter.get(ORDER_PATH, authorize.permitted('Admin'), adminController.getOrderDetails);
adminRouter.post(SENDEMAIL_PATH, authorize.permitted('Admin'), adminController.sendEmail);
adminRouter.post(BENEFICIARY_KYC_PATH, authorize.permitted('Admin'), multipleUpload, adminController.uploadPhotos);
adminRouter.get(BENEFICIARY_KYC_PATH, authorize.permitted('Admin'), adminController.getKYCPhotos);
adminRouter.get(BENEFICIARY_PHOTO_PATH, authorize.permitted('Admin'), adminController.geBeneficiaryPhoto);
adminRouter.put(BENEFICIARY_KYC_UPDATE_PATH, authorize.permitted('Admin'), adminController.updateBeneficiaryKYC);
adminRouter.get(CASE_PATH, adminController.getCase);
adminRouter.put(SINGLE_ORDER_PAYOUT, authorize.permitted('Admin'), adminController.orderPayout);
adminRouter.put(IDENTITY_STATUS, adminController.updateIdentityStatusForUser);

export default adminRouter;
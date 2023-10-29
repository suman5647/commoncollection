import { Router } from 'express';
import * as multer from 'multer';

import * as authorize from '../controllers/authorize';
import { CaseController } from '../controllers/case.controller';
import { ExchangeRatesController } from '../controllers/exchangeRates.controller';

const caseRouter: Router = Router();
const caseController: CaseController = new CaseController();
const exchangeRatesController: ExchangeRatesController = new ExchangeRatesController();

const CASES_PATH: string = '/cases';
const SEARCH_CASES_PATH: string = '/searchcases';
const SORTED_CASES_PATH: string = '/sortedcases';
const CASE_PATH: string = '/cases/:id';
const CASE_RATING_PATH: string = '/cases/:id/rating';
const CASE_USERRATING_PATH: string = '/cases/:id/userrating';
const MY_CASES_PATH: string = '/mycases';
const MY_CASE_PATH: string = '/mycases/:id';
const MYCASE_STATUS_PATH: string = '/mycases/:id/status';
const MYCASE_PHOTOS_PATH: string = '/mycases/:id/uploadphotos';
const MYCASE_REARRAGEPHOTOS_PATH: string = '/mycases/:id/rearragephotos';
const MYCASE_REMOVEPHOTS_PATH: string = '/mycases/:id/removephotos';
const BENEFI_CASES_PATH: string = '/beneficiary/:id/cases';
const BENEFI_PROFILE_PATH: string = '/beneficiary/:id';
const BENEFI_RATING_PATH: string = '/beneficiary/:id/ratings';
const BENEFI_CONTACT_PATH: string = '/beneficiary/:id/contact';
const BENEFE_DONATIONS_PATH: string = '/benefactor/:id/donations';
const BENEFE_PROFILE_PATH: string = '/benefactor/:id';
const BENEFE_CONTACT_PATH: string = '/benefactor/:id/contact';
const CASE_PHOTO_PATH: string = '/cases/:id/images/:uniqueName';
const CASE_DONATE: string = '/cases/:id/donate';
const CASE_DONATE_DETAILS: string = '/cases/:id/donate';
const CASE_DONATE_THANKS: string = '/cases/:id/donatedSuccess';
const BITGOWEBHOOK: string = '/webhook';
const FIAT_RATES: string = '/rates/:base/:quote';
const VALIDATE_ADDRESS: string = '/validateaddress/:coin/:address';
const CASE_DONATIONS: string = '/case/:id/donations';
const CASE_DONATIONS_STATUS: string = '/casestatus/:id/:address/:coin/:amount/status';
const SEND_COINS_TO_RECEIVER: string = '/sendcoins/:id';
const BENEF_TRANSACTION_LIST: string = '/transactions/:id/benefactor';
const BENEFI_TRANSACTION_LIST: string = '/transactions/:id/beneficiary';
const CASE_TRANSACTION_LIST: string = '/transactions/:id/case';
const CASE_BENEFICIARY: string = '/casebeneficiary/:id';
const CASE_DONATIONS_SUCCESS: string = '/success';
const CASE_DONATIONS_FAILED: string = '/falied';
const MERCHANTWEBHOOK: string = '/monniWebhook';

var storage = multer.memoryStorage({
    destination: function (req, file, callback) {
        callback(null, '');
    }
});

var multipleUpload = multer({ storage: storage }).array('file');

caseRouter.post(CASES_PATH, authorize.permitted('*'), caseController.postCase);
caseRouter.put(MY_CASE_PATH, authorize.permitted('*'), caseController.putCase);
caseRouter.post(CASE_RATING_PATH, authorize.permitted('*'), caseController.postRating);
caseRouter.get(CASE_USERRATING_PATH, authorize.permitted('*'), caseController.getRating);
caseRouter.get(MY_CASES_PATH, authorize.permitted('*'), caseController.getAllMyCases);
caseRouter.get(MY_CASE_PATH, authorize.permitted('*'), caseController.getCaseDetails);
caseRouter.put(MYCASE_STATUS_PATH, authorize.permitted('*'), caseController.postStatusForCase);
caseRouter.post(MYCASE_PHOTOS_PATH, authorize.permitted('*'), multipleUpload, caseController.uploadPhotos);
caseRouter.put(MYCASE_REMOVEPHOTS_PATH, authorize.permitted('*'), caseController.removePhotos);
caseRouter.post(CASE_DONATE, authorize.permitted('*'), caseController.donate);
caseRouter.get(CASE_DONATE_DETAILS, authorize.permitted('*'), caseController.donateDetails);
caseRouter.get(CASE_DONATIONS_STATUS, authorize.permitted('*'), caseController.checkPayment);

caseRouter.get(CASES_PATH, caseController.getCases);
caseRouter.get(SEARCH_CASES_PATH, caseController.getSearchCases);
caseRouter.get(SORTED_CASES_PATH, caseController.sortedcases);
caseRouter.get(CASE_RATING_PATH, caseController.getCaseRatings);
caseRouter.get(CASE_PATH, caseController.getCase);
caseRouter.get(BENEFI_PROFILE_PATH, caseController.getBenefiProfile);
caseRouter.get(BENEFI_CASES_PATH, caseController.getBenefiCases);
caseRouter.get(BENEFI_RATING_PATH, caseController.getBenefiRatings);
caseRouter.post(BENEFI_CONTACT_PATH, caseController.contactBenefi);
caseRouter.get(BENEFE_PROFILE_PATH, caseController.getBenefaProfile);
caseRouter.get(BENEFE_DONATIONS_PATH, caseController.getBenefaDonations);
caseRouter.post(BENEFE_CONTACT_PATH, caseController.contactBenefa);
caseRouter.post(BITGOWEBHOOK, caseController.webhooks);
caseRouter.get(FIAT_RATES, exchangeRatesController.getRates);
caseRouter.get(VALIDATE_ADDRESS, caseController.validateCryptoAddress);
caseRouter.get(CASE_DONATIONS, caseController.sendCoins);
caseRouter.post(SEND_COINS_TO_RECEIVER, caseController.sendCoins);
caseRouter.get(BENEF_TRANSACTION_LIST, caseController.benfaTransactionsList);
caseRouter.get(BENEFI_TRANSACTION_LIST, caseController.benefTransactionsList);
caseRouter.get(CASE_TRANSACTION_LIST, caseController.caseTransactionsList);
caseRouter.get(CASE_BENEFICIARY, caseController.caseBenefiProfile);
caseRouter.get(CASE_DONATIONS_SUCCESS, caseController.successDonation);
caseRouter.get(CASE_DONATIONS_FAILED, caseController.failedDonation);
caseRouter.post(MERCHANTWEBHOOK, caseController.MerchantWebhook);

export default caseRouter;
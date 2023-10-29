import { AuditData } from '../config/common';
import { Case, CaseStatus, ILockTxn, LockTxn } from '../data/case';
import { Currency } from '../data/common';
import caseSchema, { CaseModel } from '../models/case';
import { localizationService } from '../services/localization.service';
import { ServiceBase } from './base';
import { AuditLogSevice } from '../services/auditLog.service';
import { v1 as uuidv1 } from 'uuid';

const localizeService: localizationService = new localizationService();
const auditLog: AuditLogSevice = new AuditLogSevice();
const lockObj: LockTxn = new LockTxn();

export class CaseService extends ServiceBase<Case, CaseModel> {
    constructor() {
        super(caseSchema, "case");
    }

    // add extra methods here
    test() { };

    getCases = function (cases) {
        let allGetDetails = [];
        for (let i = 0; i <= cases.length - 1; i++) {
            const caseDetails = {
                caseId: cases[i].caseId,
                caseStatus: cases[i].status,
                caseLocation: cases[i].location,
                caseContent: cases[i].content,
                caseBenificary: cases[i].beneficiary,
                caseAttactments: cases[i].attachments[0]
            }
            allGetDetails.push(caseDetails);
        }
        return allGetDetails;
    }

    getCase = function (cases) {
        const caseDetails = {
            caseId: cases.caseId,
            caseLocation: cases.location,
            caseContent: cases.content,
            caseCurrency: cases.baseCurrency,
            caseCommission: cases.agentCommission,
            caseBenificary: cases.beneficiary,
            casePhotos: cases.attachments,
            caseAddress: cases.address,
            caseDonation: cases.donations,
            caseRatings: cases.rating
        }
        return caseDetails;
    }

    sortDonations = function (cases) {
        let totalDonatedInBTC = 0;
        let totalDonated = 0;
        let btcDonated = 0;
        let donors = [];
        let sortedDonors = [];

        for (let i = 0; i < cases.length; i++) {
            let amountDonated = cases[i].order.amount;
            let amountCurrency = cases[i].order.currency;
            //TotalDonated in terms of BTC
            if (amountCurrency == Currency.BTC) {
                btcDonated = amountDonated;
                totalDonatedInBTC += amountDonated;
                totalDonated += amountDonated;
            } else if (amountCurrency == Currency.LTC) {
                let ltcDonated = amountDonated;
                btcDonated = ltcDonated * 0.01; // Assumed 1BTC = 100 LTC => 1 LTC = 1BTC/100
                totalDonatedInBTC += btcDonated;
            } else if (amountCurrency == Currency.INR) {
                let inrDonated = amountDonated;
                btcDonated = inrDonated * 0.0000015;  //As on 31/07/2019 conversion rate need to use a coinmarketcap api todo this
                totalDonatedInBTC += btcDonated;
            } else if (amountCurrency == Currency.USD) {
                let usdDonated = amountDonated;
                btcDonated = usdDonated * 0.0001024;  //As on 31/07/2019 conversion rate need to use a coinmarketcap api todo this
                totalDonatedInBTC += btcDonated;
                totalDonated += amountDonated;
            }
            donors.push({
                user: cases[i].user,
                order: {
                    amount: cases[i].order.amount,
                    amountInTermsBTC: btcDonated,
                    currency: cases[i].order.currency,
                }
            });

        }
        sortedDonors = donors.sort(function (a, b) { return a.order.amount < b.order.amount ? 1 : a.order.amount > b.order.amount ? -1 : 0; });
        return { sortedDonors, totalDonated };
    }

    sumDonations = function (cases) {
        let totalDonated = 0;
        for (let i = 0; i < cases.length; i++) {
            totalDonated += cases[i].totalCaseDonation;
        }
        return totalDonated;
    }

    UsersSumDonations = function (cases) {
        let totalCasesDonations = 0;
        for (let i = 0; i < cases.length; i++) {
            let donationAmount = cases[i].donations.order.amount;
            totalCasesDonations = totalCasesDonations + donationAmount;
        }
        return totalCasesDonations;
    }

    updateCaseStatus = async function (caseId: string, caseStatus: string, tenantId: string) {
        let updatedCaseStatus: any = await this.updatePart({ tenantId: tenantId, caseId: caseId, status: CaseStatus.Draft }, { $set: { status: caseStatus, publishedOn: new Date() } });
        if (updatedCaseStatus.nModified) {
            let dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryStatusUpdated', this.language);
            return { status: 200, data: dataMessage };
        } else {
            let dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryStatusFailed', this.language);
            return { status: 500, data: { message: dataMessage } };
        }
    }

    async lockCase(caseId, lockingUserId) {
        let getCase = await this.findOneSelect({ caseId: caseId }, {});
        if (getCase) {
            if (getCase.isLocked === undefined || !getCase.isLocked) {
                const lockDate = new Date();
                lockDate.setHours(lockDate.getHours() + 2);  //Locking a case for 2 hrs
                let lockOrder = await this.updatePart({ caseId: caseId }, {
                    $set: {
                        isLocked: true,
                        lockedUntil: lockDate,
                        lockedBy: lockingUserId,
                        lockId: uuidv1()
                    }
                });
                getCase = await this.findOneSelect({ caseId: caseId }, {});
                let lockedDetails: ILockTxn = {
                    isLocked: false,
                    lockId: '',
                    lockedUntil: new Date(),
                    lockedBy: ''
                    //myId: ''
                };
                lockedDetails.isLocked = getCase.isLocked;
                lockedDetails.lockId = getCase.lockId;
                lockedDetails.lockedUntil = getCase.lockedUntil;
                lockedDetails.lockedBy = getCase.lockedBy;
                let JSONdata = {
                    data: `CaseId:${caseId} locked till ${lockDate} by ${lockingUserId} lockId ${lockedDetails.lockId}`
                };
                let auditLogData = AuditData(`Successfully locked a case, Id:${caseId}`, 'admin', 200, JSONdata);
                 await auditLog.create(auditLogData);
                return {
                    status: 200, data: lockedDetails
                };
            } else {
                let JSONdata = {
                    data: `CaseId:${caseId} locked till ${getCase.lockedUntil} by ${getCase.lockedBy} lockId ${getCase.lockId}`
                };
                let auditLogData = AuditData(`Failed to lock a case, Id:${caseId}`, lockingUserId, 500, JSONdata);
                await auditLog.create(auditLogData);
                return { status: 500, data: `Case already Locked` };
            }
        } else {
            return { status: 500, data: `Case not found` };
        }
    }

    async unlockCase(caseId, unlockingUserId, lockObj) {
        let getCase = await this.findOneSelect({ caseId: caseId, lockId: lockObj.lockId }, {});
        if (getCase) {
            if (getCase.isLocked) {
                let lockOrder = await this.updatePart({ caseId: caseId }, {
                    $set: {
                        isLocked: false,
                        lockedUntil: null, //todo set current date and time
                        lockedBy: '',
                        lockId: ''
                    }
                });
                let JSONdata = {
                    data: `CaseId:${caseId} unlocked by ${unlockingUserId}`
                };
                let auditLogData = AuditData(`Successfully locked an case, Id:${caseId}`, unlockingUserId, 200, JSONdata);
                await auditLog.create(auditLogData);
                getCase = await this.findOneSelect({ caseId: caseId }, {});
                let lockedDetails: ILockTxn = {
                    isLocked: false,
                    lockId: '',
                    lockedUntil: new Date(),
                    lockedBy: ''
                    //myId: ''
                };
                lockedDetails.isLocked = getCase.isLocked;
                lockedDetails.lockId = getCase.lockId;
                lockedDetails.lockedUntil = getCase.lockedUntil;
                lockedDetails.lockedBy = getCase.lockedBy;
                return {
                    status: 200, data: lockedDetails
                };
            } else {
                let JSONdata = {
                    data: `CaseId:${caseId} already locked till ${getCase.lockedUntil} by ${getCase.lockedBy}`
                };
                let auditLogData = AuditData(`Failed to unlock an case, Id:${caseId}`, unlockingUserId, 500, JSONdata);
                await auditLog.create(auditLogData);
                return { status: 500, data: `Case already Unlocked` };
            }
        } else {
            return { status: 500, data: `Case not found` };
        }
    }

    async isCaseUsable(caseId) {
        let getCase = await this.findOneSelect({ caseId: caseId }, {});
        if (getCase.isLocked === undefined || (!getCase.isLocked && (getCase.lockedUntil === undefined || getCase.lockedUntil == null || getCase.lockedUntil.getMilliseconds() > new Date().getMilliseconds()))) {
            return true;
        } else {
            return false;
        }

    }

}
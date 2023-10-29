import { AdminStatus, Case, CaseStatus } from "../data/case";
import { User } from "../data/user";
import caseSchema from "../models/case";
import userSchema, { UserModel } from "../models/user";
import { ServiceBase } from "./base";
import { emailSendService } from "./email.service";
import { localizationService } from "./localization.service";

let localizeService: localizationService = new localizationService();
let emailService: emailSendService = new emailSendService();

export class AdminService extends ServiceBase<User, UserModel> {
    constructor() {
        super(caseSchema, "case");
    }
    updateCaseStatus = async function (Id: string, adminStatus: string, comment: string, tenantId: string, benefiLite: User, caseDetail: Case) {
        var updatedCaseStatus: any;
        if (adminStatus == AdminStatus.Due) {
            updatedCaseStatus = await this.updatePart({ tenantId: tenantId, caseId: Id }, { $set: { status: CaseStatus.Draft, adminStatus: adminStatus, adminComments: comment, adminCommentOn: new Date() } });
        }
        //for any case status update
        else if (adminStatus == CaseStatus.Completed || adminStatus == CaseStatus.Obsolete) {
            updatedCaseStatus = await this.updatePart({ tenantId: tenantId, caseId: Id }, { $set: { status: adminStatus, adminComments: comment, adminCommentOn: new Date() } });
        }
        else {
            updatedCaseStatus = await this.updatePart({ tenantId: tenantId, caseId: Id }, { $set: { adminStatus: adminStatus, adminComments: comment, adminCommentOn: new Date() } });
        }
        if (updatedCaseStatus.nModified) {
            let dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryStatusUpdated', this.language);
            emailService.sendMailToBeneficiary(benefiLite.email, benefiLite.basic.firstName, this.language, comment, caseDetail.content[0].title);
            return { status: 200, data: dataMessage };
        } else {
            let dataMessage = await localizeService.localizeContactMeOutro('beneficiaryMessages.beneficiaryStatusFailed', this.language);
            return { status: 500, data: { message: dataMessage } };
        }
    }
}
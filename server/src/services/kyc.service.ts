import { ServiceBase } from "./base";
import kycSchema, { KYCModel } from "../models/kyc";
import { KYC, KycDocument, KycState, KYCStatus, KYCType } from "../data/kyc";
import { RepositoryBase } from "../repository/base";
import { FileService } from './file.service';
const fileService: FileService = new FileService();

export class KYCService extends ServiceBase<KYC, KYCModel> {
    constructor() {
        super(kycSchema, "kycs");
    }

    // add extra methods here
    async uploadKyc(tenantId, accountId, userLite, adminUserLite, kycFiles, adminNotes, kycType) {

        let KycDocuments: KycDocument[] = [];
        let kycStates: KycState[] = [];

        //add the kyc state
        let KycState: KycState = {
            status: KYCStatus.Uploaded,
            statusOn: new Date(),
            statusBy: adminUserLite,
            note: adminNotes !== undefined ? adminNotes : ''
        }

        for (let i = 0; i < kycFiles.length; i++) {
            let kycObj: KycDocument = {
                fileType: kycFiles[i].mimetype,
                kycTypeType: kycType,
                title: kycFiles[i].originalname,
                uniqueName: userLite.firstName + '_KYC_' + kycType,  // unique name with path need to obtain the kyc file
                states: kycStates,
                status: KYCStatus.Uploaded
            }
            KycDocuments.push(kycObj);
            //save the image buffer to local server 
            let saveFile = await fileService.saveImage(kycFiles[i].buffer, kycObj.uniqueName).then();
        }

        kycStates.push(KycState);

        let newKyc: KYC = {
            tenantId: tenantId,
            accountId: accountId,
            user: userLite,
            documents: KycDocuments,
            states: kycStates
        } as KYC;

        let uploadKyc;
        let checkKYC = await this.findOneSelect({ "user.userId": userLite.userId }, {});
        //if user has already kyc document push into same doc else create a doc
        if (checkKYC) {
            uploadKyc = await this.updatePart({ "user.userId": userLite.userId }, {
                $push: {
                    documents: KycDocuments
                }
            });
        } else {
            uploadKyc = await this.create(newKyc);
        }
        if (uploadKyc) {
            return { status: 200, data: uploadKyc };
        }
        else {
            return { status: 500, data: 'KYC upload failed' };
        }
    }

    //update kyc status
    async updateKYC(adminUserLite, userId: string, photoId: string, kycId: string, adminStatus, adminNotes: string) {
        let getKYC = await this.findOneSelect({ "user.userId": userId, documents: { $elemMatch: { _id: kycId, kycTypeType: photoId } } }, {});
        console.log(getKYC);
        if (getKYC) {
            //add the kyc state
            let KycState: KycState = {
                status: adminStatus,
                statusOn: new Date(),
                statusBy: adminUserLite,
                note: adminNotes !== undefined ? adminNotes : ''
            }
            let updateKyc = await this.updatePart({ "user.userId": userId, documents: { $elemMatch: { _id: kycId, kycTypeType: photoId } } }, {
                $push: {
                    "documents.$.states": KycState
                },
                $set: {
                    "documents.$.status": adminStatus
                   // "donations.$.order.status": OrderStatus.Paid
                }
            })
            console.log('updateKyc', updateKyc);
            return { status: 200, data: "KYC status updated successfully" }
        } else {
            return { status: 500, data: "KYC status updated not updated" }
        }
    }
}
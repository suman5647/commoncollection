import * as aws from 'aws-sdk';
import { keys } from '../config/keys';
import { IAPIOperations } from "../platform/base.operations";
import { CCFileInfo } from "../data/common";
import { AuditData } from '../config/common';
import { AuditLogSevice } from '../services/auditLog.service';
import { S3Data } from '../data/keys';
import { decryptData } from '../services/crypto.service';
//getting decrypted keys
var s3keys: S3Data;
if (keys.files.isEncrypted) {
  s3keys = decryptData(keys.files.key);
}
const bucketPath: string = s3keys.documentsPath;
const public_read_ACL: string = 'public-read';
const auditLog: AuditLogSevice = new AuditLogSevice();

export class FileOperations implements IAPIOperations {

    private s3: aws.S3;

    constructor() {
        const s3 = new aws.S3({
            accessKeyId: s3keys.accessKeyId,
            secretAccessKey: s3keys.secretAccessKey,
        });

        this.s3 = s3;
    }

    async uploadFile(key: string, docType: string, docBuffer: Buffer, userId: string): Promise<CCFileInfo> {

        var params = {
            Bucket: bucketPath,
            Key: key,
            ContentType: docType,
            Body: docBuffer,
            ACL: public_read_ACL
        };
        try {
            let fileInfo = await this.s3.upload(params).promise();
            //AuditLog
            let auditLogData = AuditData('AWS file upload response', userId, 200, fileInfo);
            let createLog = await auditLog.create(auditLogData);
            return fileInfo as CCFileInfo;
        } catch (err) {
            let auditLogData = AuditData('AWS file upload error response', userId, 500, err);
            let createLog = await auditLog.create(auditLogData);
            return err;
        }
    }

    public async getFile(fileId: string, userId: string): Promise<Buffer> {
        var params = {
            Bucket: bucketPath,
            Key: fileId
        };
        try {
            let getObj = await this.s3.getObject(params).promise();
            let auditLogData = AuditData('AWS get file response', userId, 200, getObj.$response);
            let createLog = await auditLog.create(auditLogData);
            return getObj.Body as Buffer;
        } catch (err) {
            let auditLogData = AuditData('AWS get file error response', userId, 500, err);
            let createLog = await auditLog.create(auditLogData);
            return err;
        }
    }

    async removeFile(fileId: string, userId: string) {
        var params = {
            Bucket: bucketPath,
            Key: fileId
        };
        try {
            let headObject = await this.s3.headObject(params).promise();
            try {
                let deleteObject = await this.s3.deleteObject(params).promise();
                //AuditLog
                let auditLogData = AuditData('AWS delete file response', userId, 200, headObject);
                let createLog = await auditLog.create(auditLogData);
            } catch (err) {
                //AuditLog
                let auditLogData = AuditData('AWS delete file response error ', userId, 500, err);
                let createLog = await auditLog.create(auditLogData);
            }
        } catch (err) {
            //AuditLog
            let auditLogData = AuditData('AWS file not found error ', userId, 500, err);
            let createLog = await auditLog.create(auditLogData);
        }
    }
}
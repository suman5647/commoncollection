import * as nodemailer from 'nodemailer';
import { keys } from '../config/keys';
import { AuditLogSevice } from '../services/auditLog.service';
import { AuditData } from '../config/common';
import { SMTPData } from '../data/keys';
import { decryptData } from '../services/crypto.service';

const auditLog: AuditLogSevice = new AuditLogSevice();
var SMPTData: SMTPData;
if(keys.smtp.isEncrypted){
    SMPTData = decryptData(keys.smtp.key);
}

export class sendingEmail {

    private poolConfig: SMTPData = SMPTData;
    constructor() {
    }

    async sendEmail(to: string, subject: string, text: string, from: string = SMPTData.defaultFrom) {
        try {
            var transport = nodemailer.createTransport(this.poolConfig);
            var mailOptions = {
                from: from,
                to: to,
                bcc:'support@commoncollection.com',
                subject: subject,
                text: text,
            };
            let results = await transport.sendMail(mailOptions);

            if (results) {
                //Audit log
                let auditLogData = AuditData('Node mailer response', to, 200, results);
                let createLog = await auditLog.create(auditLogData);
                return { status: 200, data: 'Email sent successfully' };
            } else {
                //Audit log
                let auditLogData = AuditData('Node mailer error response', to, 500, results);
                let createLog = await auditLog.create(auditLogData);
                return { status: 500, data: 'Email sent failed' };
            }
        }
        catch (err) {
            return { status: 500, data: { message: 'Failed to sent email successfully :: ' + err, Error: err } };
        }
    }

} 
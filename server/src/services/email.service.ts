import { localizationService } from '../services/localization.service';
import { User } from '../data/user';
import { sendingEmail } from '../platform/email.operations';

let localizeService: localizationService = new localizationService();
let sendingEmailService: sendingEmail = new sendingEmail();

export class emailSendService {
    async sendNewUserEmail(ip: string, user: User, token: string) {
        const url = `${ip}/api/v1/auth/activate?token=${token}`;
        const subject = await localizeService.localizeSubject('subjectFields.newUserCreated', user.language);
        const to = user.email;
        const text = await localizeService.localizeIntro('intro.newUserCreatedText', user.language, user.basic.firstName) +
            url + await localizeService.localizeOutro('outro.newUserCreatedText', user.language);
        let sendMailResults = await sendingEmailService.sendEmail(to, subject, text);
        return sendMailResults;
    }

    async sendForgotEmail(ip: string, user: User, token: string) {
        const url = `${ip}/api/v1/auth/setpassword?resettoken=${token}`;
        const subject = await localizeService.localizeSubject('subjectFields.forgotPassword', user.language);
        const to = user.email;
        const text = await localizeService.localizeIntro('intro.forgotPasswordText', user.language, user.basic.firstName) +
            url + await localizeService.localizeOutro('outro.forgotPasswordText', user.language);
        let sendMailResults = await sendingEmailService.sendEmail(to, subject, text);
        return sendMailResults;
    }

    async contactMe(userEmail: string, userName: string, userLanguage: string, senderMessage: string, senderEmail: string, senderName: string, senderPhone: string) {
        const subject = await localizeService.localizeContactMeSubject('subjectFields.contactMe', userLanguage, senderName);
        const to = userEmail;
        const text = await localizeService.localizeContactMeIntro('intro.contactMeText', userLanguage, userName, senderName, senderMessage, senderEmail, senderPhone)
            + await localizeService.localizeContactMeOutro('outro.contactMeText', userLanguage);
        let sendMailResults = await sendingEmailService.sendEmail(to, subject, text);
        return sendMailResults;
    }

    async benefactorEmailDonationReceived(userEmail: string, userName: string, userLanguage: string, orderId: string, donationAmount: string, caseId: string) {
        const subject = await localizeService.localizeContactMeSubject('subjectFields.DonationReceived', userLanguage, caseId);
        const to = userEmail;
        const text = await localizeService.localizeReceivedDonationIntro('intro.DonationReceivedText', userLanguage, userName, caseId, orderId, donationAmount)
            + await localizeService.localizeContactMeOutro('outro.DonationReceivedText', userLanguage);
        let sendMailResults = await sendingEmailService.sendEmail(to, subject, text);
        return sendMailResults;
    }

    async beneficiaryEmailDonationReceived(userEmail: string, userName: string, userLanguage: string, orderId: string, donationAmount: string, caseId: string) {
        const subject = await localizeService.localizeContactMeSubject('subjectFields.DonationReceivedBeneficiary', userLanguage, caseId);
        const to = userEmail;
        const text = await localizeService.localizeReceivedDonationIntro1('intro.DonationReceivedTextBeneficiary', userLanguage, userName, orderId, donationAmount)
            + await localizeService.localizeContactMeOutro('outro.DonationReceivedText', userLanguage);
        let sendMailResults = await sendingEmailService.sendEmail(to, subject, text);
        return sendMailResults;
    }

    async beneficiaryEmailDonationPayoutCompleted(userEmail: string, userName: string, userLanguage: string, orderId: string, donationAmount: string, caseId: string, cryptoAddress: string, txHash: string) {
        const subject = await localizeService.localizeContactMeSubject('subjectFields.DonationPaidOutToBeneficiary', userLanguage, caseId);
        const to = userEmail;
        const text = await localizeService.localizePaidOutDonationIntro1('intro.DonationPaidOutTextBeneficiary', userLanguage, userName, orderId, donationAmount, cryptoAddress, txHash)
            + await localizeService.localizeContactMeOutro('outro.DonationPayoutText', userLanguage);
        let sendMailResults = await sendingEmailService.sendEmail(to, subject, text);
        return sendMailResults;
    }

    async sendMailToBeneficiary(userEmail: string, userName: string, userLanguage: string, senderMessage: string, caseName: string) {
        const subject = await localizeService.localizeSubject('subjectFields.ReviewCase', userLanguage);
        const to = userEmail;
        const text = await localizeService.localizeReviewIntro('intro.ReviewText', userLanguage, senderMessage, userName, caseName)
            + await localizeService.localizeContactMeOutro('outro.contactMeText', userLanguage);
        let sendMailResults = await sendingEmailService.sendEmail(to, subject, text);
        return sendMailResults;
    }

    //used by admin for contacing beneficiary or benefactor
    async sendMail(senderName: string, senderEmail: string, messageSubject: string, messageText: string, userLanguage: string) {
        const text = await localizeService.localizeContactMeSubject('intro.GeneralText', userLanguage, senderName) + messageText + await localizeService.localizeContactMeOutro('outro.contactMeText', userLanguage);
        let sendMailResults = await sendingEmailService.sendEmail(senderEmail, messageSubject, text);
        return sendMailResults;
    }

}
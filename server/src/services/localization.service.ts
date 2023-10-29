import * as i18n from 'i18n';
import * as moment from 'moment';

export class localizationService {

    async localizeSubject(subject: string, lang: string) {
        return i18n.__({ phrase: subject, locale: moment.locale(lang) });
    }

    async localizeIntro(subject: string, lang: string, name: string) {
        console.log('subject', i18n.__({ phrase: subject, locale: moment.locale(lang) }, name));
        return i18n.__({ phrase: subject, locale: moment.locale(lang) }, name);
    }

    async localizeOutro(subject: string, lang: string) {
        return i18n.__({ phrase: subject, locale: moment.locale(lang) });
    }

    async localizeContactMeSubject(subject: string, lang: string, name: string) {
        return i18n.__({ phrase: subject, locale: moment.locale(lang) }, name);
    }

    async localizeContactMeIntro(subject: string, lang: string, rname: string, name: string, message: string, email: string, phone: string,) {
        return i18n.__({ phrase: subject, locale: moment.locale(lang) }, rname, name, message, email, phone);
    }

    async localizeContactMeOutro(subject: string, lang: string) {
        return i18n.__({ phrase: subject, locale: moment.locale(lang) });
    }

    async localizeReceivedDonationIntro(subject: string, lang: string, name: string, caseId: string, orderId: string, amount: string) {
        return i18n.__({ phrase: subject, locale: moment.locale(lang) }, name, caseId, orderId, amount);
    }

    async localizeReceivedDonationIntro1(subject: string, lang: string, name: string, orderId: string, amount: string) {
        return i18n.__({ phrase: subject, locale: moment.locale(lang) }, name, orderId, amount);
    }

    async localizePaidOutDonationIntro1(subject: string, lang: string, name: string, orderId: string, amount: string, cryptoAddress: string, txHash: string) {
        return i18n.__({ phrase: subject, locale: moment.locale(lang) }, name, orderId, amount);
    }

    async localizeReviewIntro(subject: string, lang: string, message: string, name: string, caseName: string,) {
        return i18n.__({ phrase: subject, locale: moment.locale(lang) }, message, caseName);
    }
}
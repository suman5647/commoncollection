import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { KYCUpdateData } from '../components/common/beneficiary/beneficiary.component';

import { config } from '../config';
import { CaseCounts, PageResponseData, ResponseData } from '../core/models/base.response.model';
import { Contact } from '../core/models/common';
import { AdminCaseStatus, Case, CaseDocument, CaseStatus, CaseStatusModel, IdentityStatusModel, RatingSummary } from '../models/case';
import { KYC } from '../models/kyc';
import { Order } from '../models/order';
import { Rating } from '../models/rating.model';
import { Beneficiary } from '../models/user';


@Injectable({
    providedIn: 'root'
})

export class CaseService {
    constructor(private http: HttpClient) { }

    getCaseCount(): Observable<ResponseData<CaseCounts>> {
        return this.http.get<ResponseData<CaseCounts>>(`${config.apiAdminUrl}casescount`);
    }

    activeCases(page: number, perPage: number): Observable<PageResponseData<Case>> {
        return this.http.get<PageResponseData<Case>>(`${config.apiAdminUrl}activecases?page=` + page + `&perPage=` + perPage);
    }

    adminPendingCases(page: number, perPage: number): Observable<PageResponseData<Case>> {
        return this.http.get<PageResponseData<Case>>(`${config.apiAdminUrl}pendingcases?page=` + page + `&perPage=` + perPage);
    }

    caseDetail(caseId: string): Observable<ResponseData<Case>> {
        return this.http.get<ResponseData<Case>>(`${config.apiUrl}cases/${caseId}`);
    }

    caseDetailAdmin(caseId: string): Observable<ResponseData<Case>> {
        return this.http.get<ResponseData<Case>>(`${config.apiAdminUrl}cases/${caseId}`);
    }

    updatedAdminStatus(caseId: string, statusModel: AdminCaseStatus): Observable<PageResponseData<CaseStatus>> {
        return this.http.put<PageResponseData<CaseStatus>>(`${config.apiAdminUrl}adminstatus/${caseId}`, statusModel);
    }

    updatedCaseStatus(caseId: string, statusModel: CaseStatusModel): Observable<PageResponseData<CaseStatus>> {
        return this.http.put<PageResponseData<CaseStatus>>(`${config.apiAdminUrl}casestatus/${caseId}`, statusModel);
    }

    getOrderDetails(orderId: string): Observable<ResponseData<Order>> {
        return this.http.get<ResponseData<Order>>(`${config.apiAdminUrl}order/${orderId}`);
    }

    removeCaseRatings(caseId: string, ratingId: string): Observable<ResponseData<RatingSummary>> {
        return this.http.put<ResponseData<RatingSummary>>(`${config.apiAdminUrl}removeratings/${caseId}`, { ratingId });
    }

    sendEmail(contactForm): Observable<ResponseData<Contact>> {
        return this.http.post<ResponseData<Contact>>(`${config.apiAdminUrl}sendemail`, contactForm);
    }

    upload(files: File, userId: String, kycType: string, adminComments: string) {
        let formData = this.fileFormdata(files, kycType, adminComments);
        return this.postWithUpload(formData, userId);
    };

    fileFormdata(files, kycType, adminComments) {
        let formData: FormData = new FormData();
        for (var j = 0; j < files.length; j++) {
            formData.append("file", files[j], files[j].name);
            formData.append("kycType", kycType);
            formData.append("adminComment", adminComments);
        }
        return formData;
    }

    updateKYCstatus(data: KYCUpdateData, userId): Observable<ResponseData<CaseDocument>> {
        return this.http.put<ResponseData<CaseDocument>>(`${config.apiAdminUrl}beneficiary/${userId}/kyc`, data);
    }

    updateIdentitystatus(data: IdentityStatusModel, userId): Observable<ResponseData<string>> {
        return this.http.put<ResponseData<string>>(`${config.apiAdminUrl}beneficiary/status/${userId}`, data);
    }

    postWithUpload(data: FormData, userId: String): Observable<ResponseData<CaseDocument>> {
        return this.http.post<ResponseData<CaseDocument>>(`${config.apiAdminUrl}beneficiary/${userId}/kyc`, data);
    }

    getBeneficiaryKYC(userId: string): Observable<ResponseData<KYC>> {
        return this.http.get<ResponseData<KYC>>(`${config.apiAdminUrl}beneficiary/${userId}/kyc`);
    }

    getPhotos(photoId: string): Observable<ResponseData<string>> {
        return this.http.get<ResponseData<string>>(`${config.apiAdminUrl}beneficiary/photo/${photoId}`);
    }

    orderPayout(orderId: string): Observable<ResponseData<string>> {
        return this.http.put<ResponseData<string>>(`${config.apiAdminUrl}orders/${orderId}`, {});
    }
    
    //common methods
    getCaseRating(caseId: string, page: number): Observable<PageResponseData<Rating>> {
        return this.http.get<PageResponseData<Rating>>(`${config.apiUrl}cases/${caseId}/rating?page=` + page);
    }

    getBeneficiary(userId: number): Observable<ResponseData<Beneficiary>> {
        return this.http.get<ResponseData<Beneficiary>>(`${config.apiUrl}beneficiary/${userId}/`);
    }

    getBeneficiaryDetails(userId: string): Observable<ResponseData<Beneficiary>> {
        return this.http.get<ResponseData<Beneficiary>>(`${config.apiUrl}beneficiary/${userId}/`);
    }

    removeCasePhoto(caseId: string, uniqueName: string): Observable<ResponseData<CaseDocument>> {
        return this.http.put<ResponseData<CaseDocument>>(`${config.apiUrl}mycases/${caseId}/removephotos`, { uniqueName })
    }


}
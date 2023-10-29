import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from "rxjs";
import { config } from '../config';
import { Contact, Beneficiary, Benefactor, Cases } from '../models/user';
import { Rating } from '../models/rating.model';
import { PageResponseData, ResponseData, ErrorData, CasesResponseData, DonationsResponseData, BitcoinAddressResponse, TransactionList } from '../core/models/base.response.model';
import { Case, CaseCreate, CaseStatus, CaseLite, CaseDocument, CaseDonate, FiatRatesResponse, CurrenciesReq, DonationConfirmation } from '../models/case';
import { Donations, DonationsObj, CryptoAddress } from 'src/app/models/donation';


@Injectable({
  providedIn: 'root'
})
export class CaseService {

  constructor(private http: HttpClient) { }

  searchText: string;

  viewCase(page: number, perPage: number): Observable<PageResponseData<Case>> {
    return this.http.get<PageResponseData<Case>>(`${config.apiUrl}sortedcases?page=` + page + `&perPage=` + perPage);
  }

  searchCase(): Observable<PageResponseData<Case>> {
    return this.http.get<PageResponseData<Case>>(`${config.apiUrl}searchcases`);
  }

  updateCaseStatus(caseId: string, caseStatus: CaseStatus): Observable<PageResponseData<CaseStatus>> {
    return this.http.put<PageResponseData<CaseStatus>>(`${config.apiUrl}mycases/${caseId}/status`, caseStatus);
  }

  caseDetail(caseId: string): Observable<ResponseData<Case>> {
    return this.http.get<ResponseData<Case>>(`${config.apiUrl}cases/${caseId}`);
  }

  getCaseRating(caseId: string, page: number): Observable<PageResponseData<Rating>> {
    return this.http.get<PageResponseData<Rating>>(`${config.apiUrl}cases/${caseId}/rating?page=` + page);
  }

  getBeneficiary(userId: number): Observable<ResponseData<Beneficiary>> {
    return this.http.get<ResponseData<Beneficiary>>(`${config.apiUrl}beneficiary/${userId}/`);
  }
  getBeneficiaryCases(userId: number): Observable<CasesResponseData<Cases>> {
    return this.http.get<CasesResponseData<Cases>>(`${config.apiUrl}beneficiary/${userId}/cases`);
  }
  getAllBeneficiaryCases(userId: string): Observable<CasesResponseData<Cases>> {
    return this.http.get<CasesResponseData<Cases>>(`${config.apiUrl}beneficiary/${userId}/cases`);
  }
  getBeneficiaryRating(userId: number, page: number): Observable<PageResponseData<Rating>> {
    return this.http.get<PageResponseData<Rating>>(`${config.apiUrl}beneficiary/${userId}/ratings?page=` + page);
  }
  getBenefactor(userId: number): Observable<ResponseData<Benefactor>> {
    return this.http.get<ResponseData<Benefactor>>(`${config.apiUrl}benefactor/${userId}/`);
  }
  getBenefactorCases(userId: number): Observable<DonationsResponseData<Cases>> {
    return this.http.get<DonationsResponseData<Cases>>(`${config.apiUrl}benefactor/${userId}/donations`);
  }
  getAllBenefactorCases(userId: string): Observable<DonationsResponseData<Cases>> {
    return this.http.get<DonationsResponseData<Cases>>(`${config.apiUrl}benefactor/${userId}/donations`);
  }
  contactBeneficiary(model: Contact, userId: number): Observable<ResponseData<Contact> | ResponseData<ErrorData>> {
    return this.http.post<ResponseData<Contact>>(`${config.apiUrl}beneficiary/${userId}/contact`, model);
  }
  contactBenefactor(model: Contact, userId: number): Observable<ResponseData<Contact>> {
    return this.http.post<ResponseData<Contact>>(`${config.apiUrl}benefactor/${userId}/contact`, model);
  }

  saveCaseRating(caseId: string, rating: Rating): Observable<ResponseData<Rating>> {
    return this.http.post<ResponseData<Rating>>(`${config.apiUrl}cases/${caseId}/rating`, rating);
  }
  getMyCases(): Observable<PageResponseData<Case>> {
    return this.http.get<PageResponseData<Case>>(`${config.apiUrl}mycases`);
  }

  createCase(model: CaseCreate): Observable<ResponseData<Case>> {
    return this.http.post<ResponseData<Case>>(`${config.apiUrl}cases`, model);
  }

  updateCase(caseId: string, model: Case): Observable<ResponseData<Case>> {
    return this.http.put<ResponseData<Case>>(`${config.apiUrl}mycases/${caseId}/`, model);
  }

  getCaseDeatil(caseId: string): Observable<ResponseData<Case>> {
    return this.http.get<ResponseData<Case>>(`${config.apiUrl}mycases/${caseId}`);
  }

  upload(files: File, caseId: String) {
    let formData = this.fileFormdata(files);
    return this.postWithUpload(formData, caseId);
  };
  fileFormdata(files) {
    let formData: FormData = new FormData();
    for (var j = 0; j < files.length; j++) {
      formData.append("file", files[j], files[j].name);
    }
    return formData;
  }

  postWithUpload(data: FormData, caseId: String): Observable<ResponseData<CaseDocument>> {
    return this.http.post<ResponseData<CaseDocument>>(`${config.apiUrl}mycases/${caseId}/uploadphotos`, data);
  }

  removeCasePhoto(caseId: String, uniqueName: String): Observable<ResponseData<CaseDocument>> {
    return this.http.put<ResponseData<CaseDocument>>(`${config.apiUrl}mycases/${caseId}/removephotos`, { uniqueName })
  }

  donate(model: DonationsObj, caseId: String): Observable<ResponseData<CaseDonate>> {
    return this.http.post<ResponseData<CaseDonate>>(`${config.apiUrl}cases/${caseId}/donate`, model);
  }

  getFiatRates(base: String, quote: String): Observable<ResponseData<FiatRatesResponse>> {
    return this.http.get<ResponseData<FiatRatesResponse>>(`${config.apiUrl}rates/${base}/${quote}`);
  }

  validateCryptoAddress(coin: string, address: string): Observable<BitcoinAddressResponse> {
    return this.http.get<BitcoinAddressResponse>(`${config.apiUrl}validateaddress/${coin}/${address}`,);
  }

  donateConfirmation(caseId: string, amount: string, address: string, coin: string): Observable<ResponseData<DonationConfirmation>> {
    return this.http.get<ResponseData<DonationConfirmation>>(`${config.apiUrl}casestatus/${caseId}/${address}/${coin}/${amount}/status`);
  }

  getTransactionList(userId: string, roleId?: string): Observable<ResponseData<TransactionList[]>> {
    return this.http.get<ResponseData<TransactionList[]>>(`${config.apiUrl}transactions/${userId}/${roleId}`);
  }

  caseTransactionList(caseId: string): Observable<ResponseData<TransactionList[]>> {
    return this.http.get<ResponseData<TransactionList[]>>(`${config.apiUrl}transactions/${caseId}/case`);
  }

  getCaseHolder(caseId: string):  Observable<ResponseData<Beneficiary>> {
    return this.http.get<ResponseData<Beneficiary>>(`${config.apiUrl}casebeneficiary/${caseId}/`);
  }
}

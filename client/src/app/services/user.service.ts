import { Injectable } from '@angular/core';
import { User, ProfileLite, BeneficiaryLite } from '../models/user';
import { Observable } from 'rxjs';
import { ResponseData } from '../core/models/base.response.model';
import { config } from '../config';
import { HttpClient } from '@angular/common/http';
import { UserLite } from '../models/user.model';
import { Address, Password } from '../core/models/common';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  postUser(user: User): Observable<ResponseData<User>> {
    return this.http.post<ResponseData<User>>(`${config.apiUrl}pub/register`, user)
  }

  forgotPassword(email): Observable<ResponseData<User>> {
    return this.http.post<ResponseData<User>>(`${config.apiUrl}auth/forgotpassword`, { email })
  }

  resetPassword(newPassword, newPassword2, resettoken): Observable<ResponseData<User>> {
    return this.http.post<ResponseData<User>>(`${config.apiUrl}auth/resetpassword?resettoken=${resettoken}`, { newPassword, newPassword2, })
  }

  viewProfile(): Observable<ResponseData<UserLite>> {
    return this.http.get<ResponseData<UserLite>>(`${config.apiUrl}auth/profile`)
  }

  changePassword(password): Observable<ResponseData<Password>> {
    return this.http.post<ResponseData<Password>>(`${config.apiUrl}auth/changepassword`, { password })
  }

  profileUpload(files: File) {
    let formData = this.fileFormdata(files);
    return this.postProfilePicUpload(formData);
  }

  fileFormdata(files) {
    let formData: FormData = new FormData();
    formData.append("file", files, files.name);
    return formData;
  }

  postProfilePicUpload(data: FormData): Observable<ResponseData<UserLite>> {
    return this.http.post<ResponseData<UserLite>>(`${config.apiUrl}auth/uploadphoto`, data)
  }
  
 updateAddress(data: BeneficiaryLite): Observable<ResponseData<Address>> {
    return this.http.put<ResponseData<Address>>(`${config.apiUrl}auth/changeaddress`, data)
  }

}

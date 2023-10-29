import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { ResponseData } from '../core/models/base.response.model';
import { TokenLite } from '../models/user';
import { config } from './../config';

const helper = new JwtHelperService();

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  private readonly jwtToken = 'access_token';
  private readonly refreshToken = 'refresh_token';
  private readonly userObj = 'userObj';

  loggedIn = new BehaviorSubject<boolean>(this.tokenAvailable());
  logValue = new BehaviorSubject<boolean>(this.tokenNotAvailable());

  constructor(private http: HttpClient, private router: Router) { }

  login(user: { password: string, email: string }): Observable<ResponseData<TokenLite>> {
    var results = this.http.post<ResponseData<TokenLite>>(`${config.apiUrl}auth/issue`, user).pipe(tap(res => {
      localStorage.setItem('access_token', res.data.access_token);
    }));
    return results;
  }

  isLoggedIn() {
    return !!this.getJwtToken();
  }

  getJwtToken() {
    return localStorage.getItem(this.jwtToken);
  }

  private tokenAvailable(): boolean {
    return !!localStorage.getItem(this.jwtToken);
  }

  private tokenNotAvailable(): boolean {
    if (!localStorage.getItem(this.jwtToken)) {
      return true;
    }
  }

  doLoginUser(tokens: TokenLite) {
    this.storeTokens(tokens);
  }

  doLogoutUser() {
    this.removeTokens();
  }

  getRefreshToken() {
    var token = localStorage.getItem(this.refreshToken);
    return token;
  }

  storeTokens(tokens: TokenLite) {
    let user = this.decodeJWT(tokens.access_token);
    localStorage.setItem(this.jwtToken, tokens.access_token);
    localStorage.setItem(this.refreshToken, tokens.refresh_token);
    localStorage.setItem(this.userObj, JSON.stringify(user));
  }

  removeTokens() {
    localStorage.removeItem(this.jwtToken);
    localStorage.removeItem(this.userObj);
    localStorage.removeItem(this.refreshToken);
  }

  decodeJWT(access_token: string) {
    let userObj = helper.decodeToken(access_token);
    return userObj;
  }

}

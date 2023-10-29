import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { config } from './../config';
import { TokenLite } from '../models/user'
import { BehaviorSubject, Observable } from 'rxjs';
import { ResponseData } from '../core/models/base.response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly jwtToken = 'access_token';
  private readonly refreshToken = 'refresh_token';
  loggedIn = new BehaviorSubject<boolean>(this.tokenAvailable());
  logValue = new BehaviorSubject<boolean>(this.tokenNotAvailable());

  constructor(private http: HttpClient, private router: Router) { }

  login(user: { password: string, email: string }): Observable<ResponseData<TokenLite>> {
    return this.http.post<ResponseData<TokenLite>>(`${config.apiUrl}auth/issue`, user)
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
    //exact jwt and store in local store as user object
    localStorage.setItem(this.jwtToken, tokens.access_token);
    localStorage.setItem(this.refreshToken, tokens.refresh_token);
  }

  removeTokens() {
    //remove from local store the user object
    localStorage.removeItem(this.jwtToken);
    localStorage.removeItem(this.refreshToken);
  }

}

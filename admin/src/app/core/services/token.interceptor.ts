import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, HttpHeaderResponse, HttpSentEvent, HttpProgressEvent, HttpResponse, HttpUserEvent, HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { config } from '../../config';
import { ToastrService } from 'ngx-toastr';
import { ResponseData } from '../models/base.response.model';
import { TokenLite } from '../../models/user';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(public authService: AuthService, private http: HttpClient, private router: Router, private toastr: ToastrService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {

    if (this.authService.getJwtToken()) {
      request = this.addToken(request, this.authService.getJwtToken());
    }

    return next.handle(request).pipe(catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        this.handle401Error(request, next);
      }
      else if (error instanceof HttpErrorResponse && error.status === 403) {
        var res: HttpErrorResponse = error
        this.toastr.error(res.error.data.key);
      }
      else if (error instanceof HttpErrorResponse && error.status === 404) {
        var res: HttpErrorResponse = error
        this.toastr.error(res.error.data.key);
      }
      else if (error instanceof HttpErrorResponse && error.status === 400) {
        var res: HttpErrorResponse = error
        this.toastr.error(res.error.data.key);
      }
      else {
        this.toastr.error(error.error.data.message);
        return throwError(error);
      }
    }));
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        'Authorization': `${token}`
      }
    });
  }


  private handle401Error(req: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      var refreshToken = this.authService.getRefreshToken()
      this.authService.doLogoutUser();
      const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': refreshToken })
      };
      return this.http.get<ResponseData<TokenLite>>(`${config.apiUrl}/api/auth/refresh`, httpOptions).subscribe(res => {
        var loggedUser: TokenLite = res.data;
        this.authService.doLoginUser(loggedUser)
        this.isRefreshing = false;
        this.refreshTokenSubject.next(res);
        return next.handle(this.addToken(req, loggedUser.access_token)).subscribe();
      });
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(this.addToken(req, token));
        }));
    }
  }
}




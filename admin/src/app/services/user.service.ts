import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { config } from '../config';
import { ResponseData } from '../core/models/base.response.model';
import { UserLite } from '../models/user.model';


@Injectable({
    providedIn: 'root'
  })
  export class UserService {
  
    constructor(private http: HttpClient) { }

    viewProfile(): Observable<ResponseData<UserLite>> {
        return this.http.get<ResponseData<UserLite>>(`${config.apiUrl}auth/profile`)
      }
    
  }
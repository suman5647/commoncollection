import { Injectable } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localedanish from '@angular/common/locales/da'


@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private _locale: string;

  set locale(value: string) {
    this._locale = value;
  }
  get locale(): string {
    return this._locale || "en-US";
  }
  registerCulture(culture: string) {
    if (!culture) {
      return;
    }
    this._locale = culture;

    // Register locale data since only the en-US locale data comes with Angular
    switch (culture) {
      case "da": {
        registerLocaleData(localedanish);
        //localStorage.setItem('locale',"da")
        break;
      }
    }
  }
}

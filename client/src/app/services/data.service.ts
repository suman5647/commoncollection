
import { Injectable, Inject } from '@angular/core';
import { DonationsObj, DonationResponse } from '../models/donation';
import { Observable } from 'rxjs';
import { DOCUMENT  } from '@angular/common';
@Injectable({
    providedIn: 'root'
  })

export class DataService {

    donationObj: DonationsObj = {} as DonationsObj;
    donationResponse: DonationResponse = {} as DonationResponse;
    constructor(@Inject(DOCUMENT) private document: Document){
        let url = document.location.protocol +'//'+ document.location.hostname + ':my_port' ;
    }

    getDonationObj(){
        return this.donationObj;
    }
    setDonationObj(inputObj: DonationsObj) {
        this.donationObj = inputObj;
    }

    getHostname() : string {
        return this.document.location.hostname;
    }

    setDonationResponseObj(inputObj: DonationResponse){
        this.donationResponse = inputObj;
    }

     getDonationResponseObj(){
         return this.donationResponse;
     }

     clearLocalStorage() {
        localStorage.removeItem('other');
        localStorage.removeItem('customtip')
        localStorage.removeItem('backClicked');
        localStorage.removeItem('tipselected');
        localStorage.removeItem('amount');
        localStorage.removeItem('tipAmount');
        localStorage.removeItem('paymentType');
        localStorage.removeItem('currency');
        localStorage.removeItem('donationOccurance');
        localStorage.removeItem('firstName');
        localStorage.removeItem('lastName');
        localStorage.removeItem('email');
        localStorage.removeItem('address');
        localStorage.removeItem('country');
        localStorage.removeItem('city');
        localStorage.removeItem('pinCode');
        localStorage.removeItem('phone');
        localStorage.removeItem('comments');
        localStorage.removeItem('commentsValue');
        localStorage.removeItem('donateAnonymously');
        localStorage.removeItem('donateAnonymouslyValue');
      }
}
import { CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import { NgxGalleryImage, NgxGalleryOptions } from 'ngx-gallery-9';
import { ToastrService } from 'ngx-toastr';
import { PageData } from 'src/app/core/models/base.response.model';
import { Address } from 'src/app/core/models/common';
import { Case, CaseDonation } from 'src/app/models/case';
import { DonationsObj } from 'src/app/models/donation';
import { Rating } from 'src/app/models/rating.model';
import { Beneficiary } from 'src/app/models/user';
import { UserLite } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { CaseService } from 'src/app/services/case.service';
import { DataService } from 'src/app/services/data.service';
import { PreviousRouteService } from 'src/app/services/previous-route.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-donate-page',
  templateUrl: './donate-page.component.html',
  styleUrls: ['./donate-page.component.css'],
})

export class DonatePageComponent implements OnInit {

  model: UserLite = {} as UserLite;
  show: boolean = false;
  cases: Case[];
  tipAmount: number;
  form: FormGroup;
  case: Case;
  showCAnonymousField: boolean = false;
  showCommentField: boolean = false;
  donationObj: DonationsObj = {} as DonationsObj;
  caseId: string;
  paymentTypes: any = ['Crypto'];
  currencies: any = ['BTC', 'LTC'];
  paymentMethods = [
    { name: 'Bank', activeCurrencies: ['DKK', 'EUR'] },
    { name: 'Crypto', activeCurrencies: ['BTC', 'LTC'] },
    { name: 'Credit Card', activeCurrencies: ['AED', 'ARS', 'AUD', 'BHD', 'CAD', 'CHF', 'CLP', 'CNY', 'CRC', 'CZK', 'DKK', 'EUR', 'GBP', 'GEL', 'GTQ', 'HKD', 'HUF', 'INR', 'JOD', 'JPY', 'KRW', 'KWD', 'KZT', 'MDL', 'MXN', 'NOK', 'NZD', 'PHP', 'RSD', 'SEK', 'SGD', 'TWD', 'VND', 'ZAR'] }
  ];
  selectedAmount;
  selectedTipAmount;
  amountRadioButton: string;
  amountdisabled: boolean = false;
  tipAmountRadioButton: string;
  tipAmountdisabled: boolean = false;
  selectedLink: string;
  selectedLinkTip: string;
  calculatedTip: number = 0;
  calculatedTip0: string = '$0';
  calculatedTip5: string = '$0';
  calculatedTip10: string = '$0';
  previousUrl: string;
  previousRoute: string[];
  userAmount;
  userTipAmount;
  minimumTip: boolean = false;
  beneficiary: Beneficiary;
  ratingDisabled: boolean = false;
  profileEmail: String;
  userId: string;
  snapshot: RouterStateSnapshot;
  donors: CaseDonation[];
  caseID: string;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = new Array<NgxGalleryImage>();
  ratings: Rating[] = [];
  userrating: Rating = {} as Rating;
  page: number = 1;
  count: number;
  pageData: PageData;
  formatedtotalDonation: string;
  userLang: string;
  strLocale: string;
  constructor(private caseService: CaseService,
    private userService: UserService,
    private auth: AuthService,
    private toastr: ToastrService, private _route: ActivatedRoute, private dataService: DataService,
    private currencyPipe: CurrencyPipe, public router: Router, private previousRouteService: PreviousRouteService) {
  }


  ngOnInit() {
    this.caseId = this._route.snapshot.params['caseId'];
    this.previousUrl = this.previousRouteService.getPreviousUrl();
    this.viewDetailCase(this.caseId);
    this.previousRoute = this.previousUrl.split("/");
    if (this.previousRoute[1] === 'donate-confirm') {
      this.getFromLocalStoreage();
      this.dataService.clearLocalStorage();

    } else {
      this.loadAccount();
    }

    this.viewDetailCase(this.caseId);
  }

  loadUserProfile(userId) {
    this.caseService.getBeneficiary(userId).subscribe(res => {
      this.beneficiary = res.data;

    })
  }

  viewDetailCase(caseID: string) {
    this.caseService.caseDetail(caseID).subscribe(
      res => {
        this.case = res.data;
        this.loadProfile(this.case.beneficiary.userId);
        this.userLang = navigator.language;
        if (this.case.rating) {
          this.count = this.case.rating.count;
        }
        if (this.case.attachments.length > 0) {
          for (let i = 0; i < this.case.attachments.length; i++)
            this.galleryImages.push(
              {
                small: this.case.attachments[i].thumb,
                medium: this.case.attachments[i].original,
                big: this.case.attachments[i].original
              });
        }
      }
    )
  }

  fbShare() {
    window.open("https://www.facebook.com/sharer/sharer.php?u=" + window.location.href, "_blank");
  }
  twShare() {
    window.open("https://twitter.com/intent/tweet?url=" + window.location.href, "_blank");
  }

  openWindow(address: Address) {
    window.open("https://www.google.dk/maps/place/" + address.place + ',' + address.city + ',' + address.country, "_blank", 'toolbar=1,scrollbars=1,location=1,statusbar=0,menubar=1,resizable=1,width=800,height=600');
  }

  scrollToElement(): void {
    const element = document.querySelector("#destination2")
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  onScroll() {
    if (this.pageData.next) {
      this.page = this.page + 1;
    }
  }

  toggle() {
    if (!this.auth.getJwtToken()) {
      this.router.navigate(["/login"], { queryParams: { returnUrl: this.snapshot.url } });
    }
  }

  loadProfile(userId) {
    this.caseService.getBeneficiary(userId).subscribe(res => {
      this.beneficiary = res.data;
    })
  }

  rateCase(sendRating: NgForm) {
    this.caseService.saveCaseRating(this.caseId, this.userrating).subscribe(res => {
      if (res.status == 200) {
        this.toastr.success("Rate Posted Successfully");
        sendRating.reset();
        this.ratings = [];
        this.page = 1;
        this.galleryImages = [];
        this.viewDetailCase(this.caseID);
      }
    })
  }

  showMessage() {
    this.toastr.info('End Receivers seeks donations directly and for their own purpose.');
  }


  activeCurrencies = [];
  paymentMethodChange(e) {
    this.paymentMethods.filter(res => {
      var eventValue: string = (e.target.value.split(' ')[1] == 'Credit') ? e.target.value.split(' ')[1] + ' ' + e.target.value.split(' ')[2] : e.target.value.split(' ')[1];
      if (res.name == eventValue) {
        this.activeCurrencies = res.activeCurrencies;
      }
    })
  }

  loadAccount() {
    this.userService.viewProfile().subscribe(res => {
      if (res.data != null) {
        this.donationObj.email = res.data.email;
        this.donationObj.firstName = res.data.firstName;
        this.donationObj.lastName = res.data.lastName;
        this.donationObj.phone = res.data.phone;
        this.donationObj.address = res.data.addressLine1 + '' + res.data.addressLine2;
        this.donationObj.city = res.data.city;
        this.donationObj.country = res.data.country;
        this.donationObj.pinCode = res.data.pinCode
      }
    });
  }

  donate() {
    this.donationObj.baseFiatCurrency = 'USD'; //todo not hard-code, come from user fill details
    if (this.showCAnonymousField) {
      this.donationObj.isAnonymously = true;
    }
    this.donationObj.currency = this.donationObj.currency;
    if (this.selectedLink != undefined) {
      if (this.selectedLink.localeCompare('other') == 0) {
        this.userAmount = this.donationObj.amount;
        this.donationObj.amount = this.parseFloatFromString(this.donationObj.amount);
        this.donationObj.amount = this.transformAmount(this.donationObj.amount);
      }
    }
    if (this.selectedLinkTip != undefined) {
      if (this.selectedLinkTip.localeCompare('customtip') == 0) {
        //converting the localeNumber to standard number
        this.userTipAmount = this.donationObj.tipAmount;
        this.donationObj.tipAmount = this.parseFloatFromString(this.donationObj.tipAmount);
        this.donationObj.tipAmount = this.transformAmount(this.donationObj.tipAmount);
      } else {
        let value = Number(this.selectedLinkTip);
        let userAmount = Number(this.donationObj.amount.substr(1));
        let tipAmount = this.calculateFormatedValue(userAmount * (value / 100));
        this.donationObj.tipAmount = tipAmount;
      }
    }
    this.storeToLocalStorage();
    this.dataService.setDonationObj(this.donationObj);
  }


  setradio(e: string): void {
    this.selectedLink = e;
  }

  isSelected(name: string): boolean {
    if (!this.selectedLink) { // if no radio button is selected, always return false so every nothing is shown  
      return false;
    }
    return (this.selectedLink === name); // if current radio button is selected, return true, else return false  
  }

  settipratio(e: string): void { //directly get value
    this.selectedLinkTip = e;
  }

  transformAmount(value: string) {
    let amount = '$' + value;
    return amount;
  }

  isSelectedTip(name: string): boolean {
    if (!this.selectedLinkTip) { // if no radio button is selected, always return false so every nothing is shown  
      return false;
    }
    return (this.selectedLinkTip === name); // if current radio button is selected, return true, else return false  
  }

  validateTip(userValue) {
    let minimumValue = Number(this.calculatedTip5.substr(1));
    if (userValue < minimumValue) {
      this.minimumTip = true;
    }
  }

  //calculate user tip values
  updateTip(str: string, value?: string) {
    let userAmountValue
    if (str.localeCompare('customamount') == 0) {
      //10
      value = this.parseFloatFromString(value.toString());
      userAmountValue = Number(value);
      this.calculateTips(userAmountValue);
    } else {
      //$10
      userAmountValue = Number(value.substr(1));
      this.calculateTips(userAmountValue);
    }
  }

  calculateFormatedValue(value: number) {
    let amount = value.toFixed(2);
    return this.transformAmount(amount.toString());
  }
  calculateTips(value: number) {
    this.calculatedTip0 = this.calculateFormatedValue(value * (0 / 100));
    this.calculatedTip5 = this.calculateFormatedValue(value * (5 / 100));
    this.calculatedTip10 = this.calculateFormatedValue(value * (10 / 100));
  }

  //localize values to normal amount values
  parseFloatFromString(value, coerce: boolean = true) {
    value = String(value).trim();

    if ('' === value) {
      return value;
    }

    // check if the string can be converted to float as-is
    var parsed = parseFloat(value);
    if (String(parsed) === value) {
      return this.fixDecimals(parsed, 2);
    }

    // replace arabic numbers by latin
    value = value
      // arabic
      .replace(/[\u0660-\u0669]/g, function (d) {
        return d.charCodeAt(0) - 1632;
      })

      // persian
      .replace(/[\u06F0-\u06F9]/g, function (d) {
        return d.charCodeAt(0) - 1776;
      });

    // remove all non-digit characters
    var split = value.split(/[^\dE-]+/);

    if (1 === split.length) {
      // there's no decimal part
      return this.fixDecimals(parseFloat(value), 2);
    }

    for (var i = 0; i < split.length; i++) {
      if ('' === split[i]) {
        return coerce ? this.fixDecimals(parseFloat('0'), 2) : NaN;
      }
    }

    // use the last part as decimal
    var decimal = split.pop();

    // reconstruct the number using dot as decimal separator
    return this.fixDecimals(parseFloat(split.join('') + '.' + decimal), 2);
  }

  fixDecimals(num, precision) {
    return (Math.floor(num * 100) / 100).toFixed(precision);
  }

  storeToLocalStorage() {
    if (this.selectedLink === 'other') {
      localStorage.setItem('other', this.selectedLink);
      localStorage.setItem('amount', this.userAmount);
    } else {
      localStorage.setItem('amount', this.donationObj.amount);
    }
    if (this.selectedLinkTip === 'customtip') {
      localStorage.setItem('customtip', this.selectedLinkTip);
      localStorage.setItem('tipAmount', this.userTipAmount);
    } else {
      localStorage.setItem('tipselected', this.selectedLinkTip);
      localStorage.setItem('tipAmount', this.donationObj.tipAmount);
    }
    localStorage.setItem('backClicked', 'true');
    localStorage.setItem('paymentType', this.donationObj.paymentType);
    localStorage.setItem('currency', this.donationObj.currency);
    localStorage.setItem('donationOccurance', this.donationObj.donateOccurance);
    localStorage.setItem('firstName', this.donationObj.firstName);
    localStorage.setItem('lastName', this.donationObj.lastName);
    localStorage.setItem('email', this.donationObj.email);
    localStorage.setItem('address', this.donationObj.address);
    localStorage.setItem('country', this.donationObj.country);
    localStorage.setItem('city', this.donationObj.city);
    localStorage.setItem('pinCode', this.donationObj.pinCode);
    localStorage.setItem('phone', this.donationObj.phone);
    if (this.showCAnonymousField) {
      localStorage.setItem('donateAnonymously', 'true');
      localStorage.setItem('donateAnonymouslyValue', this.donationObj.donationAnonymously);
    }
    if (this.showCommentField) {
      localStorage.setItem('comments', 'true');
      localStorage.setItem('commentsValue', this.donationObj.comment);
    }

  }

  getFromLocalStoreage() {
    let other = localStorage.getItem('other');
    let customtip = localStorage.getItem('customtip');
    let comments = localStorage.getItem('comments');
    let donateAnonymously = localStorage.getItem('donateAnonymously');
    if (other || other != undefined) {
      this.selectedLink = other;
      this.donationObj.amount = localStorage.getItem('amount');
      this.updateTip('customamount', this.donationObj.amount)
    } else {
      this.donationObj.amount = localStorage.getItem('amount');
      this.updateTip('amount', this.donationObj.amount);
    }
    if (customtip || customtip != undefined) {
      this.selectedLinkTip = customtip;
      this.donationObj.tipAmount = localStorage.getItem('tipAmount');
    } else {
      this.selectedLinkTip = localStorage.getItem('tipselected');
      this.donationObj.tipAmount = localStorage.getItem('tipAmount');
    }
    if (comments || comments != undefined) {
      this.showCommentField = true;
      this.donationObj.comment = localStorage.getItem('commentsValue');
    }
    if (donateAnonymously || donateAnonymously != undefined) {
      this.showCAnonymousField = true;
      this.donationObj.donationAnonymously = localStorage.getItem('donateAnonymouslyValue');
    }
    this.donationObj.paymentType = localStorage.getItem('paymentType');
    this.paymentMethods.filter(res => {
      var eventValue: string = (this.donationObj.paymentType == 'Credit') ? this.donationObj.paymentType + ' ' + this.donationObj.paymentType : this.donationObj.paymentType;
      if (res.name == eventValue) {
        this.activeCurrencies = res.activeCurrencies;
      }
    })
    this.donationObj.currency = localStorage.getItem('currency');
    this.donationObj.donateOccurance = localStorage.getItem('donationOccurance');
    this.donationObj.firstName = localStorage.getItem('firstName');
    this.donationObj.lastName = localStorage.getItem('lastName');
    this.donationObj.email = localStorage.getItem('email');
    this.donationObj.address = localStorage.getItem('address');
    this.donationObj.country = localStorage.getItem('country');
    this.donationObj.city = localStorage.getItem('city');
    this.donationObj.pinCode = localStorage.getItem('pinCode');
    this.donationObj.phone = localStorage.getItem('phone');
  }

}
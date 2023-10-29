import { Component, OnInit, Input, Inject } from '@angular/core';
import { CaseService } from 'src/app/services/case.service';
import { Case, CaseDonate, DonateResponse } from 'src/app/models/case';
import { UserLite } from 'src/app/models/user.model';
import { DonationsObj, DonationResponse } from 'src/app/models/donation';
import { Benefactor, Beneficiary, Cases } from 'src/app/models/user';
import { DataService } from 'src/app/services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
//import { SocketService } from 'src/app/services/socket.service';
import { AuthService } from 'src/app/services/auth.service';
import { DecimalPipe } from '@angular/common';
import { DOCUMENT } from '@angular/common';
// This lets me use jquery
declare var $: any;
@Component({
  selector: 'app-donate-confirm',
  templateUrl: './donate-confirm.component.html',
  styleUrls: ['./donate-confirm.component.css']
})
export class DonateConfirmComponent implements OnInit {
  private url: string;
  donationObject: DonationsObj;
  model: UserLite;
  show: boolean = false;
  acutalCryptoValue: string = '';
  amountInCrypto: number = 0;
  amountInFiat: number = 0;
  tipAmountInCrypto: number = 0;
  tipAmountInFiat: number = 0;
  adminstrationPercentage: number = 0.05; //5% PERCENT
  adminstrationAmtInCrypto: number = 0;
  adminstrationAmtInFiat: number = 0;
  adminstrationAmt: string;
  caseId: string = '';
  result: CaseDonate = {} as CaseDonate;
  qrcode: string = '';
  address: string = '';
  donationAmount: string = '';
  totalAmountInFiat: number = 0;
  totalAmountInCrypto: number = 0;
  isBack: boolean = false;
  id;
  MonniUrl: string;
  case: Case;
  currency: string;
  totalDonationDonated: number;
  totalDonationReceived: number;
  formatedtotalDonation: string;
  userId: number;
  person: Beneficiary | Benefactor = {} as Beneficiary | Benefactor;
  isProfileEmpty: boolean;
  activeDigtialcurrencies: string[] = ['BTC', 'LTC'];
  activeFiatCurrencies: string[] = ['AED', 'ARS', 'AUD', 'BHD', 'CAD', 'CHF', 'CLP', 'CNY', 'CRC', 'CZK', 'DKK', 'EUR', 'GBP', 'GEL', 'GTQ', 'HKD', 'HUF', 'INR', 'JOD', 'JPY', 'KRW', 'KWD', 'KZT', 'MDL', 'MXN', 'NOK', 'NZD', 'PHP', 'RSD', 'SEK', 'SGD', 'TWD', 'USD', 'VND', 'ZAR',];
  constructor(private caseService: CaseService,
    private dataService: DataService,
    private route: ActivatedRoute,
    //private socketService: SocketService,
    private router: Router,
    private decimalPipe: DecimalPipe,
    @Inject(DOCUMENT) private document: Document,
    private authService: AuthService) {
    this.url = document.location.protocol + '//' + document.location.hostname + '/success';
  }


  ngOnInit() {
    this.caseId = this.route.snapshot.params['caseId'];
    this.route.params.subscribe(routeParams => { this.userId = routeParams['userId'] });
    this.getCaseBeneficiary();
    this.donationObject = this.dataService.getDonationObj();
    if (this.donationObject.donationAnonymously === undefined) {
      this.donationObject.donationAnonymously = '12345'
    }
    this.amountInFiat = Number(this.donationObject.amount.substr(1)); //$10 => 10
    this.amountInFiat = Number(this.amountInFiat.toFixed(2)); //10 => 10.00
    this.donationObject.amount = this.calculateFormatedValue(this.amountInFiat); //$20 => $20.00
    this.tipAmountInFiat = Number(this.donationObject.tipAmount.substr(1)); //$2 => 2 
    this.tipAmountInFiat = Number(this.tipAmountInFiat.toFixed(2)); //2 => 2.00
    if (this.tipAmountInFiat == 0) {
      this.adminstrationAmtInFiat = this.adminstrationPercentage * this.amountInFiat;
      this.adminstrationAmt = this.calculateFormatedValue(this.adminstrationAmtInFiat);
      this.totalAmountInFiat = this.amountInFiat + this.adminstrationAmtInFiat; //10 + 5
      this.donationObject.totalAmount = this.calculateFormatedValue(this.totalAmountInFiat); // 12.00 => $12.00
    } else {
      this.totalAmountInFiat = this.amountInFiat + this.tipAmountInFiat; //10 + 2
      this.donationObject.totalAmount = this.calculateFormatedValue(this.totalAmountInFiat); // 12.00 => $12.00
    }
    this.getFiatRates();
    
  }

  ngOnDestroy() {
    //this.socketService.disconnectSocket();
    clearInterval(this.id)
    // this.socketService.disconnectSocket();
  }

  getCaseBeneficiary() {
    this.caseService.getCaseHolder(this.caseId.toString()).subscribe(res => {
      this.person = res.data;
      console.log(this.person);
      if (this.person.basic.profilePhoto == undefined) {
        this.isProfileEmpty = true;
      }
    });
    this.caseService.caseDetail(this.caseId.toString()).subscribe(res => {
      this.case = res.data;
      this.currency = res.data.baseCurrency;
      var userLang = navigator.language;
      this.totalDonationReceived = res.data.totalCaseDonation;
      this.formatedtotalDonation = this.decimalPipe.transform(res.data.totalCaseDonation, "1.2-2", userLang);
    })
  }

  checkDonationReceived() {
    this.caseService.donateConfirmation(this.caseId, this.donationAmount, this.address, this.donationObject.currency).subscribe((res) => {
      if (res.status == 200 && res.data.isPaid) {
        let responseData: DonationResponse = {
          caseId: res.data.caseId,
          txHash: res.data.txHash,
          orderId: res.data.orderId
        }
        this.dataService.setDonationResponseObj(responseData);
        this.hideModal();
        this.router.navigateByUrl(`/donate-thank-you/${this.caseId}`);
      }
    })
  }
  getFiatRates() {
    this.caseService.getFiatRates(this.donationObject.baseFiatCurrency, this.donationObject.currency).subscribe((data) => {
      let donationCurrencyisDigital = this.checkisDigitalCurrency(this.donationObject.currency);
      let baseCurrencyisDigital = this.checkisDigitalCurrency(this.donationObject.baseFiatCurrency);

      let donationCurrencyIsFiat = this.checkisFiatCurrency(this.donationObject.currency);
      let baseCurrencyIsFiat = this.checkisFiatCurrency(this.donationObject.baseFiatCurrency);
      let rateValue;
      if (donationCurrencyisDigital && baseCurrencyisDigital) {
        rateValue = data.data.cryptoQuoteEurRate;
      } else if (donationCurrencyisDigital && baseCurrencyIsFiat) {
        rateValue = data.data.fiatQuoteValue;
      } else if (donationCurrencyIsFiat && baseCurrencyIsFiat) {
        rateValue = data.data.baseQuoteValue;
      } else {
        rateValue = data.data.cryptoQuoteValue;
      }
      //converting the donation amount into crypto values
      this.amountInCrypto = this.AmountFixed(this.amountInFiat * rateValue, this.donationObject.currency);
      this.donationObject.donationAmountFormated = this.amountInCrypto;
      //converting the tip amount into crypto values
      if (this.tipAmountInFiat == 0) {
        this.adminstrationAmtInCrypto = this.AmountFixed(this.adminstrationAmtInFiat * rateValue, this.donationObject.currency);
        this.donationObject.tipAmountFormated = this.adminstrationAmtInCrypto;
      } else {
        this.tipAmountInCrypto = this.AmountFixed(this.tipAmountInFiat * rateValue, this.donationObject.currency);
        this.donationObject.tipAmountFormated = this.tipAmountInCrypto;
      }
      //total amount sum of (donation and tip)
      this.totalAmountInCrypto = this.AmountFixed(this.donationObject.donationAmountFormated + this.donationObject.tipAmountFormated, this.donationObject.currency);
      this.donationObject.totalAmountFormated = this.totalAmountInCrypto;
    })
  }

  AmountFixed(value: number, currency: string) {
    if (this.checkisDigitalCurrency(currency)) {
      let amount = value.toFixed(8);
      return Number(amount);
    }
    if (this.checkisFiatCurrency(currency)) {
      let amount = value.toFixed(0);
      return Number(amount);
    }

  }

  checkisDigitalCurrency(currency: string) {
    if (this.activeDigtialcurrencies.includes(currency)) {
      return true;
    } else {
      return false;
    }
  }

  checkisFiatCurrency(currency: string) {
    if (this.activeFiatCurrencies.includes(currency)) {
      return true;
    } else {
      return false;
    }
  }
  donate() {
    if (this.donationObject.paymentType === 'Crypto') {
      this.donationObject.url = this.url;
      this.caseService.donate(this.donationObject, this.caseId).subscribe(res => {
        if (res.status == 200) {
          this.result = res.data;
          this.qrcode = this.result.qrcodeImg;
          this.address = this.result.address;
          this.donationAmount = this.result.amount;
          this.showModal();
          var timesRun = 0;
          //ping the rest api for every 20 secs and for maximum time of 5 mins
          this.id = setInterval(() => {
            timesRun += 1;
            if (timesRun > 10) {
              clearInterval(this.id);
              this.hideModal();
              this.showTimeModal();
            } else {
              this.checkDonationReceived();
            }

          }, 20000); //20000msec = 20secs
        }
      })
    }
    else if (this.donationObject.paymentType === 'Bank') {
      let name = this.donationObject.firstName + ' ' + this.donationObject.lastName;
      this.donationObject.digitalCurrency = 'BTC';
      this.donationObject.url = this.url;
      this.caseService.donate(this.donationObject, this.caseId).subscribe(res => {
        if (res.status == 200) {
          this.result = res.data;
          this.address = this.result.address;
          this.donationAmount = this.result.amount;
          this.MonniUrl = `${this.result.monniUrl}/?paymentMethod=${this.donationObject.paymentType}&amount=${this.totalAmountInCrypto}&currency=${this.donationObject.currency}&cryptoAddress=${this.result.address}&name=${name}&email=${this.donationObject.email}&referenceId=${this.result.orderId}&merchantCode=${"CC"}&returnUrl=${this.result.returnUrl}/api/v1/success`;
          //redirect to monni url
          this.document.location.href = this.MonniUrl;
        }
      })
    }
    else if (this.donationObject.paymentType === 'Credit Card') {
      let name = this.donationObject.firstName + ' ' + this.donationObject.lastName;
      this.donationObject.digitalCurrency = 'BTC';
      this.donationObject.url = this.url;
      this.caseService.donate(this.donationObject, this.caseId).subscribe(res => {
        if (res.status == 200) {
          this.result = res.data;
          this.address = this.result.address;
          this.donationAmount = this.result.amount;
          this.MonniUrl = `${this.result.monniUrl}/?paymentMethod=${this.donationObject.paymentType.toString().replace(/ /g,'')}&amount=${this.totalAmountInCrypto}&currency=${this.donationObject.currency}&cryptoAddress=${this.result.address}&name=${name}&email=${this.donationObject.email}&referenceId=${this.result.orderId}&merchantCode=${"CC"}&returnUrl=${this.result.returnUrl}/api/v1/success`;
          //redirect to monni url
          this.document.location.href = this.MonniUrl;
        }
      })

    }
  }

  showModal(): void {
    $('#myCryptoModal').modal({
      backdrop: 'static',
      keyboard: false
})
    $("#myCryptoModal").modal('show');
    
  }
  showTimeModal(): void {
    $('#myTimeOutModal').modal({
      backdrop: 'static',
      keyboard: false })
    $("#myTimeOutModal").modal('show');
    
  }
  hideModal(): void {
    document.getElementById('close-modal').click();
    clearInterval(this.id);
    //this.socketService.disconnectSocket();
  }

  hideModal1(): void {
    document.getElementById('close-modal1').click();
    //   this.socketService.disconnectSocket();
  }

  transformAmount(value: string) {
    let amount = '$' + value;
    return amount;
  }

  calculateFormatedValue(value: number) {
    let amount = value.toFixed(0);
    return this.transformAmount(amount.toString());
  }

}

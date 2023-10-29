import { Component, OnInit, Input } from '@angular/core';
import { CaseService } from 'src/app/services/case.service';
import { Case, CaseDonation } from 'src/app/models/case';
import { UserService } from 'src/app/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { FileService } from 'src/app/core/services/file.service';
import { UserLite } from 'src/app/models/user.model';
import { DataService } from 'src/app/services/data.service';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery-9';
import { Rating } from 'src/app/models/rating.model';
import { AuthService } from 'src/app/services/auth.service';
import { NgForm } from '@angular/forms';
import { PageData } from 'src/app/core/models/base.response.model';
import { Beneficiary } from 'src/app/models/user';


@Component({
  selector: 'app-donate-thank-you',
  templateUrl: './donate-thank-you.component.html',
  styleUrls: ['./donate-thank-you.component.css']
})
export class DonateThankYouComponent implements OnInit {

  name: string;
  paymentType: string;
  amount: number;
  orderId: string;
  txHash: string;
  currency: string;
  LinkTxHash: string;
  caseId: string;
  pages: number[] = [];
  cases: Case[];
  pageno: number = 1;
  perPage: number = 8;
  totalPages: number;
  caseLength: number;
  ratingDisabled: boolean = false;
  profileEmail: String;
  userId: string;
  snapshot: RouterStateSnapshot;
  case: Case;
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
  beneficiary: Beneficiary;
  constructor(private dataService: DataService,
   private _route: ActivatedRoute, 
   private caseService: CaseService,
   private router: Router,
   private toastr: ToastrService,
   private auth: AuthService) {
  }

  ngOnInit() {
    this.caseID = this._route.snapshot.params['caseId'];
    this.viewDetailCase(this.caseID);
    this.getCases();
    this.caseId = this._route.snapshot.params['caseId'];
    this.getDonorName();
    this.dataService.clearLocalStorage();
    
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
        if (this.count > 0) {
          this.caseRating();
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
  caseRating() {
    this.caseService.getCaseRating(this.caseID, this.page).subscribe(res => {
      this.pageData = res.meta;
      for (let i = 0; i < res.data.length; i++) {
        this.ratings.push(res.data[i]);
      }
    })
  }
  

  scrollToElement(): void {
    const element = document.querySelector("#destination2")
if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    console.log(element);
  }

  onScroll() {
    if (this.pageData.next) {
      this.page = this.page + 1;
      this.caseRating();
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
    this.caseService.saveCaseRating(this.caseID, this.userrating).subscribe(res => {
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

  getCases() {
    this.pageno = 1;
    this.perPage = 4;
    this.caseService.viewCase(this.pageno, this.perPage).subscribe(res => {
      this.cases = res.data;
      this.caseLength = res.meta.totalItems;
      this.totalPages = Math.round(this.caseLength / this.perPage);
      for (let k = 1; k <= this.totalPages; k++) {
        this.pages.push(k);
      }
    })
  }

  getDonorName() {
    let donorObj = this.dataService.getDonationObj();
    let donorResObj = this.dataService.getDonationResponseObj();
    this.name = donorObj.firstName + ' ' + donorObj.lastName;
    this.paymentType = donorObj.paymentType;
    this.currency = donorObj.currency;
    this.amount = donorObj.donationAmountFormated;
    this.txHash = donorResObj.txHash;
    if ((this.paymentType.localeCompare('Crypto') == 0) && (this.currency.localeCompare('BTC') == 0)) {
      this.LinkTxHash = 'https://blockexplorer.one/btc/testnet/tx/' + donorResObj.txHash;
    }
    if ((this.paymentType.localeCompare('Crypto') == 0) && (this.currency.localeCompare('LTC') == 0)) {
      this.LinkTxHash = 'https://blockexplorer.one/ltc/testnet/tx/' + donorResObj.txHash;
    }
    this.orderId = donorResObj.orderId;
  }

  isCryptoPayment() {
    if (!this.paymentType) {
      return false;
    }
    return (this.paymentType === 'Crypto');
  }
}

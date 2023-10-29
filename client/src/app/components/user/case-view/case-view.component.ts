import { Component, OnInit, Inject, LOCALE_ID, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import { CaseService } from 'src/app/services/case.service';
import { Case, CaseDonation, CasePhotoStatus } from 'src/app/models/case';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery-9';
import { Rating } from 'src/app/models/rating.model';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { PageData } from 'src/app/core/models/base.response.model';
import { UserService } from 'src/app/services/user.service';
import { Beneficiary } from 'src/app/models/user';


@Component({
  selector: 'app-case-view',
  templateUrl: './case-view.component.html',
  styleUrls: ['./case-view.component.css']
})
export class CaseviewComponent implements OnInit, AfterViewInit {
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
  facebook_id: string;

  constructor(private _route: ActivatedRoute,
    private caseService: CaseService,
    private userService: UserService,
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService,
    @Inject(LOCALE_ID) private locale: string) {
    this.snapshot = router.routerState.snapshot;
  }

  ngOnInit() {
    this.caseID = this._route.snapshot.params['caseId'];
    this.viewDetailCase(this.caseID);
    this.galleryOptions = [
      {
        width: '100%',
        height: '600px',
        thumbnailsColumns: 8,
        imageAnimation: NgxGalleryAnimation.Slide
      },
      // max-width 800
      {
        breakpoint: 800,
        width: '100%',
        height: '600px',
        imagePercent: 80,
        thumbnailsPercent: 20,
        thumbnailsMargin: 20,
        thumbnailMargin: 20
      },
      // max-width 400
      {
        breakpoint: 400,
        preview: true
      }
    ];

  }

  ngAfterViewInit() {
    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.4";

      if (d.getElementById(id)) {
        //if <script id="facebook-jssdk"> exists
        delete (<any>window).FB;
        fjs.parentNode.replaceChild(js, fjs);
      } else {
        fjs.parentNode.insertBefore(js, fjs);
      }
    }(document, 'script', 'facebook-jssdk'));
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
          for (let i = 0; i < this.case.attachments.length; i++) {
            if (this.case.attachments[i].status !== CasePhotoStatus.Obsolete) {
              //works for seeding data
              if (this.case.attachments[i]?.status === undefined) {
                this.galleryImages.push(
                  {
                    small: this.case.attachments[i].thumb,
                    medium: this.case.attachments[i].original,
                    big: this.case.attachments[i].original
                  });
              } else {
                this.galleryImages.push(
                  {
                    small: this.case.attachments[i].thumb,
                    medium: this.case.attachments[i].original,
                    big: this.case.attachments[i].original
                  });
              }

            }
          }
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
      if (this.beneficiary.reqProfile.socialMedialLinks.length > 0 && this.beneficiary.reqProfile.socialMedialLinks[0].code == 'FB')
        this.facebook_id = this.beneficiary.reqProfile.socialMedialLinks[0].text.split(".com/").pop();
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

  openWindow() {
    window.open("https://www.google.dk/maps/place/" + this.case.address.place + ',' + this.case.address.city + ',' + this.case.address.country, "_blank", 'toolbar=1,scrollbars=1,location=1,statusbar=0,menubar=1,resizable=1,width=800,height=600');
  }

}
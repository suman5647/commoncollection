import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import { CaseService } from 'src/app/services/case.service';
import { Case, CaseDonation } from 'src/app/models/case';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery-9';
import { Rating, RatingStatus } from 'src/app/models/rating.model';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { PageData } from 'src/app/core/models/base.response.model';
import { UserService } from 'src/app/services/user.service';
import { Beneficiary } from 'src/app/models/user';


@Component({
  selector: 'app-reviews-case',
  templateUrl: './reviews-case.component.html',
  styleUrls: ['./reviews-case.component.css']
})
export class ReviewsCaseComponent implements OnInit {
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
        if (res.data[i].status !== RatingStatus.Obsolete) {
          if (this.case.attachments[i]?.status === undefined) {
            this.ratings.push(res.data[i]);
          } else {
            this.ratings.push(res.data[i]);
          }
        }
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
}
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PageData } from 'src/app/core/models/base.response.model';
import { Case, CaseDocument, CaseDonation } from 'src/app/models/case';
import { Rating } from 'src/app/models/rating.model';
import { Beneficiary } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { CaseService } from 'src/app/services/case.service';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-case-view',
  templateUrl: './case-view.component.html',
  styleUrls: ['./case-view.component.css']
})
export class CaseviewComponent implements OnInit {

  donationsDisplayedColumns: string[] = ['email', 'orderId', 'amount', 'status', 'action'];
  displayedColumns: string[] = ['imageUrl', 'status', 'action'];
  ratingsDisplayedColumns: string[] = ['comments', 'rateOn', 'rating', 'status', 'action'];
  caseAttachments: CaseDocument[];
  ratingDisabled: boolean = false;
  profileEmail: String;
  userId: string;
  snapshot: RouterStateSnapshot;
  case: Case;
  donors: CaseDonation[];
  caseID: string;
  ratings: Rating[] = [];
  userrating: Rating = {} as Rating;
  page: number = 1;
  count: number;
  pageData: PageData;
  formatedtotalDonation: string;
  userLang: string;
  strLocale: string;
  beneficiary: Beneficiary;
  dataSource;
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

  }

  viewDetailCase(caseID: string) {
    this.caseService.caseDetail(caseID).subscribe(
      res => {
        this.case = res.data;
        this.userLang = navigator.language;
        // if (this.case.rating) {
        //   this.count = this.case.rating.count;
        // }
        // if (this.count > 0) {
        this.caseRating();
        // }

        if (this.case.attachments.length > 0) {
          this.caseAttachments = this.case.attachments;
          for (let i = 0; i < this.case.attachments.length; i++) {
            if (this.case.attachments[i]?.status === undefined) {
              this.case.attachments[i].status = "Active"
            }
          }
        }

      }
    )
  }

  caseRating() {
    this.caseService.getCaseRating(this.caseID, this.page).subscribe(res => {
      this.pageData = res.meta;
      this.ratings = res.data;
      for (let i = 0; i < res.data.length; i++) {
        if (this.ratings[i]?.status === undefined) {
          this.ratings[i].status = "Active"
        }
      }
    })
  }

  deleteComments(obj) {
    let ratingId: string = obj._id;
    this.caseService.removeCaseRatings(this.caseID.toString(), ratingId).subscribe(res => {
      if (res.status == 200) {
        this.toastr.success(res.data.toString());
        this.viewDetailCase(this.caseID);
      }
    })
  }

  payout(obj) {
  }

  deleteCasePhoto(obj) {
    let photoUniqueId: string = obj.uniqueName;
    this.caseService.removeCasePhoto(this.caseID.toString(), photoUniqueId).subscribe(res => {
      if (res.status == 200) {
        this.toastr.success(res.data.toString());
        this.viewDetailCase(this.caseID);
      }
    })

  }
}
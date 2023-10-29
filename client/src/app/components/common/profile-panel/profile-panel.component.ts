import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Address, GeoLocation } from 'src/app/core/models/common';
import { RatingSummary } from 'src/app/models/case';
import { Rating } from 'src/app/models/rating.model';
import { Beneficiary } from 'src/app/models/user';
import { Benefactor } from 'src/app/models/user';
import { PreviousRouteService } from 'src/app/services/previous-route.service';

@Component({
  selector: 'app-profile-panel',
  templateUrl: './profile-panel.component.html',
  styleUrls: ['./profile-panel.component.css']
})
export class ProfilePanelComponent implements OnInit {

  @Input('userProfile') userProfile: Beneficiary | Benefactor;
  @Input('DonationAmount') DonationAmount: number;
  @Input('address') address: number;
  @Input('location') location: GeoLocation;
  @Input('rating') rating: RatingSummary;
  @Input('isbeneficiary') isbeneficiary: boolean = true;
  @Input('isbenefactor') isbenefactor: boolean = false;
  @Input('currency') currency: string;
  @Input('agentCommission') agentCommission: string;

  public userLang: string;
  public currentUrl: string;
  public currentRoute: string[];
  public hasCase: boolean = false;
  public caseId: string;
  public hasName: boolean = true;

  constructor(private toastr: ToastrService, private router: Router) { }

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    this.userLang = navigator.language;
    this.currentRoute = this.currentUrl.split("/");
    if (this.currentRoute[1] === 'case-view') {
      this.hasCase = true;
      this.caseId = this.currentRoute[2]
    }
    if (this.currentRoute[1] === 'reviews-case' || this.currentRoute[1] === 'reviews-user') {
      this.caseId = this.currentRoute[2]
      this.isbenefactor = false;
    }
    this.currentRoute = this.currentUrl.split("/");
    if (this.currentRoute[1] === 'benefactor') {
      this.isbenefactor = true;
      this.isbeneficiary = false;
    }
    if (this.currentRoute[1] === 'beneficiary') {
      this.hasName = false;
    }
  }

  showMessage() {
    this.toastr.info('End Receivers seeks donations directly and for their own purpose.');
  }

  openWindow(address: Address) {
    window.open("https://www.google.dk/maps/place/" + address.place + ',' + address.city + ',' + address.country, "_blank", 'toolbar=1,scrollbars=1,location=1,statusbar=0,menubar=1,resizable=1,width=800,height=600');
  }

  ratingMessage() {
    if (this.isbeneficiary) {
      this.router.navigateByUrl(`/reviews-user/${this.userProfile.basic.userId}`);
    }
    else {
      this.toastr.info('To see or give ratings and reviews please select a specific case.');
    }
  }

}

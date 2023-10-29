import { Component, OnInit } from '@angular/core';
import { CaseService } from 'src/app/services/case.service';
import { ActivatedRoute } from '@angular/router';
import { Contact, Beneficiary, Cases } from 'src/app/models/user';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Rating } from 'src/app/models/rating.model';
import { PageData } from 'src/app/core/models/base.response.model';
import { DecimalPipe } from '@angular/common';
import { Address } from 'src/app/core/models/common';
@Component({
  selector: 'app-beneficiary',
  templateUrl: './beneficiary.component.html',
  styleUrls: ['./beneficiary.component.css']
})
export class BeneficiaryComponent implements OnInit {
  beneficiary: Beneficiary;
  cases: Cases[];
  userId: number;
  totalDonationReceived: number;
  model: Contact = {} as Contact;
  showRating: boolean = false;
  ratings: Rating[] = [];
  page: number = 1;
  pageData: PageData;
  facebookLink: string;
  userLang: string;
  instaLink: string;
  formatedtotalDonation: string;
  constructor(private caseService: CaseService, private route: ActivatedRoute, private toastr: ToastrService, private _decimalPipe: DecimalPipe) { }


  ngOnInit() {
    this.userId = this.route.snapshot.params['userId'];
    this.getReceiver();
    this.getReceiverCases();
    this.rating();
  }

  getReceiver() {
    this.caseService.getBeneficiary(this.userId).subscribe(res => {
      this.beneficiary = res.data;
      this.getSocialMediaLinks();
    })
  }

  getSocialMediaLinks() {
    if (this.beneficiary.reqProfile.socialMedialLinks.length > 0) {
      for (let i = 0; i < this.beneficiary.reqProfile.socialMedialLinks.length; i++) {
        if (this.beneficiary.reqProfile.socialMedialLinks[i].text.includes("facebook")) {
          this.facebookLink = this.beneficiary.reqProfile.socialMedialLinks[i].text;
        }
        if (this.beneficiary.reqProfile.socialMedialLinks[i].text.includes("instagram")) {
          this.instaLink = this.beneficiary.reqProfile.socialMedialLinks[i].text;
        }

      }
    }
  }
  getReceiverCases() {
    this.caseService.getBeneficiaryCases(this.userId).subscribe(res => {
      this.cases = res.data;
      this.totalDonationReceived = res.meta.totalDonationReceived;
      this.userLang = navigator.language;
    })

  }

  contactMe(SendRequest: NgForm) {
    this.caseService.contactBeneficiary(this.model, this.userId).subscribe(res => {
      if (res.status == 200) {
        SendRequest.reset();
        this.toastr.success(res.data.toString());
      }
    });
  }

  rating() {
    this.caseService.getBeneficiaryRating(this.userId, this.page).subscribe(res => {
      this.pageData = res.meta;
      for (let i = 0; i < res.data.length; i++)
        this.ratings.push(res.data[i]);
      if (this.ratings) {
        this.showRating = true;
      }

    })
  }

  openWindow(address: Address) {
    window.open("https://www.google.dk/maps/place/" + address.place + ',' + address.city + ',' + address.country, "_blank");
  }

  onScroll() {
    if (this.pageData.next) {
      this.page = this.page + 1;
      this.rating();
    }
  }
}

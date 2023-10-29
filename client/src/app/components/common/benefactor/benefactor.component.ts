import { Component, OnInit } from '@angular/core';
import { CaseService } from 'src/app/services/case.service';
import { ActivatedRoute } from '@angular/router';
import { Contact, Benefactor, Cases } from 'src/app/models/user';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DecimalPipe } from '@angular/common';
@Component({
  selector: 'app-benefactor',
  templateUrl: './benefactor.component.html',
  styleUrls: ['./benefactor.component.css']
})
export class BenefactorComponent implements OnInit {
  benefactor: Benefactor;
  cases: Cases[];
  userId: number;
  totalDonationDonated: number;
  model: Contact = {} as Contact;
  formatedtotalDonation: string;
  userLang: string;
  constructor(private caseService: CaseService, private route: ActivatedRoute, private toastr: ToastrService,  private decimalPipe: DecimalPipe) { }

  ngOnInit() {
    this.userId = this.route.snapshot.params['userId'];
    this.getDonors();
    this.getDonorsCases();
  }

  getDonors() {
    this.caseService.getBenefactor(this.userId).subscribe(res => {
      this.benefactor = res.data;
      this.userLang = navigator.language;
    })
  }

  getDonorsCases() {
    this.caseService.getBenefactorCases(this.userId).subscribe(res => {
      this.cases = res.data;
      this.totalDonationDonated = res.meta.totalDonationDonated;
      var userLang = navigator.language;
      this.formatedtotalDonation = this.decimalPipe.transform(this.totalDonationDonated, "1.2-2", userLang);
    })
  }

  contactMe(SendRequest: NgForm) {
    this.caseService.contactBenefactor(this.model, this.userId).subscribe(res => {
      if (res.status == 200) {
        SendRequest.reset();
        this.toastr.success(res.data.toString());
      }
    });
  }
}

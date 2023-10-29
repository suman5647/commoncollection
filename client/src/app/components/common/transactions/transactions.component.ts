import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RoutesRecognized } from '@angular/router';
import { Benefactor, Beneficiary, Cases } from 'src/app/models/user';
import { CaseService } from 'src/app/services/case.service';
import { ToastrService } from 'ngx-toastr';
import { DecimalPipe } from '@angular/common';
import { PreviousRouteService } from 'src/app/services/previous-route.service';
import { Observable } from 'rxjs';
import { filter, map, pairwise } from 'rxjs/operators';
import { Donations } from 'src/app/models/donation';
import { TransactionList } from 'src/app/core/models/base.response.model';
import { UserLite } from 'src/app/models/user.model';
import { Case } from 'src/app/models/case';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {

  isDonor: boolean;
  isReceiver: boolean;
  isCase: boolean;
  person: Beneficiary | Benefactor = {} as Beneficiary | Benefactor;
  donationList: TransactionList[];
  paidDonationList: TransactionList[] = [];
  unPaidDonationList: TransactionList[] = [];
  //donations: Donations[];
  case: Case;
  currency: string;
  userId: number;
  userRole: string = 'case';
  totalDonationDonated: number;
  totalDonationReceived: number;
  formatedtotalDonation: string;
  totalCaseDonation: number;
  previousRouteUrl: string;
  previousUrl: string;
  isProfileEmpty: boolean;
  userLang: string;
  beneficiary: Beneficiary;
  hasUnpaidDonations: boolean = false;
  allpaidDonations: boolean = false;
  constructor(private caseService: CaseService, private route: ActivatedRoute, private router: Router, private previousRouteService: PreviousRouteService, private toastr: ToastrService, private decimalPipe: DecimalPipe) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(routeParams => { this.userId = routeParams['userId'] });
    this.getCaseList();
    this.getCaseBeneficiary();
  }

  getCaseList() {
    this.caseService.caseTransactionList(this.userId.toString()).subscribe(res => {
      this.donationList = res.data;
      for (let i = 0; i < this.donationList.length; i++) {
        if (this.donationList[i].orderStatus !== 'Paid' && this.donationList[i].orderStatus !== 'Completed') {
          this.hasUnpaidDonations = true;
          this.unPaidDonationList.push(this.donationList[i]);
        } else {
          this.allpaidDonations = true;
          this.paidDonationList.push(this.donationList[i]);
        }
      }
    });
  }

  getCaseBeneficiary() {
    this.caseService.getCaseHolder(this.userId.toString()).subscribe(res => {
      this.person = res.data;
      if (this.person.basic.profilePhoto == undefined) {
        this.isProfileEmpty = true;
      }
    });
    this.caseService.caseDetail(this.userId.toString()).subscribe(res => {
      this.case = res.data;
      this.currency = res.data.baseCurrency;
      var userLang = navigator.language;
      this.totalDonationReceived = res.data.totalCaseDonation;
      this.formatedtotalDonation = this.decimalPipe.transform(res.data.totalCaseDonation, "1.2-2", userLang);
    })
  }
}

import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TransactionList } from 'src/app/core/models/base.response.model';
import { Case } from 'src/app/models/case';
import { Beneficiary } from 'src/app/models/user';
import { CaseService } from 'src/app/services';
import { PreviousRouteService } from 'src/app/services/previous-route.service';

@Component({
  selector: 'app-transaction-beneficiary',
  templateUrl: './transaction-beneficiary.component.html',
  styleUrls: ['./transaction-beneficiary.component.css']
})
export class TransactionBeneficiaryComponent implements OnInit {

  isDonor: boolean;
  person: Beneficiary = {} as Beneficiary;
  donationList: TransactionList[];
  //donations: Donations[];
  case: Case;
  currency: string;
  userId: number;
  userRole: string = 'beneficiary';
  totalDonationDonated: number;
  totalDonationReceived: number;
  formatedtotalDonation: string;
  totalCaseDonation: number;
  previousRouteUrl: string;
  previousUrl: string;
  isProfileEmpty: boolean;
  userLang: string;
  beneficiary: Beneficiary;
  constructor(private caseService: CaseService, private route: ActivatedRoute, private router: Router, private previousRouteService: PreviousRouteService, private toastr: ToastrService, private decimalPipe: DecimalPipe) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(routeParams => { this.userId = routeParams['userId'] });
    this.getReceiverCases();
    this.getReceiver();
  }

  getReceiverCases() {
    this.caseService.getBeneficiaryCases(this.userId).subscribe(res => {
      for (var i = 0; i < 1; i++) {
        var obj: any = res.data[0];
        this.currency = obj.baseCurrency;
      }
      this.totalDonationReceived = res.meta.totalDonationReceived;
      this.userLang = navigator.language;
    });
    this.caseService.getTransactionList(this.userId.toString(), this.userRole).subscribe(res => {
      this.donationList = res.data;
    });
  }

  getReceiver() {
    this.caseService.getBeneficiary(this.userId).subscribe(res => {
      this.person = res.data;
      if (this.person.basic.profilePhoto == undefined) {
        this.isProfileEmpty = true;
      }
    });
  }

}

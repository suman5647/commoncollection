import { Component, OnInit } from '@angular/core';
import { CaseService } from 'src/app/services/case.service';
import { Case } from 'src/app/models/case';
import { UserService } from 'src/app/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { FileService } from 'src/app/core/services/file.service';
import { UserLite } from 'src/app/models/user.model';
import { TransactionList } from 'src/app/core/models/base.response.model';
import { Address } from 'src/app/core/models/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  model: UserLite;
  show: boolean = false;
  address: boolean = false;
  donatedCases: boolean = false;
  hasdonation: boolean = false;
  cases: Case[];
  file: File;
  FileExtn = [".jpg", ".jpeg", ".png"];
  donationList: TransactionList[];
  userRole: string = 'benefactor';
  userLang: string;
  hasUnpaidDonations: boolean = false;
  isLocalUser: boolean = true;

  constructor(private caseService: CaseService,
    private userService: UserService,
    private toastr: ToastrService,
    private fileService: FileService) {
  }


  ngOnInit() {
    this.loadAccount();
    this.viewCase();

  }

  loadAccount() {
    this.userService.viewProfile().subscribe(res => {
      this.model = res.data;
      this.model.authProvider.forEach(x => {
        if (x.provider == 'Facebook' || x.provider == 'Google') {
          this.isLocalUser = false;
        }
      })
    });
  }

  viewAccount() {
    this.show = false;
    this.address = false;
    this.hasdonation = false;
  }

  viewCase() {
    this.show = true;
    this.address = false;
    this.hasdonation = false;
    this.caseService.getMyCases().subscribe((res) => {
      this.cases = res.data;
    });
  }

  viewAddress() {
    this.address = true;
    this.hasdonation = false;
  }

  viewDonatedCases() {
    this.donatedCases = true;
    this.hasdonation = false;
  }

  onFileChange(event) {
    this.file = event.target.files;
    this.fileService.validationAndFileSize(this.file, this.FileExtn);
    let result = this.fileService.errors;
    if (result.length > 0) {
      this.toastr.error(result.toString());
    } else {
      this.file = this.fileService.reqFiles[0]
      this.userService.profileUpload(this.file).subscribe(res => {
        if (res.status == 200) {
          this.toastr.success(res.data.toString());
          this.loadAccount();
        }
      });

    }
  }

  getDontionList() {
    this.caseService.getTransactionList(this.model.userId, this.userRole).subscribe(res => {
      this.donationList = res.data;
      this.userLang = navigator.language;
      if (this.donationList.length > 0) {
        this.hasdonation = true;
        this.show = false;
        this.address = false;
      }
      for (let i = 0; i < this.donationList.length; i++) {
        if (this.donationList[i].orderStatus !== 'Paid' && this.donationList[i].orderStatus !== 'Completed') {
          this.hasUnpaidDonations = true;
        }
      }
    })
  }

  openWindow(address: Address) {
    window.open("https://www.google.dk/maps/place/" + address.place + ',' + address.city + ',' + address.country, "_blank", 'toolbar=1,scrollbars=1,location=1,statusbar=0,menubar=1,resizable=1,width=800,height=600');
  }
}

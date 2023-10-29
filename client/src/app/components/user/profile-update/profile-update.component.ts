import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Address, ItemData } from 'src/app/core/models/common';
import { BeneficiaryLite } from 'src/app/models/user';
import { UserLite } from 'src/app/models/user.model';
import { CaseService, UserService } from 'src/app/services';

@Component({
  selector: 'app-profile-update',
  templateUrl: './profile-update.component.html',
  styleUrls: ['./profile-update.component.scss']
})
export class ProfileUpdateComponent implements OnInit {
  address: Address = {} as Address;
  isEmpty: boolean = true;
  isAlreadyDonated: boolean = false;
  isAlreadyReceived: boolean = false;
  currencyUpdate: boolean = false;
  model: UserLite;
  beneficiary: BeneficiaryLite = {} as BeneficiaryLite;
  socialMedialLinks: ItemData[] = {} as ItemData[];
  fbSocialMedia: ItemData = { code: "FB" } as ItemData;
  instasocialMedial: ItemData = { code: "Insta" } as ItemData;
  activeCurrencies = ['DKK', 'EUR', 'INR', 'USD'];
  constructor(private userService: UserService, private caseService: CaseService, private route: Router, private toastr: ToastrService) { }

  ngOnInit() {
    this.userService.viewProfile().subscribe(res => {
      this.beneficiary.address = {} as Address;
      this.model = res.data;
      if (this.model.addressLine1.length > 0) {
        this.beneficiary.address.addressLine1 = this.model.addressLine1;
        this.beneficiary.address.addressLine2 = this.model.addressLine2;
        this.beneficiary.address.place = this.model.place;
        this.beneficiary.address.city = this.model.city;
        this.beneficiary.address.country = this.model.country;
        this.beneficiary.address.pincode = this.model.pinCode;
        this.beneficiary.address.state = this.model.state;
        this.isEmpty = false;
        if (this.typeOfObj(this.model?.reqProfile?.socialMedialLinks)) {
          this.fbSocialMedia.text = this.model?.reqProfile?.socialMedialLinks[0].text.length > 0 ? this.model?.reqProfile?.socialMedialLinks[0].text :
            '';
          this.instasocialMedial.text = this.model?.reqProfile?.socialMedialLinks[1].text.length > 0 ? this.model?.reqProfile?.socialMedialLinks[1].text :
            '';
        }
        this.currencyUpdate = this.model.verification.currencyUpdated;
      }
      let userId = this.model.email;
      this.caseService.getAllBeneficiaryCases(userId).subscribe(res => {
        if (res.meta.totalDonationReceived > 0) {
          this.isAlreadyReceived = true;
        }
      })
      this.caseService.getAllBenefactorCases(userId).subscribe(res => {
        if (res.meta.totalDonatedCases > 0) {
          this.isAlreadyDonated = true;
        }
      })
    });

  }
  addToSocialmediaLinks() {
    this.beneficiary.socialMedialLinks = [];
    if (this.fbSocialMedia.text != null)
      this.beneficiary.socialMedialLinks.push(this.fbSocialMedia);
    if (this.instasocialMedial.text != null)
      this.beneficiary.socialMedialLinks.push(this.instasocialMedial);
  }
  onSubmit() {
    this.beneficiary.firstName = this.model.firstName;
    this.beneficiary.lastName = this.model.lastName;
    this.addToSocialmediaLinks();
    this.userService.updateAddress(this.beneficiary).subscribe(res => {
      // if (res.status == 200) {
      this.toastr.success("Profile updated Successfully ");
      this.route.navigate(['/profile']);
      // }
    })
  }

  typeOfObj(value) {
    return (
      // null or undefined
      (value == null) ||
  
      // has length and it's zero
      (value.hasOwnProperty('length') && value.length === 0) ||
  
      // is an Object and has no keys
      (value.constructor === Object && Object.keys(value).length === 0)
    );
  }
}

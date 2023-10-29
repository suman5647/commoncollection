import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CaseContent, CaseCreate, IAccountDetails } from 'src/app/models/case';
import { UserLite } from 'src/app/models/user.model';
import { Address, GeoLocation } from 'src/app/core/models/common';
import { Router } from '@angular/router';
import { CaseService } from 'src/app/services/case.service';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { NgxGalleryOptions, NgxGalleryImage } from 'ngx-gallery-9';
import { UserService } from 'src/app/services/user.service';
import { Subscription, Observable } from 'rxjs';
import { timer } from 'rxjs';
import { AddressBuilder, LocationBuilder } from '../../../core/components/builder.component'



@Component({
  selector: 'app-case-add',
  templateUrl: './case-add.component.html',
  styleUrls: ['./case-add.component.css']
})
export class CaseAddComponent implements OnInit, AfterViewInit {

  maxSize: number = 1;
  beneficiaryData: UserLite;
  case: CaseCreate = {} as CaseCreate;
  address: Address = {} as Address;
  accountDetails: IAccountDetails = {} as IAccountDetails;
  caseContent: CaseContent = {} as CaseContent;
  galleryOptions: NgxGalleryOptions[];
  addressIsValid: boolean = true;
  galleryImages: NgxGalleryImage[] = new Array<NgxGalleryImage>();
  showFile: boolean = false;
  load: boolean = false;
  geoLocation: GeoLocation = {} as GeoLocation;
  public showloader: boolean = false;
  public showProgress: boolean = false;
  private subscription: Subscription;
  private timer: Observable<any>;
  rating = { average: 0, count: 0 };
  autocompleteInput: string;
  @ViewChild('addresstext', { static: true }) addresstext: any;
  currencyList: any = ['DKK', 'USD',]

  constructor(private caseService: CaseService,
    private route: Router,
    private userService: UserService,
    private toastr: ToastrService,) { }


  ngOnInit() {
    this.loadAccount();
    //this.accountDetails.accountType == null;
  }

  ngAfterViewInit() {
    this.getPlaceAutocomplete();
  }

  getPlaceAutocomplete() {
    this.address = {} as Address;
    let autocomplete = new google.maps.places.Autocomplete(this.addresstext.nativeElement, {
      types: ['geocode']
    });
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      const place = autocomplete.getPlace();
      this.getAddrComponent(place)

    });
  }

  checkAddress() {
    let coin = this.accountDetails.currency;
    let address = this.accountDetails.accountId;
    let validateAddress = this.caseService.validateCryptoAddress(coin, address).subscribe(res => {
      this.addressIsValid = res.data;
    })
  }

  getAddrComponent(place) {
    this.geoLocation = new LocationBuilder().getLang(place).getLat(place).build();
    this.address = new AddressBuilder().setStreetLine1(place).setStreetLine2(place).setPlace(place).setCity(place).setPostCode(place).setState(place).setCountry(place).build();
    if (this.address) {
      this.showloader = false;
    }
  }

  loadSpring() {
    this.showloader = true;
    this.timer = timer(5000);
    this.subscription = this.timer.subscribe(() => {
      this.showloader = false;
      if (JSON.stringify(this.address) === '{}') {
        this.toastr.error("address not found please enter the address manualy");
      }
    });

  }

  loadAccount() {
    this.userService.viewProfile().subscribe(res => {
      this.beneficiaryData = res.data;
      this.beneficiaryData.userId = res.data.email;
      delete this.beneficiaryData.email;
    })
  }

  changeCurrency(e) {
    this.case.baseCurrency;
  }

  onSubmit(createCase: NgForm) {
    this.case.address = this.address;
    this.case.content = [];
    this.case.content.push(this.caseContent);
    this.case.beneficiary = this.beneficiaryData;
    this.case.rating = this.rating;
    this.case.location = this.geoLocation;
    this.case.accountDetails = [];
    this.case.accountDetails.push(this.accountDetails);
    this.caseService.createCase(this.case).subscribe(res => {
      this.showProgress = true;
      if (res.status == 200) {
        this.showProgress = false;
        this.toastr.success("Case Created Successfully ");
        this.route.navigate(['/profile']);
        createCase.reset();
      }
    })
  }
}

import { Component, OnInit, Input } from '@angular/core';
import { Location } from '@angular/common';
import { Address, GeoLocation } from 'src/app/core/models/common';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  labelOptions: any;
  @Input("address") address: Address;
  @Input("location") location: GeoLocation;
  @Input("showBallon") showBallon: boolean;

  constructor() { }

  ngOnInit() {
    this.labelOptions = {
      color: 'black',
      fontFamily: '',
      fontSize: '18px',
      fontWeight: '500',
      text: this.address
    }
  }
  openWindow() {
    window.open("https://www.google.dk/maps/place/" + this.address.place + ',' + this.address.city + ',' + this.address.country, "_blank", 'toolbar=1,scrollbars=1,location=1,statusbar=0,menubar=1,resizable=1,width=800,height=600');
  }
}

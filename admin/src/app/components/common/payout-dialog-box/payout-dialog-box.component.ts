import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IAccountDetails, CaseDonation } from 'src/app/models/case';

export interface UsersData {
  comments: string;
  id: number;
  action: string,
  statusType: string;
  amount: string;
  address: string;
  name: string;
  details: IAccountDetails;
  currency: string;
  orderId: string;
  order: any
}


@Component({
  selector: 'app-payout-dialog-box',
  templateUrl: './payout-dialog-box.component.html',
  styleUrls: ['./payout-dialog-box.component.scss']
})
export class PayoutDialogBoxComponent {
  caseTitle: string;
  action: string;
  local_data: any;
  statusType: string;
  comments: string;
  name: string;
  amount: string;
  address: string;
  loading: boolean;
  orderId: string;
  constructor(
    public dialogRef: MatDialogRef<PayoutDialogBoxComponent>,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: UsersData) {
    this.local_data = { ...data };
    this.action = this.local_data.action;

    console.log(data);
    console.log(data.order);
    console.log(data.details.accountId);
    console.log(data.currency);
    console.log(data.amount);
    console.log(data.orderId);
    this.statusType = this.data.statusType;
    this.address = data.details.accountId;
    let amount = (data.amount === undefined) ? data.order.amount : data.amount;
    let currency = (data.currency === undefined) ? data.order.currency : data.currency;
    this.amount = amount + ' ' + currency;
    this.orderId = (data.orderId === undefined) ? data.order.orderId : data.orderId;

    //this.caseTitle = this.data.content[0].title;

    this.comments = this.local_data.comments;
  }

  doAction() {
    this.dialogRef.close({ event: this.action, data: this.local_data });
  }

  closeDialog() {
    this.dialogRef.close({ event: 'Cancel' });
  }

}
import { Component, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CaseContent } from 'src/app/models/case';

export interface UsersData {
  comments: string;
  id: number;
  action: string,
  statusType: string;
  content: CaseContent[]
}


@Component({
  selector: 'app-dialog-box',
  templateUrl: './dialog-box.component.html',
  styleUrls: ['./dialog-box.component.scss']
})
export class DialogBoxComponent {
  caseTitle: string;
  action: string;
  local_data: any;
  statusType: string;
  comments: string;
  constructor(
    public dialogRef: MatDialogRef<DialogBoxComponent>,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: UsersData) {
    this.local_data = { ...data };
    this.action = this.local_data.action;
    if (this.data.statusType === undefined)
    {
      this.statusType = "KYC Status Update";
      this.caseTitle = this.data.content[0].title;
    }
    else{
      this.statusType = this.data.statusType;
      this.caseTitle = this.data.content[0].title;
    }
    this.comments = this.local_data.comments;
  }

  doAction() {
    this.dialogRef.close({ event: this.action, data: this.local_data });
  }

  closeDialog() {
    this.dialogRef.close({ event: 'Cancel' });
  }

}
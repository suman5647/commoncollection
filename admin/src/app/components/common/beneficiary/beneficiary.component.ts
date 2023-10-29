import { Component, ElementRef, Inject, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { KycDocument, KycState } from 'src/app/models/kyc';
import { Beneficiary } from 'src/app/models/user';
import { CaseService } from 'src/app/services/case.service';
import { FileService } from 'src/app/services/file.service';
import { SelectItem } from 'primeng/api';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { KycListDataSource } from './kycstate-list-datasource';
import { DataSource } from '@angular/cdk/table';
import { IdentityStatusModel } from 'src/app/models/case';

@Component({
  selector: 'app-beneficiary',
  templateUrl: './beneficiary.component.html',
  styleUrls: ['./beneficiary.component.scss']
})

export class BeneficiaryComponent implements OnInit {
  @Input('userProfile') userProfile: Beneficiary;
  @ViewChild('fileInput') fileInput: ElementRef;
  fileAttr = 'Choose File';
  displayedColumns: string[] = ['title', 'fileType', 'kycStatus', 'kycTypeType', 'show', 'updateStatus', 'fileHistory'];
  displayedColumns2: string[] = ['statusOn', 'status', 'note', 'statusBy'];
  displayedColumns3: string[] = ['Type', 'title1'];
  uploadList: MatTableDataSource<KycDocument>;
  dataSource;
  userId: string;
  beneficiary: Beneficiary;
  uploadFiles: KycDocument[] = [];
  selectedFiles;
  kycData;
  myForm: FormGroup;
  userType: string = "Beneficiary";
  dataimage: any;
  FileExtn = [".jpg", ".jpeg", ".png", ".pdf"];
  reqFiles: File[] = [];
  errors: Array<string> = [];
  load: boolean;
  hasDocuments: boolean = true;
  statuses: SelectItem[];
  //Holds the IDs of the uploaded files
  private filesUploadedIds: number[] = [];


  constructor(private _route: ActivatedRoute,
    private caseService: CaseService,
    private fileService: FileService,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer,
    public dialog: MatDialog,
    public fb: FormBuilder) { }


  ngOnInit(): void {
    this.statuses = [{ label: 'Obsolete', value: 'Obsolete' }, { label: 'Requested', value: 'Requested' }, { label: 'Uploaded', value: 'Uploaded' },
    { label: 'Approved', value: 'Approved' }, { label: 'OnHold', value: 'Rejected' }, { label: 'Rejected', value: 'Rejected' }]
    this.userId = this._route.snapshot.params['userId'];
    if (this.userId !== undefined) {
      this.getBeneficiaryDetails(this.userId);
      this.getBeneficiaryKYC(this.userId);
    } else {
      this.displayedColumns[0] = "Name";
      this.displayedColumns[1] = "LastName";
      this.dataSource = this.userProfile;
    }
    this.reactiveForm();
  }

  submitForm() {
  }


  /* Reactive form */
  reactiveForm() {
    this.myForm = this.fb.group({
      adminComments: [''],
      typeName: [''],
      fileName: ['']
    })
  }

  openKYCStates(elemnet) {
    this.dialog.open(DialogKYCData, {
      data: elemnet
    });
  }

  getdata(data) {
    return new MatTableDataSource<any>(data);
  }

  getBeneficiaryDetails(userId) {
    this.caseService.getBeneficiary(userId).subscribe(res => {
      this.beneficiary = res.data;
      this.dataSource = this.beneficiary;
    });
  }

  getBeneficiaryKYC(userId) {
    this.caseService.getBeneficiaryKYC(userId).subscribe(res => {
      if (res.status == 200) {
        this.kycData = res.data;
        this.uploadFiles = res.data.documents;
        this.hasDocuments = true;
      } else {
        this.hasDocuments = false;
      }
    })
  }

  openDialog(element) {
    this.caseService.getPhotos(element.uniqueName).subscribe(res => {
      let dataImage = res.data;
      this.dialog.open(DialogDataExampleDialog, {
        data: "data:" + element.fileType + ";base64," + dataImage
      });
    }
    );
  }

  UpdateKYCStatusDialog(action, obj) {
    obj.action = action;
    const dialogRef = this.dialog.open(KycDialogBoxComponent, {
      width: '450px',
      data: obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined)
        if (result.event !== 'Cancel')
          this.updateKYCStatus(result.data, this.userId);
    });
  }

  updateKYCStatus(row_obj, userId) {
    let documentId: string = (row_obj._id);
    let status: string = (row_obj.action);
    let kycType: string = (row_obj.kycTypeType);
    let comments: string = (row_obj.comments);
    let data: KYCUpdateData = {
      comments: '',
      kycId: '',
      status: '',
      photoId: '',
    };
    data.comments = comments;
    data.kycId = documentId;
    data.status = status;
    data.photoId = kycType;
    this.caseService.updateKYCstatus(data, userId).subscribe(res => {
      if (res.status == 200) {
        this.toastr.success("KYC status successfully updated");
      } else {
        this.toastr.error("KYC status updation failed. Please try again after some time");
      }
    })
  }

  uploadFileEvt(imgFile: any) {
    let adminComment = this.myForm.value.adminComments;
    let kycType = this.myForm.value.typeName;

    if (imgFile.target.files && imgFile.target.files[0]) {
      this.fileAttr = '';
      this.errors = [];
      this.reqFiles = [];
      this.uploadFiles = Array.from(imgFile.target.files);
      Array.from(imgFile.target.files).forEach((file: File) => {
        this.fileAttr += file.name;
      });

      // HTML5 FileReader API
      let reader = new FileReader();
      reader.onload = (e: any) => {
        let image = new Image();
        image.src = e.target.result;
        image.onload = rs => {
          let imgBase64Path = e.target.result;
          this.dataimage = imgBase64Path;
        };
      };
      reader.readAsDataURL(imgFile.target.files[0]);

      // Reset if duplicate image uploaded again
      this.fileInput.nativeElement.value = "";
    } else {
      this.fileAttr = 'Choose File';
    }

    this.fileService.validationAndFileSize(this.uploadFiles, this.FileExtn);
    this.errors = this.fileService.errors;
    this.reqFiles = this.fileService.reqFiles;
    if (this.reqFiles.length > 0) {
      this.saveFiles(this.reqFiles, adminComment, kycType);
    }
  }

  saveFiles(files, adminComment, kycType) {
    this.load = true;
    if (files.length > 0) {
      this.caseService.upload(files, this.userId, kycType, adminComment).subscribe(res => {
        if (res.status == 200) {
          this.toastr.success("KYC file uploads is success");
          this.load = false;
          this.getBeneficiaryKYC(this.userId);
        } else {
          this.toastr.error("KYC file failed. Please try again");
          this.load = false;
          this.getBeneficiaryKYC(this.userId);
        }
      });
    }
  }

  updateStatus(status: boolean, idtype: string) {
    var data: IdentityStatusModel = {
      identityStatus: false,
      type: ''
    }
    data.identityStatus = status;
    data.type = idtype

    this.caseService.updateIdentitystatus(data, this.userId).subscribe(res => {
      if (res.status == 200) {
        this.toastr.success(res.data);
      }
    })


  }
  onRowEditInit(product) {
  }

  onRowEditSave(product) {
  }

  onRowEditCancel(product, index: number) {

    // this.products2[index] = this.clonedProducts[product.id];
    // delete this.clonedProducts[product.id];
  }

}

export interface KYCUpdateData {
  status: string;
  kycId: string;
  photoId: string;
  comments: string;
}

@Component({
  selector: 'dialog-data-example-dialog',
  templateUrl: './dialog-data-example-dialog.html',
})
export class DialogDataExampleDialog {
  constructor(public dialog: MatDialogRef<DialogDataExampleDialog>, @Inject(MAT_DIALOG_DATA) public data) { }

  onNoClick(): void {
    this.dialog.close();
  }
}



@Component({
  selector: 'dialog-kyc-states',
  templateUrl: 'dialog-kyc-states.html',
  styleUrls: ['./beneficiary.component.scss']
})
export class DialogKYCData implements OnInit {
  @ViewChild(MatTable) table!: MatTable<KycState[]>;
  statesDisplayedColumns: string[] = ['note', 'status', 'modifiedBy', 'statusOn'];

  dataSource1: KycState[];

  public kycStates: KycState[];
  constructor(@Inject(MAT_DIALOG_DATA) public data: KycDocument, public dialog: MatDialogRef<DialogKYCData>) {
    // this.dataSource = new MatTableDataSource();
  }

  ngOnInit() {
    this.dataSource1 = this.data.states;

  }
}

@Component({
  selector: 'app-dialog-kyc-box',
  templateUrl: 'dialog-kyc-user.html',
  styleUrls: ['./beneficiary.component.scss']
})
export class KycDialogBoxComponent {
  caseTitle: string;
  action: string;
  local_data: any;
  statusType: string;
  comments: string;
  constructor(
    public dialogRef: MatDialogRef<DialogBoxComponent>,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: KycDocument) {
    this.local_data = { ...data };
    this.action = this.local_data.action;
    if (this.data.status === undefined) {
      this.statusType = "KYC Status Update";
    }
    else {
      this.statusType = this.data.status;
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
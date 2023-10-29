import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { CaseCounts } from 'src/app/core/models/base.response.model';
import { AdminCaseStatus, Case, CaseDonation, CaseStatusModel } from 'src/app/models/case';
import { Page } from 'src/app/models/user';
import { CaseService } from 'src/app/services/case.service';
import { animate, state, style, transition, trigger } from '@angular/animations';

import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { CdkDetailRowDirective } from './cdk-detail-row.directive';
import { CaseListDataSource } from '../donations-table/donation-list-datasource';


@Component({
  selector: 'app-case',
  templateUrl: './case.component.html',
  styleUrls: ['./case.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('void', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('*', style({ height: '*', visibility: 'visible' })),
      transition('void <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class CaseComponent implements OnInit {

  expandedElement: boolean = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns: string[] = [];
  caseData: Case[];
  dataSource: MatTableDataSource<Case>;
  pages: number[] = [];
  cases: Case[];
  pageno: number = 1;
  perPage: number = 8;
  totalPages: number;
  caseLength: number;
  statusAdminPending: string = "Pending";
  adminStatus: string = "Admin Status";
  casesStatus: string = "Case Status";
  statusType: string = this.casesStatus;
  filterStatus: string = "Verified";
  caseStatus: number;
  isAdminPending: boolean = false;
  // MatPaginator Inputs
  pageSizeOptions: number[] = [8, 16, 24, 32];
  pageEvent: PageEvent;
  casesCount: CaseCounts;
  activeCases: number;
  adminPendingCases: number;
  caseID: string;
  showVar: boolean = false;
  private openedRow: CdkDetailRowDirective;
  constructor(private route: ActivatedRoute, private caseService: CaseService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.caseStatus = params['status'];
      this.getCases(); // reset and set based on new parameter this time
  });
    this.caseService.getCaseCount().subscribe(res => {
      this.casesCount = res.data;
      this.activeCases = this.casesCount.activeCases;
      this.adminPendingCases = this.casesCount.adminPendingCases;
    });
    this.getCases();
    if (this.caseStatus.toString().localeCompare(this.statusAdminPending) === 0) {
      this.isAdminPending = true;
      this.statusType = this.adminStatus;
    }
  }


  openDialog(action, obj) {
    obj.action = action;
    obj.statusType = this.statusType;
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      width: '450px',
      data: obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.event == 'Approve') {
        this.updateAdminStatus(result.data);
      } else if (result.event == 'Request') {
        this.updateAdminStatus(result.data);
      } else if (result.event == 'Reject') {
        this.updateAdminStatus(result.data);
      } else if (result.event == 'Obsolete') {
        this.updateCaseStatus(result.data);
      } else if (result.event == 'Completed') {
        this.updateCaseStatus(result.data);
      }
    });
  }

  updateAdminStatus(row_obj) {
    let caseId: string = (row_obj.caseId);
    let status: string = (row_obj.action);
    let comments: string = (row_obj.comments);
    this.updatedCase(status, caseId, comments);
  }

  updateCaseStatus(row_obj) {
    let caseId: string = (row_obj.caseId);
    let status: string = (row_obj.action);
    let comments: string = (row_obj.comments);
    this.updatedCase(status, caseId, comments);
  }

  getCases() {
    this.route.queryParams.subscribe((page: Page) => {
      this.pageno = page.page || 1;
      this.perPage = page.perPage || 8;
    })
    if (this.caseStatus.toString().localeCompare(this.statusAdminPending) === 0) {
      this.caseService.adminPendingCases(this.pageno, this.perPage).subscribe(res => {
        this.cases = res.data;
        this.caseLength = res.meta.totalItems;
        this.isAdminPending = true;
        this.totalPages = Math.round(this.caseLength / this.perPage);
        for (let k = 1; k <= this.totalPages; k++) {
          this.pages.push(k);
        }
        this.formatCaseData(this.cases);
      })
    } else {
      this.caseService.activeCases(this.pageno, this.perPage).subscribe(res => {
        this.cases = res.data;
        this.caseLength = res.meta.totalItems;
        this.isAdminPending = false;
        this.totalPages = Math.round(this.caseLength / this.perPage);
        for (let k = 1; k <= this.totalPages; k++) {
          this.pages.push(k);
        }
        this.formatCaseData(this.cases);
      })
    }
  }

  paginationOfCases(page: PageEvent) {
    this.perPage = +page.pageSize;
    this.pageno = +page.pageIndex + 1;
    this.route.queryParams.subscribe((page: Page) => {
      this.perPage = page.perPage || this.perPage;
      this.pageno = page.page || this.pageno;
    });
    this.caseService.adminPendingCases(page.pageIndex + 1, this.perPage).subscribe(res => {
      this.cases = res.data;
      this.caseData = this.cases;
      this.dataSource = new MatTableDataSource(this.caseData);
    });
  }

  paginationOfActiveCases(page: PageEvent) {
    this.perPage = +page.pageSize;
    this.pageno = +page.pageIndex + 1;
    this.route.queryParams.subscribe((page: Page) => {
      this.perPage = page.perPage || this.perPage;
      this.pageno = page.page || this.pageno;

    })
    this.caseService.activeCases(page.pageIndex + 1, this.perPage).subscribe(res => {
      this.cases = res.data;
      this.caseData = this.cases;
      this.dataSource = new MatTableDataSource(this.caseData);
    })
  }

  updatedCase(status: string, caseId: string, comments: string) {

    if (status.localeCompare('Approve') == 0 || status.localeCompare('Request') == 0 || status.localeCompare('Reject') == 0) {
      let statusData: AdminCaseStatus = {
        adminComments: '',
        adminStatus: ''
      };
      statusData.adminComments = comments;
      statusData.adminStatus = status;
      this.caseService.updatedAdminStatus(caseId, statusData).subscribe(res => {
        if (res.status === 200) {
          this.getCases();
        }
      });
    } else {
      let statusData: CaseStatusModel = {
        adminComments: '',
        caseStatus: ''
      };
      statusData.adminComments = comments;
      statusData.caseStatus = status;
      this.caseService.updatedCaseStatus(caseId, statusData).subscribe(res => {
        if (res.status === 200) {
          this.getCases();
        }
      });
    }
  }


  formatCaseData(cases: Case[]) {
    let headers = cases.map((o) => {
      return Object.keys(o)
    }).reduce((prev, curr) => {
      return prev.concat(curr)
    }).filter((col, i, array) => {
      return array.indexOf(col) === i
    });
    this.displayedColumns[0] = headers[1];
    this.displayedColumns[1] = headers[2];
    this.displayedColumns[2] = headers[3];
    this.displayedColumns[3] = headers[4];
    this.displayedColumns[4] = "action";
    this.displayedColumns[5] = "donations";
    this.displayedColumns = this.displayedColumns.filter(e => e !== 'caseId');
    this.caseData = this.cases;
    this.dataSource = new MatTableDataSource(this.caseData);
  }

  selectedRow(row) {
    this.caseID = row.caseId;
    const dialogRef = this.dialog.open(DialogDonationData, {
      data: this.caseID
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  onToggleChange(cdkDetailRow: CdkDetailRowDirective): void {
    this.caseID = cdkDetailRow.row.caseId;
    if (this.openedRow && this.openedRow.expended) {
      this.openedRow.toggle();
    }
    this.openedRow = cdkDetailRow.expended ? cdkDetailRow : undefined;
  }
}

@Component({
  selector: 'app-dialog-donation',
  templateUrl: 'dialog-donation.html',
})
export class DialogDonationData implements OnInit {
  @ViewChild(MatTable) table!: MatTable<CaseDonation[]>;
  donationsDisplayedColumns: string[] = ['email', 'orderId', 'amount', 'status'];

  dataSource1: CaseListDataSource;
  emptyDonations: boolean = false;

  public kycStates: CaseDonation[];
  case: Case;
  caseID: string;
  constructor(@Inject(MAT_DIALOG_DATA) public data: string, public dialog: MatDialogRef<DialogDonationData>, private caseService: CaseService) {
  }

  ngOnInit() {
    this.caseID = this.data;
    this.viewDetailCase(this.caseID);

  }
  viewDetailCase(caseID: string) {
    this.caseService.caseDetailAdmin(caseID).subscribe(
      res => {
        this.case = res.data;
        let caseLength = this.case[0].donations.length
        this.dataSource1 = new CaseListDataSource(this.case[0].donations);
        if (caseLength == 0)
          this.emptyDonations = true;
      }
    )
  }
  closeModel() {
    this.dialog.close()
  }
}

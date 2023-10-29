import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { Case, CaseDonation } from 'src/app/models/case';
import { CaseListDataSource } from './donation-list-datasource';
import { CaseService } from 'src/app/services/case.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { MatDialog } from '@angular/material/dialog';
import { PayoutDialogBoxComponent } from '../payout-dialog-box/payout-dialog-box.component';


@Component({
  selector: 'app-donation-table-list',
  templateUrl: './donations-table.component.html',
  styleUrls: ['./donations-table.component.scss']
})
export class DonationsTableComponent implements AfterViewInit {
  @ViewChild(MatTable) table!: MatTable<CaseDonation>;
  dataSource: CaseListDataSource;
  @Input('caseID') caseID: string;
  emptyDonations: boolean = false;
  loading: boolean = false;

  case: Case;
  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  donationsDisplayedColumns: string[] = ['email', 'orderId', 'amount', 'status', 'action'];


  constructor(private _route: ActivatedRoute, private caseService: CaseService, private toastr: ToastrService, public dialog: MatDialog) {
  }

  ngOnInit() {
    this.caseID = this._route.snapshot.params['caseId'];
    this.viewDetailCase(this.caseID);

  }

  viewDetailCase(caseID: string) {
    this.caseService.caseDetail(caseID).subscribe(
      res => {
        this.case = res.data;
        this.dataSource = new CaseListDataSource(this.case.donations);
        if (this.dataSource.dataSource.length > 0)
          this.table.dataSource = this.dataSource;
        else
          this.emptyDonations = true;
      }
    )
  }

  openDialog(action, obj) {
   
    obj.action = action;
    this.caseService.caseDetail(this.caseID).subscribe(res => {
      obj.details = res.data.accountDetails[0];
      const dialogRef = this.dialog.open(PayoutDialogBoxComponent, {
        width: '450px',
        data: obj
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result.event === 'Cancel') {
        }
        else {
          this.payout(result);
        }
      });
    })
   
  }
  
  payout(element) {
    this.loading = true;
    console.log(element);
    console.log(element.data.order.orderId);
    let orderId = element.data.order.orderId;
    // this.caseService.orderPayout(orderId).subscribe(res => {
    //   if (res.status == 200) {
    //     this.toastr.success('Payout successfull');
    //   } else {
    //     this.toastr.error('Payout failed');
    //   }
    //   this.loading = false;
    //   this.viewDetailCase(this.caseID);
    // })

  }
  ngAfterViewInit(): void {

  }
}

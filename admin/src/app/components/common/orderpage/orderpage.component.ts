import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Order, OrderBreakdown, OrderTransaction } from 'src/app/models/order';
import { Beneficiary, User } from 'src/app/models/user';
import { CaseService } from 'src/app/services/case.service';
import { UserService } from 'src/app/services/user.service';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { PayoutDialogBoxComponent } from '../payout-dialog-box/payout-dialog-box.component';

@Component({
  selector: 'app-orderpage',
  templateUrl: './orderpage.component.html',
  styleUrls: ['./orderpage.component.scss']
})
export class OrderpageComponent implements OnInit {

  orderId: string;
  orders: Order;
  txnsData: OrderTransaction[];
  //breakDownData: OrderBreakdown[];
  displayedColumns: string[] = [];
  breakDowndisplayedColumns: string[] = ['amount', 'name'];
  dataSource: MatTableDataSource<OrderTransaction>;
  breakDownData: MatTableDataSource<OrderBreakdown>;
  txnLink: string;
  //coinLink: string;
  href: string;
  env: string;
  beneficiary: Beneficiary;
  externalMerchantLink: string;
  loading: boolean = false;
  constructor(
    private _route: ActivatedRoute,
    private caseService: CaseService,
    private userService: UserService,
    private toastr: ToastrService,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.orderId = this._route.snapshot.params['orderId'];
    this.getOrderDetails(this.orderId);
    this.href = window.location.href;
  }

  getOrderDetails(orderId: string) {
    this.caseService.getOrderDetails(this.orderId).subscribe(res => {
      this.orders = res.data;
      this.breakDownData = new MatTableDataSource(this.orders.breakdown);
      if (this.orders.merchantReferenceId !== undefined) {
        if (this.href.includes('local')) {
          this.externalMerchantLink = 'https://localhost:44333/api/v1/orders/' + this.orders.merchantReferenceId;
        } else if (this.href.includes('test')) {
          this.externalMerchantLink = 'https://test.app.monni.com/api/v1/orders/' + this.orders.merchantReferenceId;
        } else {
          this.externalMerchantLink = 'https://app.monni.com/api/v1/orders/' + this.orders.merchantReferenceId;
        }
      }
      this.getCaseDetails(this.orders.caseId);
      this.formatTxns(this.orders.transactions);
    });
  }

  getBeneficiaryDetails(userId) {
    this.caseService.getBeneficiary(userId).subscribe(res => {
      this.beneficiary = res.data;
    });
  }

  getCaseDetails(caseId) {
    this.caseService.caseDetail(caseId).subscribe(res => {
      let userId = res.data.beneficiary.userId;
      this.caseService.getBeneficiaryDetails(userId).subscribe(res => {
        this.beneficiary = res.data;
      })
    })
  }

  formatTxns(txns) {
    let headers = txns.map((o) => {
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
    this.displayedColumns[4] = headers[5];
    //this.displayedColumns[4] = headers[6];
    this.displayedColumns[5] = headers[7];
    this.displayedColumns[6] = headers[8];
    this.displayedColumns[7] = "action";
    this.txnsData = txns;

    this.dataSource = new MatTableDataSource(this.txnsData);
    for (let i = 0; i < this.txnsData.length; i++) {
      this.txnsData[i].orderId = this.orderId;
      if (this.href.includes('local') || this.href.includes('test')) {
        if (this.txnsData[i].currency === 'BTC') {
          this.txnsData[i].txLink = "https://blockexplorer.one/btc/testnet/tx/" + this.txnsData[i].trnHash;
          this.txnsData[i].addressLink = "https://blockexplorer.one/btc/testnet/address/" + this.txnsData[i].walletAddress;
        } else if (this.txnsData[i].currency === 'LTC') {
          this.txnsData[i].txLink = "https://blockexplorer.one/ltc/testnet/tx/" + this.txnsData[i].trnHash;
          this.txnsData[i].addressLink = "https://blockexplorer.one/ltc/testnet/address/" + this.txnsData[i].walletAddress;
        } else {
          this.txnsData[i].addressLink = "https://blockexplorer.one/btc/testnet/address/" + this.txnsData[i].walletAddress;
        }
      }
      else {
        if (this.txnsData[i].currency === 'BTC') {
          this.txnsData[i].txLink = "https://blockexplorer.one/btc/mainnet/tx/" + this.txnsData[i].trnHash;
          this.txnsData[i].addressLink = "https://blockexplorer.one/btc/mainnet/address/" + this.txnsData[i].walletAddress;
        } else if (this.txnsData[i].currency === 'LTC') {
          this.txnsData[i].txLink = "https://blockexplorer.one/ltc/mainnet/tx/" + this.txnsData[i].trnHash;
          this.txnsData[i].addressLink = "https://blockexplorer.one/ltc/mainnet/address/" + this.txnsData[i].walletAddress;
        } else {
          this.txnsData[i].addressLink = "https://blockexplorer.one/btc/mainnet/address/" + this.txnsData[i].walletAddress;
        }
      }
    }

  }

  openDialog(action, obj) {
    console.log(action);
    console.log(obj);
    obj.action = action;
    this.caseService.caseDetail(this.orders.caseId).subscribe(res => {
      console.log(res.data.accountDetails);
      obj.details = res.data.accountDetails[0];
      const dialogRef = this.dialog.open(PayoutDialogBoxComponent, {
        width: '450px',
        data: obj
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log(result);
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
    let orderId = element.data.orderId;
    this.caseService.orderPayout(orderId).subscribe(res => {
      console.log(res.data);
      if (res.status == 200) {
        this.toastr.success("Payout successfull");
      } else {
        this.toastr.error("Payout Failed");
      }
      this.loading = false;
      this.getOrderDetails(this.orderId);
    })
  }
}

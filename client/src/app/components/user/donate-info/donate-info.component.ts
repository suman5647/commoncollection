import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-donate-info',
  templateUrl: './donate-info.component.html',
  styleUrls: ['./donate-info.component.css']
})
export class DonateInfoComponent implements OnInit {
  name: string;
  paymentType: string;
  amount: number;
  orderId: string;
  txHash: string;
  currency: string;
  status: string;
  caseId: string;
  constructor(private dataService: DataService, private route: ActivatedRoute) {
    this.route.queryParams.subscribe(routeParams => {
      this.orderId = routeParams['orderId'];
      this.amount = routeParams['orderAmount'];
      this.currency = routeParams['currency'];
      this.status = routeParams['status'];
    });
  }

  ngOnInit(): void {
  }

}

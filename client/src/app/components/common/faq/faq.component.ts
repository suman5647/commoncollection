import { Component, OnInit } from '@angular/core';
import { Case } from 'src/app/models/case';
import { ActivatedRoute } from '@angular/router';
import { Page } from 'src/app/models/user';
import { CaseService } from 'src/app/services/case.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {

  pages: number[] = [];
  cases: Case[];
  pageno: number = 1;
  perPage: number = 8;
  totalPages: number;
  caseLength: number;

  constructor(private caseService: CaseService, private _route: ActivatedRoute) { }

  ngOnInit() {
    this.getCases();
  }

  getCases() {
    this._route.queryParams.subscribe((page: Page) => {
      this.pageno = page.page || 1;
      this.perPage = page.perPage || 8;
    })
    this.caseService.viewCase(this.pageno, this.perPage).subscribe(res => {
      this.cases = res.data;
      this.caseLength = res.meta.totalItems;
      this.totalPages = Math.round(this.caseLength / this.perPage);
      for (let k = 1; k <= this.totalPages; k++) {
        this.pages.push(k);
      }
    })
  }

  paginationOfCases(page) {
    this._route.queryParams.subscribe((page: Page) => {
      this.perPage = page.perPage || this.perPage;
      this.pageno = page.page;

    })
    this.caseService.viewCase(page, this.perPage).subscribe(res => {
      this.cases = res.data;
    })
  }


}

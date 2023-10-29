import { Component, OnInit, Input} from '@angular/core';
import { Case } from 'src/app/models/case';
import { ActivatedRoute } from '@angular/router';
import { CaseService } from 'src/app/services/case.service';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
 @Input() searchText;
  cases: Case[];

  constructor(private caseService: CaseService, private _route: ActivatedRoute) { }

  ngOnInit() {
    this.getCases();
    this._route.params.subscribe(params => {this.searchText = params["text"];})
  }

  getCases() {
    this.caseService.searchCase().subscribe(res => {
      this.cases = res.data;
      console.log(this.cases);
      console.log(res.data);
    })
  }


}

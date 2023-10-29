import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CaseCounts } from 'src/app/core/models/base.response.model';
import { AuthService } from 'src/app/services/auth.service';
import { CaseService } from 'src/app/services/case.service';

@Component({
  selector: 'app-adminhome',
  templateUrl: './adminhome.component.html',
  styleUrls: ['./adminhome.component.scss']
})
export class AdminhomeComponent implements OnInit {

  public logIn: Observable<boolean>;
  public isLogIn: Observable<boolean>;
  public status: string;
  public statusOpen: string = "Open";
  public statusAdminPending: string = "Pending";
  casesCount: CaseCounts;
  activeCases: number;
  adminPendingCases: number;
  constructor(private authService: AuthService, private caseService: CaseService) { }

  ngOnInit(): void {
    this.logIn = this.authService.logValue;
    this.isLogIn = this.authService.loggedIn;
    this.caseService.getCaseCount().subscribe(res => {
      this.casesCount = res.data;
      this.activeCases = this.casesCount.activeCases;
      this.adminPendingCases = this.casesCount.adminPendingCases;
    })
  }

  logOut() {
    this.authService.removeTokens();
    this.authService.loggedIn.next(false);
    this.authService.logValue.next(true);
  }

}

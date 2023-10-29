import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SessionService } from 'src/app/core/services/session.service';
import { AuthService } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { CaseService } from 'src/app/services';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  public logIn: Observable<boolean>;
  public isLogIn: Observable<boolean>;
  public LandDanish: boolean = false;
  public LandEnglish: boolean = false;
  public Show: boolean = false;
  public searchText: string;
  constructor(private translate: TranslateService, private session: SessionService, private Auth: AuthService, private router: Router) {
    this.translate.setDefaultLang('en');
  }

  ngOnInit() {
    this.logIn = this.Auth.logValue;
    this.isLogIn = this.Auth.loggedIn;
    var userLang = navigator.language;
    console.log(this.logIn);
    console.log(this.isLogIn);
  }

  searchFnc() {
    this.Show = true;
    this.router.navigateByUrl("search/" + this.searchText);

  }

  clearFnc() {
    this.Show = false;
    this.searchText=''
    this.router.navigateByUrl("home");

  }

  danish() {
    this.session.registerCulture("da");
    this.translate.use("da");
    this.LandDanish = true;
    this.LandEnglish = false;
    console.log("danish");
  }

  english() {
    this.session.registerCulture("en-Us");
    this.translate.use("en");
    this.LandDanish = false;
    this.LandEnglish = true;
    console.log("english");
  }

  logOut() {
    this.Auth.removeTokens();
    this.Auth.loggedIn.next(false);
    this.Auth.logValue.next(true);
  }

}

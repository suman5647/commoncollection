import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'admin';
  public logIn: Observable<boolean>;
  public isLogIn: Observable<boolean>;

  constructor(private authService: AuthService) {

  }

  ngOnInit(): void {
    this.logIn = this.authService.logValue;
    this.isLogIn = this.authService.loggedIn;
  }

  logOut() {
    this.authService.removeTokens();
    this.authService.loggedIn.next(false);
    this.authService.logValue.next(true);
  }
}

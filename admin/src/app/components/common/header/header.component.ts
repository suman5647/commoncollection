import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  public logIn: Observable<boolean>;
  public isLogIn: Observable<boolean>;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    console.log('I am here');
    this.logIn = this.authService.logValue;
    this.isLogIn = this.authService.loggedIn;
    console.log(this.logIn);
    console.log(this.isLogIn);
  }

  logOut() {
    console.log("hiii");
    this.authService.removeTokens();
    this.authService.loggedIn.next(false);
    this.authService.logValue.next(true);
  }
}

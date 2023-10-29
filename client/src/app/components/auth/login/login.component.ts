import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { User, TokenLite } from 'src/app/models/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  model: User = {} as User;
  private loginData:TokenLite;
  private returnUrl: string;

  constructor(private auth: AuthService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => this.returnUrl = params['returnUrl']);
  }

  signIn() {
    this.auth.login({
      password: this.model.password, email: this.model.email
    }).subscribe(res => {
      this.loginData = res.data;
      this.auth.doLoginUser(this.loginData);
      if (this.auth.getJwtToken) {
        this.auth.loggedIn.next(true);
        this.auth.logValue.next(false);
      }
      this.router.navigateByUrl(this.returnUrl);
    })
  }

}

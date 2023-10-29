import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { TokenLite, User, UserJWTObj } from 'src/app/models/user';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  public loginInvalid: boolean;
  private formSubmitAttempt: boolean;
  private returnUrl: string;
  model: User = {} as User;
  private loginData: TokenLite;
  public logIn: Observable<boolean>;
  public isLogIn: Observable<boolean>;

  constructor(private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => this.returnUrl = params['returnUrl']);


    this.form = this.fb.group({
      username: ['', Validators.email],
      password: ['', Validators.required]
    });
  }

  async onSubmit() {
    this.loginInvalid = false;
    this.formSubmitAttempt = false;
    if (this.form.valid) {
      try {
        const username = this.form.get('username').value;
        const password = this.form.get('password').value;

        this.authService.login({ password: password, email: username }).subscribe(res => {
          this.loginData = res.data;
          let user: UserJWTObj = this.authService.decodeJWT(res.data.access_token);
         
          if (user.role.localeCompare('Admin') == 0 || user.role.localeCompare('SuperAdmin') == 0) {
            this.authService.doLoginUser(this.loginData);
            if (this.authService.getJwtToken) {
              this.authService.loggedIn.next(true);
              this.authService.logValue.next(false);
            }
            //this.router.navigateByUrl(this.returnUrl);
            this.router.navigateByUrl('/adminhome');
            this.logIn = this.authService.logValue;
            this.isLogIn = this.authService.loggedIn;
        }
          else {
            this.toastr.error("User not allowed to login. Only admin")
          }
        });
    } catch (err) {
      this.loginInvalid = true;
    }
  } else {
  this.formSubmitAttempt = true;
}
  }

}

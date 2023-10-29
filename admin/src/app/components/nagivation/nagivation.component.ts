import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { TokenLite, User, UserJWTObj } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-nagivation',
  templateUrl: './nagivation.component.html',
  styleUrls: ['./nagivation.component.scss']
})
export class NagivationComponent {
  public userName : string;
  public statusOpen: string = "Open";
  public statusAdminPending: string = "Pending";
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver, private Auth: AuthService, public dialog: MatDialog,private userService: UserService) {}

  async ngOnInit(): Promise<void> {
    this.Auth.loggedIn.subscribe(loggedIn => {
      if (!loggedIn) {
        this.openLoginDialog();
      } 
    });

    this.userService.viewProfile().subscribe( res =>{
      this.userName = res.data.firstName;
    })
 
  }

  logOut() {
    this.Auth.removeTokens();
    this.Auth.loggedIn.next(false);
    this.Auth.logValue.next(true);
  }

  openLoginDialog(): void {
    const dialogRef = this.dialog.open(LoginDialogComponent, {
      height: 'auto',
      width: 'auto',
      panelClass: 'full-screen-login',
      backdropClass: 'login-bg',
      disableClose: true
    });
  }

}

@Component({
  selector: 'app-admin-login',
  templateUrl: 'admin-login.component.html',
})
export class LoginDialogComponent {
  form: FormGroup;
  public loginInvalid: boolean;
  private formSubmitAttempt: boolean;
  private returnUrl: string;
  model: User = {} as User;
  private loginData: TokenLite;
  public logIn: Observable<boolean>;
  public isLogIn: Observable<boolean>;
  public userName : string;

  constructor(
    public dialogRef: MatDialogRef<LoginDialogComponent>,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private toastr: ToastrService,
    ) { }

    ngOnInit(): void {
      this.route.queryParams.subscribe(params => this.returnUrl = params['returnUrl']);
      this.form = this.fb.group({
        username: ['', Validators.email],
        password: ['', Validators.required]
      });
    }

    closeDialog(): void {
      this.dialogRef.close();
    }
  
    openSnackBar(message: string, action: string = ''): void {
      this.snackBar.open(message, action, {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
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
            this.closeDialog();
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

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-loginsucess',
  template: '',
})
export class LoginSuccessComponent implements OnInit {

  constructor(private auth: AuthService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => { 
      let access_token = params['access_token'];
      let refresh_token = params['refresh_token'];
      this.auth.storeTokens({ access_token: access_token, refresh_token: refresh_token });
      if (this.auth.getJwtToken) {
        this.auth.loggedIn.next(true);
        this.auth.logValue.next(false);
      }
      this.router.navigateByUrl("['/home']");
    });
  }

}

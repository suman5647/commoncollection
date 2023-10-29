import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-setpassword',
  templateUrl: './setpassword.component.html',
  styleUrls: ['./setpassword.component.css']
})
export class SetpasswordComponent implements OnInit {
  token: string;
  model: User = {} as User;
  password: string;
  passwordRepeat: string;

  constructor(private route: ActivatedRoute, private userService: UserService, private toastr: ToastrService, private router: Router) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['resettoken'];
    });
  }

  forgotPassword() {
    this.userService.resetPassword(this.model.password, this.model.confirmPassword,
      this.token).subscribe(res => {
        this.toastr.success(res.data.toString());
        this.router.navigateByUrl('/login');
      }
      )
  }
}

import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  model: User = {} as User;

  constructor(private userService: UserService, private toastr: ToastrService) { }

  ngOnInit() {
  }

  sendMail() {
    this.userService.forgotPassword(this.model.email).subscribe(res => {
      this.toastr.success(res.data.toString());
    }
    );
  }
}

import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/services/user.service';
import { Password } from 'src/app/core/models/common';

@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.css']
})
export class ChangepasswordComponent implements OnInit {
  password: Password = {} as Password;

  constructor(private userService: UserService, private toastr: ToastrService) { }

  ngOnInit() {
  }

  changePassword() {
    this.userService.changePassword(this.password).subscribe(res => {
      this.toastr.success(res.data.toString());
    });
  }

}

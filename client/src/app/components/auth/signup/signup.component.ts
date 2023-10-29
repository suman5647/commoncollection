import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  model: User = {} as User;

  constructor(private userService: UserService, private toastr: ToastrService, private router: Router) { }

  ngOnInit() {
  }


  signUp(userForm: NgForm) {
    this.model.fullName = this.model.firstName + ' ' + this.model.lastName;
    this.userService.postUser(this.model).subscribe(res => {
      if (res.status == 200) {
        this.toastr.success(res.data.toString());
        userForm.reset();
        this.router.navigateByUrl('/login');
      }
    }
    );
  }

  telInputObject(obj) {
    obj.setCountry('in');
  }

  getNumber(event) {
    this.model.mobile = event;

  }
}

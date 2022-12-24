import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { fadeInUpAnimation } from '../../../../@fury/animations/fade-in-up.animation';
import { AuthenticationService } from 'src/app/tabs/shared/services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResetPassword } from 'src/app/tabs/shared/models/reset-password.model';

@Component({
  selector: 'fury-forgot-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  animations: [fadeInUpAnimation]
})
export class ResetPasswordComponent implements OnInit {

  userName: string;
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;

  newPasswordInputType = 'password';
  newPasswordVisible = false;

  confirmPasswordInputType = 'password';
  confirmPasswordVisible = false;

  passwordMatch = true;

  form: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authenticationService: AuthenticationService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      newPassword: ['', Validators.compose([
        Validators.required,
        Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&].{8,}')
        //Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')
      ])
      ],
      confirmPassword: ['', Validators.compose([
        Validators.required,
        Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&].{8,}')
        //Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')
      ])
      ],
    });

  }

  ngOnInit() {
    if (this.route) {
      this.route.paramMap.subscribe(params => {
        if (params) {
          this.userName = params.get('username');
          this.email = params.get('email');
          this.token = params.get('token');
        }
      });
    }
  }


  toggleNewPasswordVisibility() {
    if (this.newPasswordVisible) {
      this.newPasswordInputType = 'password';
      this.newPasswordVisible = false;
      this.cd.markForCheck();
    } else {
      this.newPasswordInputType = 'text';
      this.newPasswordVisible = true;
      this.cd.markForCheck();
    }
  }



  toggleConfirmPasswordVisibility() {
    if (this.confirmPasswordVisible) {
      this.confirmPasswordInputType = 'password';
      this.confirmPasswordVisible = false;
      this.cd.markForCheck();
    } else {
      this.confirmPasswordInputType = 'text';
      this.confirmPasswordVisible = true;
      this.cd.markForCheck();
    }
  }



  confirm() {
    if (this.form.valid) {
      this.changePassword();
    } else {
      this.validateAllFormFields(this.form);
    }
  };

  changePassword() {
    if (this.newPassword != this.confirmPassword) {
      this.passwordMatch = false;
      this.notificationMessage('New Password and Confirm Password does not match', 'red-snackbar');
      return;
    }
    const resetPassword: ResetPassword = {
      userName: this.userName,
      email: this.email,
      password: this.newPassword,
      token: this.token
    };
    this.authenticationService.resetPassword(resetPassword
    ).subscribe({
      next: (result: any) => {
        if (result.status == 'Success') {
          this.notificationMessage('Password changed successfully.You can login with your new password', 'green-snackbar');
          this.router.navigate(['/login']);
        } else {
          this.notificationMessage('Password reset failed', 'red-snackbar');
        }
      },
      error: (err) => {
        this.notificationMessage('Password reset failed', 'red-snackbar');
      }
    });
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
}

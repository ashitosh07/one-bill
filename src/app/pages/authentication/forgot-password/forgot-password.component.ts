import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { fadeInUpAnimation } from '../../../../@fury/animations/fade-in-up.animation';
import { AuthenticationService } from 'src/app/tabs/shared/services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResetPassword } from 'src/app/tabs/shared/models/reset-password.model';

@Component({
  selector: 'fury-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  animations: [fadeInUpAnimation]
})
export class ForgotPasswordComponent implements OnInit {

  userName: string;
  email: string;
  form: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authenticationService: AuthenticationService,
    private snackbar: MatSnackBar
  ) {
    this.form = this.fb.group({
      userName: [null, Validators.required],
      email: [null, Validators.email]
    });

  }

  ngOnInit() {    
  }

  send() {
    const resetPassword: ResetPassword = { userName: this.userName, email: this.email };
    this.authenticationService.forgetPassword(resetPassword
    ).subscribe({
      next: (result: any) => {
        if (result.status == 'Success') {
          this.notificationMessage('A request has been sent your email.Please check your email for password reset', 'green-snackbar');
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

  goBack() {
    this.router.navigate(['/login']);
  }
}

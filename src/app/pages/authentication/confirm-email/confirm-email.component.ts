import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { fadeInUpAnimation } from '../../../../@fury/animations/fade-in-up.animation';
import { AuthenticationService } from 'src/app/tabs/shared/services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmailConfirmation } from 'src/app/tabs/shared/models/email-confirmation.model';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.scss'],
  animations: [fadeInUpAnimation]
})
export class ConfirmEmailComponent implements OnInit {

  userId: string;
  token: string;
  confirmed: boolean = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit() {
    if (this.route) {
      this.route.paramMap.subscribe(params => {
        if (params) {
          this.userId = params.get('userId');
          this.token = params.get('token');
          this.confirmEmail();
        }
      });
    }
  }

  confirmEmail() {
    this.confirmed = false;
    const emailConfirmation: EmailConfirmation = { userId: this.userId, token: this.token };
    this.authenticationService.confirmEmail(emailConfirmation
    ).subscribe({
      next: (result: any) => {
        if (result.status == 'Success') {
          this.confirmed = true;
          this.notificationMessage('Email confirmed successfully', 'green-snackbar');
          this.router.navigate(['/login']);
        } else {
          this.confirmed = false;
          this.notificationMessage('Email confirmation failed', 'red-snackbar');
        }
      },
      error: (err) => {
        this.confirmed = false;
        this.notificationMessage('Email confirmation failed', 'red-snackbar');
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
}
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Payment } from 'src/app/tabs/shared/models/payment.model';
import { BillService } from 'src/app/tabs/shared/services/bill.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'fury-payment-cancel',
  templateUrl: './payment-cancel.component.html',
  styleUrls: ['./payment-cancel.component.scss']
})
export class PaymentCancelComponent implements OnInit {

  form: FormGroup;
  clientId: number;
  
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: Payment,
    private dialogRef: MatDialogRef<PaymentCancelComponent>,
    private billService: BillService,
    private fb: FormBuilder,
    private cookieService: CookieService,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.form = this.fb.group({
      cancelReason: [this.data.cancelReason || '']
    })

  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  cancelPaymentHistory(data) {
    this.data.cancelReason = this.form.get('cancelReason').value;
    this.data.clientId = this.clientId;
    this.billService.cancelPaymentHistory(data).subscribe(
      {
        next: (response: boolean) => {
          if (response) {
            this.notificationMessage('Payment cancelled successfully', 'green-snackbar');
            this.dialogRef.close();
          } else {
            this.notificationMessage('Payment cancel failed', 'red-snackbar');
          }
        },
        error: (err) => {
          this.notificationMessage('Payment cancel failed', 'red-snackbar');
        }
      }
    );
    this.dialogRef.close();
  }

  save() {
    this.cancelPaymentHistory(this.data);
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BillMaster } from 'src/app/tabs/shared/models/bill-master.model';
import { BillService } from 'src/app/tabs/shared/services/bill.service';
import { BillSettlementService } from 'src/app/tabs/shared/services/billsettlement.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'fury-bill-cancel',
  templateUrl: './bill-cancel.component.html',
  styleUrls: ['./bill-cancel.component.scss']
})
export class BillCancelComponent implements OnInit {

  formHeading: string = '';
  form: FormGroup;
  buttonName: string = 'CANCEL BILL';
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: BillMaster,
    private dialogRef: MatDialogRef<BillCancelComponent>,
    private billService: BillService,
    private billSettlementService: BillSettlementService,
    private fb: FormBuilder,
    private snackbar: MatSnackBar
  ) {
    if (this.data.type === 'Cancel') {
      this.buttonName = 'CANCEL BILL';
    } else {
      this.buttonName = 'REJECT BILL';
    }
  }

  ngOnInit(): void {
    this.formHeading = this.data.type + ' Bill';
    this.form = this.fb.group({
      remarks: [this.data.remarks || ''],
    })
  }

  cancelBillHistory(data) {
    this.data.cancelRemarks = this.form.get('remarks').value;
    if (this.data && this.data.paid > 0) {
      this.notificationMessage('Already payment has done against this invoice.So cancel the payment first before continue', 'yellow-snackbar');
      return;
    }
    this.billService.cancelBillHistory(data).subscribe({
      next: (response: boolean) => {
        if (response) {
          this.notificationMessage('Invoice cancelled successfully', 'green-snackbar');
        } else {
          this.notificationMessage('Invoice cancel failed', 'red-snackbar');
        }
      },
      error: (err) => {
        this.notificationMessage('Invoice cancel failed', 'red-snackbar');
      }
    });
    this.dialogRef.close();
  }

  rejectBillMaster(data: BillMaster) {
    data.rejectedRemarks = this.form.get('remarks').value;
    const billMasterDetails: BillMaster[] = [data];
    this.billSettlementService.updatBillMasterRejectedStatus(billMasterDetails).subscribe(
      {
        next: (response: boolean) => {
          if (response) {
            this.notificationMessage('Invoice rejected successfully', 'green-snackbar');
          } else {
            this.notificationMessage('Invoice reject failed', 'red-snackbar');
          }
        },
        error: (err) => {
          this.notificationMessage('Invoice reject failed', 'red-snackbar');
        }
      });
    this.dialogRef.close();
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  save() {
    if (this.data.type === 'Cancel') {
      this.cancelBillHistory(this.data);
    } else {
      this.rejectBillMaster(this.data);
    }
  }

  close() {
    this.dialogRef.close();
  }
}

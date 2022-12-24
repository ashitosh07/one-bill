import { Component, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'fury-user-confirmation-popup',
  templateUrl: './user-confirmation-popup.component.html',
  styleUrls: ['./user-confirmation-popup.component.scss']
})
export class UserConfirmationPopupComponent {

  constructor(public dialogRef: MatDialogRef<UserConfirmationPopupComponent>) { 
    dialogRef.disableClose = true;
  }

  public confirmMessage: string = "Are you sure you want to Delete?";

  getConfirmation(message)
  {
    this.dialogRef.close(message);
  }

}

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EnvService } from 'src/app/env.service';
import { environment } from 'src/environments/environment';
import { ListItem } from '../../models/list-item.model';

@Component({
  selector: 'fury-cancel-confirmation-dialog',
  templateUrl: './cancel-confirmation-dialog.component.html',
  styleUrls: ['./cancel-confirmation-dialog.component.scss']
})
export class CancelConfirmationDialogComponent {

  public confirmMessage: string;

  constructor(private dialogRef: MatDialogRef<CancelConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private message: ListItem, private envService: EnvService) {
    dialogRef.disableClose = true;
    this.confirmMessage = this.message.label;
    if (this.message.selected) {
      setTimeout(() => {
        this.dialogRef.close(true);
      }, envService.confirmationTimeout);
    }
  }

  ngOnInit(): void {

  }

  getConfirmation(message) {
    this.dialogRef.close(message);
  }

}

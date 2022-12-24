import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientsettingsService } from 'src/app/tabs/clientsettings/clientsettings.service';
import { CopyContent } from '../../models/copy-content.model';
import { ListItem } from '../../models/list-item.model';

@Component({
  selector: 'fury-user-confirmation-dialog',
  templateUrl: './user-confirmation-dialog.component.html',
  styleUrls: ['./user-confirmation-dialog.component.scss']
})
export class UserConfirmationDialogComponent implements OnInit {

  form: FormGroup;
  title: string = 'Copy Data';
  selectedOption: ListItem = null;
  options: ListItem[] = [];

  constructor(private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: ListItem[]) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.options = this.data;
    this.form = this.fb.group({
      option: [null]
    });
  }

  close() {
    this.selectedOption = null;
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.selectedOption);
  }
}

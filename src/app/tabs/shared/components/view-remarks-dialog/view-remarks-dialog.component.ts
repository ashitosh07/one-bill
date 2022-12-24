import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Item } from '@syncfusion/ej2-angular-navigations';
import { ListData } from '../../models/list-data.model';
import { ListItem } from '../../models/list-item.model';

@Component({
  selector: 'fury-view-remarks-dialog',
  templateUrl: './view-remarks-dialog.component.html',
  styleUrls: ['./view-remarks-dialog.component.scss']
})
export class ViewRemarksDialogComponent implements OnInit {

  form: FormGroup;
  data: ListData = {};
  constructor(private dialogRef: MatDialogRef<ViewRemarksDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private item: ListData) {
    this.data = item;
  }

  ngOnInit(): void {
  }

  close() {
    this.dialogRef.close();
  }

  save(){
  }
}

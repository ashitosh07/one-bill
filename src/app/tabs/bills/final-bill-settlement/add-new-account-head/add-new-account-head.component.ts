import { Component, OnInit, Input, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AccountHead } from 'src/app/tabs/shared/models/account-head.model';

@Component({
  selector: 'app-add-new-account-head',
  templateUrl: './add-new-account-head.component.html',
  styleUrls: ['./add-new-account-head.component.scss']
})
export class AddNewAccountHeadComponent implements OnInit {

  accountHeadItems: any[] = [];
  accountHeadName: string = '';
  accountHeadId = 0;
  amount: number = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: AccountHead[],
    private dialogRef: MatDialogRef<AddNewAccountHeadComponent>
  ) { }

  ngOnInit(): void {
    this.onGetAccountHeads(this.data);
  }

  onGetAccountHeads(data: AccountHead[]) {
    this.accountHeadItems = [{ label: 'Select', value: 0 }];
    data.forEach(x => {
      this.accountHeadItems.push({ label: x.accountHeadName, value: x.id });
    });
  }

  onChangeAccountHeads(value: any) {
    this.accountHeadId = value;
    const data = this.data.find(x => x.id === this.accountHeadId);
    if (data) {
      this.accountHeadName = data.accountHeadName;
      this.amount = data.fixedAmount;
    }
  }

  onAddNewItem() {
    const accountHead: AccountHead = {
      id: this.accountHeadId,
      accountHeadName: this.accountHeadName,
      fixedAmount: this.amount
    };
    this.dialogRef.close(accountHead);
  }
}

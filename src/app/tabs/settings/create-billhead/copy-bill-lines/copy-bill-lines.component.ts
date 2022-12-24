import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { from } from 'rxjs';
import { UserConfirmationDialogComponent } from 'src/app/tabs/shared/components/user-confirmation-dialog/user-confirmation-dialog.component';
import { CopyContent } from 'src/app/tabs/shared/models/copy-content.model';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';
import { BillheadService } from 'src/app/tabs/shared/services/bill-head.service';
import { CancelConfirmationDialogComponent } from 'src/app/tabs/shared/components/cancel-confirmation-dialog/cancel-confirmation-dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'fury-copy-bill-lines',
  templateUrl: './copy-bill-lines.component.html',
  styleUrls: ['./copy-bill-lines.component.scss']
})
export class CopyBillLinesComponent implements OnInit {

  isCancel: boolean = false;
  lstClients: any = [];
  lstFilterClients: any = [];
  selectedClients: any[] = [];
  clientId: string;
  fromClientName: string;
  form: FormGroup;
  @ViewChild('allClientsSelected') private allClientsSelected: MatOption;
  constructor(private fb: FormBuilder,
    private billHeadService: BillheadService,
    private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<CopyBillLinesComponent>,
    private dialog: MatDialog,
    private cookieService: CookieService) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.clientId = this.cookieService.get('globalClientId');
    this.lstClients = this.lstFilterClients = JSON.parse(localStorage.getItem('userClients'));
    if (this.clientId) {
      this.lstClients = this.lstFilterClients.filter(x => x.clientId != Number(this.clientId));
    }
    this.form = this.fb.group({
      fromClient: [''],
      clients: ['']
    });
    this.lstFilterClients.find(item => {
      if (item.clientId == this.clientId) {
        this.fromClientName = item.clientName;
        this.selectCopyFromClient(this.fromClientName);
      }
    })
  }

  selectCopyFromClient(clientName) {
    this.selectedClients = [];
    let fromClient = this.lstFilterClients.find(item => item.clientName == clientName);
    this.clientId = fromClient.clientId;
    this.fromClientName = fromClient.clientName;
    if (this.clientId) {
      this.lstClients = this.lstFilterClients.filter(x => x.clientId != Number(this.clientId));
    }
  }

  toggleClientsAllSelection() {
    if (this.allClientsSelected.selected) {
      this.form.controls.clients
        .patchValue([...this.lstClients.map(item => item.clientId), 0]);
    } else {
      this.form.controls.clients.patchValue([]);
    }
  }

  toggleClientPerOne(all) {
    if (this.allClientsSelected.selected) {
      this.allClientsSelected.deselect();
      return false;
    }
    if (this.form.controls.clients.value.length == this.lstClients.length)
      this.allClientsSelected.select();
  }

  save() {
    if (this.isCancel) {
      this.isCancel = false;
      const confirmMessage: ListItem = {
        label: "Are you sure you want to Cancel?",
        selected: false
      };
      this.dialog.open(CancelConfirmationDialogComponent, { data: confirmMessage }).afterClosed().subscribe((message: any) => {
        if (message) {
          this.dialogRef.close();
        }
      });
      return;
    }

    const deleteAndCopy: ListItem = { label: 'Remove Existing & Copy whole Configuration from Beginning', value: 1 };
    const skipExistingChanges: ListItem = { label: 'Keep Existing & Copy Only New Configuration', value: 2 }
    const modifyExistingChanges: ListItem = { label: 'Copy Only New & Modify existing Configuration', value: 3 }
    const options: ListItem[] = [deleteAndCopy, skipExistingChanges, modifyExistingChanges];
    //const dialogRef = 
    this.dialog.open(UserConfirmationDialogComponent, {
      autoFocus: true,
      data: options
    }).afterClosed().subscribe(response => {
      if (response) {
        if (this.selectedClients && this.selectedClients.length) {
          let copyContents: CopyContent[] = [];
          this.selectedClients.forEach(x => {
            if (x != 0) {
              copyContents.push({ fromClientId: Number(this.clientId), toClientId: Number(x), type: Number(response.value) });
            }
          });
          this.billHeadService.copyBillHead(copyContents).subscribe({
            next: (response: boolean) => {
              if (response) {
                this.notificationMessage('Bill Line copied successfully.', 'green-snackbar');
              } else {
                this.notificationMessage('Bill Line copy failed', 'red-snackbar');
              }
              this.dialogRef.close();
            },
            error: (err) => {
              this.notificationMessage('Bill Line copy failed', 'red-snackbar');
            }
          });
        }
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

  search(query: string) {
    let result = this.select(query)
    this.lstClients = result;
  }

  select(query: string): any[] {
    let result: any[] = [];
    if (query) {
      for (let a of this.lstFilterClients) {
        if (a.clientName.toLowerCase().indexOf(query) > -1) {
          result.push(a)
        }
      }
    } else {
      result = this.lstFilterClients;
    }
    return result
  }

  close() {
    this.dialogRef.close();
  }

  closeDialog() {
    this.isCancel = true;
  }


}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { ClientsettingsService } from '../../clientsettings.service';
import { UserConfirmationPopupComponent } from '../../../shared/components/user-confirmation-popup/user-confirmation-popup.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'fury-client-settings-ledger-relation',
  templateUrl: './client-settings-ledger-relation.component.html',
  styleUrls: ['./client-settings-ledger-relation.component.scss']
})
export class ClientSettingsLedgerRelationComponent implements OnInit {

  blnShow = 'none';

  ledgerSettings: FormGroup;

  // group = {};
  // ledger = {};

  groupId: Number;
  ledgerId: Number;

  groupName: String = '';
  ledgerName: String = '';

  lstGroupandLedger = [];

  lstGroup = [];

  lstLedger = [];
  ledgerDataSource: MatTableDataSource<[]>;

  clientId: Number;

  ledgerColumns: ListColumn[] = [
    { name: 'Group Id', property: 'groupName', visible: true, isModelProperty: true },
    { name: 'Ledger Id', property: 'ledgerName', visible: true, isModelProperty: true },
    { name: 'Delete', property: 'actions', visible: true },
    { name: 'Modify', property: 'modify', visible: true },

  ] as ListColumn[];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private clientSettingService: ClientsettingsService,
    private cookieService: CookieService
  ) {
    this.ledgerSettings = fb.group({
      'groupId': [''],
      'ledgerId': [null]
    });
  }

  ngOnInit(): void {

    this.clientId = Number(this.cookieService.get('globalClientId'));

    this.getGroupandLedger();
    this.getGridList();


  }

  getGridList() {
    this.clientSettingService.groupandLedgerGrid(this.clientId).subscribe((data: any) => {
      if (data) {
        this.lstLedger = data;
        this.ledgerDataSource = new MatTableDataSource(this.lstLedger);

        if (this.lstLedger.length > 0) {
          this.blnShow = 'block';
        }
      }
    })
  }

  deleteLedger(row) {
    this.dialog.open(UserConfirmationPopupComponent).afterClosed().subscribe((message: any) => {
      if (message) {
        this.lstLedger.splice(this.lstLedger.findIndex((element) => element.groupName === row.groupName), 1);
        this.ledgerDataSource = new MatTableDataSource(this.lstLedger);
        if (this.lstLedger.length == 0) {
          this.blnShow = 'none';
        }
      }
    })
  }

  modifyLedger(row) {

    this.groupId = row['groupId'];
    this.ledgerId = row['ledgerId'];
    this.groupName = row['groupName'];
    this.ledgerName = row['ledgerName'];

    this.deleteLedger(row);
  }

  getGroupandLedger() {
    this.clientSettingService.getGroupandLedger().subscribe((data: any) => {
      if (data) {
        this.lstGroup = [];
        this.lstGroupandLedger = data;
        this.lstGroupandLedger.forEach(element => {
          const elementExist = this.lstGroup.findIndex(x => x.groupId == element.groupId);
          if (elementExist < 0) {
            this.lstGroup.push(element)
          }
        });
        this.lstGroupandLedger = this.lstGroupandLedger.filter(x => x.ledgerName);
      }
    })
  }

  get ledgerVisibleColumns() {
    return this.ledgerColumns.filter(column => column.visible).map(column => column.property);
  }

  onChangeGroupId(event: MatSelectChange) {

    this.groupName = event.source.triggerValue;

    this.lstLedger.forEach(element => {
      if (element.groupName == this.groupName) {
        this.notificationMessage('Group already added', 'red-snackbar');
        this.groupName = '';
        this.groupId = null;
        return;
      }
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

  onChangeLedgerId(event: MatSelectChange) {
    this.ledgerName = event.source.triggerValue;
  }

  saveLedger() {

    let dctLedger = {
      clientId: Number(this.cookieService.get('globalClientId')),
      groupName: this.groupName,
      groupId: this.groupId,
      ledgerName: this.ledgerName,
      ledgerId: this.ledgerId

    }
    this.lstLedger.push(dctLedger);
    this.groupName = '';
    this.ledgerName = '';
    this.ledgerId = null;
    this.groupId = null;

    this.ledgerDataSource = new MatTableDataSource(this.lstLedger);

    if (this.lstLedger.length > 0) {
      this.blnShow = 'block';
    }
  }

  onGroupChange(group) {
    this.groupName = group.groupName;
    this.groupId = group.groupId;
  }

  onLedgerChange(ledger) {
    this.ledgerName = ledger.ledgerName;
    this.ledgerId = ledger.ledgerId;
  }

}

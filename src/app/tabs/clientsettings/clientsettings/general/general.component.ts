import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CookieService } from 'ngx-cookie-service';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { ClientsettingsService } from '../../clientsettings.service';

@Component({
  selector: 'fury-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss']
})
export class GeneralComponent implements OnInit {

  generalSettings: FormGroup;

  clientId: Number = null;
  lstClients = [];

  workingHrs: string = '';
  supportMail: string;
  website: string;
  billSettingsId: Number;
  lstBillSettings: Master[];
  isBilledbyClient: boolean = false;

  constructor(private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private clientSettingService: ClientsettingsService,
    private cookieService: CookieService) {
    this.generalSettings = fb.group({
      'clientId': [{value:'', disabled: true}],
      'workingHrs': [null],
      'supportMail': [null],
      'website': [''],
      'billSettingsId': [''],
      'isBilledbyClient': false
    });
  }

  ngOnInit(): void {
    this.lstClients = JSON.parse(localStorage.getItem('userClients'));

    this.clientId = Number(this.cookieService.get('globalClientId'));

    this.getBillSettings();

    this.initialData(this.clientId);
  }

  initialData(clientId) {
    this.clientSettingService.generalData(clientId).subscribe({
      next: (data: any) => {
        if (data) {
          this.workingHrs = data['workingHours'];
          this.supportMail = data['supportMail'];
          this.website = data['website'];
          this.billSettingsId = data['billSettingsId'];
          this.isBilledbyClient = data['isBilledbyClient'];
        }
      },
      error: (err: any) => {
        this.workingHrs = null;
        this.supportMail = null;
        this.website = '';
        this.billSettingsId = 0;
        this.isBilledbyClient = false;
        this.notificationMessage('Data Not Found.', 'red-snackbar');
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

  onChangeClientId(value) {
    this.initialData(value);
  }

  getBillSettings() {
    this.clientSettingService.getBillSettings().subscribe((data: Master[]) => {
      if (data) {
        this.lstBillSettings = data;
      }
    })
  }



}

import { Component, Inject, OnInit, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Observable, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { FormValidators } from '../../../shared/methods/form-validators';
import { Metadata } from 'src/app/tabs/shared/models/metadata.model';
import { MetadataBillSettings } from '../../../shared/models/metadata.bill-settings.model'
import { MetadataService } from 'src/app/tabs/shared/services/metadata.service';
import { BillPeriod } from './billperiod.model';
import { defaults } from 'chart.js';
import { DatePipe } from '@angular/common';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { BillPeriodService } from 'src/app/tabs/shared/services/billperiod.service';
import { CancelConfirmationDialogComponent } from 'src/app/tabs/shared/components/cancel-confirmation-dialog/cancel-confirmation-dialog.component';
import { CookieService } from 'ngx-cookie-service';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';

@Component({
  selector: 'fury-billperiod-create-update',
  templateUrl: './billperiod-create-update.component.html',
  styleUrls: ['./billperiod-create-update.component.scss']
})
export class BillperiodCreateUpdateComponent implements OnInit {

  static id = 100;
  startDate: Date;
  endDate: Date;
  billSettingsId: number = 0;
  billSettingsName: string = '';
  periodDescription: string = '';
  isValidDate: boolean = true;
  isCancel: boolean = false;
  form: FormGroup;
  clientId: number;

  mode: 'create' | 'update' = 'create';

  metadataBillSettings: Master[];
  filteredBillSettings: Master[];

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: BillPeriod,
    private dialogRef: MatDialogRef<BillperiodCreateUpdateComponent>,
    private fb: FormBuilder, private metadataService: MetadataService,
    private datePipe: DatePipe, private billPeriodService: BillPeriodService,
    private fv: FormValidators, private dialog: MatDialog,
    private cookieService: CookieService) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    if (this.defaults) {
      this.mode = 'update';
    }
    else {
      this.defaults = new BillPeriod({});
    }
    this.billPeriodService.getBillSettings(this.clientId).subscribe((data: Master[]) => {
      if (data) {
        this.metadataBillSettings = data;
        //this.filteredBillSettings = data;
      }
    })

    // this.metadataBillSettings = this.metadataService.getMetadata().billSettings;
    // this.filteredBillSettings = this.metadataService.getMetadata().billSettings;

    this.form = this.fb.group({
      id: [this.defaults.id || BillperiodCreateUpdateComponent.id++],
      billSettingsId: [this.defaults.billSettingsId || '', Validators.required],
      billSettingsName: [this.defaults.billSettingsName || ''],
      periodDescription: [this.defaults.periodDescription || '', Validators.required],
      fromDate: [this.defaults.periodStart || '', Validators.required],
      toDate: [this.defaults.periodEnd || '', Validators.required]
    });

    this.billSettingsId = this.defaults.billSettingsId;
    this.billSettingsName = this.defaults.billSettingsName;
    this.periodDescription = this.defaults.periodDescription;
    this.startDate = new Date(this.defaults.periodStart.toString().replace(/-/g, '\/').replace(/T.+/, ''));
    this.endDate = new Date(this.defaults.periodEnd.toString().replace(/-/g, '\/').replace(/T.+/, ''));
    this.form.controls.billSettingsName.valueChanges.subscribe(newSettingsName => {
      this.filteredBillSettings = this.filterSettingsName(newSettingsName);
    });
  }

  setValidator()
  {
    //this.form.controls.fromDa
  }

  getBillSettings() {
    this.filteredBillSettings = this.filterSettingsName(this.form.controls.billSettingsName.value);
  }

  filterSettingsName(name: string) {
    if ((this.form.controls.billSettingsName.pristine) && (this.mode != 'create')) {
      return [];
    }
    else {
      return this.metadataBillSettings.filter(billSettings =>
        billSettings.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
    }
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
    this.defaults.periodDescription = this.form.controls.periodDescription.value;
    this.defaults.billSettingsId = this.form.controls.billSettingsId.value;
    this.defaults.billSettingsName = this.form.controls.billSettingsName.value;
    this.defaults.periodStart = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
    this.defaults.periodEnd = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');
    // console.log(this.startDate);
    // console.log(this.endDate);
    // console.log(this.defaults.periodStart);
    // console.log(this.defaults.periodEnd);
    // console.log(this.defaults.periodStart.toString().replace(/-/g, '\/'));
    // console.log(this.defaults.periodEnd.toString().replace(/-/g, '\/'));
    // console.log(this.defaults.periodStart.toString().replace(/-/g, '\/').replace(/T.+/, ''));
    // console.log(this.defaults.periodEnd.toString().replace(/-/g, '\/').replace(/T.+/, ''));
    // console.log(new Date(this.defaults.periodStart.toString().replace(/-/g, '\/').replace(/T.+/, '')).toISOString().substr(0, 10));
    // console.log(new Date(this.defaults.periodEnd.toString().replace(/-/g, '\/').replace(/T.+/, '')).toISOString().substr(0, 10));
    // // if (this.mode === 'create') {
    //   this.createBillPeriod();
    // }
    // else if (this.mode === 'update' || this.mode === 'renew' || this.mode === 'delete') {
    //   this.updateBillPeriod();
    // }
    this.defaults.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.dialogRef.close(new BillPeriod(this.defaults));
  }

  // createBillPeriod() {
  //   Object.assign(this.defaults, this.form.value);
  //   this.defaults.clientId = parseInt(this.cookieService.get('globalClientId'));
  //   this.dialogRef.close(new BillPeriod(this.defaults));
  // }

  // updateBillPeriod() {
  //   Object.assign(this.defaults, this.form.value);
  //   this.defaults.clientId = parseInt(this.cookieService.get('globalClientId'));
  //   this.dialogRef.close(new BillPeriod(this.defaults));
  // }

  isCreateMode() {
    return this.mode === 'create';
  }

  isUpdateMode() {
    return this.mode === 'update';
  }

  selectBillSettings(event) {
    this.metadataBillSettings.forEach(billSettings => {
      if (event.option.value == billSettings.description) {
        this.form.controls.billSettingsId.setValue(billSettings.id);
        this.form.controls.billSettingsName.setValue(billSettings.description);
      }
    })
  }

  validateDates(event: Date) {
    this.isValidDate = true;
    const endDate: Date = event;
    var startYear = new Date(this.startDate).getFullYear();
    var endYear = new Date(endDate).getFullYear();
    if ((startYear != 1970) && (endYear != 1970)) {
      if (startYear < endYear) {
        this.isValidDate = true;
      }
      else if (startYear > endYear) {
        this.isValidDate = false;
        return this.isValidDate;
      }
      else if (this.startDate != null && endDate != null) {
        if ((endDate) < (this.startDate)) {
          this.isValidDate = false;
        }
        return this.isValidDate;
      }
    }
    else {
      return this.isValidDate;
    }
  }

  close() {
    this.dialogRef.close();
  }

  closeDialog() {
    this.isCancel = true;
  }

}

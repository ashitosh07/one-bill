import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { ManageParams } from 'src/app/tabs/shared/models/manage-params.model';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { ConsumptionAlert } from 'src/app/tabs/shared/models/consumption-alert.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConsumptionAlertRange } from 'src/app/tabs/shared/models/consumption-alert-range.model';
import { MatDialog } from '@angular/material/dialog';
import { CancelConfirmationDialogComponent } from 'src/app/tabs/shared/components/cancel-confirmation-dialog/cancel-confirmation-dialog.component';
import { BillSettlementService } from 'src/app/tabs/shared/services/billsettlement.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'fury-bill-consumption-toolbar',
  templateUrl: './bill-consumption-toolbar.component.html',
  styleUrls: ['./bill-consumption-toolbar.component.scss']
})
export class BillConsumptionToolbarComponent implements OnInit {


  @Input() billPeriods: any[] = [];
  @Input() utilityTypes: any[] = [];
  @Input() set consumptionRangeDatas(datas: ConsumptionAlertRange[]) {
    let consumptionAlerts: ConsumptionAlert[] = [];
    if (datas && datas.length) {
      datas.forEach(x => {
        let description: string = '';

        if (x.consumptionType === 'High Consumption') {
          description = `Threshold set for ${x.consumptionType} for the ${x.fromBillPeriod} bill period is ${x.percentage}% .Bill will be considered in failed state if consumption exceeds the ${x.percentage}%`;
        }

        if (x.consumptionType === 'Low Consumption') {
          description = `Threshold set for ${x.consumptionType} for the ${x.fromBillPeriod} bill period is ${x.percentage}% .Bill will be considered in failed state if consumption is lower than the ${x.percentage}%`;
        }

        if (x.consumptionType === 'Zero Consumption') {
          description = `Threshold set for ${x.consumptionType} for the ${x.fromBillPeriod} bill period is ${x.percentage}%`;
        }

        consumptionAlerts.push({ id: x.id, fromBillPeriod: x.fromBillPeriod, toBillPeriod: x.toBillPeriod, consumptionType: x.consumptionType, utilityType: x.utilityType, percentage: x.percentage, description: description });
      });
      this.filterConsumptionAlerts = this.consumptionAlerts = consumptionAlerts;
    }
  }

  @Output() searchClicked = new EventEmitter<ManageParams>();
  @Output() saveClicked = new EventEmitter();
  @Output() disableSave = new EventEmitter<boolean>();

  fromDate: string;
  startDate: string;
  endDate: string;
  percentageDatewise: number = 0;
  toBillPeriod: string = '';
  fromBillPeriod: string = '';
  consumptionType: string = '';
  utilityType: string = '';
  manageParams: ManageParams;
  optionId: string = '1';
  consumptionTypes: ListItem[] = [
    {
      label: 'Select',
      value: 0
    },
    {
      label: 'High Consumption',
      value: 1
    },
    {
      label: 'Low Consumption',
      value: 2
    },
    {
      label: 'Zero Consumption',
      value: 3
    }
  ];

  alertTypeToCompareCoulmnName = 'Alert Type';
  utilityTypeToCompareCoulmnName = 'Utility Type';
  billPeriodToCompareCoulmnName = 'Bill Period To Compare';
  toBeCompareWithCoulmnName = 'To Be Compared With';
  percentageDifferenceColumnName = 'Percentage Difference [%]';
  descriptionColumnName = 'Description';

  columns: any[] = [];
  consumptionAlerts: ConsumptionAlert[] = [];
  consumptionAlertRanges: ConsumptionAlertRange[] = [];
  filterConsumptionAlerts: ConsumptionAlert[] = [];
  consumptionAlertRange: ConsumptionAlertRange = {};

  form: FormGroup;
  billPeriodForm: FormGroup;

  disableBillPeriod: boolean = true;
  disableDatewise: boolean = true;
  clientId: number;

  constructor(
    private snackbar: MatSnackBar,
    private billSettlementService: BillSettlementService,
    private dialog: MatDialog,
    private cookieService: CookieService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.createGridColumns();
    this.form = this.fb.group({
      consumptionTypeId: [this.consumptionAlertRange.consumptionTypeId || 0, Validators.required],
      utilityTypeId: [this.consumptionAlertRange.utilityTypeId || 0, Validators.required]
    });

    this.billPeriodForm = this.fb.group({
      fromBillPeriodId: [this.consumptionAlertRange.fromBillPeriodId || 0, Validators.required],
      toBillPeriodId: [this.consumptionAlertRange.toBillPeriodId || 0, Validators.required],
      percentageBillPeriod: [this.consumptionAlertRange.percentage || 0]
    });

  }

  onSearch(type: string) {
    if (!this.enbaleValidators(type)) {
      if (type == 'BillPeriod') {
        this.disableSave.emit(true);
      }
      return;
    } else {
      if (type == 'BillPeriod') {
        this.disableSave.emit(false);
      }
    }
    if (this.optionId == '1') {
      this.manageParams = {
        consumptionTypeId: this.form.controls.consumptionTypeId.value,
        consumptionType: this.consumptionType,
        utilityTypeId: this.form.controls.utilityTypeId.value,
        utilityType: this.utilityType,
        fromBillPeriodId: this.billPeriodForm.controls.fromBillPeriodId.value,
        toBillPeriodId: this.billPeriodForm.controls.toBillPeriodId.value,
        percentage: this.billPeriodForm.controls.percentageBillPeriod.value ?? 0
      }
    } else {
      this.manageParams = {
        consumptionTypeId: this.form.controls.consumptionTypeId.value,
        consumptionType: this.consumptionType,
        utilityTypeId: this.form.controls.utilityTypeId.value,
        utilityType: this.utilityType,
        fromDate: `${this.fromDate === undefined ? '' : moment(this.fromDate).format('YYYY-MM-DD')}`,
        startDate: `${this.startDate === undefined ? '' : moment(this.startDate).format('YYYY-MM-DD')}`,
        endDate: `${this.endDate === undefined ? '' : moment(this.endDate).format('YYYY-MM-DD')}`,
        percentage: this.percentageDatewise
      }
    }
    this.searchClicked.emit(this.manageParams);
  }


  enbaleValidators(type: string) {
    let valid = true;
    if (type == 'BillPeriod') {
      if (!this.formValidation(this.form) || !this.formValidation(this.billPeriodForm)) {
        valid = false;
      }
    } else {
      if (!this.formValidation(this.form) || !this.startDate || !this.endDate || !this.fromDate) {
        valid = false;
      }
    }
    return valid;
  }

  formValidation(form: FormGroup) {
    let valid = true;
    const controls = form.controls;
    Object.keys(controls).forEach(key => {
      if (controls[key].validator && (!controls[key].value || controls[key].value == 0)) {
        valid = false;
      }
    });
    return valid;
  }


  reset() {
    if (this.optionId == '1') {
      this.fromDate = this.startDate = this.endDate = '';
      this.disableDatewise = true;
      //this.searchClicked.emit(null);
    } else {
      this.billPeriodForm.reset();
      this.consumptionAlerts = [];
      this.disableDatewise = true;
      //this.disableSave.emit(true);
      //this.searchClicked.emit(null);
    }
  }

  createGridColumns(): any {
    this.columns = [
      { name: "Id", property: 'id', visible: false, isModelProperty: false },
      { name: this.alertTypeToCompareCoulmnName, property: 'consumptionType', visible: true, isModelProperty: true },
      { name: this.utilityTypeToCompareCoulmnName, property: 'utilityType', visible: true, isModelProperty: true },
      { name: this.billPeriodToCompareCoulmnName, property: 'fromBillPeriod', visible: true, isModelProperty: true },
      { name: this.toBeCompareWithCoulmnName, property: 'toBillPeriod', visible: true, isModelProperty: true },
      { name: this.percentageDifferenceColumnName, property: 'percentage', visible: true, isModelProperty: true },
      { name: this.descriptionColumnName, property: 'description', visible: true, isModelProperty: true },
      { name: 'Actions', property: 'actions', visible: true, isModelProperty: false }
    ] as ListColumn[];

  }

  onChangeFromBillPeriod(event: any) {
    this.fromBillPeriod = event.source.triggerValue;
    this.dropDownValidation();
  }

  onChangeToBillPeriod(event: any) {
    this.toBillPeriod = event.source.triggerValue;
    this.dropDownValidation();
  }

  onChangeConsumptionType(event: any) {
    this.consumptionType = event.source.triggerValue;
    if (this.consumptionType === 'Zero Consumption') {
      this.billPeriodForm.get('toBillPeriodId').clearValidators()
    }
    this.dropDownValidation();
  }

  onChangeUtilityType(event: any) {
    this.utilityType = event.source.triggerValue;
    this.dropDownValidation();
  }

  dropDownValidation() {
    this.filter();
    if (!this.formValidation(this.form) || !this.formValidation(this.billPeriodForm)) {
      this.disableBillPeriod = true;
      this.disableSave.emit(true);
    } else {
      this.disableBillPeriod = false;
      this.disableSave.emit(false);
    }
  }

  onSave() {
    this.saveClicked.emit();
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  optionChange(option: any) {
    this.optionId = option.value;
    if (this.optionId === '2') {
      this.disableSave.emit(true);
    }
    this.reset();
  }

  filter() {
    this.consumptionAlerts = this.filterConsumptionAlerts;
    if (this.consumptionAlerts && this.consumptionAlerts.length) {
      if (this.consumptionType) {
        this.consumptionAlerts = this.consumptionAlerts.filter(x => x.consumptionType == this.consumptionType);
      }
      if (this.utilityType) {
        this.consumptionAlerts = this.consumptionAlerts.filter(x => x.utilityType == this.utilityType);
      }
      if (this.fromBillPeriod) {
        this.consumptionAlerts = this.consumptionAlerts.filter(x => x.fromBillPeriod == this.fromBillPeriod);
      }
      if (this.toBillPeriod) {
        this.consumptionAlerts = this.consumptionAlerts.filter(x => x.toBillPeriod == this.toBillPeriod);
      }
    }
  }

  getConsumptionAlertRanges() {
    this.consumptionAlerts = [];
    this.filterConsumptionAlerts = [];
    const manageParams: ManageParams = { clientId: this.clientId };
    if (manageParams) {
      this.billSettlementService.getConsumptioSavedAlertDetails(manageParams).subscribe(
        (consumptionAlerts: ConsumptionAlertRange[]) => {
          if (consumptionAlerts && consumptionAlerts.length) {
            this.consumptionAlerts = this.filterConsumptionAlerts = consumptionAlerts;
          }
          else {
            this.consumptionAlerts = [];
            this.filterConsumptionAlerts = [];
          }
        });
    }
  }

  onDeleteRow(row: ConsumptionAlert) {
    const confirmMessage: ListItem = {
      label: "Are you sure you want to Delete?",
      selected: false
    };
    this.dialog.open(CancelConfirmationDialogComponent, { data: confirmMessage }).afterClosed().subscribe((message: any) => {
      if (message) {
        this.billSettlementService.deleteConsumptionAlert(row.id,row).subscribe({ next: (status: boolean) => {
          if(status) {
            this.getConsumptionAlertRanges();
            this.notificationMessage("Consumption Alert deleted successfully.","green-snackbar");
          }
          else {
            this.notificationMessage("Consumption Alert deletion failed.","red-snackbar");
          }
        },
        error: (err) => {
          this.notificationMessage('Consumption Alert deletion failed.', 'red-snackbar');
        }
        });
      }
    });
  }

}

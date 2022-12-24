import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { BillSettings } from '../../create-billsettings/billsettings-create-update/billsettings.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, ReplaySubject } from 'rxjs';
//import { FormValidators } from '../../../shared/methods/form-validators';
import { Metadata } from '../../../shared/models/metadata.model';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { MasterService } from 'src/app/tabs/shared/services/master.service';
import { CancelConfirmationDialogComponent } from 'src/app/tabs/shared/components/cancel-confirmation-dialog/cancel-confirmation-dialog.component';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';
import { CookieService } from 'ngx-cookie-service';
import { TaxSettingsService } from 'src/app/tabs/shared/services/tax-settings.service';

@Component({
  selector: 'billsettings-create-update',
  templateUrl: './billsettings-create-update.component.html',
  styleUrls: ['./billsettings-create-update.component.scss']
})
export class BillsettingsCreateUpdateComponent implements OnInit {


  static id = 100;
  form: FormGroup;
  mode: 'create' | 'update' = 'create';
  image: any = 'assets/img/avatars/two.png';
  subject$: ReplaySubject<BillSettings[]> = new ReplaySubject<BillSettings[]>(1);
  data$: Observable<BillSettings[]> = this.subject$.asObservable();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  metadataBillAmountTypes: Master[];
  metadataBillPeriodTypes: Master[];
  metadataBillFormat: Master[];
  metadata: Metadata;
  filteredBillAmountTypes: Master[];
  filteredBillFormat: Master[];
  filteredBillPeriodTypes: Master[];
  isCancel: boolean = false;
  clientId: number;
  //lstTermsAndConditions: Master[];
  taxSettings: Master[];
  constructor(@Inject(MAT_DIALOG_DATA) public defaults: BillSettings,
    private masterService: MasterService, private dialog: MatDialog,
    private cookieService: CookieService,
    private dialogRef: MatDialogRef<BillsettingsCreateUpdateComponent>,
    private fb: FormBuilder, private taxSettingsService: TaxSettingsService) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {

    if (this.defaults) {
      this.mode = 'update';
    }
    else {
      this.defaults = new BillSettings({});
    }
    this.clientId = parseInt(this.cookieService.get('globalClientId'));

    this.masterService.getSystemMasterdata(23, 0).subscribe((data: Master[]) => {
      this.metadataBillAmountTypes = data;
      this.filteredBillAmountTypes = data;
    });
    this.masterService.getSystemMasterdata(24, 0).subscribe((data: Master[]) => {
      this.metadataBillFormat = data;
      this.filteredBillFormat = data;
    });
    this.masterService.getSystemMasterdata(39, 0).subscribe((data: Master[]) => {
      this.metadataBillPeriodTypes = data;
      this.filteredBillPeriodTypes = data;
    });

    // this.billsettingsService.getTermsAndConditions(this.clientId).subscribe((data: Master[]) => {
    //   this.lstTermsAndConditions = data;
    // })

    this.taxSettingsService.getAllTaxSettings().subscribe((taxSettings: Master[]) => {
      this.taxSettings = taxSettings
    });

    // this.metadataService.invokeMetadata();
    // this.metadata = this.metadataService.getMetadata();
    // this.metadataBillAmountTypes = this.metadata.billAmountTypes;
    // this.metadataBillFormat = this.metadata.billFormats;
    // this.filteredBillFormat = this.metadata.billFormats;
    // this.metadataBillPeriodTypes=this.metadata.billPeriodTypes

    this.form = this.fb.group({
      id: [this.defaults.id || BillsettingsCreateUpdateComponent.id++],
      billSettingsName: [this.defaults.billSettingsName || '', Validators.required],
      billPeriodTypeId: [this.defaults.billPeriodTypeId || 0],
      billPeriodType: [this.defaults.billPeriodType || ''],
      averageMonthsNumber: [this.defaults.averageMonthsNumber || '', Validators.required],
      billAmountType: [this.defaults.billAmountType || 0],
      amountType: [this.defaults.amountType || ''],
      billFormat: [this.defaults.billFormat || '', Validators.required],
      billDueDays: [this.defaults.billDueDays || '', Validators.required],
      penaltyAfter: [this.defaults.penaltyAfter || '', Validators.required],
      //termsAndConditionId: [this.defaults.termsAndConditionId || '', Validators.required],
      //termsAndCondition: [this.defaults.termsAndCondition || '', Validators.required],
      taxId: [this.defaults.taxId || ''],
      taxName: [this.defaults.taxName || '']
    })
    this.form.controls.billPeriodType.valueChanges.subscribe(newBillPeriodType => {
      this.filteredBillPeriodTypes = this.filterBillPeriodTypes(newBillPeriodType);
    });
    this.form.controls.amountType.valueChanges.subscribe(newAmountType => {
      this.filteredBillAmountTypes = this.filterBillAmountType(newAmountType);
    });
    // this.form.controls.billFormat.valueChanges.subscribe(newBillFormat => {
    //   this.filteredBillFormat = this.filterBillFormats(newBillFormat);
    // });
  }

  filterBillPeriodTypes(name: string) {
    return this.metadataBillPeriodTypes.filter(billPeriodTypes =>
      billPeriodTypes.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  // filterBillFormats(name: string) {
  //   if ((name != null) && (name != undefined) && (name != '')) {
  //     return this.metadataBillFormat.filter(billFormat =>
  //       billFormat.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  //   }
  //   else {
  //     this.form.controls.billFormatId.setValue('');
  //     return this.metadataBillFormat;
  //   }
  // }

  filterBillAmountType(name: string) {
    return this.metadataBillAmountTypes.filter(billAmountTypes =>
      billAmountTypes.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
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
    if (this.mode === 'create') {
      this.createBillsettings();
    }
    else if (this.mode === 'update') {
      this.updateBillsettings();
    }
  }

  createBillsettings() {
    Object.assign(this.defaults, this.form.value);
    this.dialogRef.close(new BillSettings(this.defaults));
  }

  updateBillsettings() {
    Object.assign(this.defaults, this.form.value);
    this.dialogRef.close(new BillSettings(this.defaults));
  }

  isCreateMode() {
    return this.mode === 'create';
  }

  isUpdateMode() {
    return this.mode === 'update';
  }

  selectBillAmountType(event) {
    this.form.controls.billAmountType.setValue(0);
    this.metadataBillAmountTypes.forEach(amountType => {
      if (event.option.value == amountType.description) {
        this.form.controls.billAmountType.setValue(amountType.id);
      }
    })
  }

  // selectBillFormats(event) {
  //   this.form.controls.billFormatId.setValue('');
  //   this.metadataBillFormat.forEach(billFormat => {
  //     if (event.option.value == billFormat.description) {
  //       this.form.controls.billFormatId.setValue(billFormat.id);
  //     }
  //   })
  // }

  selectBillPeriodType(event) {
    this.form.controls.billPeriodTypeId.setValue(0);
    this.metadataBillPeriodTypes.forEach(billPeriodType => {
      if (event.option.value == billPeriodType.description) {
        this.form.controls.billPeriodTypeId.setValue(billPeriodType.id);
      }
    })
  }

  close() {
    this.dialogRef.close();
  }

  closeDialog() {
    this.isCancel = true;
  }

  // selectTermsConditions(event)
  // {
  //   this.form.controls.termsAndConditionId.setValue('');
  //   this.lstTermsAndConditions.forEach(termsAndCondition => {
  //     if (event.value == termsAndCondition.description) {
  //       this.form.controls.termsAndConditionId.setValue(termsAndCondition.id);
  //     }
  //   })
  // }

  selectTaxSettings(event) {
    this.form.controls.taxId.setValue('');
    this.taxSettings.forEach(taxSetting => {
      if (event.value == taxSetting.description) {
        this.form.controls.taxId.setValue(taxSetting.id);
      }
    })
  }

  uploadFile(nativeElement: any) {
    this.defaults.file = nativeElement.target.files[0];
    this.form.controls.billFormat.setValue(nativeElement.target.files[0].name);
  }

}

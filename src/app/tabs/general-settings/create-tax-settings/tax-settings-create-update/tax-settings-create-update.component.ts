import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CancelConfirmationDialogComponent } from 'src/app/tabs/shared/components/cancel-confirmation-dialog/cancel-confirmation-dialog.component';
import { FormValidators } from 'src/app/tabs/shared/methods/form-validators';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { MasterService } from 'src/app/tabs/shared/services/master.service';
import { TaxSettingsService } from 'src/app/tabs/shared/services/tax-settings.service';
import { getClientDataFormat } from 'src/app/tabs/shared/utilities/utility';
import { TaxSettings } from './tax-settings.model';

@Component({
  selector: 'fury-tax-settings-create-update',
  templateUrl: './tax-settings-create-update.component.html',
  styleUrls: ['./tax-settings-create-update.component.scss']
})
export class TaxSettingsCreateUpdateComponent implements OnInit {

  mode: 'create' | 'update' = 'create';

  form: FormGroup;
  taxSettings: Master[];
  isCancel: boolean;
  taxMapGroups = [];
  lstComputationType: Master[] = [];
  effectiveFrom: string;
  showAgainstBillLine: boolean = false;
  selectedTaxSettings = [];
  selectedTaxMapGroups: any[] = [];
  computationType: string;
  taxAmount: number = 0;
  currency = getClientDataFormat('Currency',0);
  roundFormat = getClientDataFormat('RoundOff');

  @ViewChild('allSelected') private allSelected: MatOption;

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: TaxSettings,
  private dialogRef: MatDialogRef<TaxSettingsCreateUpdateComponent>,
  private fb: FormBuilder, private taxSettingsService: TaxSettingsService,
  private fv: FormValidators, private dialog: MatDialog, 
  private masterService: MasterService) {
      dialogRef.disableClose = true;
   }

  ngOnInit(): void {
    if (this.defaults) {
      this.mode = 'update';
      this.effectiveFrom = this.defaults.effectiveFrom.toString();
      this.computationType = this.defaults.computationTypeName;      
      for (let i = 0; i < this.defaults.taxMapGroups.length; i++) {
        this.selectedTaxSettings[i] = this.defaults.taxMapGroups[i].taxId;
      }
    }
    else {
      this.defaults = new TaxSettings();
    }

    this.taxAmount = this.defaults.value;

    this.taxSettingsService.getNonGroupTaxSettings().subscribe((taxSettings: Master[]) => {
      this.taxSettings = taxSettings
    });
    this.taxSettingsService.getComputationType().subscribe((data: Master[]) => {
      this.lstComputationType = data;
    });

    this.form = this.fb.group({
      id: [this.defaults.id || 0],
      taxName: [this.defaults.taxName || '', Validators.required],
      computationType: [this.defaults.computationType || '', Validators.required],
      taxMapGroups: [this.defaults.taxMapGroups || ''],
      value: [this.defaults.value || ''],
      taxDisplayName: [this.defaults.taxDisplayName || '', Validators.required],
      effectiveFrom: [this.defaults.effectiveFrom || ''],
      showAgainstBillLine: [this.defaults.showAgainstBillLine || '']
    });

    if(this.mode == 'update')
    {
      this.form.controls.taxName.disable();
      this.form.controls.computationType.disable();
      this.setValidators();
    }

  }

  selectComputationType(event)
  {
    if(this.lstComputationType)
    {
      let item = this.lstComputationType.filter((item) => item.id == event.value);
      if(item)
      {
        this.computationType = item[0].description;
      }
    }
    this.setValidators();
  }

  setValidators()
  {
    if(this.computationType != 'Group Tax')
    {
      this.form.controls["value"].setValidators(Validators.required);
      this.form.controls["taxMapGroups"].clearValidators();
    }
    else {
      this.form.controls["taxMapGroups"].setValidators(Validators.required);
      this.form.controls["value"].clearValidators();
    }
    this.form.controls["taxMapGroups"].updateValueAndValidity();
    this.form.controls["value"].updateValueAndValidity();
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
    
    Object.assign(this.defaults, this.form.value);
    for (let i = 0; i < this.selectedTaxSettings.length; i++) {
      if (this.selectedTaxSettings[i] != 0) {
        this.selectedTaxMapGroups.push({
          taxId: this.selectedTaxSettings[i], 
          taxGroupId: this.defaults.id
        });
      }
    }    
    this.defaults.taxMapGroups = this.selectedTaxMapGroups;
    if(this.computationType == 'Group Tax')
    {
      this.defaults.value = 0;
    }      
    this.defaults.effectiveFrom = new Date();
    this.defaults.showAgainstBillLine = false;
    this.defaults.value = parseFloat(this.form.controls.value?.value == '' ? '0' : this.form.controls.value?.value);
    this.dialogRef.close(this.defaults);
  }

  isCreateMode() {
    return this.mode === 'create';
  }

  isUpdateMode() {
    return this.mode === 'update';
  }

  toggleAllSelection() {
    if (this.allSelected.selected) {
      this.form.controls.taxMapGroups
        .patchValue([...this.taxSettings.map(item => item.id), 0]);
    } else {
      this.form.controls.taxMapGroups.patchValue([]);
    }
  }

  togglePerOne(all) {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }
    if (this.form.controls.taxMapGroups.value.length == this.taxSettings.length)
      this.allSelected.select();
  }

  hideOrShowAgainstBillLine(showAgainstBillLine)
  {
    this.showAgainstBillLine = !showAgainstBillLine;
  }

  close() {
    this.dialogRef.close();
  }

  closeDialog() {
    this.isCancel = true;
  }

}

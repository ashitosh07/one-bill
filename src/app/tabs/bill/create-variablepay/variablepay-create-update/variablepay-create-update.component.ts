import { Component, Inject, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MetadataService } from 'src/app/tabs/shared/services/metadata.service';
import { Metadata } from '../../../shared/models/metadata.model';
import { MetadataTenant } from 'src/app/tabs/shared/models/metada.tenant.model';
import { MetadataBillPeriod } from '../../../shared/models/metadata.bill-period.model';
import { MetadataUnit } from 'src/app/tabs/shared/models/metadata.unit.model';
import { MetadataAccountHead } from '../../../shared/models/metadata.account-head.model';
import { MetadataBillType } from '../../../shared/models/metadata.bill-type.model';
import { VariablePay } from './variablepay.model';
import { VariablePayService } from '../../../shared/services/variablepay.service';
import { Observable, ReplaySubject } from 'rxjs';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { CancelConfirmationDialogComponent } from 'src/app/tabs/shared/components/cancel-confirmation-dialog/cancel-confirmation-dialog.component';
import { CookieService } from 'ngx-cookie-service';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';
import { getClientDataFormat } from 'src/app/tabs/shared/utilities/utility';
import { MatOption } from '@angular/material/core';

@Component({
  selector: 'fury-variablepay-create-update.component',
  templateUrl: './variablepay-create-update.component.html',
  styleUrls: ['./variablepay-create-update.component.scss']
})
export class VariablepayCreateUpdateComponent implements OnInit {

  @ViewChild('allSelected') private allSelected: MatOption;
  
  static id = 100;
  mode: 'create' | 'update' = 'create';
  form: FormGroup;
  isDeduction: boolean = false;
  tenantId: number = 0;
  clientId: number;
  accountHeadId: number = 0;
  onAveragebillType: boolean = false;
  isCancel: boolean = false;
  metadata: Metadata;
  metadataTenant: MetadataTenant[];
  metadataUnit: Master[];
  metadataBillPeriod: MetadataBillPeriod[];
  metadataAccountHead: MetadataAccountHead[];
  //metadataBillType: MetadataBillType[];
  filteredTenants: MetadataTenant[];
  filteredUnits: Master[];
  selectedUnits = [];
  filteredBillPeriods: MetadataBillPeriod[];
  filteredAccountHeads: MetadataAccountHead[];
  //filteredBillType: MetadataBillType[];
  variablePayamount: number = 0;
  currency = getClientDataFormat('Currency',0);
  roundFormat = getClientDataFormat('RoundOff');

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: VariablePay,
    private fb: FormBuilder, private dialog: MatDialog,
    private datePipe: DatePipe, private decimalPipe: DecimalPipe,
    private metadataService: MetadataService,
    private variablePayService: VariablePayService,
    private cookieService: CookieService,
    private dialogRef: MatDialogRef<VariablepayCreateUpdateComponent>) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    if (this.defaults) {
      this.mode = 'update';
      this.selectedUnits.push(this.defaults.unitId);      
      // if((this.defaults.billTypeName == "Average") || (this.defaults.billTypeName == "Manual"))
      //   this.onAveragebillType = true;
      // else
      //   this.onAveragebillType = false;
    }
    else {
      this.defaults = new VariablePay({});
    }

    this.variablePayamount = this.defaults.amount;
    //this.tenantId = this.defaults.tenantId;
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.variablePayService.getTenants(this.clientId).subscribe((tenants: MetadataTenant[]) => {
      this.metadataTenant = tenants.map(tenant => new MetadataTenant(tenant));
      this.filteredTenants = tenants
    });
    //this.metadata = this.metadataService.getMetadata();
    // this.metadataTenant = this.metadata.tenants;
    // this.filteredTenants = this.metadata.tenants;

    // if (this.defaults.tenantId != 0) {
    //   this.onTenantSelect(this.defaults.tenantId);
    // }

    this.getUnitsWithTenantName();
    this.variablePayService.getBillPeriods(this.clientId).subscribe((billPeriods: MetadataBillPeriod[]) => {
      this.metadataBillPeriod = billPeriods.map(billPeriod => new MetadataBillPeriod(billPeriod));
      this.filteredBillPeriods = billPeriods
    });
    this.variablePayService.getAccountHeads(this.clientId).subscribe((accountHeads: MetadataAccountHead[]) => {
      this.metadataAccountHead = accountHeads.map(accountHead => new MetadataAccountHead(accountHead));
      this.filteredAccountHeads = accountHeads      
      this.onBindSelectedBillLine();
    });

    // this.metadataBillPeriod = this.metadata.billPeriods;
    // this.filteredBillPeriods = this.metadata.billPeriods;
    // this.metadataAccountHead = this.metadata.accountHeads;
    // this.filteredAccountHeads = this.metadata.accountHeads;
    // this.metadataBillType = this.metadata.billTypes;
    // this.filteredBillType = this.metadata.billTypes;


    this.form = this.fb.group({
      id: [this.defaults.id || VariablepayCreateUpdateComponent.id++],
      billPeriodId: [this.defaults.billPeriodId || '', Validators.required],
      periodDescription: [this.defaults.periodDescription || ''],
      tenantId: [this.defaults.tenantId || ''], //, Validators.required],
      tenantName: [this.defaults.tenantName || ''], //,Validators.required],
      unitId: [this.defaults.unitId || ''],
      unitNumber: [this.defaults.unitNumber || ''], //Validators.required],
      accountHeadId: [this.defaults.accountHeadId || '', Validators.required],
      accountHeadName: [this.defaults.accountHeadName || '', Validators.required],
      //billType: [this.defaults.billType || '', Validators.required],
      //billTypeName: [this.defaults.billTypeName || '', Validators.required],
      isDeduction: [this.defaults.isDeduction || false],
      amount: [this.defaults.amount || ''],
      unit: [this.defaults.unit || '', Validators.required]
    });
    this.isDeduction = this.defaults.isDeduction;

    this.form.controls.periodDescription.valueChanges.subscribe(newPeriod => {
      this.filteredBillPeriods = this.filterBillPeriods(newPeriod);
    });
    this.form.controls.tenantName.valueChanges.subscribe(newTenant => {
      this.filteredTenants = this.filterTenant(newTenant);
    });
    this.form.controls.unitNumber.valueChanges.subscribe(newUnit => {
      this.filteredUnits = this.filterUnit(newUnit);
    });
    this.form.controls.accountHeadName.valueChanges.subscribe(newAccountHead => {
      this.filteredAccountHeads = this.filterAccountHeads(newAccountHead);
    });
    // this.form.controls.billTypeName.valueChanges.subscribe(newBillType => {
    //   this.filteredBillType = this.filterBillType(newBillType);      
    // });
    if(this.mode == 'update')
    {
      this.form.controls.periodDescription.disable();
      this.form.controls.unit.disable();
      this.form.controls.accountHeadName.disable();
    }
  }

  filterTenant(name: string) {
    return this.metadataTenant.filter(tenant =>
      tenant.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  filterUnit(name: string) {
    return this.metadataUnit.filter(unit =>
      unit.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  filterBillPeriods(name: string) {
    if(!this.metadataBillPeriod)
    {
      return;
    }
    return this.metadataBillPeriod.filter(billPeriod =>
      billPeriod.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  filterAccountHeads(name: string) {
    if(!this.metadataAccountHead)
    {
      return;
    }
    return this.metadataAccountHead.filter(accountHead =>
      accountHead.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  // filterBillType(name: string) {
  //   return this.metadataBillType.filter(billType =>
  //     billType.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  // }

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
      this.createVariablePay();
    }
    else if (this.mode === 'update') {
      this.updateVariablePay();
    }
  }

  createVariablePay() {
    Object.assign(this.defaults, this.form.value);
    this.defaults.amount = parseFloat(this.form.controls.amount.value == '' ? '0' : this.form.controls.amount.value);    
    this.defaults.isDeduction = this.isDeduction;
    this.defaults.clientId = this.clientId;    
    this.defaults.unit = this.selectedUnits.join(",");
    this.dialogRef.close(new VariablePay(this.defaults));
  }

  updateVariablePay() {
    Object.assign(this.defaults, this.form.value);
    this.defaults.amount = parseFloat(this.form.controls.amount.value == '' ? '0' : this.form.controls.amount.value);
    this.defaults.isDeduction = this.isDeduction;
    this.defaults.clientId = this.clientId;
    this.defaults.unit = this.selectedUnits.join(",");
    this.dialogRef.close(new VariablePay(this.defaults));
  }

  isCreateMode() {
    return this.mode === 'create';
  }

  isUpdateMode() {
    return this.mode === 'update';
  }

  selectTenant(event) {
    this.metadataTenant.forEach(tenant => {
      if (event.option.value == tenant.description) {
        this.form.controls.tenantId.setValue(tenant.id);
        this.tenantId = tenant.id;
        this.onTenantSelect(this.tenantId);
      }
    });

  }

  selectUnit(event) {
    this.metadataUnit.forEach(unit => {
      if (event.option.value == unit.description) {
        this.form.controls.unitId.setValue(unit.id);
      }
    })
  }

  selectBillPeriod(event) {
    this.metadataBillPeriod.forEach(billPeriod => {
      if (event.option.value == billPeriod.description) {
        this.form.controls.billPeriodId.setValue(billPeriod.id);
      }
    })
  }

  onFilterChange(value) {
    value = value.trim();
    value = value.toLowerCase();
    this.metadataBillPeriod.filter = value;
  }

  selectAccountHead(event) {
    this.onAveragebillType = false;
    const accountHead = this.metadataAccountHead.find(accountHead => accountHead.description === event.option.value);
    if (accountHead) {
      this.accountHeadId = accountHead.id;
      this.form.controls.accountHeadId.setValue(accountHead.id);
      if (accountHead.defaultValue && accountHead.defaultValue.toLowerCase() === 'Consumption Charge'.toLowerCase()) {
        this.onAveragebillType = true;
      }
      else if(accountHead.defaultValue && accountHead.defaultValue.toLowerCase() === 'Variable'.toLowerCase())
      {
        this.variablePayService.getVariableAmount(this.accountHeadId).subscribe((variableAmount: number) => {
          if(variableAmount)
          {
            let variableAmountLocal = this.decimalPipe.transform(variableAmount,this.roundFormat).replace(',','');
            this.form.controls.amount.setValue(variableAmountLocal);
          }          
        });
      }
    }
  }

  onBindSelectedBillLine() {
    if (this.defaults && this.defaults.accountHeadName) {
      this.onAveragebillType = false;
      const accountHead = this.metadataAccountHead.find(accountHead => accountHead.description === this.defaults.accountHeadName);
      if (accountHead && accountHead.defaultValue && accountHead.defaultValue.toLowerCase() === 'Consumption Charge'.toLowerCase()) {
        this.onAveragebillType = true;
      }
    }
  }

  // selectBillType (event) 
  // {
  //   const billType = this.metadataBillType.find(billType => billType.description === event.option.value);
  //   if (billType) {
  //     this.form.controls.billType.setValue(billType.id);
  //   }
  //   if (event.option.value === 'Average') {
  //     this.onAveragebillType = true;
  //     this.variablePayService.getConsumptionValue(this.tenantId, billType.id, this.accountHeadId).subscribe((value: number) => {
  //       this.form.controls.amount.setValue(value);
  //     });
  //   }
  //   else if(event.option.value === 'Manual')
  //   {
  //     this.onAveragebillType = true;
  //   }
  //   else
  //   {
  //     this.onAveragebillType = false;
  //   }
  // }

  toggleDeduction(value) {
    this.isDeduction = !value;
  }

  onTenantSelect(id) {
    this.filteredUnits = [];

    // this.variablePayService.getUnitsOfTenant(this.tenantId).subscribe((units: MetadataUnit[]) => {
    //   this.metadataUnit = units.map(unit => new MetadataUnit(unit));
    //   this.filteredUnits = units;
    // });
    this.getUnitsWithTenantName();
    this.form?.controls.unitNumber.setValue("");
    this.form?.controls.unitId.setValue(0);
  }

  getUnitsWithTenantName()
  {
    this.variablePayService.GetUnitsWithTenantName(this.clientId).subscribe((units: Master[]) => {
      this.metadataUnit = units.map(unit => new Master(unit));
      this.filteredUnits = units;
    });
  }

  toggleAllSelection() {
    if (this.allSelected.selected) {
      this.form.controls.unit
        .patchValue([...this.filteredUnits.map(item => item.id), 0]);
    } else {
      this.form.controls.unit.patchValue([]);
    }
  }

  togglePerOne(all) {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }
    if (this.form.controls.unit.value.length == this.filteredUnits.length)
      this.allSelected.select();
  }

  close() {
    this.dialogRef.close();
  }

  closeDialog() {
    this.isCancel = true;
  }

  searchUnit(query: string) {
    let result = this.selectUnits(query.toLowerCase())
    this.filteredUnits = result;
  }

  selectUnits(query: string): Master[] {
    let result: any[] = [];
    if(query)
    {
      for (let a of this.metadataUnit) {
        if (a.description.toLowerCase().indexOf(query) > -1) {
          result.push(a)
        }
      }
    }
    else {
      return this.metadataUnit;
    }
    return result;
  }

  handleInput(event: KeyboardEvent): void{
    event.stopPropagation();
 } 

}

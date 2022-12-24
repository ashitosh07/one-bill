import { Component, OnInit, Output, EventEmitter, Inject, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Tenant } from 'src/app/tabs/shared/models/tenant.model';
import { ManageParams } from 'src/app/tabs/shared/models/manage-params.model';
import { DatePipe } from '@angular/common';
import { BillSettlementService } from 'src/app/tabs/shared/services/billsettlement.service';
import { UnitMaster } from 'src/app/tabs/settings/create-unit-master/unit-master-create-update/unit-master.model';
import * as moment from 'moment';
import { CookieService } from 'ngx-cookie-service';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { Master } from 'src/app/tabs/shared/models/master.model';

@Component({
  selector: 'app-final-bill-settlement-toolbar',
  templateUrl: './final-bill-settlement-toolbar.component.html',
  styleUrls: ['./final-bill-settlement-toolbar.component.scss']
})
export class FinalBillSettlementToolbarComponent implements OnInit {
  unitId: number = 0;
  unitNumber = '';
  tenantId: number = 0;
  accountNumber: string = '';
  billPeriodId: number = 0;
  @Input() settlementDate: string = moment(new Date).format('YYYY-MM-DD');
  units: UnitMaster[];
  accountNumbers: Master[];
  clientId: number;
  filteredTenants: any[] = [];
  filteredUnits: UnitMaster[] = [];
  filteredAccountNumbers: Master[] = [];
  data: any[] = [];
  selectedOption: ListItem = null;
  manageParams: ManageParams = {};
  form: FormGroup;

  @Input() get tenants(): any[] { return this.data }
  set tenants(value: any[]) {
    this.filteredTenants = this.data = value;
  }

  @Input() get selectedTenant(): number { return this.tenantId }
  set selectedTenant(value: number) {
    this.tenantId = value;
    this.setTenantNameValue(value);
  }

  @Input() options: ListItem[] = [];

  @Input() billPeriods: any[] = [];

  @Input() isHide = true;
  @Input() isVisible = true;

  @Output() searchClicked = new EventEmitter<ManageParams>();

  constructor(private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private billSettlementService: BillSettlementService,
    private datePipe: DatePipe,
    private cookieService: CookieService) {
  }

  ngOnInit(): void {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.filteredTenants = this.tenants;
    this.billSettlementService.getUnits(this.clientId).subscribe((units: UnitMaster[]) => {
      this.units = units
      this.filteredUnits = units
    });
    this.billSettlementService.getAccountNumbers(this.clientId).subscribe((accountNumbers: Master[]) => {
      this.accountNumbers = accountNumbers
      this.filteredAccountNumbers = accountNumbers;
    });

    if (this.selectedOption == null) {
      this.selectedOption = this.options[0];
    }

    this.form = this.fb.group({
      option: [null],
      tenantName: [''],
      unitNumber: [''],
      accountNumber: ['']
    });
    this.radioChange(null);

    this.form.controls.unitNumber.valueChanges.subscribe(newUnit => {
      this.filteredUnits = this.filterUnit(newUnit);
    });
    this.form.controls.accountNumber.valueChanges.subscribe(newAccountNumber => {
      this.filteredAccountNumbers = this.filterAccountNumber(newAccountNumber);
    });
  }

  onSearch() {

    if (this.unitNumber || this.tenantId || this.billPeriodId) {
      this.manageParams = {
        unitNumber: this.unitNumber,
        tenantId: `${this.tenantId ? this.tenantId : '0'}`,
        billPeriodId: `${this.billPeriodId ? this.billPeriodId : '0'}`,
        settlementDate: this.settlementDate == '' ? '' : moment(this.settlementDate).format('YYYY-MM-DD'),
        billType: 2,
        clientId: this.clientId
      }
      this.searchClicked.emit(this.manageParams);
    } else {
      this.snackbar.open('Invalid search parameters', null, {
        duration: 5000,
        verticalPosition: 'top',
        horizontalPosition: 'end',
        panelClass: ['yellow-snackbar'],
      });
    }
  }

  selectTenant(event: any) {
    this.tenants.forEach(tenant => {
      if (tenant.ownerName === event.option.value) {
        this.tenantId = tenant.id;
      }
    });
  }

  selectUnit(event: any) {
    this.units.forEach(unit => {
      if (unit.unitNumber === event.option.value) {
        this.unitId = unit.id;
        this.unitNumber = unit.unitNumber;
        this.tenantId = unit.tenantId;
      }
    });
  }

  selectAccountNumber(event: any) {
    this.accountNumbers.forEach(accountNumber => {
      if (accountNumber.description === event.option.value) {
        this.tenantId = accountNumber.id;
        this.accountNumber = accountNumber.description;
      }
    });
  }

  onChangeBillPeriod(value: any) {
    this.billPeriodId = value;
  }

  filterTenant(name: string) {
    this.filteredTenants = this.data.filter(tenant =>
      tenant.ownerName.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  filterUnit(name: string) {
    if (name && name != '') {
      this.filteredUnits = this.units.filter(unit =>
        unit.unitNumber.toLowerCase().indexOf(name.toLowerCase()) === 0);
    }
    else {
      this.filteredUnits = this.units;
    }
    return this.filteredUnits
  }

  filterAccountNumber(name: string) {
    if (name && name != '') {
      this.filteredAccountNumbers = this.accountNumbers.filter(accountNumber =>
        accountNumber.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
    }
    else {
      this.filteredAccountNumbers = this.accountNumbers;
    }
    return this.filteredAccountNumbers
  }

  radioChange(event: MatRadioChange) {
    if (event != null) {
      this.selectedOption = event.value;
    }
    if (this.selectedOption.value == 1) {
      this.form.controls.tenantName.enable();
      this.form.controls.unitNumber.setValue('');
      this.form.controls.unitNumber.disable();
      this.unitId = 0;
      this.unitNumber = '';
      this.form.controls.accountNumber.setValue('');
      this.form.controls.accountNumber.disable();
    }
    else if (this.selectedOption.value == 2) {
      this.tenantId = 0;
      this.form.controls.tenantName.setValue('');
      this.form.controls.tenantName.disable();
      this.form.controls.unitNumber.enable();
      this.form.controls.accountNumber.setValue('');
      this.form.controls.accountNumber.disable();
    }
    else {
      this.form.controls.tenantName.setValue('');
      this.form.controls.tenantName.disable();
      this.unitId = 0;
      this.unitNumber = '';
      this.form.controls.unitNumber.setValue('');
      this.form.controls.unitNumber.disable();
      this.form.controls.accountNumber.enable();
    }
  }

  setTenantNameValue(tenantId) {
    const selectedTenant = this.data.find(tenant =>
      tenant.id === tenantId);
    if (selectedTenant) {
      this.form.controls.tenantName.setValue(selectedTenant.ownerName);
    }
  }

  searchTenant(query: string) {
    let result = this.selectOwnerTenant(query.toLowerCase())
    this.filteredTenants = result;
  }

  selectOwnerTenant(query: string): string[] {
    let result: any[] = [];
    if(query)
    {
      for (let a of this.data) {
        if (a.ownerName.toLowerCase().indexOf(query) > -1) {
          result.push(a)
        }
      }
    }
    else {
      return this.data;
    }
    return result;
  }

  handleInput(event: KeyboardEvent): void{
    event.stopPropagation();
  }

}

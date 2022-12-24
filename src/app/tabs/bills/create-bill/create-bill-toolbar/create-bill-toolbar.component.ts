import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ManageParams } from 'src/app/tabs/shared/models/manage-params.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { CookieService } from 'ngx-cookie-service';
import { Tenant } from 'src/app/tabs/shared/models/tenant.model';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-create-bill-toolbar',
  templateUrl: './create-bill-toolbar.component.html',
  styleUrls: ['./create-bill-toolbar.component.scss']
})
export class CreateBillToolbarComponent implements OnInit {

  utilityTypeId: number = 0;
  billPeriodId: number = 0;
  fromDate: string = Date.UTC.toString();
  toDate: string = Date.UTC.toString();
  billDate: string = '';
  isHide = true;
  clientId: number;
  selectedTenants: any[] = [];
  maxDate = new Date();
  manageParams: ManageParams = {};

  @Input() utilityTypes: any[] = [];

  @Input() billPeriods: any[] = [];

  filteredTenants: Tenant[] = [];
  data: Tenant[] = [];

  @Input() get tenants(): Tenant[] { return this.data }
  set tenants(value: Tenant[]) {
    this.filteredTenants = this.data = value;
  }

  @Output() filterClicked = new EventEmitter<ManageParams>();

  @Output() saveClicked = new EventEmitter<boolean>();

  @ViewChild('allTenantsSelected') private allTenantsSelected: MatOption;
  @ViewChild('tenantSelect') select: MatSelect;

  constructor(private snackbar: MatSnackBar,
    private cookieService: CookieService) { }

  ngOnInit(): void {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
  }

  onChangeUtilityType(value: any) {
    this.utilityTypeId = value;
  }

  onChangeBillPeriod(value: any) {
    this.isHide = true;
    this.billPeriodId = value;
    if (this.billPeriodId) {
      const billPeriod = this.billPeriods.find(x => x.value === this.billPeriodId);
      if (billPeriod) {
        this.isHide = false;
        this.fromDate = billPeriod.fromDate === '' ? '' : moment(billPeriod.fromDate).format('YYYY-MM-DD');
        this.toDate = billPeriod.toDate === '' ? '' : moment(billPeriod.toDate).format('YYYY-MM-DD');
      }
    }
  }


  onGenerate() {
    if (this.utilityTypeId !== 0 || this.billPeriodId !== 0) {
      this.manageParams = { utilityTypeId: `${this.utilityTypeId}`, billPeriodId: `${this.billPeriodId}`, clientId: this.clientId, processDate: this.billDate ? `${moment(this.billDate).format('YYYY-MM-DD')}` : null };
      if (this.selectedTenants && this.selectedTenants.length) {
        this.manageParams.tenantIds = this.selectedTenants.filter(x => x != 0);
      }
      this.filterClicked.emit(this.manageParams);
    } else {
      this.snackbar.open('Invalid search parameters', null, {
        duration: 5000,
        verticalPosition: 'top',
        horizontalPosition: 'end',
        panelClass: ['yellow-snackbar'],
      });
    }
  }

  toggleTenantsAllSelection() {
    this.selectedTenants = [];
    if (this.allTenantsSelected.selected) {
      this.selectedTenants = this.filteredTenants.map(x => { return x.id });
      this.select.options.forEach((item: MatOption) => item.select());
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
      this.selectedTenants = [];
    }
  }

  toggleTenantsPerOne() {
    if (this.allTenantsSelected.selected) {
      this.allTenantsSelected.deselect();
      return false;
    }
    if (this.data.length <= this.selectedTenants.length) {
      this.allTenantsSelected.select();
    }
  }

  searchTenants(query: string) {
    let result = this.selectTenants(query.toLowerCase())
    this.filteredTenants = result;
  }

  selectTenants(query: string): Tenant[] {
    let result: Tenant[] = [];
    if (query) {
      for (let a of this.data) {
        if (a.ownerName.toLowerCase().indexOf(query) > -1) {
          result.push(a)
        }
      }
    } else {
      result = this.filteredTenants = this.data;
    }
    return result
  }

  handleInput(event: KeyboardEvent): void{
    event.stopPropagation();
  }
}

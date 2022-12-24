import { Component, OnInit, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { Tenant } from 'src/app/tabs/shared/models/tenant.model';
import { ManageParams } from 'src/app/tabs/shared/models/manage-params.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';
import * as moment from 'moment';
import { CookieService } from 'ngx-cookie-service';
import { validateDates } from '../../../shared/utilities/utility';
import { MasterService } from 'src/app/tabs/shared/services/master.service';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';

@Component({
  selector: 'app-bill-history-toolbar',
  templateUrl: './bill-history-toolbar.component.html',
  styleUrls: ['./bill-history-toolbar.component.scss']
})
export class BillHistoryToolbarComponent implements OnInit {

  isValidDate: boolean = true;
  @Input() billPeriods: ListItem[] = [];
  //@Input() tenants: Tenant[] = [];
  @Input() billFeeTypes: ListItem[] = [];
  @Input() billTypes: ListItem[] = [];
  @Input() isHide = true;
  @Input() isApproveBills = false;
  @Input() isRejectedBills = false;
  @Input() isTenantVisible = false;

  selectedTenants: any[] = [];
  filteredTenants: Tenant[] = [];
  data: Tenant[] = [];

  @Input() get tenants(): Tenant[] { return this.data }
  set tenants(value: Tenant[]) {
    this.filteredTenants = this.data = value;
  }

  @ViewChild('allTenantsSelected') private allTenantsSelected: MatOption;
  @ViewChild('tenantSelect') select: MatSelect;

  @Output() searchClicked = new EventEmitter<ManageParams>();
  @Output() billFeeTypeChanged = new EventEmitter<string>();

  manageParams: ManageParams = {};
  tenantId: number = 0;
  fromDate: string = '';
  toDate: string = '';
  unitNumber: string = '';
  billPeriodId: number = 0;
  billFeeTypeId: number = 0;
  billFeeType: string = '';
  billTypeId: number = 0;
  billType: string = '';
  role: string = '';
  ownerId: number = 0;
  lstMonths: Master[] = [];
  monthSelected: string = '3 Months';   

  constructor(private snackbar: MatSnackBar,
    private date: DatePipe,private masterService: MasterService,
    private jwtHelperService: JwtHelperService,
    private cookieService: CookieService) { }

  ngOnInit(): void {
    let token = this.cookieService.get('access_token');
    const decodedToken = this.jwtHelperService.decodeToken(token);
    if (decodedToken)
      this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    const ownerId = this.cookieService.get('ownerId')
    this.ownerId = parseInt((ownerId ? ownerId : '0'));
    if (this.ownerId > 0) {
      this.masterService.getSystemMasterdata(81, 0).subscribe((data: Master[]) => {
        if(data && data.length > 0)
        {
          this.lstMonths = data;
          this.monthSelected = this.lstMonths[0].description;
        } 
        this.onSearch();
      });      
    }
  }

  getDates()
  {
    if(this.monthSelected != '')
    {
      let month = this.monthSelected.substr(0,this.monthSelected.indexOf(' '));
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setMonth(fromDate.getMonth() - parseInt(month)+1);
      fromDate.setDate(1);
      this.fromDate = fromDate.toString();
      this.toDate = toDate.toString();
    }  
  }

  onSearch() {
    if(this.ownerId > 0)
    {
      this.getDates();
    }
    
    if ((this.fromDate && this.toDate) || this.billPeriodId || this.ownerId > 0) {
      this.manageParams = {
        fromDate: `${this.fromDate == '' ? '' : moment(this.fromDate).format('YYYY-MM-DD')}`,
        toDate: `${this.toDate == '' ? '' : moment(this.toDate).format('YYYY-MM-DD')}`,
        billPeriodId: `${this.billPeriodId}`,
        billFeeType: this.billFeeType,
        billType: this.billTypeId,
        tenantId: this.role != 'External' && this.selectedTenants && this.selectedTenants.length > 0 ? this.selectedTenants.join(",") : this.ownerId.toString()
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

  onChangeBillPeriod(value) {
    this.billPeriodId = value;
  }

  // onChangeFine(value) {
  //   this.isFine = value.checked;
  // }

  // onChangePenality(value) {
  //   this.isPenality = value.checked;
  // }

  onChangeBillFeeType(value) {
    this.billFeeTypeId = value;
    const billFeeType = this.billFeeTypes.find(x => x.value === value);
    if (billFeeType) {
      this.billFeeType = billFeeType.label;
    }
    this.billFeeTypeChanged.emit(this.billFeeType);
  }

  onChangeBillType(value) {
    this.billTypeId = value;
    const billType = this.billTypes.find(x => x.value === value);
    if (billType) {
      this.billType = billType.label;
    }
  }

  selectTenant(event: any) {
    this.tenants.forEach(tenant => {
      if (tenant.ownerName === event.option.value) {
        this.tenantId = tenant.id;
      }
    });
  }

  validateFromDateAndToDate()
  {
    if(this.fromDate && this.toDate)
    {
      let startDate = new Date(this.fromDate);
      let endDate = new Date(this.toDate);
      this.isValidDate = validateDates(startDate,endDate);
    }    
  }

  onChangeMonths(event)
  {
    this.monthSelected = event;
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


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
import { MatOption } from '@angular/material/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-account-statement-toolbar',
  templateUrl: './account-statement-toolbar.component.html',
  styleUrls: ['./account-statement-toolbar.component.scss']
})
export class AccountStatementToolbarComponent implements OnInit {

  @Input() billPeriods: ListItem[] = [];
  @Input() billTypes: ListItem[] = [];
  @Input() isHide = true;

  @Input() get tenants(): Tenant[] { return this.data }
  set tenants(value: Tenant[]) {
    this.filteredTenants = this.data = value;
    //this.filteredTenants.splice(0,0,new Tenant({id: 0,ownerName: "All Tenants"}));
  }

  @Output() searchClicked = new EventEmitter<ManageParams>();
  @Output() billTypeChanged = new EventEmitter<string>();
  @Output() tenantChanged = new EventEmitter<boolean>();

  @ViewChild('allSelected') private allSelected: MatOption;  
  form: FormGroup;

  manageParams: ManageParams = {};
  tenantId: number = 0;
  fromDate: string = '';
  toDate: string = '';
  unitNumber: string = '';
  billPeriodId: number = 0;
  billTypeId: number = 0;
  billType: string = '';
  role: string = '';
  filteredTenants: any[] = [];
  data: any[] = [];
  tenantName: string = '';
  ownerId: number=0;
  selectedTenants = [];
  isMovedOutTenant: boolean = false;

  constructor(
    private snackbar: MatSnackBar,
    private date: DatePipe,private fb: FormBuilder,
    private jwtHelperService: JwtHelperService,
    private cookieService: CookieService) { }

  ngOnInit(): void {
    let token = this.cookieService.get('access_token');
    const decodedToken = this.jwtHelperService.decodeToken(token);
    if (decodedToken)
      this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    this.ownerId = parseInt(this.cookieService.get('ownerId'));
    this.tenantId = this.ownerId ?? 0;
    if(this.tenantId > 0)
    {
      this.selectedTenants.push(this.ownerId ?? 0);
    }    
    // if (this.tenantId > 0 || this.tenantName == 'All Tenants' && this.role != 'External') {
    //   this.onSearch();
    // }
    
    this.form = this.fb.group({
      movedOutTenant: [''],
      fromDate: [''],
      toDate: [''],
      tenant: ['']
    });
  }

  onSearch() {  
    let index = this.selectedTenants.findIndex((tenant) => tenant == 0)
    if (index >= 0) {
      this.selectedTenants.splice(index, 1);
    }  
    if (this.fromDate && this.toDate && this.selectedTenants && this.selectedTenants.length > 0) {     //(this.tenantId > 0 || this.tenantName == 'All Tenants')) {     

      this.manageParams = {
        fromDate: `${this.fromDate == '' ? '' : moment(this.fromDate).format('YYYY-MM-DD')}`,
        toDate: `${this.toDate == '' ? '' : moment(this.toDate).format('YYYY-MM-DD')}`,
        tenantId: this.selectedTenants.join(","),        //`${this.tenantId ?? this.ownerId ?? 0}`,
        tenantName: `${this.tenantName}`
      }
      this.searchClicked.emit(this.manageParams);
    } 
    else {      
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

  filterTenant(name: string) {
    if(name != '')
    {
      this.filteredTenants = this.data.filter(tenant =>
        tenant.ownerName.toLowerCase().indexOf(name.toLowerCase()) === 0);
    }
    
  }

  toggleAllSelection() {
    if (this.allSelected.selected) {
      this.form.controls.tenant
        .patchValue([...this.filteredTenants.map(item => item.id), 0]);
    } else {
      this.form.controls.tenant.patchValue([]);
    }
  }

  togglePerOne(all) {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }
    if (this.form.controls.tenant.value.length == this.filteredTenants.length)
      this.allSelected.select();
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

  showMovedOutTenants(isMovedOutTenant)
  {
    this.isMovedOutTenant = !isMovedOutTenant; 
    this.form.controls.tenant.setValue('');
    this.selectedTenants=[];
    this.tenantChanged.emit(this.isMovedOutTenant);
  }

  handleInput(event: KeyboardEvent): void{
    event.stopPropagation();
  }

}

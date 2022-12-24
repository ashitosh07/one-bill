import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { Tenant } from '../shared/models/tenant.model';
import { BillSettlementService } from '../shared/services/billsettlement.service';
import { TenantsService } from '../shared/services/tenants.service';
import { CommunicationSummary } from '../shared/models/communication-summary.model';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientSelectionService } from '../shared/services/client-selection.service';

@Component({
  selector: 'fury-communication-summary',
  templateUrl: './communication-summary.component.html',
  styleUrls: ['./communication-summary.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation]
})
export class CommunicationSummaryComponent implements OnInit {

  clientId: number;
  tenantId: number = 0;
  tenants: Tenant[] = [];
  filteredTenants: Tenant[] = [];
  form: FormGroup;
  communicationSummary: CommunicationSummary[] = [];
  exportedData: CommunicationSummary[] = [];
  tableData: any[] = [];

  @Input()
  columns: ListColumn[] = [
    { name: 'Date', property: 'date', visible: true, isModelProperty: false },
    { name: 'Time', property: 'time', visible: true, isModelProperty: false },
    { name: 'Type', property: 'type', visible: true, isModelProperty: true },
    { name: 'Description', property: 'description', visible: true, isModelProperty: true }
  ] as ListColumn[];

  public pageSize = 8;
  public dataSource: MatTableDataSource<CommunicationSummary>;

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort && this.dataSource){
       this.dataSource.sort = this.sort;  
    }
  }

  constructor(private billSettlementService: BillSettlementService,
    private tenantsService: TenantsService,
    private date: DatePipe,
    private fb: FormBuilder,private snackbar: MatSnackBar,
    private clientSelectionService: ClientSelectionService,
    private cookieService: CookieService) { }

  ngOnInit(): void {
    this.clientSelectionService.setIsClientVisible(true);
    this.clientId = parseInt(this.cookieService.get("globalClientId"));
    this.getTenants();

    this.form = this.fb.group({
      tenantName: ['']
    });

    this.form.controls.tenantName.valueChanges.subscribe(newTenant => {
      this.filteredTenants = this.filterTenant(newTenant);
    });
  }

  ngAfterViewInit() {
    if (this.dataSource != undefined) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  getTenants() {
    this.billSettlementService.getTenantsDetails(this.clientId).subscribe(data => {
      this.tenants = data;
      this.filteredTenants = data;
    });
  }

  filterTenant(name: string) {
    if ((name != '') && (name != null) && (name != undefined)) {
      this.filteredTenants = this.tenants.filter(tenant =>
        tenant.ownerName.toLowerCase().indexOf(name.toLowerCase()) === 0);
      return this.filteredTenants;
    }
    else {
      return this.tenants;
    }
  }

  selectTenant(event) {
    this.tenants.filter((item) => {
      if (item.ownerName == event.option.value)
        this.tenantId = item.id;
    })
  }

  getCommunicationSummary() {
    this.communicationSummary = [];
    this.exportedData = [];
    this.tenantsService.getCommunicationSummary(this.clientId, this.tenantId).subscribe((data: CommunicationSummary[]) => {
      if (data) {
        data.forEach(value => { this.communicationSummary.push(Object.assign({}, value)) })
        this.communicationSummary.forEach(value => {
          this.exportedData.push(Object.assign({}, value));
          value.description = value.description.replace(/[</p>]/g,' ');
          value.description = value.description.replace(/\s{2,}/g,' ');
          value.description = value.description.trim();
        })
        this.dataSource = new MatTableDataSource(this.communicationSummary);
        this.ngAfterViewInit();
      }
    })
  }

  onFilterChange(value) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

  getJsonData() {
    this.tableData = [];
    if (this.exportedData != undefined) {
      this.exportedData.forEach((item) => {
        let element = {
          Date: this.date.transform(item.date, 'yyyy-MM-dd'),
          Time: this.date.transform(item.time, 'h:mm:ss a'),
          Type: item.type,
          Description: item.description
        }
        this.tableData.push(element);
      })
    }
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  onExport() {
    if(this.exportedData && this.exportedData.length > 0)
    {
      this.getJsonData();
      if (this.tableData != undefined) {
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.tableData);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        /* save to file */
        XLSX.writeFile(wb, 'CommunicationSummary.xlsx');
      }
    }
    else {
      this.notificationMessage("No Data to Export","yellow-snackbar");
    } 
  }


}

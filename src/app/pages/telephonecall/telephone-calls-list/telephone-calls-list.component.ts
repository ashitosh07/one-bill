import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TelephonecallService } from '../telephonecall.service';
import { MatTableDataSource } from '@angular/material/table';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ViewTextComponent } from '../../telephonecall/view-text/view-text.component';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getClientDataFormat } from 'src/app/tabs/shared/utilities/utility';
import { ClientSelectionService } from 'src/app/tabs/shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-telephone-calls-list',
  templateUrl: './telephone-calls-list.component.html',
  styleUrls: ['./telephone-calls-list.component.scss']
})
export class TelephoneCallsListComponent implements OnInit {

  lstData: any[];
  exportedData: any[] = [];
  userId: string;
  ownerId: number = 0;

  pageSize = 10;
  dataSource;

  dateFormat = '';


  @Input()
  columns: ListColumn[] = [
    { name: 'Date', property: 'datetime', visible: true, isModelProperty: true },
    { name: 'Call Type', property: 'callType', visible: true, isModelProperty: true },
    { name: 'Tenant Name', property: 'tenantName', visible: true, isModelProperty: true },
    { name: 'Text', property: 'textdata', visible: true, isModelProperty: true },
    { name: 'Actions', property: 'actions', visible: true },
    // { name: 'Checkbox', property: 'checkbox', visible: false }
  ] as ListColumn[];

  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  constructor(
    private telephoneCallService: TelephonecallService,
    private router: Router,
    private dialog: MatDialog,
    private date: DatePipe,
    private cookieService: CookieService,
    private clientSelectionService: ClientSelectionService,
    private snackbar: MatSnackBar,
    private envService: EnvService
  ) {
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;;
  }

  ngOnInit(): void {
    this.clientSelectionService.setIsClientVisible(true);
    this.userId = this.cookieService.get('userId');
    this.getData();
  }

  openDialog(content) {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    // dialogConfig.height = "610px";
    dialogConfig.data = { dialogData: content }

    this.dialog.open(ViewTextComponent, dialogConfig);

  }

  ngAfterViewInit() {

    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'datetime': return new Date(item.datetime);
        default: return item[property];
      }
    };

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  createCall() {
    this.router.navigateByUrl('telephonecallupdate/telephonecall')
  }


  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  onFilterChange(value) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

  getData() {
    this.ownerId = parseInt(this.cookieService.get('ownerId'));
    this.dataSource = new MatTableDataSource(this.lstData);
    this.dateFormat = getClientDataFormat('DateFormat')
    this.telephoneCallService.getCalls(this.ownerId).subscribe((data: any) => {
      if (data) {
        this.lstData = data;

        this.lstData.forEach(element => {
          element.datetime = this.date.transform(element.datetime.toString(), this.dateFormat.toString());
        })
        this.dataSource = new MatTableDataSource(this.lstData);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.dataSource.sortingDataAccessor = (item, property) => {
          switch (property) {
            case 'datetime': return new Date(item.datetime);
            default: return item[property];
          }
        };

      }
    })
  }

  getJsonData() {
    this.exportedData = [];
    if (this.lstData != undefined) {
      this.lstData.forEach((item) => {
        let element = {
          Date: this.date.transform(item.datetime, 'yyyy-MM-dd'),
          CallType: item.callType,
          TenantName: item.tenantName,
          Text: item.textdata
        }
        this.exportedData.push(element);
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
    if (this.lstData && this.lstData.length > 0) {
      this.getJsonData();
      if ((this.exportedData != undefined) && (this.exportedData.length > 0)) {
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.exportedData);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        /* save to file */
        XLSX.writeFile(wb, 'CallLogHistory.xlsx');
      }
    }
    else {
      this.notificationMessage("No Data to Export", "yellow-snackbar");
    }
  }

}

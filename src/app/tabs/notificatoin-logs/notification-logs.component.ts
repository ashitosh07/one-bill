import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { NotificationLog } from "./notification-log.model";
import { fadeInRightAnimation } from "../../../@fury/animations/fade-in-right.animation";
import { fadeInUpAnimation } from "../../../@fury/animations/fade-in-up.animation";
import { DatePipe, DecimalPipe } from "@angular/common";
import { environment } from "../../../environments/environment";
import { JwtHelperService } from '@auth0/angular-jwt';
import { MasterService } from '../shared/services/master.service';
import { TemplatesService } from 'src/app/pages/templates/templates.service';
import { NotificationLogsToolbarComponent } from './notification-logs-toolbar/notification-logs-toolbar.component';
import { NotificationLogsFooterToolbarComponent } from './notification-logs-footer-toolbar/notification-logs-footer-toolbar.component';
import { ManageParams } from '../shared/models/manage-params.model';
import { ListItem } from '../shared/models/list-item.model';
import * as moment from 'moment';
import * as XLSX from 'xlsx';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getClientDataFormat } from '../shared/utilities/utility';
import { ClientSelectionService } from '../shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-notification-logs',
  templateUrl: './notification-logs.component.html',
  styleUrls: ['./notification-logs.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation],
})
export class NotificationLogsComponent implements OnInit {


  role: string = '';
  private _gap = 16;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`;

  notificationLogs: NotificationLog[] = [];
  selectedRows: NotificationLog[] = [];
  temporaryData: NotificationLog[] = [];
  statuses: ListItem[] = [];
  modes: ListItem[] = [];
  columns: any[] = [];
  manageParams: ManageParams = {};
  columnNames: ListColumn[] = [];
  exportedData: any[] = [];

  showSpinner: boolean = false;
  clientId: number;

  dateFormat = '';
  roundFormat = '';

  sentDateColumnName = "Sent Date";
  transactionNumberColumnName = "Transaction Number";
  accountNumberColumnName = "Account Number";
  descriptionColumnName = "Description";
  notificationModeColumnName = "Notification Mode";
  statusColumnName = "Status";
  reasonColumnName = "Reason";

  @ViewChild("htmlData") htmlData: ElementRef;
  @ViewChild(NotificationLogsToolbarComponent, { static: true }) notificationLogsToolbarComponent: NotificationLogsToolbarComponent;
  @ViewChild(NotificationLogsFooterToolbarComponent, { static: true }) notificationLogsFooterToolbarComponent: NotificationLogsFooterToolbarComponent;

  constructor(
    private templateService: TemplatesService,
    private date: DatePipe,
    private decimalPipe: DecimalPipe,
    private masterService: MasterService,
    private jwtHelperService: JwtHelperService,
    private cookieService: CookieService,
    private clientSelectionService: ClientSelectionService,
    private snackbar: MatSnackBar,
    private envService: EnvService
  ) {
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;
    this.roundFormat = getClientDataFormat('RoundOff') ?? envService.roundOffFormat;
  }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit(): void {
    this.clientSelectionService.setIsClientVisible(true);
    let token = this.cookieService.get('access_token');

    const decodedToken = this.jwtHelperService.decodeToken(token);
    if (decodedToken)
      this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    this.getNotificationModes();
    this.createColumnNames();
    this.createGridColumns();
    this.clientId = parseInt(this.cookieService.get("globalClientId"));

  }

  createGridColumns() {
    this.columns = [
      "sentDatelocal",
      "transactionNumber",
      "accountNumber",
      "description",
      "notificationMode",
      "status",
      "reason"
    ];

  }

  createColumnNames() {
    this.columnNames = [
      { name: this.sentDateColumnName, property: "sentDatelocal" },
      { name: this.transactionNumberColumnName, property: "transactionNumber" },
      { name: this.accountNumberColumnName, property: "accountNumber" },
      { name: this.descriptionColumnName, property: "description" },
      { name: this.notificationModeColumnName, property: "notificationMode" },
      { name: this.statusColumnName, property: "status" },
      { name: this.reasonColumnName, property: "reason" }
    ] as ListColumn[];

  }

  getNotificationLogs(manageParams: ManageParams) {
    this.showSpinner = true;
    this.manageParams = manageParams;
    this.notificationLogs = [];
    this.temporaryData = [];
    manageParams.fromDate = manageParams.fromDate == '' ? '' : moment(manageParams.fromDate).format('YYYY-MM-DD');
    manageParams.toDate = manageParams.toDate == '' ? '' : moment(manageParams.toDate).format('YYYY-MM-DD');
    this.templateService.getNotificationLogs(manageParams).subscribe({
      next: (notificationLogs) => {
        //this.showSpinner = false;
        notificationLogs.forEach(value => { this.temporaryData.push(Object.assign({}, value)) });

        notificationLogs.forEach((x) => {
          x.sentDatelocal = this.date.transform(x.sentDate.toString(), 'MMM d, y, H:mm:ss');
        });
        //this.notificationLogs = notificationLogs.sort((a, b) => b.sentDate.toString().localeCompare(a.sentDate.toString()));

        this.notificationLogs = notificationLogs; //.sort((b, a) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime());

        this.showSpinner = false;
      },
      error: (err) => {
        this.showSpinner = false;
      }
    });

  }

  onModeChange(mode: string) {
    if (this.notificationLogsFooterToolbarComponent) {
      this.notificationLogsFooterToolbarComponent.mode = mode;
    }
  }

  getNotificationModes() {
    this.modes = [{ label: 'Select', value: 0 }];
    this.masterService.getSystemMasterdata(11, 0).subscribe(modes => {
      modes.forEach(x => {
        this.modes.push({ label: x.description, value: x.id });
      });
    });
  }

  getJsonData() {
    this.exportedData = [];
    if (this.temporaryData != undefined) {
      this.temporaryData.forEach((item) => {
        let element = {
          SentDate: this.date.transform(item.sentDate, 'yyyy-MM-dd, h:mm:ss a'),
          Description: item.description,
          NotificationMode: item.notificationMode,
          Status: item.status,
          Reason: item.reason
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
    this.exportedData = [];
    if (this.temporaryData && this.temporaryData.length > 0) {
      this.getJsonData();
      if ((this.exportedData != undefined) && (this.exportedData.length > 0)) {
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.exportedData);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        /* save to file */
        XLSX.writeFile(wb, 'Notification Logs.xlsx');
      }
    }
    else {
      this.notificationMessage("No Data to Export", "yellow-snackbar");
    }
  }

}

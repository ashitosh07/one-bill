import { Component, Input, OnInit, ViewChild, AfterViewInit, ElementRef } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Observable, ReplaySubject } from "rxjs";
import { filter } from "rxjs/operators";
import { fadeInRightAnimation } from "../../../@fury/animations/fade-in-right.animation";
import { fadeInUpAnimation } from "../../../@fury/animations/fade-in-up.animation";
import { ListColumn } from "src/@fury/shared/list/list-column.model";
import { LoginReportService } from "../shared/services/login-report.service";
import { LoginReport } from "../shared/models/login-report.model";
import * as XLSX from 'xlsx';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientSelectionService } from '../shared/services/client-selection.service';

@Component({
  selector: "loginreport",
  templateUrl: "./loginreport.component.html",
  styleUrls: ["./loginreport.component.scss"],
  animations: [fadeInRightAnimation, fadeInUpAnimation],
})
export class LoginreportComponent implements OnInit, AfterViewInit {
  subject$: ReplaySubject<LoginReport[]> = new ReplaySubject<LoginReport[]>(1);
  data$: Observable<LoginReport[]> = this.subject$.asObservable();
  loginDetails: LoginReport[];
  tableData: any[];
  userid: string;
  @Input()
  columns: ListColumn[] = [
    {
      name: "User",
      property: "accountNumber",
      visible: true,
      isModelProperty: true,
    },
    {
      name: "Login Time",
      property: "loginTime",
      visible: true,
      isModelProperty: true,
    },
    {
      name: "Logout Time",
      property: "logoutTime",
      visible: true,
      isModelProperty: true,
    },
    {
      name: "IP Address",
      property: "ipAddress",
      visible: true,
      isModelProperty: true,
    },
  ] as ListColumn[];
  pageSize = 8;
  dataSource: MatTableDataSource<LoginReport> | null;

  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort){
       this.dataSource.sort = this.sort;  
    }
  }

  constructor(private loginReportService: LoginReportService,
    private snackbar: MatSnackBar,
    private clientSelectionService: ClientSelectionService,
    private cookieService: CookieService) { }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit() {
    this.clientSelectionService.setIsClientVisible(false);
    this.userid = this.cookieService.get("userId");
    this.getAllloginDetails(this.userid);
  }

  getAllloginDetails(userid) {
    this.loginReportService
      .getLoginUserDetails(userid)
      .subscribe((loginDetails: LoginReport[]) => {
        loginDetails = loginDetails.map(
          (loginDetail) => new LoginReport(loginDetail)
        );
        this.subject$.next(loginDetails);
      });

    this.dataSource = new MatTableDataSource();

    this.data$.pipe(filter((data) => !!data)).subscribe((loginDetails) => {
      this.loginDetails = loginDetails;
      this.dataSource.data = loginDetails;
    });

    this.ngAfterViewInit();
  }

  onFilterChange(value) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy() { }

  getJsonData() {
    this.tableData = [];
    this.loginDetails.forEach((item) => {
      let element = {
        AccountNumber: item.accountNumber,
        LoginTime: item.loginTime,
        LogoutTime: item.logoutTime,
        IPAddress: item.ipAddress
      }
      this.tableData.push(element);
    })
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
    if (this.loginDetails && this.loginDetails.length > 0) {
      this.getJsonData();
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.tableData);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      /* save to file */
      XLSX.writeFile(wb, 'Login Report.xlsx');
    }
    else {
      this.notificationMessage("No Data to Export","yellow-snackbar");
    } 
  }

}

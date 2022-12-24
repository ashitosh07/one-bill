import { Component, Input, OnInit, ViewChild, AfterViewInit, ElementRef } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Observable, ReplaySubject } from "rxjs";
import { filter } from "rxjs/operators";
import { fadeInRightAnimation } from "../../../@fury/animations/fade-in-right.animation";
import { fadeInUpAnimation } from "../../../@fury/animations/fade-in-up.animation";
import { LoginReportService } from "../shared/services/login-report.service";
import { LoginReport } from "../shared/models/login-report.model";
import * as XLSX from 'xlsx';
import { ListColumn } from "../../../@fury/shared/list/list-column.model";
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CookieService } from 'ngx-cookie-service';
import { ImageProperty } from '../shared/models/imageProperty.model';
import { ClientService } from '../shared/services/client.service';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getClientDataFormat } from '../shared/utilities/utility';
import { ClientSelectionService } from '../shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';
import { UserFileAcceptanceLog } from '../shared/models/user-file-acceptance-log.model';

@Component({
  selector: "app-acceptance-report",
  templateUrl: "./acceptance-report.component.html",
  styleUrls: ["./acceptance-report.component.scss"],
  animations: [fadeInRightAnimation, fadeInUpAnimation],
})
export class AcceptanceReportComponent implements OnInit, AfterViewInit {
  subject$: ReplaySubject<UserFileAcceptanceLog[]> = new ReplaySubject<UserFileAcceptanceLog[]>(1);
  data$: Observable<UserFileAcceptanceLog[]> = this.subject$.asObservable();
  userAcceptanceLogDetails: UserFileAcceptanceLog[];
  tableData: any[];
  filePath = '';
  imageProperties: ImageProperty[] = [];
  userid: string;
  clientId: number;
  @Input()
  columns: ListColumn[] = [
    {
      name: "Account Number",
      property: "accountNumber",
      visible: true,
      isModelProperty: true,
    },
    {
      name: "Owner Name",
      property: "ownerName",
      visible: true,
      isModelProperty: true,
    },
    {
      name: "Is Accepted",
      property: "isAccepted",
      visible: true,
      isModelProperty: false,
    },
    {
      name: "Last Updated On",
      property: "createdDate",
      visible: true,
      isModelProperty: true,
    }
  ] as ListColumn[];

  sort;
  pageSize = 8;
  dataSource: MatTableDataSource<UserFileAcceptanceLog> | null;
  dateFormat = '';
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  constructor(
    private loginReportService: LoginReportService,
    private date: DatePipe, private snackbar: MatSnackBar,
    private cookieService: CookieService,
    private clientSelectionService: ClientSelectionService,
    private clientService: ClientService,
    private envService: EnvService) {
    this.filePath = envService.backendForFiles;
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;
    this.clientId = parseInt(this.cookieService.get("globalClientId"));
  }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit() {
    this.clientSelectionService.setIsClientVisible(true);
    this.userid = this.cookieService.get("userId");
    this.GetAllUserAcceptanceLogDetails();
  }

  GetAllUserAcceptanceLogDetails() {
    this.loginReportService
      .getAllUserAcceptanceLogDetails(this.clientId)
      .subscribe((userAcceptanceLogDetails: UserFileAcceptanceLog[]) => {
        userAcceptanceLogDetails.forEach(x => {
          x.createdDateLocal = this.date.transform(x.createdDate.toString(), this.dateFormat.toString());
        })
        // userAcceptanceLogDetails = userAcceptanceLogDetails.map(
        //   (userAcceptanceLogDetail) => new UserFileAcceptanceLog(userAcceptanceLogDetail)
        // );
        this.subject$.next(userAcceptanceLogDetails);
      });

    this.dataSource = new MatTableDataSource();

    this.data$.pipe(filter((data) => !!data)).subscribe((userAcceptanceLogDetails) => {
      this.userAcceptanceLogDetails = userAcceptanceLogDetails;
      this.dataSource.data = userAcceptanceLogDetails;
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
    this.userAcceptanceLogDetails.forEach((item) => {
      let element = {
        AccountNumber: item.accountNumber,
        OwnerName: item.ownerName,
        IsAccepted: item.isAccepted == true ? 'Yes' : 'No',
        LastUpdatedOn: item.createdDate
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
    if (this.userAcceptanceLogDetails && this.userAcceptanceLogDetails.length > 0) {
      this.getJsonData();
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.tableData);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      /* save to file */
      XLSX.writeFile(wb, 'AcceptanceReport.xlsx');
    }
    else {
      this.notificationMessage("No Data to Export", "yellow-snackbar");
    }
  }

  onPrint() {
    this.getClientImageProperties();
  }

  getClientImageProperties() {
    this.imageProperties = [];
    this.clientService.getClientImageProperties(this.clientId).subscribe({
      next: (imageProperties: ImageProperty[]) => {
        if (imageProperties && imageProperties.length) {
          this.imageProperties = imageProperties;
          if (this.userAcceptanceLogDetails && this.userAcceptanceLogDetails.length) {
            this.downloadSummary(this.userAcceptanceLogDetails);
          }
        }
      },
      error() {
        this.notificationMessage("Image properties not found. To see image on print, please configure image properties", "red-snackbar");
        if (this.userAcceptanceLogDetails && this.userAcceptanceLogDetails.length) {
          this.downloadSummary(this.userAcceptanceLogDetails);
        }
      }
    });
  }

  downloadSummary(userAcceptanceLogDetails: UserFileAcceptanceLog[]) {
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let firstTableCols = [
      'SL No',
      'Account Number',
      'Owner Name',
      'Is Accepted',
      'Last Updated On'];

    let totalAmount = 0;
    let totalPaidAmount = 0;

    for (let a = 0; a < userAcceptanceLogDetails.length; a++) {
      row.push(a + 1)
      row.push(userAcceptanceLogDetails[a].accountNumber)
      row.push(userAcceptanceLogDetails[a].ownerName)
      row.push(userAcceptanceLogDetails[a].isAccepted == true ? 'Yes' : 'No')
      row.push(userAcceptanceLogDetails[a].createdDate)
      firstTableRows.push(row);
      row = [];
    }


    const title = 'TNC Acceptance Report';



    this.getSummaryReport(userAcceptanceLogDetails, firstTableCols, firstTableRows, title)
  }

  getSummaryReport(data: UserFileAcceptanceLog[], firstTableCols: any[], firstTableRows: any[], title: string) {
    const totalPagesExp = data.length % 15;
    const imageProperties: ImageProperty[] = this.imageProperties;
    var img = new Image()
    img.src = this.filePath + '/uploads/' + this.imageProperties[0]?.photo //'assets/img/' + data.client.photo
    let pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter"
    });
    let startX = 10;
    let startY = 30;
    const currentTime: string = moment().format('M/D/YYYY hh:mm:ss a');
    var pageContent = function (data) {
      // HEADER
      pdf.setFontSize(30);
      if (img && data && imageProperties && imageProperties.length) {
        const imageProperty: ImageProperty = imageProperties.find(x => x.imageType.trim().toLowerCase() === 'portrait');
        if (imageProperty) {
          img.onload = function () {
            pdf.addImage(img, imageProperty.imgX, imageProperty.imgY, imageProperty.imgW, imageProperty.imgH);
          };
          //pdf.addImage(img, 'png', imageProperty.imgX, imageProperty.imgY, imageProperty.imgW, imageProperty.imgH);
        }
      }
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('Cambria');
      pdf.text(title, startX + 250, startY + 30);
      pdf.setFont('Cambria', 'normal');
      //const tableHeadingWidth = pdf.getTextWidth(title);
      // pdf.line(startX + 250, startY + 10, startX + 250 + tableHeadingWidth, startY + 10);
      pdf.setFontSize(9);
      pdf.text('Print Date: ' + currentTime, pdf.internal.pageSize.width - 150, startY - 10);
      // FOOTER
      var str = "Page " + data.pageCount;
      // Total page number plugin only available in jspdf v1.0+
      if (typeof pdf.putTotalPages === 'function') {
        pdf.setTextColor(0, 0, 0);
        pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
      }
      pdf.setFontSize(9);
      var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
      pdf.text(str, data.settings.margin.left, pageHeight - 10); // showing current page number
    };
    const autoTable = 'autoTable';
    pdf[autoTable](firstTableCols, firstTableRows, {
      startX: 10,
      startY: startY + 40,
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { top: startY + 30, left: 20 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 40,
          halign: 'center'
        },
        1: {
          cellWidth: 100,
          halign: 'center'
        },
        2: {
          cellWidth: 230,
          halign: 'center'
        },
        3: {
          cellWidth: 70,
          halign: 'center'
        },
        4: {
          cellWidth: 130,
          halign: 'center'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      }
    });
    var blob = pdf.output("blob");
    window.open(URL.createObjectURL(blob));
  }
}

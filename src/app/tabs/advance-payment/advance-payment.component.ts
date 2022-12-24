import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ListColumn } from '../../../@fury/shared/list/list-column.model';
import { AdvancePayment } from "../shared/models/advance-payment.model";
import { fadeInRightAnimation } from "../../../@fury/animations/fade-in-right.animation";
import { fadeInUpAnimation } from "../../../@fury/animations/fade-in-up.animation";
import { CurrencyPipe, DatePipe, DecimalPipe } from "@angular/common";
import { environment } from "../../../environments/environment";
import { JwtHelperService } from '@auth0/angular-jwt';
import { BillService } from "../../tabs/shared/services/bill.service";
import { AdvancePaymentToolbarComponent } from './advance-payment-toolbar/advance-payment-toolbar.component';
import * as XLSX from 'xlsx';
import { ManageParams } from '../shared/models/manage-params.model';
import * as moment from 'moment';
import { BillSettlementService } from '../shared/services/billsettlement.service';
import { Tenant } from '../shared/models/tenant.model';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getClientDataFormat } from '../shared/utilities/utility';
import { ClientSelectionService } from '../shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-advance-payment',
  templateUrl: './advance-payment.component.html',
  styleUrls: ['./advance-payment.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation],
})
export class AdvancePaymentComponent implements OnInit {


  role: string = '';
  private _gap = 16;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`;

  advancePayments: AdvancePayment[] = [];
  selectedRows: AdvancePayment[] = [];
  tableData: any[];
  tenants: Tenant[] = [];
  columns: any[] = [];
  manageParams: ManageParams = {};
  columnNames: ListColumn[] = [];

  clientId: number;

  dateFormat = '';
  currencyFormat = '';
  roundFormat = '';
  visibleButtons: ListColumn[] = [];

  advanceDateColumnName = "Date";
  advanceAmountColumnName = "Advance Amount";
  accountNumber = "Account Number";
  ownerNameColumnName = "Owner/Tenant";
  paymentNumberColumnName = "Payment No";


  @ViewChild("htmlData") htmlData: ElementRef;
  @ViewChild(AdvancePaymentToolbarComponent, { static: true }) advancePaymentToolbarComponent: AdvancePaymentToolbarComponent;


  constructor(
    private billService: BillService,
    private date: DatePipe,
    private currency: CurrencyPipe,
    private snackbar: MatSnackBar,
    private decimalPipe: DecimalPipe,
    private billSettlementService: BillSettlementService,
    private jwtHelperService: JwtHelperService,
    private clientSelectionService: ClientSelectionService,
    private cookieService: CookieService,
    private envService: EnvService
  ) {
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;;
    this.currencyFormat = getClientDataFormat('Currency') ?? envService.currencyFormat;
    this.roundFormat = getClientDataFormat('RoundOff') ?? envService.roundOffFormat;

  }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  addVisibleButtons() {
    this.visibleButtons = [{ property: 'advanceAdjust' }] as ListColumn[];
  }

  ngOnInit(): void {
    this.clientSelectionService.setIsClientVisible(true);
    let token = this.cookieService.get('access_token');

    const decodedToken = this.jwtHelperService.decodeToken(token);
    if (decodedToken)
      this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    this.getTenants();
    this.createColumnNames();
    this.createGridColumns();
    this.addVisibleButtons();
    this.clientId = parseInt(this.cookieService.get("globalClientId"));

  }

  createGridColumns() {
    this.columns = [
      "advanceDatelocal",
      "paymentNumber",      
      "accountNumber",
      "ownerName",
      "advanceAmountLocal",
      'action'
    ];

  }

  createColumnNames() {
    this.columnNames = [
      { name: this.advanceDateColumnName, property: "advanceDatelocal" },
      { name: this.paymentNumberColumnName, property: "paymentNumber" },
      { name: this.accountNumber, property: "accountNumber" },
      { name: this.ownerNameColumnName, property: "ownerName" },
      { name: this.advanceAmountColumnName, property: "advanceAmountLocal", columnAlign: { 'text-align': 'right' } },
      { name: 'Actions', property: 'actions' }
    ] as ListColumn[];
  }

  getAdvancePaymentDetails(manageParams: ManageParams) {
    this.manageParams = manageParams;
    this.advancePayments = [];
    manageParams.fromDate = manageParams.fromDate == '' ? '' : moment(manageParams.fromDate).format('YYYY-MM-DD');
    manageParams.toDate = manageParams.toDate == '' ? '' : moment(manageParams.toDate).format('YYYY-MM-DD');

    this.billService
      .getAdvancePaymentDetails(manageParams)
      .subscribe(
        advancePayments => {
          this.dateFormat = getClientDataFormat('DateFormat');
          this.roundFormat = getClientDataFormat('RoundOff');
          this.currencyFormat = getClientDataFormat('Currency');
          advancePayments.forEach((x) => {
            x.advanceDatelocal = this.date.transform(x.advanceDate.toString(), this.dateFormat.toString());
            x.advanceAmountLocal = this.currency.transform(x.advanceAmount, this.currencyFormat.toString(), true, this.roundFormat);
          });
          this.advancePayments = advancePayments;
        });
  }

  adjustBillsWithAdvance() {
    let ownerId = parseInt(this.manageParams.tenantId);
    this.billService.adjustBillsWithAdvance(ownerId).subscribe({next: data => {
      if(data == 1) {
        this.notificationMessage("Advance Adjustments Successful.","green-snackbar");
      }
      else {
          this.notificationMessage("Advance Adjustments already done.","yellow-snackbar");
      }
      },
      error: (err) => {
        this.notificationMessage(err,"red-snackbar");
      }
    });
  }

  getTenants() {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));

    this.billSettlementService.getTenantsDetails(this.clientId).subscribe(data => {
      this.tenants = data;
    });
  }

  getJsonData() {
    this.tableData = [];
    if (this.advancePayments != undefined) {
      this.advancePayments.forEach((item) => {
        let element = {
          AdvanceDate: this.date.transform(item.advanceDate, 'yyyy-MM-dd'),
          PaymentNumber: item.paymentNumber,
          AccountNumber: item.accountNumber,
          OwnerName: item.ownerName,
          AdvanceAmount: this.currency.transform(item.advanceAmount, this.currencyFormat.toString(), true, this.roundFormat),
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
    if (this.advancePayments && this.advancePayments.length > 0) {
      this.getJsonData();
      if ((this.tableData != undefined) && (this.tableData.length > 0)) {
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.tableData);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        /* save to file */
        XLSX.writeFile(wb, 'AdvancePayment.xlsx');
      }
    }
    else {
      this.notificationMessage("No Data to Export", "yellow-snackbar");
    }
  }

}

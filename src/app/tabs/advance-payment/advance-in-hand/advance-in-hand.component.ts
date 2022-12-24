import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { AdvancePayment } from '../../shared/models/advance-payment.model';
import { ManageParams } from '../../shared/models/manage-params.model';
import { Tenant } from '../../shared/models/tenant.model';
import { BillService } from '../../shared/services/bill.service';
import { BillSettlementService } from '../../shared/services/billsettlement.service';
import { ClientSelectionService } from '../../shared/services/client-selection.service';
import { getClientDataFormat } from '../../shared/utilities/utility';
import * as XLSX from 'xlsx';
//import { AdvancePaymentToolbarComponent } from '../advance-payment-toolbar/advance-payment-toolbar.component';

@Component({
  selector: 'fury-advance-in-hand',
  templateUrl: './advance-in-hand.component.html',
  styleUrls: ['./advance-in-hand.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation],
})
export class AdvanceInHandComponent implements OnInit {

  advancePayments: AdvancePayment[] = [];
  selectedRows: AdvancePayment[] = [];
  tableData: any[];
  tenants: Tenant[] = [];
  columns: any[] = [];
  manageParams: ManageParams = {};
  columnNames: ListColumn[] = [];
  clientId: number;
  currencyFormat = '';
  roundFormat = '';
  role: string = '';
  
  accountNumber = "Account Number";
  ownerNameColumnName = "Owner/Tenant";
  advanceAmountColumnName = "Advance Amount";

  @ViewChild("htmlData") htmlData: ElementRef;
  //@ViewChild(AdvancePaymentToolbarComponent, { static: true }) advancePaymentToolbarComponent: AdvancePaymentToolbarComponent;

  constructor(private billService: BillService,
    private cookieService: CookieService,
    private currency: CurrencyPipe,
    private jwtHelperService: JwtHelperService,
    private billSettlementService: BillSettlementService,
    private clientSelectionService: ClientSelectionService,
    private snackbar: MatSnackBar) 
  { 
    this.currencyFormat = getClientDataFormat('Currency');
    this.roundFormat = getClientDataFormat('RoundOff');
  }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
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
    this.clientId = parseInt(this.cookieService.get("globalClientId"));
    this.getAdvancePaymentDetails();
  }

  createGridColumns() {
    this.columns = [      
      "accountNumber",
      "ownerName",
      "advanceAmountLocal"
    ];
  }

  createColumnNames() {
    this.columnNames = [
      { name: this.accountNumber, property: "accountNumber" },
      { name: this.ownerNameColumnName, property: "ownerName" },
      { name: this.advanceAmountColumnName, property: "advanceAmountLocal", columnAlign: { 'text-align': 'right' } },
    ] as ListColumn[];
  }

  getTenants() {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.billSettlementService.getTenantsDetails(this.clientId).subscribe(data => {
      this.tenants = data;
    });
  }

  getAdvancePaymentDetails() {
    this.advancePayments = [];
    this.billService.getAdvanceInHandForOwnerTenant(this.clientId).subscribe(
      advancePayments => {
        this.roundFormat = getClientDataFormat('RoundOff');
        this.currencyFormat = getClientDataFormat('Currency');
        advancePayments.forEach((x) => {
          x.advanceAmountLocal = this.currency.transform(x.advanceAmount, this.currencyFormat.toString(), true, this.roundFormat);
        });
        this.advancePayments = advancePayments;
      });
  }

  getJsonData() {
    this.tableData = [];
    if (this.advancePayments != undefined) {
      this.advancePayments.forEach((item) => {
        let element = {          
          AccountNumber: item.accountNumber,
          OwnerName: item.ownerName,
          AdvanceAmount: this.currency.transform(item.advanceAmount, this.currencyFormat.toString(), true, this.roundFormat)
        }
        this.tableData.push(element);
      })
    }
  }

  onExport() {
    if (this.advancePayments && this.advancePayments.length > 0) {
      this.getJsonData();
      if ((this.tableData != undefined) && (this.tableData.length > 0)) {
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.tableData);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        /* save to file */
        XLSX.writeFile(wb, 'AdvanceInHand.xlsx');
      }
    }
    else {
      this.notificationMessage("No Data to Export", "yellow-snackbar");
    }
  }

}

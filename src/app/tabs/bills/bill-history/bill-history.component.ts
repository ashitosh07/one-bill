import { Component, OnInit, ElementRef, ViewChild, Input, ChangeDetectorRef } from '@angular/core';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { ManageParams } from '../../shared/models/manage-params.model';
import { Tenant } from '../../shared/models/tenant.model';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { BillService } from '../../shared/services/bill.service';
import { BillSettlementService } from '../../shared/services/billsettlement.service';
import { DatePipe, CurrencyPipe, DecimalPipe, JsonPipe } from '@angular/common';
import { BillMaster } from '../../shared/models/bill-master.model';
import { environment } from 'src/environments/environment';
import { AccountHeadDetailsComponent } from '../final-bill-settlement/account-head-details/account-head-details.component';
import { MatDialog } from '@angular/material/dialog';
import { ListItem } from '../../shared/models/list-item.model';
import { ListData } from '../../shared/models/list-data.model';
import { TemplateService } from '../../shared/services/template.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BillCancelComponent } from "./bill-cancel/bill-cancel.component";
import { TemplateContent } from '../../shared/models/template-content.model';
import { BillHistoryToolbarComponent } from './bill-history-toolbar/bill-history-toolbar.component';
import { JwtHelperService } from '@auth0/angular-jwt';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MasterService } from '../../shared/services/master.service';
import { RegisterService } from '../../shared/services/register.service';
import { UserActions } from '../../shared/models/user-actions.model';
import { BillHistoryFooterToolbarComponent } from './bill-history-footer-toolbar/bill-history-footer-toolbar.component';
import { ResponseDetails } from '../../shared/models/response-details.model';
import { CreditNoteDetailsComponent } from '../final-bill-settlement/credit-note-details/credit-note-details.component';
import { CreditNoteTransaction } from '../../shared/models/credit-note-transaction.model';
import { CreditNote } from '../../shared/models/credit-note.model';
import { PDFDocument } from 'pdf-lib';
import { BillTariffDetail } from '../../shared/models/bill-tariff-detail.model';
import { CookieService } from 'ngx-cookie-service';
import { getClientDataFormat, stringIsNullOrEmpty } from '../../shared/utilities/utility';
import { ImageProperty } from '../../shared/models/imageProperty.model';
import { ActivatedRoute } from '@angular/router';
import { ViewRemarksDialogComponent } from '../../shared/components/view-remarks-dialog/view-remarks-dialog.component';
import { TemplatesService } from 'src/app/pages/templates/templates.service';
import { AlertSetting } from '../../shared/models/alert-setting.model';
import { NotificationAlert } from '../../shared/models/notification-alert.model';
import { NotificationsSendDialogComponent } from '../../shared/components/notifications-send-dialog/notifications-send-dialog.component';
import * as XLSX from 'xlsx';
import { ClientSelectionService } from '../../shared/services/client-selection.service';
import { NotificationLog } from '../../notificatoin-logs/notification-log.model';
import { EnvService } from 'src/app/env.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-bill-history',
  templateUrl: './bill-history.component.html',
  styleUrls: ['./bill-history.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation]
})
export class BillHistoryComponent implements OnInit {

  role: string = '';

  private _gap = 16;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`;
  tenants: Tenant[] = [];
  billPeriods: ListItem[] = [];
  billFeeTypes: ListItem[] = [];
  billTypes: ListItem[] = [];
  selectedRows: BillMaster[] = [];
  visibleButtons: ListColumn[] = [];
  columns: any[] = [];
  innerColumns: any[] = [];
  columnNames: ListColumn[] = [];
  billMasterDetails: BillMaster[] = [];
  billMasterToUpdateIsBillFailed: BillMaster[] = [];
  manageParams: ManageParams = {};
  userActions: UserActions[] = [];
  billFeeType = '';
  clientId: number;
  billAmount = '';
  receivedAmount = '';
  creditNoteAmount = '';
  netAmount = '';
  balanceAmount = '';
  parameterValue: boolean = false;
  filePath = '';
  userId: string = '';
  ownerId: number;
  disable: boolean = false;
  disableColumn: string = 'paid';
  billNumberConsumptionColumnName = 'Bill No';
  buildingColumnName = 'Building';
  unitNumberColumnName = 'Unit Number';

  smsColumnName = 'SMS';
  emailColumnName = 'Email';
  watsappColumnName = 'Watsapp';
  dateFormat = '';
  currency = '';
  roundFormat = '';
  consumptionRoundOffFormat = '';
  billNumberColumnName = 'Bill Number';
  accountNumberColumnName = 'Account Number';
  tenantNameColumnName = 'Tenant Name';
  entityTypeColumnName = 'Owner/Tenant';
  unitColumnName = 'Unit';
  billDateColumnName = 'Bill Date';
  fromDateColumnName = 'From Date';
  toDateColumnName = 'To Date';
  dueDateColumnName = 'Due Date';
  billAmountColumnName = 'Bill Amount';
  creditNoteAmountColumnName = 'Credit Note Amount';
  netAmountColumnName = 'Net Bill Amount';
  paidColumnName = 'Paid';
  balanceAmountColumnName = 'Balance Amount';
  cancelColumnName = 'Cancel';

  utilityTypeCoulmnNmae = 'Utility Type';
  meterNumberCoulmnNmae = 'Meter Number';
  previousReadingColumnName = 'Previous';
  presentReadingColumnName = 'Present';
  currentConsumptionColumnName = 'Cur-Consumption';
  consumptionChargeColumnName = 'Consumption Charge';

  cssStyledColumn: string = 'status';
  buttonDisableColumn: string = 'isLatestBill';
  buttonName: string = 'Credit Note';

  approvedCount: string = '';
  rejectedCount: string = '';
  fineCount: string = '';
  penalityCount: string = '';
  pdfsToMerge: any[] = [];
  isApproveBills: boolean = false;
  isRejectedBills: boolean = false;
  billMastersToFail: BillMaster[];

  pageSize: Number = 10;
  public columnsProps: string[];
  dataSource = new MatTableDataSource([]);
  sort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.dataSource && this.sort) {
      this.dataSource.sort = this.sort;
    }
  }
  @Input()
  displayedColumns: ListColumn[] = [
    { name: this.billDateColumnName, property: 'billDateLocal', visible: true, isModelProperty: true },
    { name: this.billNumberColumnName, property: 'billNumber', visible: true, isModelProperty: true },
    { name: this.unitNumberColumnName, property: 'unitNumber', visible: true, isModelProperty: true },
    { name: this.netAmountColumnName, property: 'netAmountLocal', visible: true, isModelProperty: false },
    { name: 'Actions', property: 'actions', visible: true }
  ] as ListColumn[];

  get visibleColumns() {
    return this.displayedColumns.filter(column => column.visible).map(column => column.property);
  }

  @ViewChild('htmlData') htmlData: ElementRef;
  @ViewChild(BillHistoryToolbarComponent, { static: true }) billHistoryToolbarComponent: BillHistoryToolbarComponent;
  @ViewChild(BillHistoryFooterToolbarComponent, { static: true }) billHistoryFooterToolbarComponent: BillHistoryFooterToolbarComponent;

  constructor(
    private billService: BillService,
    private billSettlementService: BillSettlementService,
    private date: DatePipe,
    private currencyPipe: CurrencyPipe,
    private decimalPipe: DecimalPipe,
    private dialog: MatDialog,
    private templateService: TemplateService,
    private jwtHelperService: JwtHelperService,
    private snackbar: MatSnackBar,
    private masterService: MasterService,
    private registerService: RegisterService,
    private cookieService: CookieService,
    private router: ActivatedRoute,
    private clientSelectionService: ClientSelectionService,
    private templatesService: TemplatesService,
    private ref: ChangeDetectorRef,
    private envService: EnvService
  ) {
    this.filePath = envService.backendForFiles;
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;
    this.currency = getClientDataFormat('Currency') ?? envService.currencyFormat;
    this.roundFormat = getClientDataFormat('RoundOff') ?? envService.roundOffFormat;
    this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff') ?? envService.consumptionRoundOffFormat;
  }

  ngOnInit(): void {
    this.columnsProps = this.displayedColumns.map((column: ListColumn) => column.property);
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    if (this.router.snapshot.url.toString().includes('approve-bills')) {
      this.isApproveBills = true;
    } else if (this.router.snapshot.url.toString().includes('rejected-bills')) {
      this.isRejectedBills = true;
    }
    let token = this.cookieService.get('access_token');
    const decodedToken = this.jwtHelperService.decodeToken(token);
    if (decodedToken) {
      this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      this.userId = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid'];
      this.getUserEnabledActions();
    }
    this.masterService.getParameterValue('BillHistoryNotifications').subscribe((parameterValue: boolean) => {
      this.parameterValue = parameterValue;
    })
    this.ownerId = parseInt(this.cookieService.get('ownerId'));
    if (this.ownerId > 0) {
      this.clientSelectionService.setIsClientVisible(false);
      this.onGetBillsHistory(this.manageParams);
    }
    else {
      this.clientSelectionService.setIsClientVisible(true);
    }
    this.getTenants();
    this.getBillPeriods();
    this.getBillFeeTypes();
    this.getBillTypes();
    this.createColumnNames();
    this.createGridColumns();
    this.createInnerGridColumns();
    this.addVisibleButtons();
  }

  createGridColumns() {

    if (this.ownerId == 0 && !this.isRejectedBills && !this.isApproveBills) {
      this.columns = [
        'select',
        'billDateLocal',
        'billNumber',
        'accountNumber',
        'ownerName',
        'unitNumber',
        'fromDateLocal',
        'toDateLocal',
        'dueDateLocal',
        'billAmountLocal',
        'creditNoteAmountLocal',
        'netAmountLocal',
        'paidLocal',
        'balanceAmountLocal',
        'button',
        'action'];
    } else if (this.ownerId == 0 && (this.isRejectedBills || this.isApproveBills)) {
      this.columns = [
        'select',
        'billDateLocal',
        'billNumber',
        'accountNumber',
        'ownerName',
        'unitNumber',
        'fromDateLocal',
        'toDateLocal',
        'dueDateLocal',
        'billAmountLocal',
        'button',
        'action'];
    }
    else {
      this.columns = [
        'select',
        'billDateLocal',
        'billNumber',
        'unitNumber',
        'netAmountLocal',
        'action'
      ];
    }


  }

  createInnerGridColumns() {
    this.innerColumns = [
      'utilityType',
      'deviceName',
      'previousReadingLocal',
      'presentReadingLocal',
      'consumptionLocal',
      'consumptionCharge'];
  }

  createColumnNames() {
    this.columnNames = [
      { name: this.billNumberColumnName, property: 'billNumber', visible: true, isModelProperty: true },
      { name: this.accountNumberColumnName, property: 'accountNumber', visible: true, isModelProperty: true },
      { name: this.tenantNameColumnName, property: 'ownerName', visible: true, isModelProperty: true },
      { name: this.entityTypeColumnName, property: 'entityType', visible: true, isModelProperty: true },
      { name: this.unitColumnName, property: 'unitNumber', visible: true, isModelProperty: true },
      { name: this.fromDateColumnName, property: 'fromDateLocal', visible: true, isModelProperty: true },
      { name: this.toDateColumnName, property: 'toDateLocal', visible: true, isModelProperty: true },
      { name: this.dueDateColumnName, property: 'dueDateLocal', visible: true, isModelProperty: true },
      { name: this.billDateColumnName, property: 'billDateLocal', visible: true, isModelProperty: true },
      { name: this.billAmountColumnName, property: 'billAmountLocal', visible: true, isModelProperty: true, columnAlign: { 'text-align': 'right' } },
      { name: this.paidColumnName, property: 'paidLocal', visible: true, isModelProperty: true, columnAlign: { 'text-align': 'right' } },
      { name: this.utilityTypeCoulmnNmae, property: 'utilityType', visible: true, isModelProperty: false },
      { name: this.meterNumberCoulmnNmae, property: 'deviceName', visible: true, isModelProperty: false },
      { name: this.previousReadingColumnName, property: 'previousReadingLocal', visible: true, isModelProperty: false },
      { name: this.presentReadingColumnName, property: 'presentReadingLocal', visible: true, isModelProperty: false },
      { name: this.currentConsumptionColumnName, property: 'consumptionLocal', visible: true, isModelProperty: false, columnAlign: { 'text-align': 'right' } },
      { name: this.billAmountColumnName, property: 'amountLocal', visible: true, isModelProperty: false, columnAlign: { 'text-align': 'right' } },
      { name: this.creditNoteAmountColumnName, property: 'creditNoteAmountLocal', visible: true, isModelProperty: false, columnAlign: { 'text-align': 'right' } },
      { name: this.netAmountColumnName, property: 'netAmountLocal', visible: true, isModelProperty: false, columnAlign: { 'text-align': 'right' } },
      { name: this.consumptionChargeColumnName, property: 'consumptionCharge', visible: true, isModelProperty: false, columnAlign: { 'text-align': 'right' } },
      { name: this.balanceAmountColumnName, property: 'balanceAmountLocal', visible: true, isModelProperty: false, columnAlign: { 'text-align': 'right' } }
    ] as ListColumn[];
  }

  addVisibleButtons() {
    this.visibleButtons = [];
    if (this.isApproveBills) {
      this.visibleButtons = [
        { property: 'print' },
        { property: 'reject' },
        { property: 'fail' }] as ListColumn[];
    }
    else if (this.isRejectedBills) {
      this.visibleButtons = [
        { property: 'print' },
        { property: 'remarks' }] as ListColumn[];
    } else {
      this.visibleButtons = [
        { property: 'modify' },
        { property: 'print' },
        // { property: 'reject' },
        { property: 'cancel' }] as ListColumn[];
    }
  }

  getUserEnabledActions() {
    this.userActions = [];
    this.registerService.getUserEnabledActions(this.userId).subscribe({
      next: (data: UserActions[]) => {
        this.userActions = data;
      },
      error: (err) => {
        this.notificationMessage('User Actions not found', 'red-snackbar');
      }
    });
  }

  onGetBillsHistory(manageParams: ManageParams) {
    this.manageParams = manageParams;
    this.billMasterDetails = [];
    this.billAmount = '';
    this.receivedAmount = '';
    this.rejectedCount = '';
    this.approvedCount = '';
    this.fineCount = '';
    this.penalityCount = '';
    let billAmount = 0;
    let receivedAmount = 0;
    let creditNoteAmount = 0;
    let netAmount = 0;
    let balanceAmount = 0;
    manageParams.fromDate = manageParams.fromDate == '' ? '' : moment(manageParams.fromDate).format('YYYY-MM-DD');
    manageParams.toDate = manageParams.toDate == '' ? '' : moment(manageParams.toDate).format('YYYY-MM-DD');
    manageParams.tenantId = this.role == 'External' ? this.ownerId.toString() : manageParams.tenantId;
    manageParams.clientId = this.clientId;

    this.billService.getBillHistory(manageParams).subscribe(
      billMasterDetails => {
        billMasterDetails = billMasterDetails.filter(x => x.billNumber != null && x.billNumber != '');
        if (this.isApproveBills && !this.isRejectedBills) {
          billMasterDetails = billMasterDetails.filter(x => x.isApproved === false && x.isRejected === false);
        } else if (!this.isApproveBills && !this.isRejectedBills) {
          billMasterDetails = billMasterDetails.filter(x => x.isApproved === true && x.isRejected === false);
        } else if (this.isRejectedBills) {
          billMasterDetails = billMasterDetails.filter(x => x.isRejected === true);
        }
        billMasterDetails = billMasterDetails.filter(x => x.isBillFailed === false);
        this.dateFormat = getClientDataFormat('DateFormat');
        this.roundFormat = getClientDataFormat('RoundOff');
        this.currency = getClientDataFormat('Currency');

        billMasterDetails.forEach(x => {
          x.billDateLocal = this.date.transform(x.billDate.toString(), this.dateFormat.toString());
          x.fromDateLocal = this.date.transform(x.fromDate.toString(), this.dateFormat.toString());
          x.toDateLocal = this.date.transform(x.toDate.toString(), this.dateFormat.toString());
          x.dueDateLocal = this.date.transform(x.dueDate.toString(), this.dateFormat.toString());
          x.billAmountLocal = this.currencyPipe.transform(x.billAmount, this.currency.toString(), true, this.roundFormat);
          x.paidLocal = this.currencyPipe.transform(x.paid, this.currency.toString(), true, this.roundFormat);
          x.creditNoteAmountLocal = this.currencyPipe.transform(x.creditNoteAmount, this.currency.toString(), true, this.roundFormat);
          x.netAmountLocal = this.currencyPipe.transform(x.netAmount, this.currency.toString(), true, this.roundFormat);
          x.balanceAmountLocal = this.currencyPipe.transform(x.balanceAmount, this.currency.toString(), true, this.roundFormat);
          x.bills.forEach(bill => {
            this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', bill.utilityTypeId);
            bill.previousReadingLocal = this.decimalPipe.transform(bill.previousReading, this.consumptionRoundOffFormat);
            bill.presentReadingLocal = this.decimalPipe.transform(bill.presentReading, this.consumptionRoundOffFormat);
            bill.consumptionLocal = this.decimalPipe.transform(bill.consumption, this.consumptionRoundOffFormat);
            bill.billAmountLocal = bill.consumptionCharge = this.currencyPipe.transform(bill.billAmount, this.currency.toString(), true, this.roundFormat);
          });
          if (this.isApproveBills || this.isRejectedBills) {
            x.status = 'Normal';
          }
          billAmount = billAmount + x.billAmount;
          creditNoteAmount = creditNoteAmount + x.creditNoteAmount;
          netAmount = netAmount + x.netAmount;
          receivedAmount = receivedAmount + x.paid;
          balanceAmount = balanceAmount + x.balanceAmount;
        });
        this.billMasterDetails = billMasterDetails;

        this.dataSource = new MatTableDataSource(this.billMasterDetails);
        this.ref.detectChanges();
        if (this.dataSource) {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }

        this.billAmount = this.currencyPipe.transform(billAmount, this.currency.toString(), true, this.roundFormat);
        this.creditNoteAmount = this.currencyPipe.transform(creditNoteAmount, this.currency.toString(), true, this.roundFormat);
        this.netAmount = this.currencyPipe.transform(netAmount, this.currency.toString(), true, this.roundFormat);
        this.receivedAmount = this.currencyPipe.transform(receivedAmount, this.currency.toString(), true, this.roundFormat);
        this.balanceAmount = this.currencyPipe.transform(balanceAmount, this.currency.toString(), true, this.roundFormat);
        if (this.billMasterDetails && this.billMasterDetails.length) {
          const approvedCount: number = this.billMasterDetails.filter(x => x.status === 'Approved').length ?? 0;
          this.approvedCount = '- ' + approvedCount.toString();
          const rejectedCount: number = this.billMasterDetails.filter(x => x.status === 'Rejected').length ?? 0;
          this.rejectedCount = '- ' + rejectedCount.toString();
          const fineCount: number = this.billMasterDetails.filter(x => x.status === 'Fine').length ?? 0;
          this.fineCount = '- ' + fineCount.toString();
          const penalityCount: number = this.billMasterDetails.filter(x => x.status === 'Penalty').length ?? 0;
          this.penalityCount = '- ' + penalityCount.toString();
        }
      });
  }

  onSelectedRows(selectedRows: BillMaster[]) {
    this.selectedRows = [];
    this.selectedRows = selectedRows;
    this.disable = false
    if (this.selectedRows && this.selectedRows.length) {
      const approvedBillsExist = this.selectedRows.find(x => x.isApproved == true);
      if (approvedBillsExist) {
        this.disable = true
      }
    }
  }

  getBillPeriods() {
    this.billPeriods = [{ label: 'Select', value: 0 }];
    this.billService.getBillPeriods(this.clientId).subscribe(billPeriods => {
      billPeriods.forEach(x => {
        this.billPeriods.push({ label: x.periodDescription, value: x.id });
      });
    });
  }

  getTenants() {
    this.billSettlementService.getTenantsDetails(this.clientId).subscribe(data => {
      this.tenants = data;
    });
  }


  getBillFeeTypes() {
    this.billFeeTypes = [{ label: 'Select', value: 0 }];
    this.masterService.getSystemMasterdata(64, 0).subscribe(billFeeTypes => {
      billFeeTypes.forEach(x => {
        this.billFeeTypes.push({ label: x.description, value: x.id });
      });
    });
  }

  getBillTypes() {
    this.billTypes = [{ label: 'Select', value: 0 }];
    this.masterService.getSystemMasterdata(29, 0).subscribe(billTypes => {
      billTypes.forEach(x => {
        this.billTypes.push({ label: x.description, value: Number(x.defaultValue) });
      });
    });
  }

  onBillFeeTypeChange(billFeeType: string) {
    if (this.billHistoryFooterToolbarComponent) {
      this.billHistoryFooterToolbarComponent.billFeeType = billFeeType;
    }
  }



  onViewDataRow(row: BillMaster) {
    this.dialog.open(AccountHeadDetailsComponent, { data: row }).afterClosed().subscribe();
  }

  onDeleteDataRow(row: BillMaster) {
    row.type = 'Cancel';
    if (row.contractNotExist) {
      this.notificationMessage("Can't cancel this Bill due to corresponding contract is suspended or closed", 'red-snackbar');
      return;
    }
    if (row.creditNoteAmount > 0) {
      this.notificationMessage("Can't cancel this Bill due to credit note exist", 'red-snackbar');
      return;
    }
    this.dialog.open(BillCancelComponent, { data: row }).afterClosed().subscribe(() => {
      if (row) {
        this.onGetBillsHistory(this.manageParams);
      }
    });

  }

  onSendNotifications() {
    this.getClientAlertSettings();
  }

  async onPrintPdf() {
    if (this.selectedRows && this.selectedRows.length) {
      // let pdfCount = 0;
      // this.pdfsToMerge = [];
      // this.selectedRows.forEach(row => {
      //   if (row.billFormat === 'Bill Format 1') {
      //     //this.downloadBillReport(row);
      //     if (row.bills && row.bills.length > 1) {
      //       this.downloadBillFormat1LargeReport(row);
      //     } else {
      //       this.downloadBillFormat1Report(row);
      //     }
      //   }
      //   else if (row.billFormat === 'Bill Format 2') {
      //     if (row.bills && row.bills.length > 1) {
      //       this.downloadBillFormat2LargeReport(row);
      //     } else {
      //       this.downloadBillFormat2Report(row);
      //     }
      //   }
      //   else if (row.billFormat === 'Bill Format 3') {
      //     //this.downloadBillNewFormatReport(row);
      //     if (row.bills && row.bills.length > 1) {
      //       this.downloadBillFormat3LargeReport(row);
      //     } else {
      //       this.downloadBillFormat3Report(row);
      //     }
      //   }
      //   pdfCount += 1;
      // })
      // if (pdfCount === this.selectedRows.length) {
      //   this.downloadFile();
      // }
      this.invoiceView(this.selectedRows);
    }
    else {
      this.notificationMessage('Please select Bills.', 'red-snackbar');
    }
  }

  invoiceView(billMasters: BillMaster[]) {
    this.billService.invoiceView(billMasters).subscribe({
      next: data => {
        if (data) {
          this.downloadFile(data);
        } else {
          this.notificationMessage('No data to print', 'red-snackbar');
        }
      },
      error: (err) => {
        this.notificationMessage('No data to print', 'red-snackbar');
      }
    });
  }

  // downloadPdfFile(data: any[]) {
  //   if (data) {
  //     this.downloadFile(data)
  //   }
  // }

  base64ToArrayBuffer(base64: any): ArrayBuffer {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  async downloadReport(row: BillMaster) {
    const invoices: BillMaster[] = [row];
    this.invoiceView(invoices);
  }

  async downloadFile(data: any[]) {
    const mergedPdf = await PDFDocument.create();
    for (const pdfCopyDoc of data) {
      const pdf = await PDFDocument.load(pdfCopyDoc);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });
    }
    const mergedPdfFile = await mergedPdf.save();
    const blob = new Blob([mergedPdfFile], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  }

  downloadBillReport(billMaster: BillMaster) {
    const conversionValueTRHR: number = 0.284345;
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: ListItem[] = [];
    let thirdTableRows: any[] = [];
    let fourthTableCols: any = { value: '', value1: 'Bill Period', value2: 'Meter Reading', value3: '', value4: '' };
    let fourthTableRows: any[] = [fourthTableCols];
    let fifthTableRows: any[] = [];
    let sixthTableRows: ListData[] = [];
    let firstTableCol = [
      'Services Description',
      'From',
      'To',
      'Previous',
      'Current',
      'Consumption',
      'Rate ',
      'Charges'];

    let thirdTableCol = [
      'Customer Id',
      'Billing Period',
      'Total for current period'
    ]; // initialization for headers

    // for (let a = 0; a < billMaster.bills.length; a++) {
    //   row.push(billMaster.bills[a].utilityType + '-' + billMaster.bills[a].deviceName)
    //   row.push(billMaster.fromDateLocal)
    //   row.push(billMaster.toDateLocal)
    //   row.push(this.decimalPipe.transform(billMaster.bills[a].previousReading, this.consumptionRoundOffFormat))
    //   row.push(this.decimalPipe.transform(billMaster.bills[a].presentReading, this.consumptionRoundOffFormat))
    //   row.push(this.decimalPipe.transform(billMaster.bills[a].consumption, this.consumptionRoundOffFormat))
    //   row.push(this.decimalPipe.transform(billMaster.bills[a].consumption, this.consumptionRoundOffFormat)Rate)
    //   row.push(billMaster.bills[a].billAmount)
    //   firstTableRows.push(row);
    //   row = [];
    // }

    // const title = 'Invoice';

    // billMaster.bills.forEach(bill => {
    //   if (bill.transactions && bill.transactions.length) {
    //     const restrictArray: string[] = ['consumption', 'consumptioncharge'];
    //     bill.transactions.forEach(transaction => {
    //       if (!restrictArray.includes(transaction.headDisplay.toLowerCase())) {
    //         const existingitem = secondTableRows.find(x => x.label === transaction.headDisplay);
    //         if (existingitem) {
    //           existingitem.value += transaction.headAmount;
    //         } else {
    //           secondTableRows.push({ label: transaction.headDisplay, value: transaction.headAmount });
    //         }
    //       }
    //     });
    //   }
    // });

    // billMaster.billCharges.forEach(billCharge => {
    //   if (billCharge.headDisplay !== 'VAT') {
    //     const existingitem = secondTableRows.find(x => x.label === billCharge.headDisplay);
    //     if (existingitem) {
    //       existingitem.value += billCharge.headAmount;
    //     } else {
    //       secondTableRows.push({ label: billCharge.headDisplay, value: billCharge.headAmount });
    //     }
    //   }
    // });

    // for (let a = 0; a < secondTableRows.length; a++) {
    //   row.push(secondTableRows[a].label)
    //   row.push('')
    //   row.push('')
    //   row.push('')
    //   row.push('')
    //   row.push('')
    //   row.push('')
    //   row.push(this.decimalPipe.transform(secondTableRows[a].value, this.roundFormat))
    //   firstTableRows.push(row);
    //   row = [];
    // }

    const title = 'Invoice';

    billMaster.bills.forEach(bill => {
      if (bill.billTransactions && bill.billTransactions.length) {
        bill.billTransactions.forEach(transaction => {
          // if (transaction.headDisplay && transaction.headDisplay.toLowerCase().includes('consumption')) {
          row.push(transaction.headDisplay)
          row.push(billMaster.fromDateLocal)
          row.push(billMaster.toDateLocal)
          if (bill.utilityType === 'BTU' && transaction.measuringUnitId && transaction.measuringUnitId === 2) {
            const previousReadingTRHR: number = bill.previousReading * conversionValueTRHR;
            row.push(this.decimalPipe.transform(previousReadingTRHR, this.roundFormat) + ' ' + 'TR-HR');
            const presentReadingTRHR: number = bill.presentReading * conversionValueTRHR;
            row.push(this.decimalPipe.transform(presentReadingTRHR, this.roundFormat) + ' ' + 'TR-HR');
            const consumptionTRHR: number = bill.consumption * conversionValueTRHR;
            row.push(this.decimalPipe.transform(consumptionTRHR, this.roundFormat) + ' ' + 'TR-HR');
          } else {
            row.push(bill.previousReading + ' ' + bill.measuringUnit)
            row.push(bill.presentReading + ' ' + bill.measuringUnit)
            row.push(bill.consumption + ' ' + bill.measuringUnit)
          }
          row.push(transaction.rate)
          row.push(this.decimalPipe.transform(transaction.headAmount, this.roundFormat))
          firstTableRows.push(row);
          // } else {
          //   row.push(transaction.headDisplay + '-' + bill.utilityType)
          //   row.push('')
          //   row.push('')
          //   row.push('')
          //   row.push('')
          //   row.push('')
          //   row.push('')
          //   row.push(this.decimalPipe.transform(transaction.headAmount, this.roundFormat))
          //   firstTableRows.push(row);
          // }
          row = [];
        });
      }
    });
    if (billMaster.billCharges && billMaster.billCharges.length) {
      billMaster.billCharges.sort((a, b) => a.position - b.position).forEach(billCharge => {
        if (billCharge.headDisplay !== 'VAT') {
          const existingitem = secondTableRows.find(x => x.label === billCharge.headDisplay);
          if (existingitem) {
            existingitem.value += billCharge.headAmount;
          } else {
            secondTableRows.push({ label: billCharge.headDisplay, value: billCharge.headAmount });
          }
        }
      });


      for (let a = 0; a < secondTableRows.length; a++) {
        row.push(secondTableRows[a].label)
        row.push('')
        row.push('')
        row.push('')
        row.push('')
        row.push('')
        row.push('')
        row.push(this.decimalPipe.transform(secondTableRows[a].value, this.roundFormat))
        firstTableRows.push(row);
        row = [];
      }
    }

    let meterNumber = '';
    billMaster.bills.forEach(x => {
      meterNumber += x.deviceName + ','
    });

    fifthTableRows.push(
      {
        label: 'Account Number:',
        value: billMaster.accountNumber
      },
      {
        label: 'Meter Number:',
        value: meterNumber.slice(0, -1)
      },
      {
        label: 'Unit Number:',
        value: billMaster.unitNumber
      },
      {
        label: 'Billing Date:',
        value: billMaster.billDateLocal
      },
      {
        label: 'Due Date:',
        value: billMaster.dueDateLocal
      },
      {
        label: 'Bill Period',
        value: `${stringIsNullOrEmpty(billMaster.fromDateLocal)} - ${stringIsNullOrEmpty(billMaster.toDateLocal)} `
      }
    );

    //const vatItem = billMaster.billCharges.find(billCharge => billCharge.headDisplay === 'VAT');

    let totalAmount = 0;
    firstTableRows.forEach(x => {
      totalAmount += Number(x[7].replace(',', ''))
    })

    sixthTableRows.push(
      {
        label: 'Current Month Total:',
        value: this.currencyPipe.transform(totalAmount, this.currency.toString(), true, this.roundFormat)
      });

    if (billMaster.billDiscounts && billMaster.billDiscounts.length) {
      let discountAmount = 0;
      billMaster.billDiscounts.forEach(billDiscount => {
        discountAmount += billDiscount.headAmount;
      });
      sixthTableRows.push({ label: 'Total Discount', value: this.currencyPipe.transform(discountAmount, this.currency.toString(), true, this.roundFormat) });
    }

    if (billMaster.billTaxDetails && billMaster.billTaxDetails.length) {
      billMaster.billTaxDetails.forEach(billTaxDetail => {
        sixthTableRows.push(
          {
            label: billTaxDetail.taxDisplayName,
            value: this.currencyPipe.transform(billTaxDetail.taxAmount, this.currency.toString(), true, this.roundFormat)
          });
      });
    } else {
      sixthTableRows.push(
        {
          label: 'TAX:',
          value: this.currencyPipe.transform(0, this.currency.toString(), true, this.roundFormat)
        });
    }

    sixthTableRows.push(
      {
        label: 'Current Month + TAX:',
        value: billMaster.billAmountLocal
      },
      {
        label: 'Previous Bill Outstanding Balance:',
        value: this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
      },
      {
        label: 'Total Due incl TAX:',
        value: this.currencyPipe.transform(billMaster.billAmount + billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
      }
    );

    this.getBillReport(billMaster, firstTableCol, firstTableRows, secondTableRows, thirdTableCol, thirdTableRows, fourthTableRows, fifthTableRows, sixthTableRows, title);
  }

  addImage(pdf: jsPDF, data: BillMaster) {
    try {
      if (data && data.client && data.client.imageProperties && data.client.imageProperties.length) {
        const imageProperty: ImageProperty = data.client.imageProperties.find(x => x.imageType.trim().toLowerCase() === 'invoice');
        if (imageProperty) {
          var img = new Image()
          img.src = this.filePath + '/uploads/' + data?.client?.photo; //'assets/img/' + data.client.photo
          img.onload = function () {
            pdf.addImage(img, imageProperty.imgX, imageProperty.imgY, imageProperty.imgW, imageProperty.imgH);
          };
          //pdf.addImage(img, 'png', imageProperty.imgX, imageProperty.imgY, imageProperty.imgW, imageProperty.imgH);
        } else {
          this.notificationMessage('Image properties not found. To see image on print, please configure image properties ', 'red-snackbar');
        }
      } else {
        this.notificationMessage('Image properties not found. To see image on print, please configure image properties ', 'red-snackbar');
      }
    }
    catch (err) {
      this.notificationMessage('Image not found.', 'red-snackbar');
    }
    return pdf;
  }

  getBillReport(data: BillMaster, firstTableCol: any[], firstTableRows: any[], secondTableRows: any[], thirdTableCol: any[], thirdTableRows: any[], fourthTableRows: any[], fifthTableRows: any[], sixthTableRows: any[], title: string) {

    const totalPagesExp = "1";
    let pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter"
    });

    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    let startX = 10;
    let startY = 30;
    pdf.setFontSize(30);
    pdf = this.addImage(pdf, data);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.setFont("Cambria", 'bold');
    pdf.text("Tax Invoice", startX + 250, startY);
    pdf.setFontSize(13);
    pdf.setFont('Cambria', 'normal');
    pdf.text(data.client.clientName.toUpperCase(), startX, startY + 30);
    pdf.setFontSize(10);
    pdf.setFont('Cambria');
    pdf.text("TRN: " + data.client.trnNo, startX, startY + 40);
    pdf.text("PO Box " + data.client.addresses[0].zipPostalCode, startX, startY + 50);
    pdf.text(data.client.addresses[0].address1 + ',' + data.client.addresses[0].country, startX, startY + 60);
    pdf.text("Phone: " + data.client.phoneNo, startX, startY + 70);
    pdf.text("Email: " + data.client.email + ',' + ' Web: ' + data.client.website, startX, startY + 80);
    pdf.setFillColor(241, 241, 244);
    pdf.setDrawColor(206, 203, 203);
    pdf.rect(10, startY + 90, 350, 90, 'FD');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text(data?.ownerName.toUpperCase(), startX + 10, startY + 105);
    pdf.text("CUSTOMER TRN: " + data.trn, startX + 10, startY + 125);
    pdf.text("unit #" + data.unitNumber, startX + 10, startY + 140);
    pdf.setFontSize(10);
    pdf.text(data.clientName, startX + 10, startY + 155);
    pdf.text(stringIsNullOrEmpty(data?.client?.buildingName, ',') + stringIsNullOrEmpty(data?.client?.addresses[0]?.location, ',') + stringIsNullOrEmpty(data?.client?.addresses[0]?.city, ',') + stringIsNullOrEmpty(data?.client?.addresses[0]?.country, ','), startX + 10, startY + 170);
    pdf.setFontSize(9);

    pdf.setLineWidth(.1);
    pdf.line(5, startY + 235, 607, startY + 235);
    pdf.setFontSize(10);
    const meterReadingTableHeading = 'Invoice#: ';
    pdf.setFont('bold');
    pdf.text(meterReadingTableHeading.toUpperCase(), startX + 380, startY + 80);
    pdf.setTextColor(25, 118, 210);
    const tableHeadingWidth = pdf.getTextWidth(meterReadingTableHeading);
    let billNumber: string = '';
    if (data?.billNumber) {
      billNumber = data.billNumber?.toUpperCase();
    };
    pdf.text(billNumber, 20 + 390 + tableHeadingWidth, startY + 80);
    pdf.setFont('none');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);


    const autoTable = 'autoTable';
    pdf[autoTable]('', fifthTableRows, {
      startX: startX + 200,
      startY: startY + 90,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX + 380 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 80,
          halign: 'left'
        },
        1: {
          cellWidth: 130,
          halign: 'right'
        }
      },
      didParseCell: function (fourthTableRows) {
        const col = fourthTableRows.column.index;
        if (col == 0 || col == 1) {
          fourthTableRows.cell.styles.rowHeight = 1;
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    });

    var pageContent = function (data) {
      // HEADER

      // FOOTER
      var str = "Page " + data.pageCount;
      // Total page number plugin only available in jspdf v1.0+
      if (typeof pdf.putTotalPages === 'function') {
        str = str + " of " + totalPagesExp;
        pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
      }
      pdf.setFontSize(9);
      var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
      pdf.text(str, data.settings.margin.left, pageHeight - 10); // showing current page number
    };

    pdf[autoTable]('', fourthTableRows, {
      startX: 10,
      startY: startY + 190,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { top: startY + 190, left: 10 },
      theme: 'plain',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 100,
          fontStyle: 'bold',
          halign: 'center'
        },
        1: {
          cellWidth: 160,
          fontStyle: 'bold',
          halign: 'center'
        },
        2: {
          cellWidth: 120,
          fontStyle: 'bold',
          halign: 'center'
        },
        3: {
          cellWidth: 75,
          fontStyle: 'bold',
          halign: 'center'
        },
        4: {
          cellWidth: 135,
          fontStyle: 'bold',
          halign: 'center'
        }
      },
      didParseCell: function (fourthTableRows) {
        const col = fourthTableRows.column.index;
        if (col == 0 || col == 1) {
          fourthTableRows.cell.styles.rowHeight = 1;
        }
      },
      headStyles: {
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      }
    });

    const secondTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));


    pdf[autoTable](firstTableCol, firstTableRows, {
      startX: 10,
      startY: secondTableEndY,
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { top: secondTableEndY, left: 10 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 100,
          halign: 'left'
        },
        1: {
          cellWidth: 80,
          halign: 'center'
        },
        2: {
          cellWidth: 80,
          halign: 'center'
        },
        3: {
          cellWidth: 60,
          halign: 'center'
        },
        4: {
          cellWidth: 60,
          halign: 'center'
        },
        5: {
          cellWidth: 75,
          halign: 'center'
        },
        6: {
          cellWidth: 60,
          halign: 'right'
        },
        7: {
          cellWidth: 75,
          halign: 'right'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (firstTableRows) {
        if (fifthTableRows.length > 12) {
          firstTableRows.cell.styles.cellPadding = 1.5;
        } else {
          firstTableRows.cell.styles.cellPadding = 2;
        }
      }
    });
    pdf.setTextColor(0, 0, 0);

    const thirdTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf.setTextColor(25, 118, 210);
    pdf.setFontSize(12);
    pdf.text("Bank Payment Account Details", startX, thirdTableEndY + 20);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text("Account Title: " + stringIsNullOrEmpty(data?.client?.bankDetails[0]?.accountName), startX, thirdTableEndY + 40);
    pdf.text("Account #: " + stringIsNullOrEmpty(data?.client?.bankDetails[0]?.accountNo), startX, thirdTableEndY + 50);
    pdf.text("IBAN #: " + stringIsNullOrEmpty(data?.client?.bankDetails[0]?.ibanNumber), startX, thirdTableEndY + 60);
    pdf.text("Bank Name: " + stringIsNullOrEmpty(data?.client?.bankDetails[0]?.bankName), startX, thirdTableEndY + 70);
    pdf.text("Swift Code: " + + stringIsNullOrEmpty(data?.client?.bankDetails[0]?.swiftCode), startX, thirdTableEndY + 80);
    pdf.setFontSize(9);


    pdf[autoTable]('', sixthTableRows, {
      startX: 300,
      startY: thirdTableEndY + 20,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX + 310 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 180,
          halign: 'left'
        },
        1: {
          cellWidth: 100,
          halign: 'right'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center'
      }
    });

    const fourthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    pdf.setTextColor(255, 0, 0);
    pdf.text(`Note: A Late Fee will be applied after the due date. A Default Payment \nPenalty will be added to any unit that is ${stringIsNullOrEmpty(data?.penaltyAfter?.toString())} days or more in arrears.`, startX + 310, fourthTableEndY + 10);

    pdf.setTextColor(25, 118, 210);
    pdf.setFontSize(12);
    pdf.text("USAGE TIPS to reduce consumption:", startX, fourthTableEndY + 10);
    pdf.text("Please Try to:", startX, fourthTableEndY + 30);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text("- Keep filters clean", startX + 20, fourthTableEndY + 40);
    pdf.text("- Set thermostats between 23C and 25C", startX + 20, fourthTableEndY + 50);
    pdf.text("- Keep vents unblocked", startX + 20, fourthTableEndY + 60);
    pdf.text("- Keep doors and windows closed", startX + 20, fourthTableEndY + 70);
    pdf.text("- Undertake regular maintenance of the system", startX + 20, fourthTableEndY + 80);
    pdf.setTextColor(25, 118, 210);
    pdf.setFontSize(12);
    pdf.text("Please Do Not:", startX, fourthTableEndY + 100);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text("- Set thermostats to 20C or lower", startX + 20, fourthTableEndY + 110);
    pdf.text("- Block vents", startX + 20, fourthTableEndY + 120);
    pdf.text("- Leave doors and windows open", startX + 20, fourthTableEndY + 130);
    pdf.text("- Leave heat producing appliances near thermostats", startX + 20, fourthTableEndY + 140);


    pdf.setFillColor(119, 183, 11);
    var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
    pdf.rect(startX + 310, fourthTableEndY + 30, 280, pageHeight - 80 - (fourthTableEndY + 30), 'FD');
    pdf.setFont("Comic Sans");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    const boldText = 'ADVERTISE WITH US';
    pdf.text(boldText, startX + 350, fourthTableEndY + 50);
    const boldTextWidth = pdf.getTextWidth(boldText);
    pdf.setLineWidth(.1);
    pdf.line(startX + 350, fourthTableEndY + 55, startX + 350 + boldTextWidth, fourthTableEndY + 55);
    pdf.setFontSize(9);
    pdf.text("For advertisement, contact at", startX + 380, fourthTableEndY + 65);
    pdf.text(stringIsNullOrEmpty(data?.client?.phoneNo), startX + 380, fourthTableEndY + 75);
    pdf.text(stringIsNullOrEmpty(data?.client?.email), startX + 380, fourthTableEndY + 85);
    pdf.text(stringIsNullOrEmpty(data?.client?.website), startX + 380, fourthTableEndY + 95);

    pdf.setTextColor(0, 0, 0);
    pdf.setLineWidth(.1);
    pdf.line(5, pageHeight - 70, 607, pageHeight - 70);
    pdf.text(`For any enquiries, write to us ${stringIsNullOrEmpty(data?.client?.email)} \nor Logon to ${stringIsNullOrEmpty(data?.client?.website)}`, startX, pageHeight - 60);
    pdf.setTextColor(255, 0, 0);
    pdf.setFont('bold');
    const footerText = "Notice:";
    const footerTextWidth = pdf.getTextWidth(footerText);
    pdf.text(footerText, startX + 330, pageHeight - 60);
    pdf.setFont('none');
    pdf.setTextColor(0, 0, 0);
    pdf.text("Pay your bills before due date to avoid late payment surcharge", startX + 330 + footerTextWidth, pageHeight - 60);
    pdf.text("and disconnection.", startX + 330, pageHeight - 50);
    pdf.text(`You can log onto ${stringIsNullOrEmpty(data?.client?.website)} to pay your invoices \nTerms & Conditions for Supply of Utility Services`, startX + 330, pageHeight - 40);

    var output = pdf.output('datauristring')
    this.pdfsToMerge.push(output);
  }

  downloadBillTaiffDetailsReport(billMaster: BillMaster) {
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: ListItem[] = [];
    let thirdTableRows: any[] = [];
    let fourthTableRows: ListData[] = [];
    let fifthTableRows: any[] = [];
    let sixthTableRows: ListData[] = [];
    let firstTableCol = [
      'Services Description',
      'From - To',
      'Previous',
      'Current',
      'Charges'];

    let thirdTableCol = [
      'Customer Id',
      'Billing Period',
      'Total for current period'
    ]; // initialization for headers

    for (let a = 0; a < billMaster.bills.length; a++) {
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      row.push(billMaster.bills[a].utilityType + '-' + billMaster.bills[a].deviceName)
      row.push(billMaster.fromDateLocal + ' - ' + billMaster.toDateLocal)
      row.push(this.decimalPipe.transform(billMaster.bills[a].previousReading, this.consumptionRoundOffFormat))
      row.push(this.decimalPipe.transform(billMaster.bills[a].presentReading, this.consumptionRoundOffFormat))
      row.push(billMaster.bills[a].billAmount)
      firstTableRows.push(row);
      row = [];
      if (billMaster.bills[a].billTariffDetails && billMaster.bills[a].billTariffDetails.length) {
        row.push('Week Type')
        row.push('Peak Type')
        row.push('Consumption (KWH)')
        row.push('Rate')
        row.push('Amount')
        firstTableRows.push(row);
        row = [];
        const billTariffDetails: BillTariffDetail[] = billMaster.bills[a].billTariffDetails;
        for (let b = 0; b < billTariffDetails.length; b++) {
          row.push(billTariffDetails[b]?.weekType)
          row.push(billTariffDetails[b]?.peakType)
          row.push(billTariffDetails[b]?.consumption)
          row.push(billTariffDetails[b]?.rate)
          row.push(billTariffDetails[b]?.amount)
          firstTableRows.push(row);
          row = [];
        }
      }
    }

    const title = 'Invoice';

    billMaster.bills.forEach(bill => {
      if (bill.billTransactions && bill.billTransactions.length) {
        const restrictArray: string[] = ['consumption', 'consumptioncharge'];
        bill.billTransactions.forEach(transaction => {
          if (!restrictArray.includes(transaction.headDisplay.toLowerCase())) {
            const existingitem = secondTableRows.find(x => x.label === transaction.headDisplay);
            if (existingitem) {
              existingitem.value += transaction.headAmount;
            } else {
              secondTableRows.push({ label: transaction.headDisplay, value: transaction.headAmount });
            }
          }
        });
      }
    });
    if (billMaster.billCharges && billMaster.billCharges.length) {
      billMaster.billCharges.sort((a, b) => a.position - b.position).forEach(billCharge => {
        if (billCharge.headDisplay !== 'VAT') {
          const existingitem = secondTableRows.find(x => x.label === billCharge.headDisplay);
          if (existingitem) {
            existingitem.value += billCharge.headAmount;
          } else {
            secondTableRows.push({ label: billCharge.headDisplay, value: billCharge.headAmount });
          }
        }
      });



      for (let a = 0; a < secondTableRows.length; a++) {
        row.push(secondTableRows[a].label)
        row.push('')
        row.push('')
        row.push('')
        row.push(this.decimalPipe.transform(secondTableRows[a].value, this.roundFormat))
        firstTableRows.push(row);
        row = [];
      }
    }
    fourthTableRows.push(
      {
        label: 'Billing Period',
        value: 'Meter Reading'
      });

    let meterNumber = '';
    billMaster.bills.forEach(x => {
      meterNumber += x.deviceName + ','
    });

    fifthTableRows.push(
      {
        label: 'Account Number:',
        value: billMaster.accountNumber
      },
      {
        label: 'Meter Number:',
        value: meterNumber.slice(0, -1)
      },
      {
        label: 'Unit Number:',
        value: billMaster.unitNumber
      },
      {
        label: 'Billing Date:',
        value: billMaster.billDateLocal
      },
      {
        label: 'Due Date:',
        value: billMaster.dueDateLocal
      },
      {
        label: 'Bill Period',
        value: `${stringIsNullOrEmpty(billMaster.fromDateLocal)} - ${stringIsNullOrEmpty(billMaster.toDateLocal)} `
      }
    );

    const vatItem = billMaster.billCharges.find(billCharge => billCharge.headDisplay === 'VAT');

    let totalAmount = 0;
    firstTableRows.forEach(x => {
      totalAmount += Number(x[7].replace(',', ''))
    })


    sixthTableRows.push(
      {
        label: 'Current Month Total:',
        value: this.currencyPipe.transform(totalAmount, this.currency.toString(), true, this.roundFormat)
      },
      {
        label: 'VAT 5%:',
        value: this.currencyPipe.transform(vatItem?.headAmount, this.currency.toString(), true, this.roundFormat)
      },
      {
        label: 'Current Month + VAT:',
        value: billMaster.billAmountLocal
      },
      {
        label: 'Previous Bill Outstanding Balance:',
        value: this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
      },
      {
        label: 'Total Due incl VAT:',
        value: this.currencyPipe.transform(billMaster.billAmount + billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
      }
    );

    this.getBillTaiffDetailsReport(billMaster, firstTableCol, firstTableRows, secondTableRows, thirdTableCol, thirdTableRows, fourthTableRows, fifthTableRows, sixthTableRows, title);
  }

  getBillTaiffDetailsReport(data: BillMaster, firstTableCol: any[], firstTableRows: any[], secondTableRows: any[], thirdTableCol: any[], thirdTableRows: any[], fourthTableRows: any[], fifthTableRows: any[], sixthTableRows: any[], title: string) {

    const totalPagesExp = "1";
    var img = new Image()
    img.src = this.filePath + '/uploads/' + data.client.photo //'assets/img/' + data.client.photo
    var img1 = new Image()
    img1.src = 'assets/img/lu.JPG'
    let pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter"
    });

    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    let startX = 10;
    let startY = 30;
    pdf.setFontSize(30);
    pdf.addImage(img, 'png', 5, 5, 190, img.height);
    pdf.addImage(img1, 'png', 547, 10, 56, 56);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont("Cambria");
    pdf.text("Tax Invoice", startX + 250, startY);
    pdf.setFontSize(9);
    pdf.setTextColor(25, 118, 210);
    pdf.setFont('Cambria', 'bold');
    pdf.text(data.client.clientName, startX, startY + 30);
    pdf.setFont('Cambria', 'normal');
    pdf.text("TRN: " + data.client.trnNo, startX, startY + 40);
    pdf.text("PO Box " + data.client.addresses[0].zipPostalCode, startX, startY + 50);
    pdf.text(data.client.addresses[0].address1 + ',' + data.client.addresses[0].country, startX, startY + 60);
    pdf.text("Phone: " + data.client.phoneNo, startX, startY + 70);
    pdf.text("Email: " + data.client.email + ',' + ' Web: ' + data.client.website, startX, startY + 80);
    pdf.setFillColor(241, 241, 244);
    pdf.setDrawColor(206, 203, 203);
    pdf.rect(10, startY + 90, 300, 90, 'FD');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text(data?.ownerName.toUpperCase(), startX + 10, startY + 105);
    pdf.text("CUSTOMER TRN: " + data.trn, startX + 10, startY + 125);
    pdf.text("unit #" + data.unitNumber, startX + 10, startY + 140);
    pdf.setFontSize(10);
    pdf.text(data.clientName, startX + 10, startY + 155);
    pdf.text("Al Barsha 1, Dubai, UAE", startX + 10, startY + 170);
    pdf.setFontSize(9);

    pdf.setLineWidth(.1);
    pdf.line(5, startY + 235, 607, startY + 235);
    pdf.setFontSize(10);
    const meterReadingTableHeading = 'Invoice#: ';
    pdf.setFont('bold');
    pdf.text(meterReadingTableHeading.toUpperCase(), startX + 380, startY + 80);
    pdf.setTextColor(25, 118, 210);
    const tableHeadingWidth = pdf.getTextWidth(meterReadingTableHeading);
    let billNumber: string = '';
    if (data?.billNumber) {
      billNumber = data.billNumber?.toUpperCase();
    };
    pdf.text(billNumber, 20 + 390 + tableHeadingWidth, startY + 80);
    pdf.setFont('none');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);


    const autoTable = 'autoTable';
    pdf[autoTable]('', fifthTableRows, {
      startX: startX + 200,
      startY: startY + 90,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX + 380 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 80,
          halign: 'left'
        },
        1: {
          cellWidth: 130,
          halign: 'right'
        }
      },
      didParseCell: function (fourthTableRows) {
        const col = fourthTableRows.column.index;
        if (col == 0 || col == 1) {
          fourthTableRows.cell.styles.rowHeight = 1;
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    });

    var pageContent = function (data) {
      // HEADER

      // FOOTER
      var str = "Page " + data.pageCount;
      // Total page number plugin only available in jspdf v1.0+
      if (typeof pdf.putTotalPages === 'function') {
        str = str + " of " + totalPagesExp;
        pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
      }
      pdf.setFontSize(9);
      var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
      pdf.text(str, data.settings.margin.left, pageHeight - 10); // showing current page number
    };

    pdf[autoTable]('', fourthTableRows, {
      startX: 10,
      startY: startY + 190,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { top: startY + 190, left: 10 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 500,
          fontStyle: 'bold'
        },
        1: {
          cellWidth: 90,
          fontStyle: 'bold',
          halign: 'right'
        }
      },
      didParseCell: function (fourthTableRows) {
        const col = fourthTableRows.column.index;
        if (col == 0 || col == 1) {
          fourthTableRows.cell.styles.rowHeight = 1;
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    });

    const secondTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));


    pdf[autoTable](firstTableCol, firstTableRows, {
      startX: 10,
      startY: secondTableEndY,
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { top: secondTableEndY, left: 10 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 150,
          halign: 'center'
        },
        1: {
          cellWidth: 150,
          halign: 'center'
        },
        2: {
          cellWidth: 100,
          halign: 'right'
        },
        3: {
          cellWidth: 100,
          halign: 'right'
        },
        4: {
          cellWidth: 90,
          halign: 'right'
        }
      },
      didParseCell: function (fourthTableRows) {
        const tdElement = fourthTableRows.cell.raw;
        if (tdElement === 'Week Type' || tdElement === 'Peak Type' ||
          tdElement === 'Consumption (KWH)' || tdElement === 'Rate' ||
          tdElement === 'Amount') {
          fourthTableRows.cell.styles.fontStyle = 'bold';
          fourthTableRows.cell.styles.textColor = [255, 255, 255];
          fourthTableRows.cell.styles.fillColor = [25, 118, 210];
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      }
    });
    pdf.setTextColor(0, 0, 0);

    const thirdTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf.setTextColor(25, 118, 210);
    pdf.setFontSize(12);
    pdf.text("Bank Payment Account Details", startX, thirdTableEndY + 20);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text("Account Title: LOGIC UTILITIES DISTRICT COOLING SERVICES L.L.C", startX, thirdTableEndY + 40);
    pdf.text("Account #: 019100074892", startX, thirdTableEndY + 50);
    pdf.text("IBAN #: AE54 0330 0000 1910 0074 892", startX, thirdTableEndY + 60);
    pdf.text("Bank Name: MASHREQ BANK - DUBAI MALL BRANCH", startX, thirdTableEndY + 70);
    pdf.text("Swift Code: BOMLAEAD", startX, thirdTableEndY + 80);
    pdf.setFontSize(9);


    pdf[autoTable]('', sixthTableRows, {
      startX: 300,
      startY: thirdTableEndY + 20,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX + 310 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 180,
          halign: 'left'
        },
        1: {
          cellWidth: 100,
          halign: 'right'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center'
      }
    });

    const fourthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    pdf.setTextColor(255, 0, 0);
    pdf.text(`Note: A Late Fee will be applied after the due date. A Default Payment \nPenalty will be added to any unit that is ${data.penaltyAfter} days or more in arrears.`, startX + 310, fourthTableEndY + 10);

    pdf.setTextColor(25, 118, 210);
    pdf.setFontSize(12);
    pdf.text("USAGE TIPS to reduce consumption:", startX, fourthTableEndY + 10);
    pdf.text("Please Try to:", startX, fourthTableEndY + 30);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text("- Keep filters clean", startX + 20, fourthTableEndY + 40);
    pdf.text("- Set thermostats between 23C and 25C", startX + 20, fourthTableEndY + 50);
    pdf.text("- Keep vents unblocked", startX + 20, fourthTableEndY + 60);
    pdf.text("- Keep doors and windows closed", startX + 20, fourthTableEndY + 70);
    pdf.text("- Undertake regular maintenance of the system", startX + 20, fourthTableEndY + 80);
    pdf.setTextColor(25, 118, 210);
    pdf.setFontSize(12);
    pdf.text("Please Do Not:", startX, fourthTableEndY + 100);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text("- Set thermostats to 20C or lower", startX + 20, fourthTableEndY + 110);
    pdf.text("- Block vents", startX + 20, fourthTableEndY + 120);
    pdf.text("- Leave doors and windows open", startX + 20, fourthTableEndY + 130);
    pdf.text("- Leave heat producing appliances near thermostats", startX + 20, fourthTableEndY + 140);


    pdf.setFillColor(119, 183, 11);
    var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
    pdf.rect(startX + 310, fourthTableEndY + 30, 280, pageHeight - 80 - (fourthTableEndY + 30), 'FD');
    pdf.setFont("Comic Sans");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    const boldText = 'ADVERTISE WITH US';
    pdf.text(boldText, startX + 350, fourthTableEndY + 50);
    const boldTextWidth = pdf.getTextWidth(boldText);
    pdf.setLineWidth(.1);
    pdf.line(startX + 350, fourthTableEndY + 55, startX + 350 + boldTextWidth, fourthTableEndY + 55);
    pdf.setFontSize(9);
    pdf.text("For advertisement, contact at", startX + 380, fourthTableEndY + 65);
    pdf.text("800 Logic (56442)", startX + 380, fourthTableEndY + 75);
    pdf.text("enquiry@logicutilities.com", startX + 380, fourthTableEndY + 85);
    pdf.text("www.logicutilities.com", startX + 380, fourthTableEndY + 95);

    pdf.setTextColor(0, 0, 0);
    pdf.setLineWidth(.1);
    pdf.line(5, pageHeight - 70, 607, pageHeight - 70);
    pdf.text("For any enquiries, write to us enquiry@logicutilities.com \nor Logon to www.logicutilites.com", startX, pageHeight - 60);
    pdf.setTextColor(255, 0, 0);
    pdf.setFont('bold');
    const footerText = "Notice:";
    const footerTextWidth = pdf.getTextWidth(footerText);
    pdf.text(footerText, startX + 330, pageHeight - 60);
    pdf.setFont('none');
    pdf.setTextColor(0, 0, 0);
    pdf.text("Pay your bills before due date to avoid late payment surcharge", startX + 330 + footerTextWidth, pageHeight - 60);
    pdf.text("and disconnection.", startX + 330, pageHeight - 50);
    pdf.text("You can log onto www.logicutilites.com to pay your invoices \nTerms & Conditions for Supply of Utility Services", startX + 330, pageHeight - 40);

    var output = pdf.output('datauristring')
    this.pdfsToMerge.push(output);
  }

  onPrintSummary(type: string) {
    if (this.selectedRows && this.selectedRows.length) {
      if (type === 'Normal') {
        this.billSummaryView(this.selectedRows);
      } else {
        this.downloadDetailsSummary(this.selectedRows);
      }
    } else {
      this.notificationMessage('Please select Bills.', 'red-snackbar');
    }
  }

  billSummaryView(billMasters: BillMaster[]) {
    this.billService.billSummaryView(billMasters).subscribe({
      next: data => {
        if (data) {
          this.downloadSingelFile(data);
        } else {
          this.notificationMessage('No data to print', 'red-snackbar');
        }
      },
      error: (err) => {
        this.notificationMessage('No data to print', 'red-snackbar');
      }
    });
  }

  async downloadSingelFile(data: any) {
    const mergedPdf = await PDFDocument.create();
    const pdf = await PDFDocument.load(data);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => {
      mergedPdf.addPage(page);
    });
    const mergedPdfFile = await mergedPdf.save();
    const blob = new Blob([mergedPdfFile], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  }


  downloadSummary(billMaster: BillMaster[]) {
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: any[] = [];
    let firstTableCol = [
      'Bill Number',
      'Account Number',
      'Tenant Name',
      'Owner/Tenant',
      'Unit',
      'From Date',
      'To Date ',
      'Due Date ',
      'Bill Amount',
      'Paid'];

    let totalAmount = 0;
    let totalPaidAmount = 0;

    for (let a = 0; a < billMaster.length; a++) {
      row.push(billMaster[a].billNumber)
      row.push(billMaster[a].accountNumber)
      row.push(billMaster[a].ownerName)
      row.push(billMaster[a].entityType)
      row.push(billMaster[a].unitNumber)
      row.push(billMaster[a].fromDateLocal)
      row.push(billMaster[a].toDateLocal)
      row.push(billMaster[a].dueDateLocal)
      row.push(billMaster[a].billAmountLocal)
      row.push(billMaster[a].paidLocal)
      firstTableRows.push(row);

      totalAmount += billMaster[a].billAmount;
      totalPaidAmount += billMaster[a].paid;
      row = [];
    }


    const title = 'Bill History';




    secondTableRows.push({ label: 'Total Amount', value1: totalAmount, value2: totalPaidAmount });

    for (let a = 0; a < secondTableRows.length; a++) {
      row.push('')
      row.push('')
      row.push('')
      row.push('')
      row.push('')
      row.push('')
      row.push('')
      row.push(secondTableRows[a].label)
      row.push(this.currencyPipe.transform(secondTableRows[a].value1, this.currency.toString(), true, this.roundFormat))
      row.push(this.currencyPipe.transform(secondTableRows[a].value2, this.currency.toString(), true, this.roundFormat))
      firstTableRows.push(row);
      row = [];
    }

    this.getSummaryReport(this.billMasterDetails, firstTableCol, firstTableRows, title)
  }

  getSummaryReport(billMasterDetails: BillMaster[], firstTableCol: any[], firstTableRows: any[], title: string) {
    const totalPagesExp = billMasterDetails.length % 15;
    var img = new Image()
    img.src = this.filePath + '/uploads/' + billMasterDetails[0]?.client?.photo //'assets/img/' + data.client.photo
    let pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "letter"
    });
    let startX = 10;
    let startY = 30;
    const currentTime: string = moment().format('M/D/YYYY hh:mm:ss a');
    var pageContent = function (data) {
      // HEADER
      pdf.setFontSize(30);
      pdf.setFontSize(30);
      if (img && billMasterDetails[0] && billMasterDetails[0].client && billMasterDetails[0].client.imageProperties && billMasterDetails[0].client.imageProperties.length) {
        const imageProperty: ImageProperty = billMasterDetails[0]?.client?.imageProperties.find(x => x.imageType.trim().toLowerCase() === 'landscape');
        if (imageProperty) {
          img.onload = function () {
            pdf.addImage(img, imageProperty.imgX, imageProperty.imgY, imageProperty.imgW, imageProperty.imgH);
          };
          //pdf.addImage(img, 'png', imageProperty.imgX, imageProperty.imgY, imageProperty.imgW, imageProperty.imgH);
        }
      }
      pdf.setTextColor(25, 118, 210);
      // pdf.setFontSize(9);
      // pdf.setFont("Cambria");
      // pdf.text("PO Box -" + stringIsNullOrEmpty(billMasterDetails[0]?.client?.addresses[0]?.zipPostalCode), startX + 450, startY - 10);
      // pdf.text(stringIsNullOrEmpty(billMasterDetails[0]?.client?.addresses[0]?.address1), startX + 450, startY);
      // pdf.text(stringIsNullOrEmpty(billMasterDetails[0]?.client?.addresses[0]?.location, ',') + stringIsNullOrEmpty(billMasterDetails[0]?.client?.addresses[0]?.city, ',') + stringIsNullOrEmpty(billMasterDetails[0]?.client?.addresses[0]?.country), startX + 450, startY + 10);
      // pdf.setTextColor(0, 0, 0);
      // pdf.text('Phone: ' + stringIsNullOrEmpty(billMasterDetails[0]?.client?.phoneNo), startX + 650, startY - 10);
      // pdf.text("Email: ", startX + 650, startY);
      // pdf.setTextColor(25, 118, 210);
      // pdf.text(stringIsNullOrEmpty(billMasterDetails[0]?.client?.email), startX + 675, startY);
      // pdf.setTextColor(0, 0, 0);
      // pdf.text("Web: ", startX + 650, startY + 10);
      // pdf.setTextColor(25, 118, 210);
      // pdf.text(stringIsNullOrEmpty(billMasterDetails[0]?.client?.website), startX + 675, startY + 10);
      // pdf.setTextColor(0, 0, 0);
      // pdf.setFontSize(12);
      // pdf.setTextColor(25, 118, 210);
      // pdf.text(stringIsNullOrEmpty(billMasterDetails[0]?.client?.clientName), startX, startY + 30);
      // pdf.text('TRN: ' + stringIsNullOrEmpty(billMasterDetails[0]?.client?.trnNo), startX, startY + 50)
      pdf.setFontSize(9);
      pdf.setFont("Cambria");
      pdf.setTextColor(0, 0, 0);
      pdf.text('Print Date: ' + currentTime, pdf.internal.pageSize.width - 150, startY - 10);
      pdf.setFontSize(14);
      pdf.text("Summary Report From " + stringIsNullOrEmpty(billMasterDetails[0]?.fromDateLocal) + " To " + stringIsNullOrEmpty(billMasterDetails[0]?.toDateLocal), pdf.internal.pageSize.width / 2 - 140, startY + 60)
      pdf.setFontSize(9);
      // FOOTER
      var str = "Page " + data.pageCount;
      // Total page number plugin only available in jspdf v1.0+
      if (typeof pdf.putTotalPages === 'function') {
        pdf.setTextColor(0, 0, 0);
        pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
        str = str + " of " + totalPagesExp;
      }
      pdf.setFontSize(9);
      var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
      pdf.text(str, data.settings.margin.left, pageHeight - 10); // showing current page number
    };
    const autoTable = 'autoTable';
    const secondTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    pdf[autoTable](firstTableCol, firstTableRows, {
      startX: 10,
      startY: startY + 80,
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { top: 100, left: 20 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 70,
          halign: 'left'
        },
        1: {
          cellWidth: 80,
          halign: 'center'
        },
        2: {
          cellWidth: 160,
          halign: 'left'
        },
        3: {
          cellWidth: 45,
          halign: 'center'
        },
        4: {
          cellWidth: 60,
          halign: 'center'
        },
        5: {
          cellWidth: 65,
          halign: 'center'
        },
        6: {
          cellWidth: 65,
          halign: 'center'
        },
        7: {
          cellWidth: 65,
          halign: 'center'
        },
        8: {
          cellWidth: 75,
          halign: 'right'
        },
        9: {
          cellWidth: 75,
          halign: 'right'
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


  downloadDetailsSummary(billMasters: BillMaster[]) {
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: any[] = [];
    let firstTableCols = [
      'Bill Number',
      'Bill Date',
      'Account Number',
      'Tenant Name',
    ];

    let firstColumns: string[] = [];
    let secondColumns: string[] = [];

    billMasters.forEach(x => {
      if (x.bills && x.bills.length) {
        x.bills.forEach(bill => {
          if (bill.billTransactions && bill.billTransactions.length) {
            bill.billTransactions.forEach(transaction => {
              if (!firstColumns.includes(transaction.headDisplay)) {
                firstColumns.push(transaction.headDisplay);
              }
            });
          }
        });
      }
      if (x.billCharges && x.billCharges.length) {
        x.billCharges.forEach(billCharge => {
          if (!secondColumns.includes(billCharge.headDisplay)) {
            secondColumns.push(billCharge.headDisplay);
          }
        });
      }
    });

    firstColumns.forEach(x => {
      firstTableCols.push(x);
    });

    secondColumns.forEach(x => {
      firstTableCols.push(x);
    });

    firstTableCols.push(
      'Bill Amount ', //+ this.currency,
      'Paid '); //+ this.currency);

    let totalAmount = 0;
    let totalPaidAmount = 0;

    for (let a = 0; a < billMasters.length; a++) {
      row.push(billMasters[a].billNumber)
      row.push(billMasters[a].billDateLocal)
      row.push(billMasters[a].accountNumber)
      row.push(billMasters[a].ownerName)

      firstColumns.forEach(column => {
        if (billMasters[a].bills && billMasters[a].bills.length) {
          const differentiateBills = billMasters[a].bills.filter(x => x.isDifferentiateBill == true);
          if (differentiateBills && differentiateBills.length && billMasters[a].bills.length == differentiateBills.length) {
            if (differentiateBills[differentiateBills.length - 1].billTransactions && differentiateBills[differentiateBills.length - 1].billTransactions.length) {
              const item = differentiateBills[differentiateBills.length - 1].billTransactions.find(transaction => transaction.headDisplay.toLowerCase() === column.toLowerCase());
              if (item) {
                row.push(this.currencyPipe.transform(item.headAmount, this.currency.toString(), true, this.roundFormat));
              } else {
                row.push(this.currencyPipe.transform(0, this.currency.toString(), true, this.roundFormat));
              }
            }
            else {
              row.push(this.currencyPipe.transform(0, this.currency.toString(), true, this.roundFormat));
            }
          } else {
            if (billMasters[a].isGroupBill) {
              let amount = 0;
              billMasters[a].bills.forEach(bill => {
                if (bill.billTransactions && bill.billTransactions.length) {
                  const item = bill.billTransactions.find(transaction => transaction.headDisplay.toLowerCase() === column.toLowerCase());
                  if (item) {
                    amount += item.headAmount
                  }
                }
              });
              if (amount > 0) {
                row.push(this.currencyPipe.transform(amount, this.currency.toString(), true, this.roundFormat));
              } else {
                row.push(this.currencyPipe.transform(0, this.currency.toString(), true, this.roundFormat));
              }
            } else {
              billMasters[a].bills.forEach(bill => {
                if (bill.billTransactions && bill.billTransactions.length) {
                  const item = bill.billTransactions.find(transaction => transaction.headDisplay.toLowerCase() === column.toLowerCase());
                  if (item) {
                    row.push(this.currencyPipe.transform(item.headAmount, this.currency.toString(), true, this.roundFormat));
                  }
                  else {
                    row.push(this.currencyPipe.transform(0, this.currency.toString(), true, this.roundFormat));
                  }
                }
                else {
                  row.push(this.currencyPipe.transform(0, this.currency.toString(), true, this.roundFormat));
                }
              });
            }
          }
        } else {
          row.push(this.currencyPipe.transform(0, this.currency.toString(), true, this.roundFormat));
        }
      });

      secondColumns.forEach(column => {
        if (billMasters[a].isGroupBill) {
          let amount = 0;
          if (billMasters[a].billCharges && billMasters[a].billCharges.length) {
            const items = billMasters[a].billCharges.filter(billCharge => billCharge.headDisplay.toLowerCase() === column.toLowerCase());
            if (items && items.length) {
              items.forEach(item => {
                amount += Number(item.headAmount);
              });
            }
          }
          if (amount > 0) {
            row.push(this.currencyPipe.transform(amount, this.currency.toString(), true, this.roundFormat));
          } else {
            row.push(this.currencyPipe.transform(0, this.currency.toString(), true, this.roundFormat));
          }
        }
        else {
          if (billMasters[a].billCharges && billMasters[a].billCharges.length) {
            const item = billMasters[a].billCharges.find(billCharge => billCharge.headDisplay.toLowerCase() === column.toLowerCase());
            if (item) {
              row.push(this.currencyPipe.transform(item.headAmount, this.currency.toString(), true, this.roundFormat));
            } else {
              row.push(this.currencyPipe.transform(0, this.currency.toString(), true, this.roundFormat));
            }
          } else {
            row.push(this.currencyPipe.transform(0, this.currency.toString(), true, this.roundFormat));
          }
        }
      });
      row.push(this.currencyPipe.transform(billMasters[a].billAmount, this.currency.toString(), true, this.roundFormat));
      row.push(this.currencyPipe.transform(billMasters[a].paid, this.currency.toString(), true, this.roundFormat));
      firstTableRows.push(row);

      totalAmount += billMasters[a].billAmount;
      totalPaidAmount += billMasters[a].paid;
      row = [];
    }

    const title = 'Bill History';

    row = [];
    for (let a = 0; a < firstTableCols.length - 2; a++) {
      row.push('');
    }
    row.push(this.currencyPipe.transform(totalAmount, this.currency.toString(), true, this.roundFormat));
    row.push(this.currencyPipe.transform(totalPaidAmount, this.currency.toString(), true, this.roundFormat));
    firstTableRows.push(row);

    this.getSummaryDetailsReport(this.billMasterDetails, firstTableCols, firstTableRows, title)
  }

  getSummaryDetailsReport(billMasterDetails: BillMaster[], firstTableCol: any[], firstTableRows: any[], title: string) {
    const totalPagesExp = billMasterDetails.length % 15;
    var img = new Image()
    img.src = this.filePath + '/uploads/' + billMasterDetails[0]?.client?.photo //'assets/img/' + data.client.photo
    let pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "letter"
    });
    let startX = 10;
    let startY = 30;
    const currentTime: string = moment().format('M/D/YYYY hh:mm:ss a');
    var pageContent = function (data) {
      // HEADER
      pdf.setFontSize(30);
      if (img && billMasterDetails[0] && billMasterDetails[0].client && billMasterDetails[0].client.imageProperties && billMasterDetails[0].client.imageProperties.length) {
        const imageProperty: ImageProperty = billMasterDetails[0]?.client?.imageProperties.find(x => x.imageType.trim().toLowerCase() === 'landscape');
        if (imageProperty) {
          img.onload = function () {
            pdf.addImage(img, imageProperty.imgX, imageProperty.imgY, imageProperty.imgW, imageProperty.imgH);
          };
          //pdf.addImage(img, 'png', imageProperty.imgX, imageProperty.imgY, imageProperty.imgW, imageProperty.imgH);
        }
      }
      pdf.setTextColor(25, 118, 210);
      // pdf.setFontSize(9);
      // pdf.setFont("Cambria");
      // pdf.text("PO Box -" + stringIsNullOrEmpty(billMasterDetails[0]?.client?.addresses[0]?.zipPostalCode), startX + 450, startY - 10);
      // pdf.text(stringIsNullOrEmpty(billMasterDetails[0]?.client?.addresses[0]?.address1), startX + 450, startY);
      // pdf.text(stringIsNullOrEmpty(billMasterDetails[0]?.client?.addresses[0]?.location, ',') + stringIsNullOrEmpty(billMasterDetails[0]?.client?.addresses[0]?.city, ',') + ',' + stringIsNullOrEmpty(billMasterDetails[0]?.client?.addresses[0]?.country), startX + 450, startY + 10);
      // pdf.setTextColor(0, 0, 0);
      // pdf.text('Phone: ' + stringIsNullOrEmpty(billMasterDetails[0]?.client?.phoneNo), startX + 650, startY - 10);
      // pdf.text("Email: ", startX + 650, startY);
      // pdf.setTextColor(25, 118, 210);
      // pdf.text(stringIsNullOrEmpty(billMasterDetails[0]?.client?.email), startX + 675, startY);
      // pdf.setTextColor(0, 0, 0);
      // pdf.text("Web: ", startX + 650, startY + 10);
      // pdf.setTextColor(25, 118, 210);
      // pdf.text(stringIsNullOrEmpty(billMasterDetails[0]?.client?.website), startX + 675, startY + 10);
      // pdf.setTextColor(0, 0, 0);
      // pdf.setFontSize(12);
      // pdf.setTextColor(25, 118, 210);
      // pdf.text(stringIsNullOrEmpty(billMasterDetails[0]?.client?.clientName), startX, startY + 30);
      // pdf.text('TRN: ' + stringIsNullOrEmpty(billMasterDetails[0]?.client?.trnNo), startX, startY + 50)
      pdf.setFontSize(9);
      pdf.setFont("Cambria");
      pdf.setTextColor(0, 0, 0);
      pdf.text('Print Date: ' + currentTime, pdf.internal.pageSize.width - 150, startY - 10);
      pdf.setFontSize(14);
      pdf.text("Bill History From " + stringIsNullOrEmpty(billMasterDetails[0]?.fromDateLocal) + " To " + stringIsNullOrEmpty(billMasterDetails[0]?.toDateLocal), pdf.internal.pageSize.width / 2 - 140, startY + 60)
      pdf.setFontSize(9);
      // FOOTER
      var str = "Page " + data.pageCount;
      // Total page number plugin only available in jspdf v1.0+
      if (typeof pdf.putTotalPages === 'function') {
        pdf.setTextColor(0, 0, 0);
        pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
        str = str;
      }
      pdf.setFontSize(9);
      var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
      pdf.text(str, data.settings.margin.left, pageHeight - 10); // showing current page number
    };

    const autoTable = 'autoTable';
    const secondTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    pdf[autoTable](firstTableCol, firstTableRows, {
      startX: 10,
      startY: startY + 80,
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { top: 100, left: 20 },
      theme: 'grid',
      tableWidth: 'auto',
      columnStyles: {
        0: {
          cellWidth: firstTableCol.length > 10 ? '40' : 'wrap',
          halign: 'center'
        },
        1: {
          cellWidth: firstTableCol.length > 10 ? '40' : 'wrap',
          halign: 'center'
        },
        2: {
          cellWidth: firstTableCol.length > 10 ? '40' : 'wrap',
          halign: 'center'
        },
        3: {
          cellWidth: firstTableCol.length > 10 ? '60' : 'wrap',
          halign: 'center'
        },
        4: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        5: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        6: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        7: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        8: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        9: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        10: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        11: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        12: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        13: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        14: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        15: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        16: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        17: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        18: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        19: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        20: {
          cellWidth: 'wrap',
          halign: 'right'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (firstTableRows) {
        const col = firstTableRows.column.index;
        if (col == 0) {
          let largeItem: boolean = false;
          if (firstTableRows.table && firstTableRows.table.body && firstTableRows.table.body.length) {
            for (let i = 0; i < firstTableRows.table.body.length; i++) {
              const item: string = firstTableRows.table.body[i].raw[col];
              if (item) {
                largeItem = item.length > 30 ? true : false;
              }
              if (largeItem) {
                break;
              }
            };
          }
          if (largeItem) {
            firstTableRows.cell.styles.cellWidth = '5';
          }
        }
      }
    });
    var blob = pdf.output("blob");
    window.open(URL.createObjectURL(blob));
  }

  onSendInvoice(notificationLog: NotificationLog, isManual: boolean = true, reset: boolean = false,) {
    if (this.selectedRows && this.selectedRows.length) {
      const templateContent: TemplateContent = {
        clientId: this.clientId,
        templateName: notificationLog.notificationType,
        notificationType: notificationLog.notificationType,
        billMasterDetails: this.selectedRows,
        isManual: isManual,
        isSkipExisting: notificationLog.isSkipExisting
      };
      this.templateService.emailCustomTemplate(templateContent).subscribe(
        {
          next: (response: ResponseDetails) => {
            if (response && response.status) {
              const message: string = `Notifications send failed.${response.status}`;
              this.notificationMessage(message, 'red-snackbar');
            } else if (response && response.isSuccess) {
              const message: string = 'Notifications initiated,Please check notification logs.'
              this.notificationMessage(message, 'green-snackbar');
            }
            if (reset) {
              this.reset();
              this.onGetBillsHistory(this.manageParams);
            }
          },
          error: (err) => {
            this.notificationMessage('Notifications send failed.', 'red-snackbar');
          }
        });
    } else {
      this.notificationMessage('Please select Bills.', 'red-snackbar');
    }
  }

  // onSendSMS() {
  //   this.billType = this.billHistoryToolbarComponent.billType;
  //   if (this.selectedRows) {
  //     const templateContent: TemplateContent = {
  //       notificationType: 'Invoice',
  //       templateType: this.billType,
  //       templateName: 'EMAIL',
  //       billMasterDetails: this.selectedRows
  //     };
  //     this.templateService.emailInvoiceTemplate(templateContent).subscribe(
  //       response => {
  //       }
  //     );
  //   }
  // }

  onApprove() {
    if (this.selectedRows && this.selectedRows.length) {
      this.billSettlementService.updateBillMasterApprovedStatus(this.selectedRows).subscribe(
        {
          next: (response: boolean) => {
            if (response) {
              this.notificationMessage('Invoice approved successfully', 'green-snackbar');
              this.generateInvoice();
            } else {
              this.notificationMessage('Invoice approve failed', 'red-snackbar');
            }
          },
          error: (err) => {
            this.notificationMessage('Invoice approve failed', 'red-snackbar');
          }
        });
    } else {
      this.notificationMessage('Please select Bills', 'red-snackbar');
    }
  }

  getClientAlertSettings(type: string = '') {
    this.templatesService.getClientAlertSettings(this.clientId).subscribe(
      {
        next: (response: AlertSetting[]) => {
          if (response) {
            if (type === 'Approval') {
              const autoSendAfterApproval: AlertSetting[] = response.filter(x => x.notificationCategory && x.notificationCategory.toLowerCase() === 'bills'.toLowerCase() && x.condition && x.condition.toLowerCase() == 'After Invoice Approval'.toLowerCase() && x.isEnableAutoSend == true);
              if (autoSendAfterApproval && autoSendAfterApproval.length) {
                let index = 0;
                autoSendAfterApproval.forEach(x => {
                  const notificationLog: NotificationLog = { notificationType: x.notificationType, isSkipExisting: false };
                  this.onSendInvoice(notificationLog, false, index == autoSendAfterApproval.length - 1 ? true : false);
                  index = index + 1;
                });
              } else {
                this.reset();
                this.onGetBillsHistory(this.manageParams);
              }
            } else {
              const alertSettings: AlertSetting[] = response.filter(x => x.notificationCategory && x.notificationCategory.toLowerCase() === 'bills'.toLowerCase());
              const notificationAlert: NotificationAlert = { alertSettings: alertSettings, billMasters: this.selectedRows };
              if (alertSettings) {
                this.dialog.open(NotificationsSendDialogComponent, { data: notificationAlert }).afterClosed().subscribe(response => {
                  if (response) {
                    this.onSendInvoice(response);
                  }
                });
              } else {
                this.reset();
                this.onGetBillsHistory(this.manageParams);
              }
            }
          } else {
            this.notificationMessage('Invoice approved successfully.', 'green-snackbar');
            this.reset();
            this.onGetBillsHistory(this.manageParams);
            this.notificationMessage('No notification found to send.', 'red-snackbar');
          }
        },
        error: (err) => {
          this.notificationMessage('Invoice approved successfully.', 'green-snackbar');
          this.reset();
          this.onGetBillsHistory(this.manageParams);
          this.notificationMessage('Notifications send failed', 'red-snackbar');
        }
      });
  }

  generateInvoice() {
    this.billSettlementService.invoiceGeneration(this.selectedRows).subscribe(
      {
        next: (response: ResponseDetails) => {
          if (response && response.isSuccess) {
            this.notificationMessage('Invoice generation started successfully.', 'green-snackbar');
            this.getClientAlertSettings('Approval');
          }
        },
        error: (err) => {
          this.notificationMessage('Invoice generation failed.', 'red-snackbar');
        }
      });
  }

  reset() {
    this.rejectedCount = '';
    this.approvedCount = '';
    this.fineCount = '';
    this.penalityCount = '';
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  onRejectDataRow(row: BillMaster) {
    row.type = 'Reject';
    this.dialog.open(BillCancelComponent, { data: row }).afterClosed().subscribe(() => {
      if (row) {
        this.onGetBillsHistory(this.manageParams);
      }
    });
  }  

  onFailDataRow(row: BillMaster) {
    row.isBillFailed = true;
    this.billService.updateIsFailedStatusInBills(row.bills).subscribe({ next: (billFailed: Boolean) => {
      if(billFailed)
      {
        this.billService.UpdateIsBillFailedStatusInBillMaster(row).subscribe({ next: (status: Boolean) => {
          if(status) {
            this.onGetBillsHistory(this.manageParams);
            this.notificationMessage("Moved to Failed Bills successfully","green-snackbar");
          }
          else {
            this.notificationMessage('Unable to fail the bill', 'red-snackbar');
          }
        },
        error: (err) => {
          this.notificationMessage('Unable to fail the bill', 'red-snackbar');
        } 
        });
      }
      else {
        this.notificationMessage('Unable to fail the bill', 'red-snackbar');
        }
      },
      error: (err) => {
        this.notificationMessage('Unable to fail the bill', 'red-snackbar');
      }
    });    
  } 

  onRegenerate() {
    if (this.selectedRows && this.selectedRows.length) {
      this.billSettlementService.regenerateRejectedBillMasters(this.selectedRows).subscribe(
        {
          next: (response: boolean) => {
            if (response) {
              this.notificationMessage('Invoice regenerated successfully', 'green-snackbar');
              this.reset();
              this.onGetBillsHistory(this.manageParams);
            } else {
              this.notificationMessage('Invoice regeneration failed', 'red-snackbar');
            }
          },
          error: (err) => {
            this.notificationMessage('Invoice regeneration failed', 'red-snackbar');
          }
        });
    } else {
      this.notificationMessage('Please select Bills', 'red-snackbar');
    }
  }

  onUpdateRow(billMaster: BillMaster) {
    if (billMaster.billAmount == billMaster.creditNoteAmount) {
      this.notificationMessage('Credit note amount can not be more than Bill amount', 'red-snackbar');
      return;
    }
    let creditNote: CreditNote = { billMasterId: billMaster.id, vat: billMaster.vat, vatAccountHeadId: billMaster.vatAccountHeadId, ownerId: billMaster.ownerId };
    let creditNoteTransactions: CreditNoteTransaction[] = [];
    if (billMaster) {
      billMaster.bills.forEach(bill => {
        if (bill.billTransactions && bill.billTransactions.length) {
          bill.billTransactions.forEach(billTransaction => {
            if (bill.isDifferentiateBill) {
              let existingCreditNoteTransaction: CreditNoteTransaction = null;
              if (creditNoteTransactions && creditNoteTransactions.length) {
                existingCreditNoteTransaction = creditNoteTransactions.find(x => x.headDisplay.trim().toLowerCase() === billTransaction.headDisplay.toLowerCase());
                if (existingCreditNoteTransaction) {
                  if (existingCreditNoteTransaction.fixedAmount == 0) {
                    const index = creditNoteTransactions.indexOf(existingCreditNoteTransaction);
                    if (index > -1) {
                      creditNoteTransactions.splice(index, 1);
                    }
                    const creditNoteTransaction: CreditNoteTransaction = {
                      rowNumber: creditNoteTransactions.length + 1,
                      billHeadId: billTransaction.billHeadId,
                      taxId: 0,
                      headDisplay: billTransaction.headDisplay,
                      fixedAmount: billTransaction.headAmount,
                      fixedAmountLocal: this.currencyPipe.transform(billTransaction.headAmount, this.currency.toString(), true, this.roundFormat),
                      creditNoteAmount: 0,
                      isVAT: billTransaction.isVAT,
                      position: billTransaction.position
                    };
                    creditNoteTransactions.push(creditNoteTransaction);
                  }
                }
              }
              else {
                if (billTransaction.isDiscount) {
                  let discountHeadItem = null;
                  if (billMaster.billDiscounts && billMaster.billDiscounts.length) {
                    discountHeadItem = billMaster.billDiscounts.find(x => x.billHeadId === billTransaction.billHeadId);
                  }
                  const discountTransaction = creditNoteTransactions.find(x => x.billHeadId === billTransaction.billHeadId);
                  if (discountTransaction && discountHeadItem) {
                    discountTransaction.fixedAmount = billTransaction.headAmount - discountHeadItem.headAmount;
                    discountTransaction.fixedAmountLocal = this.currencyPipe.transform(discountTransaction.fixedAmount, this.currency.toString(), true, this.roundFormat);
                  }
                  else if (discountHeadItem) {
                    const fixedAmount = billTransaction.headAmount - discountHeadItem.headAmount;
                    const creditNoteTransaction: CreditNoteTransaction = {
                      rowNumber: creditNoteTransactions.length + 1,
                      billHeadId: billTransaction.billHeadId,
                      taxId: 0,
                      headDisplay: billTransaction.headDisplay,
                      fixedAmount: fixedAmount,
                      fixedAmountLocal: this.currencyPipe.transform(fixedAmount, this.currency.toString(), true, this.roundFormat),
                      creditNoteAmount: 0,
                      isVAT: billTransaction.isVAT,
                      position: billTransaction.position
                    };
                    creditNoteTransactions.push(creditNoteTransaction);
                  }
                } else {
                  const creditNoteTransaction: CreditNoteTransaction = {
                    rowNumber: creditNoteTransactions.length + 1,
                    billHeadId: billTransaction.billHeadId,
                    taxId: 0,
                    headDisplay: billTransaction.headDisplay,
                    fixedAmount: billTransaction.headAmount,
                    fixedAmountLocal: this.currencyPipe.transform(billTransaction.headAmount, this.currency.toString(), true, this.roundFormat),
                    creditNoteAmount: 0,
                    isVAT: billTransaction.isVAT,
                    position: billTransaction.position
                  };
                  creditNoteTransactions.push(creditNoteTransaction);
                }
              }
            } else {
              if (billTransaction.isDiscount) {
                let discountHeadItem = null;
                if (billMaster.billDiscounts && billMaster.billDiscounts.length) {
                  discountHeadItem = billMaster.billDiscounts.find(x => x.billHeadId === billTransaction.billHeadId);
                }
                const discountTransaction = creditNoteTransactions.find(x => x.billHeadId === billTransaction.billHeadId);
                if (discountTransaction && discountHeadItem) {
                  discountTransaction.fixedAmount = discountTransaction.fixedAmount - discountHeadItem.headAmount;
                  discountTransaction.fixedAmountLocal = this.currencyPipe.transform(discountTransaction.fixedAmount, this.currency.toString(), true, this.roundFormat);
                }
                else if (discountHeadItem) {
                  const fixedAmount = billTransaction.headAmount - discountHeadItem.headAmount;
                  const creditNoteTransaction: CreditNoteTransaction = {
                    rowNumber: creditNoteTransactions.length + 1,
                    billHeadId: billTransaction.billHeadId,
                    taxId: 0,
                    headDisplay: billTransaction.headDisplay,
                    fixedAmount: fixedAmount,
                    fixedAmountLocal: this.currencyPipe.transform(fixedAmount, this.currency.toString(), true, this.roundFormat),
                    creditNoteAmount: 0,
                    isVAT: billTransaction.isVAT,
                    position: billTransaction.position
                  };
                  creditNoteTransactions.push(creditNoteTransaction);
                }
              } else {
                const creditNoteTransaction: CreditNoteTransaction = {
                  rowNumber: creditNoteTransactions.length + 1,
                  billHeadId: billTransaction.billHeadId,
                  taxId: 0,
                  headDisplay: billTransaction.headDisplay,
                  fixedAmount: billTransaction.headAmount,
                  fixedAmountLocal: this.currencyPipe.transform(billTransaction.headAmount, this.currency.toString(), true, this.roundFormat),
                  creditNoteAmount: 0,
                  isVAT: billTransaction.isVAT,
                  position: billTransaction.position
                };
                creditNoteTransactions.push(creditNoteTransaction);
              }
            }
          })
        }
      });
      billMaster.billCharges.forEach(billCharge => {
        if (billCharge.isDiscount) {
          let discountHeadItem = null;
          if (billMaster.billDiscounts && billMaster.billDiscounts.length) {
            discountHeadItem = billMaster.billDiscounts.find(x => x.billHeadId === billCharge.billHeadId);
          }
          const discountBillCharge = creditNoteTransactions.find(x => x.billHeadId === billCharge.billHeadId);
          if (discountBillCharge && discountHeadItem) {
            discountBillCharge.fixedAmount = discountBillCharge.fixedAmount - discountHeadItem.headAmount;
            discountBillCharge.fixedAmountLocal = this.currencyPipe.transform(discountBillCharge.fixedAmount, this.currency.toString(), true, this.roundFormat);
          }
          else if (discountHeadItem) {
            const fixedAmount = billCharge.headAmount - discountHeadItem.headAmount;
            const creditNoteTransaction: CreditNoteTransaction = {
              rowNumber: creditNoteTransactions.length + 1,
              billHeadId: billCharge.billHeadId,
              taxId: 0,
              headDisplay: billCharge.headDisplay,
              fixedAmount: fixedAmount,
              fixedAmountLocal: this.currencyPipe.transform(fixedAmount, this.currency.toString(), true, this.roundFormat),
              creditNoteAmount: 0,
              isVAT: billCharge.isVAT,
              position: billCharge.position
            };
            creditNoteTransactions.push(creditNoteTransaction);
          }
        } else {
          const creditNoteTransaction: CreditNoteTransaction = {
            rowNumber: creditNoteTransactions.length + 1,
            billHeadId: billCharge.billHeadId,
            taxId: 0,
            headDisplay: billCharge.headDisplay,
            fixedAmount: billCharge.headAmount,
            fixedAmountLocal: this.currencyPipe.transform(billCharge.headAmount, this.currency.toString(), true, this.roundFormat),
            creditNoteAmount: 0,
            isVAT: billCharge.isVAT,
            position: billCharge.position
          };
          creditNoteTransactions.push(creditNoteTransaction);
        }
      });

      if (billMaster.billTaxDetails && billMaster.billTaxDetails.length) {
        billMaster.billTaxDetails.forEach(billTaxDetail => {
          let largest = 0;
          if (creditNoteTransactions && creditNoteTransactions.length) {
            largest = creditNoteTransactions.sort((a, b) => a.position - b.position)[creditNoteTransactions.length - 1]?.position ?? 0;
          }
          const creditNoteTransaction: CreditNoteTransaction = {
            rowNumber: creditNoteTransactions.length + 1,
            billHeadId: 0,
            taxId: billTaxDetail.taxId,
            headDisplay: billTaxDetail.taxDisplayName,
            fixedAmount: billTaxDetail.taxAmount,
            fixedAmountLocal: this.currencyPipe.transform(billTaxDetail.taxAmount, this.currency.toString(), true, this.roundFormat),
            creditNoteAmount: 0,
            isVAT: false,
            formulaFieldName: billTaxDetail.computationTypeName,
            position: largest,
            disabled: true,
            value: billTaxDetail.taxValue
          };
          creditNoteTransactions.push(creditNoteTransaction);
        });
      }
    }
    if (creditNoteTransactions && creditNoteTransactions.length) {
      //const itemIndex = creditNoteTransactions.findIndex(x => x.headDisplay === 'VAT');
      //if (itemIndex) {
      // creditNoteTransactions[itemIndex].disabled = true;
      // creditNoteTransactions.splice(itemIndex, 1);
      //}
      creditNoteTransactions = creditNoteTransactions.sort((a, b) => a.position - b.position);
      for (let n = 0; n < creditNoteTransactions.length; ++n) {
        creditNoteTransactions[n].rowNumber = n + 1;
      }
    }
    creditNote.creditNoteTransactions = creditNoteTransactions;
    if (billMaster.creditNotes && billMaster.creditNotes.length) {
      billMaster.creditNotes.forEach(z => {
        z.creditNoteTransactions.forEach(x => {
          const existingCreditNoteTransaction = creditNote.creditNoteTransactions.find(y => y.billHeadId === x.billHeadId);
          if (existingCreditNoteTransaction) {
            existingCreditNoteTransaction.fixedAmount = existingCreditNoteTransaction.fixedAmount - x.creditNoteAmount;
            existingCreditNoteTransaction.fixedAmountLocal = this.currencyPipe.transform(existingCreditNoteTransaction.fixedAmount, this.currency.toString(), true, this.roundFormat);
          }
        })
      });
    }
    this.dialog.open(CreditNoteDetailsComponent, { height: '550px', data: creditNote }).afterClosed().subscribe(repsonse => {
      if (repsonse) {
        this.onGetBillsHistory(this.manageParams);
      }
    }
    );
  }

  // Full header repeat
  // getNewLargeBillReport(firstTableCol: any[], firstTableRows: any[], secondTableRows: any[], thirdTableCol: any[], thirdTableRows: any[], fourthTableRows: any[], fifthTableRows: any[], sixthTableRows: any[], title: string, seventhTableCol: any[], seventhTableRows: any[], billMaster: BillMaster, eighthTableRows: any[]) {


  //   var img = new Image()
  //   img.src = this.filePath + '/uploads/' + billMaster?.client?.photo //'assets/img/' + data.client.photo

  //   let pdf = new jsPDF({
  //     orientation: "portrait",
  //     unit: "pt",
  //     format: "letter"
  //   });

  //   let startX = 35;
  //   let startY = 20;

  //   var pageContent = function (data) {
  //     // HEADER
  //     if (data.table && (pdf.getNumberOfPages() == 1 || pdf.getNumberOfPages() > data.table.startPageNumber)) {
  //       const pdfHeadingText = billMaster?.client?.clientName ?? '';
  //       const textWidth = pdf.getTextWidth(pdfHeadingText.trim());
  //       pdf.setTextColor(0, 0, 0);
  //       pdf.setFontSize(17);
  //       pdf.setFont("Cambria");
  //       pdf.text(pdfHeadingText, Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0), startY + 3);
  //       pdf.setDrawColor(0, 0, 0);
  //       pdf.line(Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0), startY + 6, Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0) + textWidth, startY + 6);
  //       pdf.setFont("Cambria", 'normal');
  //       pdf.setFontSize(14);
  //       pdf.text("Billing Statement", startX, startY + 26);
  //       if (img && billMaster && billMaster.client && billMaster.client.imageProperties && billMaster.client.imageProperties.length) {
  //         const imageProperty: ImageProperty = billMaster?.client?.imageProperties.find(x => x.imageType.trim().toLowerCase() === 'invoice');
  //         if (imageProperty) {
  //           pdf.addImage(img, 'png', imageProperty.imgX, imageProperty.imgY, imageProperty.imgW, imageProperty.imgH);
  //         }
  //       }
  //       const autoTable = 'autoTable';
  //       pdf[autoTable]('', fourthTableRows, {
  //         startX: 10,
  //         startY: startY + 35,
  //         styles: {
  //           overflow: 'linebreak',
  //           cellWidth: 'wrap',
  //           fontSize: 9,
  //           cellPadding: 4,
  //           overflowColumns: 'linebreak',
  //           lineColor: [0, 0, 0]
  //         },
  //         margin: { left: startX },
  //         theme: 'grid',
  //         tableWidth: 'auto',
  //         cellWidth: 'wrap',
  //         columnStyles: {
  //           0: {
  //             cellWidth: 150,
  //             halign: 'left'
  //           },
  //           1: {
  //             cellWidth: 190,
  //             halign: 'left'
  //           }
  //         },
  //         headStyles: {
  //           lineWidth: 0.1,
  //           lineColor: [0, 0, 0],
  //           halign: 'center'
  //         },
  //         didParseCell: function (fourthTableRows) {
  //           fourthTableRows.cell.styles.cellPadding = 1;
  //         }
  //       });

  //       const firstTableEndY = Math.round(pdf[autoTable].previous.finalY);

  //       pdf[autoTable]('', sixthTableRows, {
  //         startX: 10,
  //         startY: firstTableEndY,
  //         styles: {
  //           overflow: 'linebreak',
  //           cellWidth: 'wrap',
  //           fontSize: 9,
  //           cellPadding: 4,
  //           overflowColumns: 'linebreak',
  //           lineColor: [0, 0, 0]
  //         },
  //         margin: { left: startX },
  //         theme: 'grid',
  //         tableWidth: 'auto',
  //         cellWidth: 'wrap',
  //         columnStyles: {
  //           0: {
  //             cellWidth: 150,
  //             halign: 'left',
  //           },
  //           1: {
  //             cellWidth: 95,
  //             halign: 'center'
  //           },
  //           2: {
  //             cellWidth: 95,
  //             halign: 'center'
  //           },
  //           3: {
  //             cellWidth: 95,
  //             halign: 'center'
  //           },
  //           4: {
  //             cellWidth: 95,
  //             halign: 'center'
  //           }
  //         },
  //         headStyles: {
  //           lineWidth: 0.1,
  //           lineColor: [0, 0, 0]
  //         },
  //         didParseCell: function (sixthTableRows) {
  //           sixthTableRows.cell.styles.cellPadding = 1;
  //         }
  //       });

  //       const secondTableEndY = Math.round(pdf[autoTable].previous.finalY);

  //       pdf[autoTable]('', fifthTableRows, {
  //         startX: 10,
  //         startY: secondTableEndY,
  //         styles: {
  //           overflow: 'linebreak',
  //           cellWidth: 'wrap',
  //           fontSize: 9,
  //           cellPadding: 4,
  //           overflowColumns: 'linebreak',
  //           lineColor: [0, 0, 0]
  //         },
  //         margin: { left: startX },
  //         theme: 'grid',
  //         tableWidth: 'auto',
  //         cellWidth: 'wrap',
  //         columnStyles: {
  //           0: {
  //             cellWidth: 150,
  //             halign: 'left'
  //           },
  //           1: {
  //             cellWidth: 380,
  //             halign: 'left'
  //           }
  //         },
  //         headStyles: {
  //           lineWidth: 0.1,
  //           lineColor: [0, 0, 0]
  //         },
  //         didParseCell: function (fifthTableRows) {
  //           fifthTableRows.cell.styles.cellPadding = 1;
  //         }
  //       });

  //       const thirdTableEndY = Math.round(pdf[autoTable].previous.finalY);
  //       data.settings.margin.top = thirdTableEndY + 10;
  //     }
  //     // FOOTER
  //     var str = "Page " + data.pageCount;
  //     // Total page number plugin only available in jspdf v1.0+
  //     if (typeof pdf.putTotalPages === 'function') {
  //       str = str;
  //     }
  //     pdf.setFontSize(9);
  //   };

  //   pdf.setFont("Cambria");
  //   pdf.setFontSize(10);
  //   const meterReadingTableHeading = 'Meter Read-Outs';
  //   pdf.text(meterReadingTableHeading.toUpperCase(), startX, 300 + 40);

  //   const autoTable = 'autoTable';
  //   pdf[autoTable](firstTableCol, firstTableRows, {
  //     startX: 10,
  //     startY: 320 + 40,
  //     showHead: "everyPage",
  //     didDrawPage: pageContent,
  //     styles: {
  //       overflow: 'linebreak',
  //       cellWidth: 'wrap',
  //       fontSize: 9,
  //       cellPadding: 6,
  //       overflowColumns: 'linebreak',
  //       lineColor: [0, 0, 0]
  //     },
  //     margin: { top: 320 + 40, left: startX },
  //     theme: 'grid',
  //     tableWidth: 'auto',
  //     cellWidth: 'wrap',
  //     columnStyles: {
  //       0: {
  //         cellWidth: 100,
  //         halign: 'center'
  //       },
  //       1: {
  //         cellWidth: 95,
  //         halign: 'center'
  //       },
  //       2: {
  //         cellWidth: 95,
  //         halign: 'center'
  //       },
  //       3: {
  //         cellWidth: 95,
  //         halign: 'center'
  //       },
  //       4: {
  //         cellWidth: 74,
  //         halign: 'center'
  //       },
  //       5: {
  //         cellWidth: 75,
  //         halign: 'center'
  //       }
  //     },
  //     headStyles: {
  //       lineWidth: 0.1,
  //       lineColor: [0, 0, 0],
  //       halign: 'center',
  //       fillColor: [25, 118, 210]
  //     },
  //     didParseCell: function (firstTableRows) {
  //       firstTableRows.cell.styles.cellPadding = 1;
  //     }
  //   });

  //   const fourthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
  //   pdf.setFontSize(10);
  //   const chargesBreakDownTableHeading = 'Charges Breakdown';
  //   pdf.text(chargesBreakDownTableHeading.toUpperCase(), startX, fourthTableEndY + 20);


  //   pdf[autoTable](seventhTableCol, seventhTableRows, {
  //     startX: 10,
  //     startY: fourthTableEndY + 30,
  //     showHead: "everyPage",
  //     didDrawPage: pageContent,
  //     styles: {
  //       overflow: 'linebreak',
  //       cellWidth: 'wrap',
  //       fontSize: 9,
  //       cellPadding: 6,
  //       overflowColumns: 'linebreak',
  //       lineColor: [0, 0, 0]
  //     },
  //     margin: { top: 320 + 40, left: startX },
  //     theme: 'grid',
  //     tableWidth: 'auto',
  //     cellWidth: 'wrap',
  //     columnStyles: {
  //       0: {
  //         cellWidth: 60,
  //         halign: 'center'
  //       },
  //       1: {
  //         cellWidth: 155,
  //         halign: 'center'
  //       },
  //       2: {
  //         cellWidth: 85,
  //         halign: 'center'
  //       },
  //       3: {
  //         cellWidth: 85,
  //         halign: 'center'
  //       },
  //       4: {
  //         cellWidth: 74,
  //         halign: 'center'
  //       },
  //       5: {
  //         cellWidth: 75,
  //         halign: 'center'
  //       }
  //     },
  //     headStyles: {
  //       lineWidth: 0.1,
  //       lineColor: [0, 0, 0],
  //       halign: 'center',
  //       fillColor: [25, 118, 210]
  //     },
  //     didParseCell: function (seventhTableRows) {
  //       seventhTableRows.cell.styles.cellPadding = 1;
  //     }
  //   });

  //   const fifthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

  //   pdf[autoTable]('', eighthTableRows, {
  //     startX: 10,
  //     startY: fifthTableEndY + 10,
  //     styles: {
  //       overflow: 'linebreak',
  //       cellWidth: 'wrap',
  //       fontSize: 9,
  //       cellPadding: 4,
  //       overflowColumns: 'linebreak',
  //       lineColor: [0, 0, 0]
  //     },
  //     margin: { bottom: startY + 20, left: 250 },
  //     theme: 'grid',
  //     tableWidth: 'auto',
  //     cellWidth: 'wrap',
  //     columnStyles: {
  //       0: {
  //         cellWidth: 244,
  //         fontStyle: "italic"
  //       },
  //       1: {
  //         cellWidth: 75
  //       }
  //     },
  //     didParseCell: function (eighthTableRows) {
  //       const col = eighthTableRows.column.index;
  //       if (col == 1) {
  //         eighthTableRows.cell.styles.halign = 'right';
  //       }
  //       eighthTableRows.cell.styles.cellPadding = 1;
  //     },
  //     headStyles: {
  //       lineWidth: 0.1,
  //       lineColor: [0, 0, 0]
  //     }
  //   });

  //   const sixthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

  //   pdf.setFillColor(241, 241, 244);
  //   pdf.rect(startX, sixthTableEndY + 20, 535, 80, 'FD');
  //   pdf.setFillColor(0, 0, 0);
  //   pdf.setFontSize(9);
  //   pdf.text("Notes :-", startX + 30, sixthTableEndY + 30);
  //   pdf.text("Payment should be made within 30 days of devitnote to avoid disconnection.", startX + 30, sixthTableEndY + 40);
  //   pdf.text("1. Cash / Cheque in favour of " + billMaster.client.clientName, startX + 30, sixthTableEndY + 50);
  //   pdf.text("2. Tax Registeration Number : " + billMaster.client.trnNo, startX + 30, sixthTableEndY + 60);
  //   pdf.text("3. Minimum charges payable :", startX + 30, sixthTableEndY + 70);
  //   pdf.text(`4. Late fee of ${this.currency} 50 / - will be levied, if payments are made by the due date`, startX + 30, sixthTableEndY + 80);
  //   pdf.text("5. Late payment fee of 1 % per month will be calculated on the over due amount from the origional date of payment", startX + 30, sixthTableEndY + 90);
  //   pdf.setTextColor(0, 0, 0);
  //   pdf.line(5, sixthTableEndY + 110, 607, sixthTableEndY + 110);



  //   const pageHeight = pdf.internal.pageSize.height;
  //   pdf.text("Notice :- Please tear and attach the slip  along with your payment", startX, pageHeight - 80);


  //   pdf[autoTable](thirdTableCol, thirdTableRows, {
  //     startX: 10,
  //     startY: pageHeight - 70,
  //     styles: {
  //       overflow: 'linebreak',
  //       cellWidth: 'wrap',
  //       fontSize: 9,
  //       cellPadding: 4,
  //       overflowColumns: 'linebreak',
  //       lineColor: [0, 0, 0]
  //     },
  //     margin: { left: startX },
  //     theme: 'grid',
  //     tableWidth: 'auto',
  //     cellWidth: 'wrap',
  //     columnStyles: {
  //       0: {
  //         cellWidth: 120,
  //         halign: 'center'
  //       },
  //       1: {
  //         cellWidth: 200,
  //         halign: 'center'
  //       },
  //       2: {
  //         cellWidth: 100,
  //         halign: 'right'
  //       },
  //       3: {
  //         cellWidth: 120,
  //         halign: 'right'
  //       },
  //     },
  //     headStyles: {
  //       lineWidth: 0.1,
  //       lineColor: [0, 0, 0],
  //       halign: 'center',
  //       fillColor: [25, 118, 210]
  //     },
  //     didParseCell: function (thirdTableRows) {
  //       thirdTableRows.cell.styles.cellPadding = 1;
  //     }
  //   });

  //   var output = pdf.output('datauristring')
  //   this.pdfsToMerge.push(output);
  // }

  // New Bill Print Format added 27/05/2021
  downloadBillFormat2LargeReport(billMaster: BillMaster) {
    const conversionValueTRHR: number = 0.284345;
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: ListItem[] = [];
    let thirdTableRows: any[] = [];
    let fourthTableRows: any[] = [];
    let fifthTableRows: any[] = [];
    let sixthTableRows: any[] = [];
    let seventhTableRows: any[] = [];
    let eighthTableRows: any[] = [];
    let ninthTableRows: any[] = [];
    let firstTableCol = [
      'Unit No',
      'Meter No',
      'Previous Reading',
      'Present Reading',
      'Consumption'];

    let thirdTableCol = [
      'Customer AccountNumber',
      'Billing Period',
      'Previous Due',
      'Total for current period'
    ]; // initialization for headers

    let seventhTableCol = [
      'Bill No',
      'Meter No',
      'Charges',
      'Consumption',
      'Measuring Unit',
      'Tariff',
      'Total'];

    fourthTableRows.push(
      {
        label: 'Bill No',
        value: billMaster?.billNumber ?? ''
      },
      {
        label: 'Date of issue',
        value: billMaster?.billDateLocal ?? ''
      },
      {
        label: 'Due Date',
        value: billMaster?.dueDateLocal ?? ''
      }
    );

    fifthTableRows.push(
      {
        label: 'Customer Name',
        value: billMaster?.ownerName ?? ''
      },
      {
        label: 'Customer AccountNumber',
        value: billMaster?.accountNumber ?? ''
      },
      {
        label: 'Unit No',
        value: billMaster?.unitNumber ?? ''
      },
      {
        label: 'Address',
        value: billMaster?.receiverDetails[0]?.address1 ?? ''
      },
      {
        label: 'City',
        value: billMaster?.receiverDetails[0]?.city ?? ''
      },
      {
        label: 'P.O Box',
        value: billMaster?.receiverDetails[0]?.zipPostalCode ?? ''
      },
      {
        label: 'Phone number',
        value: billMaster?.receiverDetails[0]?.phoneNumber ?? ''
      },
      {
        label: 'Fax Number',
        value: ''
      },
      {
        label: 'Client',
        value: billMaster?.client?.clientName ?? ''
      },
      {
        label: 'Client TRN',
        value: billMaster?.client?.trnNo ?? ''
      }
    );

    let isMultipleBillNumber = false;
    let isMultipleUnitNumber = false;
    let isMultipleTariffFormatExists = false;
    let isMultipleMeterNumber = false;

    if (billMaster && billMaster.bills && billMaster.bills.length) {
      const uniqueBillNumber = Array.from(new Set(billMaster.bills.map(x => x.billNumber)));
      const uniqueUnitNumber = Array.from(new Set(billMaster.bills.map(x => x.unitNumber)));
      const uniqueMeterNumber = Array.from(new Set(billMaster.bills.map(x => x.deviceName)));

      isMultipleBillNumber = uniqueBillNumber && uniqueBillNumber.length > 1 ? true : false;
      isMultipleUnitNumber = uniqueUnitNumber && uniqueUnitNumber.length > 1 ? true : false;
      isMultipleMeterNumber = uniqueMeterNumber && uniqueMeterNumber.length > 1 ? true : false;

      if (!isMultipleMeterNumber) {
        const itemIndex = seventhTableCol.findIndex(x => x === 'Meter No');
        if (itemIndex > -1) {
          seventhTableCol.splice(itemIndex, 1);
        }
      }

      if (!isMultipleBillNumber) {
        seventhTableCol.splice(0, 1);
      } else {
        fourthTableRows.splice(0, 1);
      }
      if (!isMultipleUnitNumber) {
        firstTableCol.splice(0, 1);
      } else {
        const itemIndex = fifthTableRows.findIndex(x => x.label === 'Unit No');
        fifthTableRows.splice(itemIndex, 1);
      }

      const tariffExistingBills = Array.from(new Set(billMaster.bills.filter(x => x.billTariffDetails && x.billTariffDetails.length)));
      const tariffNotExistingBills = Array.from(new Set(billMaster.bills.filter(x => !x.billTariffDetails || x.billTariffDetails.length === 0)));

      if (tariffNotExistingBills && tariffNotExistingBills.length && tariffNotExistingBills && tariffNotExistingBills.length) {
        isMultipleTariffFormatExists = true;
      }
      if (tariffNotExistingBills && tariffNotExistingBills.length && !tariffExistingBills) {
        isMultipleTariffFormatExists = true;
      }
      if (tariffExistingBills && tariffExistingBills.length && (!tariffNotExistingBills || tariffNotExistingBills.length == 0)) {
        for (let a = 0; a < tariffExistingBills.length; a++) {
          const tariffNotExistingItem = tariffExistingBills[a].billTransactions.find(x => !x.tariffId);
          if (tariffNotExistingItem) {
            isMultipleTariffFormatExists = true;
            break;
          }
        };
      }
    }

    if (!isMultipleTariffFormatExists) {
      const tariffIndex = seventhTableCol.findIndex(x => x === 'Tariff');
      if (tariffIndex) {
        seventhTableCol.splice(tariffIndex, 1);
      }
    }

    for (let a = 0; a < billMaster.bills.length; a++) {
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      if (isMultipleUnitNumber) {
        row.push(billMaster.bills[a].unitNumber)
      }
      row.push(billMaster.bills[a].deviceName)
      row.push(this.decimalPipe.transform(billMaster.bills[a].previousReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      row.push(this.decimalPipe.transform(billMaster.bills[a].presentReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      if (billMaster.bills[a].isDifferentiateBill) {

        if (isMultipleMeterNumber) {
          isMultipleMeterNumber = false;
          const itemIndex = seventhTableCol.findIndex(x => x === 'Meter No');
          if (itemIndex > -1) {
            seventhTableCol.splice(itemIndex, 1);
          }
        }

        const previousReading: number = billMaster.bills[a].previousReading;
        const presentReading: number = billMaster.bills[a].presentReading;
        const consumption: number = presentReading - previousReading;
        row.push(this.decimalPipe.transform(consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      } else {
        row.push(this.decimalPipe.transform(billMaster.bills[a].consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      }
      if (billMaster.bills[a].utilityType === 'BTU' && billMaster.bills[a].billTransactions && billMaster.bills[a].billTransactions.length && billMaster.bills[a].billTransactions.findIndex(x => x.measuringUnitId && x.measuringUnitId === 2) > -1) {
        if (a == 0) {
          firstTableCol.push('Consumption TR-HR');
        }
        const consumptionTRHR: number = billMaster.bills[a].consumption * conversionValueTRHR;
        row.push(this.decimalPipe.transform(consumptionTRHR, this.consumptionRoundOffFormat))
      }
      firstTableRows.push(row);
      row = [];
    }

    let totalAmount = 0;
    for (let a = 0; a < billMaster.bills.length; a++) {
      const bill = billMaster.bills[a];
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      for (let b = 0; b < bill.billTransactions.length; b++) {
        if (isMultipleBillNumber) {
          row.push(bill.billNumber);
        }
        if (isMultipleMeterNumber) {
          row.push(bill.deviceName);
        }
        row.push(bill.billTransactions[b].headDisplay)
        if (bill.utilityType === "BTU" && bill.billTransactions && bill.billTransactions.length && bill.billTransactions[b] && bill.billTransactions[b].measuringUnitId && bill.billTransactions[b].measuringUnitId === 2) {
          const consumptionTRHR: number = bill.consumption * conversionValueTRHR;
          row.push(this.decimalPipe.transform(consumptionTRHR, this.consumptionRoundOffFormat))
          row.push('TR-HR')
          if (isMultipleTariffFormatExists && bill.billTariffDetails && bill.billTariffDetails.length && bill.billTransactions[b].tariffId) {
            row.push('-')
          } else if (isMultipleTariffFormatExists) {
            row.push(bill.billTransactions[b].rate)
          }
        } else {
          row.push(this.decimalPipe.transform(bill.consumption, this.consumptionRoundOffFormat))
          row.push(bill.measuringUnit)
          if (isMultipleTariffFormatExists && bill.billTariffDetails && bill.billTariffDetails.length && bill.billTransactions[b].tariffId) {
            row.push('-')
          } else if (isMultipleTariffFormatExists) {
            row.push(bill.billTransactions[b].rate)
          }
        }
        row.push(this.currencyPipe.transform(bill.billTransactions[b].headAmount, this.currency.toString(), true, this.roundFormat))
        seventhTableRows.push(row);
        row = [];
        totalAmount += bill.billTransactions[b].headAmount;
      }
    }

    row.push(billMaster.accountNumber);
    row.push(billMaster.fromDateLocal + '-' + billMaster.toDateLocal);
    row.push(this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat));
    row.push(billMaster.billAmountLocal);
    thirdTableRows.push(row);

    const title = 'Bill History';
    if (billMaster.billCharges && billMaster.billCharges.length) {
      billMaster.billCharges.sort((a, b) => a.position - b.position).forEach(billCharge => {
        if (billCharge.headDisplay !== 'VAT') {
          const existingitem = secondTableRows.find(x => x.label === billCharge.headDisplay);
          if (existingitem) {
            existingitem.value += billCharge.headAmount;
          } else {
            secondTableRows.push({ label: billCharge.headDisplay, value: billCharge.headAmount });
          }
        }
      });

      secondTableRows.forEach(x => {
        eighthTableRows.push({ label: x.label, value: this.currencyPipe.transform(x.value, this.currency.toString(), true, this.roundFormat) });
        totalAmount += x.value
      })
    }
    //const vatItem = billMaster.billCharges.find(billCharge => billCharge.headDisplay === 'VAT');


    eighthTableRows.push(
      {
        label: 'Total Charges for Current Period',
        value: this.currencyPipe.transform(totalAmount, this.currency.toString(), true, this.roundFormat)
      });


    if (billMaster.billDiscounts && billMaster.billDiscounts.length) {
      let discountAmount = 0;
      billMaster.billDiscounts.forEach(billDiscount => {
        discountAmount += billDiscount.headAmount;
      });
      eighthTableRows.push({ label: 'Total Discount', value: this.currencyPipe.transform(discountAmount, this.currency.toString(), true, this.roundFormat) });
    }


    billMaster.billTaxDetails.forEach(billTaxDetail => {
      const existingitem = eighthTableRows.find(x => x.label === billTaxDetail.taxDisplayName);
      if (existingitem) {
        const amount = Number(existingitem.value.replace(this.currency, '').trim()) + Number(billTaxDetail.taxAmount);
        existingitem.value = this.currencyPipe.transform(amount, this.currency.toString(), true, this.roundFormat);
      } else {
        eighthTableRows.push({ label: billTaxDetail.taxDisplayName, value: this.currencyPipe.transform(billTaxDetail.taxAmount, this.currency.toString(), true, this.roundFormat) });
      }
    });

    eighthTableRows.push(
      {
        label: 'Previous Outstanding Amount',
        value: this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
      },
      {
        label: 'Total Amount Due',
        value: this.currencyPipe.transform(billMaster.billAmount + billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
      }
    );

    sixthTableRows.push({
      firstItem: 'Billing period',
      secondItem: 'From:',
      thirdItem: billMaster.fromDateLocal,
      fourthItem: 'To:',
      fifthItem: billMaster.toDateLocal
    });

    let isMultipleBillTariffDeatils = false;
    const billTariffDetails = Array.from(new Set(billMaster.bills.map(x => x.billTariffDetails)));
    if (billTariffDetails && billTariffDetails.length > 1) {
      isMultipleBillTariffDeatils = true;
    }

    let ninthTableCol = [];
    let unitMeterNumbers: string[] = [];
    let isSlabTariff: boolean = false;
    row = [];
    if (billMaster && billMaster.bills && billMaster.bills.length) {
      billMaster.bills.forEach(bill => {
        this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', bill.utilityTypeId);
        unitMeterNumbers = [];
        let unitMeterNumber: string = 'Unit Number : ' + bill.unitNumber + ' - Meter Number : ' + bill.deviceName;
        if (bill.billTariffDetails && bill.billTariffDetails.length) {
          for (let b = 0; b < bill.billTariffDetails.length; b++) {
            if (bill.billTariffDetails[b].slabSettingsId && bill.billTariffDetails[b].slabSettingsId > 0) {
              let season: string = bill.billTariffDetails[b].season;
              if (Number(bill.billTariffDetails[b].peakType) < Number(bill.billTariffDetails[b].consumption)) {
                const consumptionMax = bill.billTariffDetails[b].consumption;
                const consumptionMin = bill.billTariffDetails[b].peakType;
                season = consumptionMin + ' - ' + consumptionMax;
              }
              if (b == 0) {
                isSlabTariff = true;
                ninthTableCol = [
                  'Slab',
                  'Consumption',
                  'Rate',
                  'Amount '];
              }
              if (unitMeterNumbers && unitMeterNumbers.length) {
                const itemExists = unitMeterNumbers.find(x => x === unitMeterNumber);
                if (!itemExists) {
                  this.createUnitMeterNumberRow(unitMeterNumber, ninthTableCol.length, ninthTableRows);
                }
              } else {
                unitMeterNumbers.push(unitMeterNumber);
                this.createUnitMeterNumberRow(unitMeterNumber, ninthTableCol.length, ninthTableRows);
              }
              row.push(season);
              row.push(this.decimalPipe.transform(bill.billTariffDetails[b].consumption, this.consumptionRoundOffFormat));
              row.push(bill.billTariffDetails[b].rate);
              row.push(this.currencyPipe.transform(bill.billTariffDetails[b].amount, this.currency.toString(), true, this.roundFormat));
            } else if (bill.billTariffDetails[b].slabSettingsId == 0) {
              if (b == 0) {
                ninthTableCol = [
                  'Season',
                  'Week Type',
                  'Peak Type',
                  'Consumption',
                  'Rate',
                  'Amount '];
              }
              if (unitMeterNumbers && unitMeterNumbers.length) {
                const itemExists = unitMeterNumbers.find(x => x === unitMeterNumber);
                if (!itemExists) {
                  this.createUnitMeterNumberRow(unitMeterNumber, ninthTableCol.length, ninthTableRows);
                }
              } else {
                unitMeterNumbers.push(unitMeterNumber);
                this.createUnitMeterNumberRow(unitMeterNumber, ninthTableCol.length, ninthTableRows);
              }
              row.push(bill.billTariffDetails[b].season);
              row.push(bill.billTariffDetails[b].weekType);
              row.push(bill.billTariffDetails[b].peakType);
              row.push(this.decimalPipe.transform(bill.billTariffDetails[b].consumption, this.consumptionRoundOffFormat));
              row.push(bill.billTariffDetails[b].rate);
              row.push(this.currencyPipe.transform(bill.billTariffDetails[b].amount, this.currency.toString(), true, this.roundFormat));
            }
            ninthTableRows.push(row);
            row = [];
          };
        }
      });
    }

    this.getBillFormat2LargeReport(firstTableCol, firstTableRows, secondTableRows, thirdTableCol, thirdTableRows, fourthTableRows, fifthTableRows, sixthTableRows, title, seventhTableCol, seventhTableRows, billMaster, eighthTableRows, ninthTableCol, ninthTableRows, isSlabTariff);
  }

  getBillFormat2LargeReport(firstTableCol: any[], firstTableRows: any[], secondTableRows: any[], thirdTableCol: any[], thirdTableRows: any[], fourthTableRows: any[], fifthTableRows: any[], sixthTableRows: any[], title: string, seventhTableCol: any[], seventhTableRows: any[], billMaster: BillMaster, eighthTableRows: any[], ninthTableCol: any[], ninthTableRows: any[], isSlabTariff: boolean = false) {


    var img = new Image()
    img.src = this.filePath + '/uploads/' + billMaster?.client?.photo //'assets/img/' + data.client.photo

    let pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter"
    });

    let startX = 35;
    let startY = 20;
    const autoTable = 'autoTable';

    const pdfHeadingText = billMaster?.client?.clientName ?? '';
    const textWidth = pdf.getTextWidth(pdfHeadingText.trim()) + 4;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(17);
    pdf.setFont("Cambria");
    pdf.text(pdfHeadingText, Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0), startY + 3);
    pdf.setDrawColor(0, 0, 0);
    pdf.line(Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0), startY + 6, Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0) + textWidth, startY + 6);
    pdf.setFont("Cambria", 'normal');
    pdf.setFontSize(14);
    pdf.text("Billing Statement", startX, startY + 26);
    this.addImage(pdf, billMaster);
    pdf[autoTable]('', fourthTableRows, {
      startX: 10,
      startY: startY + 35,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 150,
          halign: 'left'
        },
        1: {
          cellWidth: 190,
          halign: 'left'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center'
      },
      didParseCell: function (fourthTableRows) {
        fourthTableRows.cell.styles.cellPadding = 1;
      }
    });

    const firstTableEndY = Math.round(pdf[autoTable].previous.finalY);

    pdf[autoTable]('', sixthTableRows, {
      startX: 10,
      startY: firstTableEndY,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 150,
          halign: 'left',
        },
        1: {
          cellWidth: 95,
          halign: 'center'
        },
        2: {
          cellWidth: 95,
          halign: 'center'
        },
        3: {
          cellWidth: 97,
          halign: 'center'
        },
        4: {
          cellWidth: 97,
          halign: 'center'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      didParseCell: function (sixthTableRows) {
        sixthTableRows.cell.styles.cellPadding = 1;
      }
    });

    const secondTableEndY = Math.round(pdf[autoTable].previous.finalY);

    pdf[autoTable]('', fifthTableRows, {
      startX: 10,
      startY: secondTableEndY,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 150,
          halign: 'left'
        },
        1: {
          cellWidth: 384,
          halign: 'left'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      didParseCell: function (fifthTableRows) {
        fifthTableRows.cell.styles.cellPadding = 1;
      }
    });

    let headerAdded: ListItem[] = [{ value: 1, selected: true }];

    var pageContent = function (data) {
      // HEADER
      // const pageNumber = pdf.getNumberOfPages();
      // let added = false;
      // if (headerAdded) {
      //   const item: ListItem = headerAdded.find(x => x.value === pageNumber);
      //   if (item) {
      //     added = item.selected;
      //   }
      // }
      // if (!added) {
      //   const pdfHeadingText = billMaster?.client?.clientName ?? '';
      //   const textWidth = pdf.getTextWidth(pdfHeadingText.trim()) + 20;
      //   pdf.setTextColor(0, 0, 0);
      //   pdf.setFontSize(17);
      //   pdf.setFont("Cambria");
      //   pdf.text(pdfHeadingText, Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0), startY + 3);
      //   pdf.setDrawColor(0, 0, 0);
      //   pdf.line(Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0), startY + 6, Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0) + textWidth, startY + 6);
      //   pdf.setFont("Cambria", 'normal');
      //   pdf.setFontSize(14);
      //   pdf.text("Billing Statement", startX, startY + 26);
      //   if (img && billMaster && billMaster.client && billMaster.client.imageProperties && billMaster.client.imageProperties.length) {
      //     const imageProperty: ImageProperty = billMaster?.client?.imageProperties.find(x => x.imageType.trim().toLowerCase() === 'invoice');
      //     if (imageProperty) {
      //       pdf.addImage(img, 'png', imageProperty.imgX, imageProperty.imgY, imageProperty.imgW, imageProperty.imgH);
      //     }
      //   }
      //   pdf[autoTable]('', fourthTableRows, {
      //     startX: 10,
      //     startY: startY + 35,
      //     styles: {
      //       overflow: 'linebreak',
      //       cellWidth: 'wrap',
      //       fontSize: 9,
      //       cellPadding: 4,
      //       overflowColumns: 'linebreak',
      //       lineColor: [0, 0, 0]
      //     },
      //     margin: { left: startX },
      //     theme: 'grid',
      //     tableWidth: 'auto',
      //     cellWidth: 'wrap',
      //     columnStyles: {
      //       0: {
      //         cellWidth: 150,
      //         halign: 'left'
      //       },
      //       1: {
      //         cellWidth: 190,
      //         halign: 'left'
      //       }
      //     },
      //     headStyles: {
      //       lineWidth: 0.1,
      //       lineColor: [0, 0, 0],
      //       halign: 'center'
      //     },
      //     didParseCell: function (fourthTableRows) {
      //       fourthTableRows.cell.styles.cellPadding = 1;
      //     }
      //   });
      //   const thirdTableEndY = Math.round(pdf[autoTable].previous.finalY);
      //   data.settings.margin.top = thirdTableEndY + 20;
      //   headerAdded.push({ value: pageNumber, selected: true });
      // } else {
      //   data.settings.margin.top = firstTableEndY + 20;
      // }
      // FOOTER
      var str = "Page " + data.pageCount;
      // Total page number plugin only available in jspdf v1.0+
      if (typeof pdf.putTotalPages === 'function') {
        str = str;
      }
      pdf.setFontSize(9);
    };

    const thirdTableEndY = Math.round(pdf[autoTable].previous.finalY);

    pdf.setFont("Cambria");
    pdf.setFontSize(10);
    const meterReadingTableHeading = 'Meter Read-Outs';
    pdf.text(meterReadingTableHeading.toUpperCase(), startX, thirdTableEndY + 20);

    pdf[autoTable](firstTableCol, firstTableRows, {
      startX: 10,
      startY: thirdTableEndY + 40,
      showHead: "everyPage",
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: firstTableCol.length == 6 ? 100 : (firstTableCol.length == 4 ? 182 : 150),
          halign: 'center'
        },
        1: {
          cellWidth: firstTableCol.length == 6 ? 95 : (firstTableCol.length == 4 ? 142 : 120),
          halign: 'center'
        },
        2: {
          cellWidth: firstTableCol.length == 4 ? 105 : 95,
          halign: 'center'
        },
        3: {
          cellWidth: firstTableCol.length == 4 ? 105 : 95,
          halign: 'center'
        },
        4: {
          cellWidth: 74,
          halign: 'center'
        },
        5: {
          cellWidth: 75,
          halign: 'right'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (firstTableRows) {
        firstTableRows.cell.styles.cellPadding = 1;
      }
    });

    const fourthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    if (seventhTableRows && seventhTableRows.length) {
      pdf.setFontSize(10);
      const chargesBreakDownTableHeading = 'Charges Breakdown';
      pdf.text(chargesBreakDownTableHeading.toUpperCase(), startX, fourthTableEndY + 20);

      pdf[autoTable](seventhTableCol, seventhTableRows, {
        startX: 10,
        startY: fourthTableEndY + 40,
        showHead: "everyPage",
        didDrawPage: pageContent,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { left: startX },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            columnWidth: seventhTableCol.length == 6 ? 80 : (seventhTableCol.length == 4 ? 214 : (seventhTableCol.length == 7 ? 75 : 215)),
            halign: 'center'
          },
          1: {
            columnWidth: seventhTableCol.length == 6 ? 145 : (seventhTableCol.length == 4 ? 160 : (seventhTableCol.length == 7 ? 75 : 85)),
            halign: 'center'
          },
          2: {
            cellWidth: 85,
            halign: 'center'
          },
          3: {
            cellWidth: 75,
            halign: seventhTableCol.length == 4 ? 'right' : 'center'
          },
          4: {
            cellWidth: 74,
            halign: seventhTableCol.length == 6 || seventhTableCol.length == 7 ? 'center' : 'right'
          },
          5: {
            cellWidth: 75,
            halign: 'center'
          },
          6: {
            cellWidth: 75,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (seventhTableRows) {
          seventhTableRows.cell.styles.cellPadding = 1;
        }
      });
    }
    const fifthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    let sixthTableEndY = fifthTableEndY;
    if (isSlabTariff) {
      pdf[autoTable](ninthTableCol, ninthTableRows, {
        startX: 40,
        startY: fifthTableEndY + 10,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: 30 },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            columnWidth: ninthTableCol.length === 4 ? 200 : 110,
            halign: 'center'
          },
          1: {
            columnWidth: ninthTableCol.length === 4 ? 117 : 140,
            halign: 'center'
          },
          2: {
            columnWidth: ninthTableCol.length === 4 ? 117 : 97,
            halign: 'center'
          },
          3: {
            columnWidth: ninthTableCol.length === 4 ? 100 : 97,
            halign: ninthTableCol.length === 4 ? 'right' : 'center'
          },
          4: {
            columnWidth: 90,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (ninthTableRows) {
          ninthTableRows.cell.styles.cellPadding = 1;
        }
      });
      sixthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    } else {
      pdf[autoTable](ninthTableCol, ninthTableRows, {
        startX: 40,
        startY: fifthTableEndY + 10,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: 30 },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            columnWidth: ninthTableCol.length === 6 ? 130 : 85,
            halign: 'center'
          },
          1: {
            columnWidth: ninthTableCol.length === 6 ? 85 : 75,
            halign: 'center'
          },
          2: {
            columnWidth: ninthTableCol.length === 6 ? 85 : 75,
            halign: 'center'
          },
          3: {
            columnWidth: ninthTableCol.length === 6 ? 85 : 75,
            halign: 'center'
          },
          4: {
            columnWidth: ninthTableCol.length === 6 ? 74 : 74,
            halign: 'center'
          },
          5: {
            columnWidth: ninthTableCol.length === 6 ? 75 : 75,
            halign: ninthTableCol.length === 6 ? 'right' : 'center'
          },
          6: {
            columnWidth: 75,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (ninthTableRows) {
          ninthTableRows.cell.styles.cellPadding = 1;
          const tdElement: string = ninthTableRows.cell.raw;
          if (tdElement && typeof tdElement === 'string' && tdElement.startsWith('Unit')) {
            ninthTableRows.cell.styles.fontStyle = 'bold';
            ninthTableRows.cell.colSpan = ninthTableCol.length;
            ninthTableRows.cell.styles.halign = 'left';
          }
        }
      });
      sixthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    }

    let pageHeight = pdf.internal.pageSize.height;

    if (pageHeight - sixthTableEndY < 200) {
      pdf.addPage();
      // const pdfHeadingText = billMaster?.client?.clientName ?? '';
      // const textWidth = pdf.getTextWidth(pdfHeadingText.trim()) + 20;
      // pdf.setTextColor(0, 0, 0);
      // pdf.setFontSize(17);
      // pdf.setFont("Cambria");
      // pdf.text(pdfHeadingText, Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0), startY + 3);
      // pdf.setDrawColor(0, 0, 0);
      // pdf.line(Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0), startY + 6, Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0) + textWidth, startY + 6);
      // pdf.setFont("Cambria", 'normal');
      // pdf.setFontSize(14);
      // pdf.text("Billing Statement", startX, startY + 26);
      // if (img && billMaster && billMaster.client && billMaster.client.imageProperties && billMaster.client.imageProperties.length) {
      //   const imageProperty: ImageProperty = billMaster?.client?.imageProperties.find(x => x.imageType.trim().toLowerCase() === 'invoice');
      //   if (imageProperty) {
      //     pdf.addImage(img, 'png', imageProperty.imgX, imageProperty.imgY, imageProperty.imgW, imageProperty.imgH);
      //   }
      // }
      // const autoTable = 'autoTable';
      // pdf[autoTable]('', fourthTableRows, {
      //   startX: 10,
      //   startY: startY + 35,
      //   styles: {
      //     overflow: 'linebreak',
      //     cellWidth: 'wrap',
      //     fontSize: 9,
      //     cellPadding: 4,
      //     overflowColumns: 'linebreak',
      //     lineColor: [0, 0, 0]
      //   },
      //   margin: { left: startX },
      //   theme: 'grid',
      //   tableWidth: 'auto',
      //   cellWidth: 'wrap',
      //   columnStyles: {
      //     0: {
      //       cellWidth: 150,
      //       halign: 'left'
      //     },
      //     1: {
      //       cellWidth: 190,
      //       halign: 'left'
      //     }
      //   },
      //   headStyles: {
      //     lineWidth: 0.1,
      //     lineColor: [0, 0, 0],
      //     halign: 'center'
      //   },
      //   didParseCell: function (fourthTableRows) {
      //     fourthTableRows.cell.styles.cellPadding = 1;
      //   }
      // });
      sixthTableEndY = firstTableEndY;
      pageHeight = 370 + firstTableEndY;
    }

    pdf[autoTable]('', eighthTableRows, {
      startX: 10,
      startY: sixthTableEndY + 20,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { bottom: startY + 20, left: 250 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 244,
          fontStyle: "italic"
        },
        1: {
          cellWidth: 75
        }
      },
      didParseCell: function (eighthTableRows) {
        const col = eighthTableRows.column.index;
        if (col == 1) {
          eighthTableRows.cell.styles.halign = 'right';
        }
        eighthTableRows.cell.styles.cellPadding = 1;
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    });

    let seventhTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    if (billMaster?.client?.termsConditions[0]?.termsAndCondition) {
      pdf.setFillColor(241, 241, 244);
      pdf.rect(startX, seventhTableEndY + 20, 535, 80, 'FD');
      pdf.setFillColor(0, 0, 0);
      pdf.setFontSize(9);
      // pdf.text("Notes :-", startX + 30, seventhTableEndY + 30);
      // pdf.text("Payment should be made within 30 days of devitnote to avoid disconnection.", startX + 30, seventhTableEndY + 40);
      // pdf.text("1. Cash / Cheque in favour of " + billMaster.client.clientName, startX + 30, seventhTableEndY + 50);
      // pdf.text("2. Tax Registeration Number : " + billMaster.client.trnNo, startX + 30, seventhTableEndY + 60);
      // pdf.text("3. Minimum charges payable :", startX + 30, seventhTableEndY + 70);
      // pdf.text(`4. Late fee of ${this.currency} 50 / - will be levied, if payments are made by the due date`, startX + 30, seventhTableEndY + 80);
      // pdf.text("5. Late payment fee of 1 % per month will be calculated on the over due amount from the origional date of payment", startX + 30, seventhTableEndY + 90);
      pdf.text(billMaster?.client?.termsConditions[0]?.termsAndCondition.replace('{{ClientName}}', billMaster.client.clientName).replace('{{TRNNumber}}', billMaster.client.trnNo).replace('{{Currency}}', this.currency), startX + 30, seventhTableEndY + 30);
    }
    pdf.setTextColor(0, 0, 0);

    pdf.line(5, seventhTableEndY + 105, 607, seventhTableEndY + 105);

    if (seventhTableEndY > pageHeight - 190) {
      pdf.addPage();
      var str = "Page " + pdf.getNumberOfPages();
      pdf.setFontSize(10);
      pdf.text(str, 10, pageHeight - 10); // showing current page number
      pageHeight = 150;
    }

    pdf.text("Notice :- Please tear and attach the slip  along with your payment", startX, pageHeight - 80);


    pdf[autoTable](thirdTableCol, thirdTableRows, {
      startX: 10,
      startY: pageHeight - 70,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 120,
          halign: 'center'
        },
        1: {
          cellWidth: 200,
          halign: 'center'
        },
        2: {
          cellWidth: 100,
          halign: 'right'
        },
        3: {
          cellWidth: 120,
          halign: 'right'
        },
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (thirdTableRows) {
        thirdTableRows.cell.styles.cellPadding = 1;
      }
    });

    var output = pdf.output('datauristring')
    this.pdfsToMerge.push(output);
  }

  // New Bill Print Format added 27/05/2021
  downloadBillFormat2Report(billMaster: BillMaster) {
    const conversionValueTRHR: number = 0.284345;
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: ListItem[] = [];
    let thirdTableRows: any[] = [];
    let fourthTableRows: any[] = [];
    let fifthTableRows: any[] = [];
    let sixthTableRows: any[] = [];
    let seventhTableRows: any[] = [];
    let eighthTableRows: any[] = [];
    let ninthTableRows: any[] = [];
    let firstTableCol = [
      'Unit No',
      'Meter No',
      'Previous Reading',
      'Present Reading',
      'Consumption'];

    let thirdTableCol = [
      'Customer AccountNumber',
      'Billing Period',
      'Previous Due',
      'Total for current period'
    ]; // initialization for headers

    let seventhTableCol = [
      'Bill No',
      'Meter No',
      'Charges',
      'Consumption',
      'Measuring Unit',
      'Tariff',
      'Total'];

    fourthTableRows.push({
      label: 'Bill No',
      value: billMaster?.billNumber ?? ''
    }, {
      label: 'Date of issue',
      value: billMaster?.billDateLocal ?? ''
    }, {
      label: 'Due Date',
      value: billMaster?.dueDateLocal ?? ''
    }
    );

    fifthTableRows.push(
      {
        label: 'Customer Name',
        value: billMaster?.ownerName ?? ''
      },
      {
        label: 'Customer AccountNumber',
        value: billMaster?.accountNumber ?? ''
      },
      {
        label: 'Unit No',
        value: billMaster?.unitNumber ?? ''
      },
      {
        label: 'Address',
        value: billMaster?.receiverDetails[0]?.address1 ?? ''
      },
      {
        label: 'City',
        value: billMaster?.receiverDetails[0]?.city ?? ''
      },
      {
        label: 'P.O Box',
        value: billMaster?.receiverDetails[0]?.zipPostalCode ?? ''
      },
      {
        label: 'Phone number',
        value: billMaster?.receiverDetails[0]?.phoneNumber ?? ''
      },
      {
        label: 'Fax Number',
        value: ''
      },
      {
        label: 'Client',
        value: billMaster?.client?.clientName ?? ''
      },
      {
        label: 'Client TRN',
        value: billMaster?.client?.trnNo ?? ''
      }
    );

    let isMultipleBillNumber = false;
    let isMultipleUnitNumber = false;
    let isMultipleTariffFormatExists = false;
    let isMultipleMeterNumber = false;

    if (billMaster && billMaster.bills && billMaster.bills.length) {
      const uniqueBillNumber = Array.from(new Set(billMaster.bills.map(x => x.billNumber)));
      const uniqueUnitNumber = Array.from(new Set(billMaster.bills.map(x => x.unitNumber)));
      const uniqueMeterNumber = Array.from(new Set(billMaster.bills.map(x => x.deviceName)));

      isMultipleBillNumber = uniqueBillNumber && uniqueBillNumber.length > 1 ? true : false;
      isMultipleUnitNumber = uniqueUnitNumber && uniqueUnitNumber.length > 1 ? true : false;
      isMultipleMeterNumber = uniqueMeterNumber && uniqueMeterNumber.length > 1 ? true : false;

      if (!isMultipleMeterNumber) {
        const itemIndex = seventhTableCol.findIndex(x => x === 'Meter No');
        if (itemIndex > -1) {
          seventhTableCol.splice(itemIndex, 1);
        }
      }

      if (!isMultipleBillNumber) {
        seventhTableCol.splice(0, 1);
      } else {
        fourthTableRows.splice(0, 1);
      }
      if (!isMultipleUnitNumber) {
        firstTableCol.splice(0, 1);
      } else {
        const itemIndex = fifthTableRows.findIndex(x => x.label === 'Unit No');
        fifthTableRows.splice(itemIndex, 1);
      }

      const tariffExistingBills = Array.from(new Set(billMaster.bills.filter(x => x.billTariffDetails && x.billTariffDetails.length)));
      const tariffNotExistingBills = Array.from(new Set(billMaster.bills.filter(x => !x.billTariffDetails || x.billTariffDetails.length === 0)));

      if (tariffNotExistingBills && tariffNotExistingBills.length && tariffNotExistingBills && tariffNotExistingBills.length) {
        isMultipleTariffFormatExists = true;
      }
      if (tariffNotExistingBills && tariffNotExistingBills.length && !tariffExistingBills) {
        isMultipleTariffFormatExists = true;
      }
      if (tariffExistingBills && tariffExistingBills.length && (!tariffNotExistingBills || tariffNotExistingBills.length == 0)) {
        for (let a = 0; a < tariffExistingBills.length; a++) {
          const tariffNotExistingItem = tariffExistingBills[a].billTransactions.find(x => !x.tariffId);
          if (tariffNotExistingItem) {
            isMultipleTariffFormatExists = true;
            break;
          }
        };
      }
    }

    if (!isMultipleTariffFormatExists) {
      const tariffIndex = seventhTableCol.findIndex(x => x === 'Tariff');
      if (tariffIndex) {
        seventhTableCol.splice(tariffIndex, 1);
      }
    }

    for (let a = 0; a < billMaster.bills.length; a++) {
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      if (isMultipleUnitNumber) {
        row.push(billMaster.unitNumber)
      }
      row.push(billMaster.bills[a].deviceName)
      row.push(this.decimalPipe.transform(billMaster.bills[a].previousReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      row.push(this.decimalPipe.transform(billMaster.bills[a].presentReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      if (billMaster.bills[a].isDifferentiateBill) {
        if (isMultipleMeterNumber) {
          isMultipleMeterNumber = false;
          const itemIndex = seventhTableCol.findIndex(x => x === 'Meter No');
          if (itemIndex > -1) {
            seventhTableCol.splice(itemIndex, 1);
          }
        }
        const previousReading: number = billMaster.bills[a].previousReading;
        const presentReading: number = billMaster.bills[a].presentReading;
        const consumption: number = presentReading - previousReading;
        row.push(this.decimalPipe.transform(consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      } else {
        row.push(this.decimalPipe.transform(billMaster.bills[a].consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      }
      if (billMaster.bills[a].utilityType === 'BTU' && billMaster.bills[a].billTransactions && billMaster.bills[a].billTransactions.length && billMaster.bills[a].billTransactions.findIndex(x => x.measuringUnitId && x.measuringUnitId === 2) > -1) {
        if (a == 0) {
          firstTableCol.push('Consumption TR-HR');
        }
        const consumptionTRHR: number = billMaster.bills[a].consumption * conversionValueTRHR;
        row.push(this.decimalPipe.transform(consumptionTRHR, this.consumptionRoundOffFormat))
      }
      firstTableRows.push(row);
      row = [];
    }

    let totalAmount = 0;
    for (let a = 0; a < billMaster.bills.length; a++) {
      const bill = billMaster.bills[a];
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      for (let b = 0; b < bill.billTransactions.length; b++) {
        if (isMultipleBillNumber) {
          row.push(bill.billNumber);
        }
        if (isMultipleMeterNumber) {
          row.push(bill.deviceName);
        }
        row.push(bill.billTransactions[b].headDisplay)
        if (bill.utilityType === "BTU" && bill.billTransactions && bill.billTransactions.length && bill.billTransactions[b] && bill.billTransactions[b].measuringUnitId && bill.billTransactions[b].measuringUnitId === 2) {
          const consumptionTRHR: number = bill.consumption * conversionValueTRHR;
          row.push(this.decimalPipe.transform(consumptionTRHR, this.consumptionRoundOffFormat))
          row.push('TR-HR')
          if (isMultipleTariffFormatExists && bill.billTariffDetails && bill.billTariffDetails.length && bill.billTransactions[b].tariffId) {
            row.push('-')
          } else if (isMultipleTariffFormatExists) {
            row.push(bill.billTransactions[b].rate)
          }
        } else {
          row.push(this.decimalPipe.transform(bill.consumption, this.consumptionRoundOffFormat))
          row.push(bill.measuringUnit)
          if (isMultipleTariffFormatExists && bill.billTariffDetails && bill.billTariffDetails.length && bill.billTransactions[b].tariffId) {
            row.push('-')
          } else if (isMultipleTariffFormatExists) {
            row.push(bill.billTransactions[b].rate)
          }
        }
        row.push(this.currencyPipe.transform(bill.billTransactions[b].headAmount, this.currency.toString(), true, this.roundFormat))
        seventhTableRows.push(row);
        row = [];
        totalAmount += bill.billTransactions[b].headAmount;
      }
    }

    row.push(billMaster.accountNumber);
    row.push(billMaster.fromDateLocal + '-' + billMaster.toDateLocal);
    row.push(this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat));
    row.push(billMaster.billAmountLocal);
    thirdTableRows.push(row);

    const title = 'Sample Report';

    if (billMaster.billCharges && billMaster.billCharges.length) {
      billMaster.billCharges.sort((a, b) => a.position - b.position).forEach(billCharge => {
        if (billCharge.headDisplay !== 'VAT') {
          const existingitem = secondTableRows.find(x => x.label === billCharge.headDisplay);
          if (existingitem) {
            existingitem.value += billCharge.headAmount;
          } else {
            secondTableRows.push({ label: billCharge.headDisplay, value: billCharge.headAmount });
          }
        }
      });

      secondTableRows.forEach(x => {
        eighthTableRows.push({ label: x.label, value: this.currencyPipe.transform(x.value, this.currency.toString(), true, this.roundFormat) });
      })
    }

    const vatItem = billMaster.billCharges.find(billCharge => billCharge.headDisplay === 'VAT');

    eighthTableRows.push(
      {
        label: 'Total consumption charge for Current Period',
        value: this.currencyPipe.transform(totalAmount, this.currency.toString(), true, this.roundFormat)
      });

    if (billMaster.billDiscounts && billMaster.billDiscounts.length) {
      let discountAmount = 0;
      billMaster.billDiscounts.forEach(billDiscount => {
        discountAmount += billDiscount.headAmount;
      });
      eighthTableRows.push({ label: 'Total Discount', value: this.currencyPipe.transform(discountAmount, this.currency.toString(), true, this.roundFormat) });
    }

    billMaster.billTaxDetails.forEach(billTaxDetail => {
      const existingitem = eighthTableRows.find(x => x.label === billTaxDetail.taxDisplayName);
      if (existingitem) {
        const amount = Number(existingitem.value.replace(this.currency, '').trim()) + Number(billTaxDetail.taxAmount);
        existingitem.value = this.currencyPipe.transform(amount, this.currency.toString(), true, this.roundFormat);
      } else {
        eighthTableRows.push({ label: billTaxDetail.taxDisplayName, value: this.currencyPipe.transform(billTaxDetail.taxAmount, this.currency.toString(), true, this.roundFormat) });
      }
    });

    eighthTableRows.push(
      {
        label: 'Previous Outstanding Amount',
        value: this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
      },
      {
        label: 'Total Amount Due',
        value: this.currencyPipe.transform(billMaster.billAmount + billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
      }
    );

    sixthTableRows.push({
      firstItem: 'Billing period',
      secondItem: 'From:',
      thirdItem: billMaster.fromDateLocal,
      fourthItem: 'To:',
      fifthItem: billMaster.toDateLocal
    });

    let isMultipleBillTariffDeatils = false;
    const billTariffDetails = Array.from(new Set(billMaster.bills.map(x => x.billTariffDetails)));
    if (billTariffDetails && billTariffDetails.length > 1) {
      isMultipleBillTariffDeatils = true;
    }

    let ninthTableCol = [];
    let isSlabTariff = false;
    let unitMeterNumbers: string[] = [];
    row = [];
    if (billMaster && billMaster.bills && billMaster.bills.length) {
      billMaster.bills.forEach(bill => {
        this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', bill.utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
        unitMeterNumbers = [];
        let unitMeterNumber: string = 'Unit Number : ' + bill.unitNumber + ' - Meter Number : ' + bill.deviceName;
        if (bill.billTariffDetails && bill.billTariffDetails.length) {
          for (let b = 0; b < bill.billTariffDetails.length; b++) {
            if (bill.billTariffDetails[b].slabSettingsId && bill.billTariffDetails[b].slabSettingsId > 0) {
              let season: string = bill.billTariffDetails[b].season;
              if (Number(bill.billTariffDetails[b].peakType) < Number(bill.billTariffDetails[b].consumption)) {
                const consumptionMax = bill.billTariffDetails[b].consumption;
                const consumptionMin = bill.billTariffDetails[b].peakType;
                season = consumptionMin + ' - ' + consumptionMax;
              }
              if (b == 0) {
                isSlabTariff = true;
                ninthTableCol = [
                  'Slab',
                  'Consumption',
                  'Rate',
                  'Amount '];
              }
              if (unitMeterNumbers && unitMeterNumbers.length) {
                const itemExists = unitMeterNumbers.find(x => x === unitMeterNumber);
                if (!itemExists) {
                  this.createUnitMeterNumberRow(unitMeterNumber, ninthTableCol.length, ninthTableRows);
                }
              } else {
                unitMeterNumbers.push(unitMeterNumber);
                this.createUnitMeterNumberRow(unitMeterNumber, ninthTableCol.length, ninthTableRows);
              }
              row.push(season);
              row.push(this.decimalPipe.transform(bill.billTariffDetails[b].consumption, this.consumptionRoundOffFormat));
              row.push(bill.billTariffDetails[b].rate);
              row.push(this.currencyPipe.transform(bill.billTariffDetails[b].amount, this.currency.toString(), true, this.roundFormat));
            } else if (bill.billTariffDetails[b].slabSettingsId == 0) {
              if (b == 0) {
                ninthTableCol = [
                  'Season',
                  'Week Type',
                  'Peak Type',
                  'Consumption',
                  'Rate',
                  'Amount '];
              }
              if (unitMeterNumbers && unitMeterNumbers.length) {
                const itemExists = unitMeterNumbers.find(x => x === unitMeterNumber);
                if (!itemExists) {
                  this.createUnitMeterNumberRow(unitMeterNumber, ninthTableCol.length, ninthTableRows);
                }
              } else {
                unitMeterNumbers.push(unitMeterNumber);
                this.createUnitMeterNumberRow(unitMeterNumber, ninthTableCol.length, ninthTableRows);
              }
              row.push(bill.billTariffDetails[b].season);
              row.push(bill.billTariffDetails[b].weekType);
              row.push(bill.billTariffDetails[b].peakType);
              row.push(this.decimalPipe.transform(bill.billTariffDetails[b].consumption, this.consumptionRoundOffFormat));
              row.push(bill.billTariffDetails[b].rate);
              row.push(this.currencyPipe.transform(bill.billTariffDetails[b].amount, this.currency.toString(), true, this.roundFormat));
            }
            ninthTableRows.push(row);
            row = [];
          };
        }
      });
    }
    this.getBillFormat2Report(firstTableCol, firstTableRows, secondTableRows, thirdTableCol, thirdTableRows, fourthTableRows, fifthTableRows, sixthTableRows, title, seventhTableCol, seventhTableRows, billMaster, eighthTableRows, ninthTableCol, ninthTableRows, isSlabTariff);
  }

  // New Bill Print Format added 10/09/2021
  getBillFormat2Report(firstTableCol: any[], firstTableRows: any[], secondTableRows: any[], thirdTableCol: any[], thirdTableRows: any[], fourthTableRows: any[], fifthTableRows: any[], sixthTableRows: any[], title: string, seventhTableCol: any[], seventhTableRows: any[], billMaster: BillMaster, eighthTableRows: any[], ninthTableCol: any[], ninthTableRows: any[], isSlabTariff: boolean = false) {

    const totalPagesExp = "1";
    let pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter"
    });

    let startX = 30;
    let startY = 15;
    const pdfHeadingText = billMaster?.client?.clientName ?? '';
    const textWidth = pdf.getTextWidth(pdfHeadingText.trim());
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(17);
    pdf.setFont("Cambria");
    pdf.text(pdfHeadingText, Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0), startY + 3);
    this.addImage(pdf, billMaster);
    pdf.setLineWidth(.1);
    pdf.line(Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0), startY + 6, Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0) + textWidth, startY + 6);
    pdf.setFontSize(13);
    // let address: string = '';
    // if (billMaster && billMaster.client && billMaster.client.addresses[0]) {
    //   address = billMaster.client.addresses[0].address1?.toLowerCase() ?? '' + ',' + billMaster.client.addresses[0].city?.toLowerCase() ?? '';
    //   if (address.trim() == ',') {
    //     address = '';
    //   }
    // }
    // pdf.text(address, Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0) + 5, startY + 15);
    pdf.setLineWidth(.1);
    pdf.setFontSize(14);
    pdf.text("Billing Statement", startX, startY + 26);

    const autoTable = 'autoTable';
    pdf[autoTable]('', fourthTableRows, {
      startX: 10,
      startY: startY + 35,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 150,
          halign: 'left'
        },
        1: {
          cellWidth: 190,
          halign: 'left'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center'
      },
      didParseCell: function (fourthTableRows) {
        fourthTableRows.cell.styles.cellPadding = 1;
      }
    });

    const firstTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf[autoTable]('', sixthTableRows, {
      startX: 10,
      startY: firstTableEndY,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 150,
          halign: 'left',
        },
        1: {
          cellWidth: 95,
          halign: 'center'
        },
        2: {
          cellWidth: 95,
          halign: 'center'
        },
        3: {
          cellWidth: 97,
          halign: 'center'
        },
        4: {
          cellWidth: 97,
          halign: 'center'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      didParseCell: function (sixthTableRows) {
        sixthTableRows.cell.styles.cellPadding = 1;
      }
    });

    const secondTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf[autoTable]('', fifthTableRows, {
      startX: 10,
      startY: secondTableEndY,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 150,
          halign: 'left'
        },
        1: {
          cellWidth: 384,
          halign: 'left'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      didParseCell: function (fifthTableRows) {
        fifthTableRows.cell.styles.cellPadding = 1;
      }
    });

    const thirdTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    pdf.setFont("Cambria");
    pdf.setFontSize(10);
    const meterReadingTableHeading = 'Meter Read-Outs';
    pdf.text(meterReadingTableHeading.toUpperCase(), startX, thirdTableEndY + 15);


    var pageContent = function (data) {
      // HEADER

      // FOOTER
      var str = "Page " + data.pageCount;
      pdf.setFontSize(10);
      var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
      pdf.text(str, data.settings.margin.left, pageHeight - 10); // showing current page number
    };

    pdf[autoTable](firstTableCol, firstTableRows, {
      startX: 10,
      startY: thirdTableEndY + 30,
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { top: 180, left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: firstTableCol.length == 6 ? 100 : (firstTableCol.length == 4 ? 182 : 150),
          halign: 'center'
        },
        1: {
          cellWidth: firstTableCol.length == 6 ? 95 : (firstTableCol.length == 4 ? 142 : 120),
          halign: 'center'
        },
        2: {
          cellWidth: firstTableCol.length == 4 ? 105 : 95,
          halign: 'center'
        },
        3: {
          cellWidth: firstTableCol.length == 4 ? 105 : 95,
          halign: 'center'
        },
        4: {
          cellWidth: 74,
          halign: 'center'
        },
        5: {
          cellWidth: 75,
          halign: 'center'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (firstTableRows) {
        firstTableRows.cell.styles.cellPadding = 1;
      }
    });


    const fourthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    if (seventhTableRows && seventhTableRows.length) {
      pdf.setFontSize(10);
      const chargesBreakDownTableHeading = 'Charges Breakdown';
      pdf.text(chargesBreakDownTableHeading.toUpperCase(), startX, fourthTableEndY + 15);

      pdf[autoTable](seventhTableCol, seventhTableRows, {
        startX: 10,
        startY: fourthTableEndY + 30,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: 30 },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            columnWidth: seventhTableCol.length == 6 ? 80 : (seventhTableCol.length == 4 ? 214 : (seventhTableCol.length == 7 ? 75 : 215)),
            halign: 'center'
          },
          1: {
            columnWidth: seventhTableCol.length == 6 ? 145 : (seventhTableCol.length == 4 ? 160 : (seventhTableCol.length == 7 ? 75 : 85)),
            halign: 'center'
          },
          2: {
            cellWidth: 85,
            halign: 'center'
          },
          3: {
            cellWidth: 75,
            halign: seventhTableCol.length == 4 ? 'right' : 'center'
          },
          4: {
            cellWidth: 74,
            halign: seventhTableCol.length == 6 || seventhTableCol.length == 7 ? 'center' : 'right'
          },
          5: {
            cellWidth: 75,
            halign: 'right'
          },
          6: {
            cellWidth: 75,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (seventhTableRows) {
          seventhTableRows.cell.styles.cellPadding = 1;
        }
      });
    }
    const fifthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    let sixthTableEndY = fifthTableEndY;
    if (isSlabTariff) {
      pdf[autoTable](ninthTableCol, ninthTableRows, {
        startX: 10,
        startY: fifthTableEndY + 10,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: 30 },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            columnWidth: ninthTableCol.length === 4 ? 200 : 110,
            halign: 'center'
          },
          1: {
            columnWidth: ninthTableCol.length === 4 ? 117 : 140,
            halign: 'center'
          },
          2: {
            columnWidth: ninthTableCol.length === 4 ? 117 : 97,
            halign: 'center'
          },
          3: {
            columnWidth: ninthTableCol.length === 4 ? 100 : 97,
            halign: ninthTableCol.length === 4 ? 'right' : 'center'
          },
          4: {
            columnWidth: 90,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (ninthTableRows) {
          ninthTableRows.cell.styles.cellPadding = 1;
          const tdElement: string = ninthTableRows.cell.raw;
          if (tdElement && typeof tdElement === 'string' && tdElement.startsWith('Unit')) {
            ninthTableRows.cell.styles.fontStyle = 'bold';
            ninthTableRows.cell.colSpan = ninthTableCol.length;
            ninthTableRows.cell.styles.halign = 'left';
          }
        }
      });
      sixthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    }
    else {
      pdf[autoTable](ninthTableCol, ninthTableRows, {
        startX: 10,
        startY: fifthTableEndY + 10,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: 30 },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            columnWidth: ninthTableCol.length === 6 ? 130 : 85,
            halign: 'center'
          },
          1: {
            columnWidth: ninthTableCol.length === 6 ? 85 : 75,
            halign: 'center'
          },
          2: {
            columnWidth: ninthTableCol.length === 6 ? 85 : 75,
            halign: 'center'
          },
          3: {
            columnWidth: ninthTableCol.length === 6 ? 85 : 75,
            halign: 'center'
          },
          4: {
            columnWidth: ninthTableCol.length === 6 ? 74 : 74,
            halign: 'center'
          },
          5: {
            columnWidth: ninthTableCol.length === 6 ? 75 : 75,
            halign: ninthTableCol.length === 6 ? 'right' : 'center'
          },
          6: {
            columnWidth: 75,
            halign: 'right'
          },
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (ninthTableRows) {
          ninthTableRows.cell.styles.cellPadding = 1;
          const tdElement: string = ninthTableRows.cell.raw;
          if (tdElement && typeof tdElement === 'string' && tdElement.startsWith('Unit')) {
            ninthTableRows.cell.styles.fontStyle = 'bold';
            ninthTableRows.cell.colSpan = ninthTableCol.length;
            ninthTableRows.cell.styles.halign = 'left';
          }
        }
      });

      sixthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    }
    pdf[autoTable]('', eighthTableRows, {
      startX: 10,
      startY: sixthTableEndY + 10,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { bottom: startY + 20, left: 230 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 235,
          fontStyle: "italic"
        },
        1: {
          cellWidth: 100
        }
      },
      didParseCell: function (eighthTableRows) {
        const col = eighthTableRows.column.index;
        if (col == 1) {
          eighthTableRows.cell.styles.halign = 'right';
        }
        eighthTableRows.cell.styles.cellPadding = 1;
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    });

    const seventhTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    if (billMaster?.client?.termsConditions[0]?.termsAndCondition) {
      pdf.setFillColor(241, 241, 244);
      pdf.rect(startX, seventhTableEndY + 20, 535, 80, 'FD');
      pdf.setFillColor(0, 0, 0);
      pdf.setFontSize(9);
      // pdf.text("Notes :-", startX + 30, sixthTableEndY + 30);
      // pdf.text("Payment should be made within 30 days of devitnote to avoid disconnection.", startX + 30, sixthTableEndY + 40);
      // pdf.text("1. Cash / Cheque in favour of " + billMaster.client.clientName, startX + 30, sixthTableEndY + 50);
      // pdf.text("2. Tax Registeration Number : " + billMaster.client.trnNo, startX + 30, sixthTableEndY + 60);
      // pdf.text("3. Minimum charges payable :", startX + 30, sixthTableEndY + 70);
      // pdf.text(`4. Late fee of ${this.currency} 50 / - will be levied, if payments are made by the due date`, startX + 30, sixthTableEndY + 80);
      // pdf.text("5. Late payment fee of 1 % per month will be calculated on the over due amount from the origional date of payment", startX + 30, sixthTableEndY + 90);
      pdf.text(billMaster?.client?.termsConditions[0]?.termsAndCondition.replace('{{ClientName}}', billMaster.client.clientName).replace('{{TRNNumber}}', billMaster.client.trnNo).replace('{{Currency}}', this.currency), startX + 30, seventhTableEndY + 30);
    }
    pdf.setTextColor(0, 0, 0);
    pdf.line(5, seventhTableEndY + 110, 607, seventhTableEndY + 110);

    let pageHeight = pdf.internal.pageSize.height;
    if (seventhTableEndY > pageHeight - 190) {
      pdf.addPage();
      var str = "Page " + pdf.getNumberOfPages();
      pdf.setFontSize(10);
      pdf.text(str, 10, pageHeight - 10); // showing current page number
      pageHeight = 150;
    }

    pdf.text("Notice :- Please tear and attach the slip  along with your payment", startX, pageHeight - 90);

    pdf[autoTable](thirdTableCol, thirdTableRows, {
      startX: 10,
      startY: pageHeight - 80,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 120,
          halign: 'center'
        },
        1: {
          cellWidth: 200,
          halign: 'center'
        },
        2: {
          cellWidth: 100,
          halign: 'right'
        },
        3: {
          cellWidth: 120,
          halign: 'right'
        },
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (thirdTableRows) {
        thirdTableRows.cell.styles.cellPadding = 1;
      }
    });

    var output = pdf.output('datauristring')
    this.pdfsToMerge.push(output);
  }

  // New Bill Print Format added 01/06/2021
  downloadBillNewFormatReport(billMaster: BillMaster) {
    const conversionValueTRHR: number = 0.284345;
    const spliter: string = ': ';
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: ListData[] = [];
    let thirdTableRows: any[] = [];
    let fourthTableRows: any[] = [];
    let fifthTableRows: any[] = [];
    let sixthTableRows: any[] = [];
    let seventhTableRows: any[] = [];
    let eighthTableRows: ListData[] = [];
    let firstTableCol = [
      'Meter No',
      'Tarif',
      'Previous Reading',
      'Present Reading',
      'Consumption',
      // 'Consumption TR-HR',
      'Unit Rate ' + this.currency + '/TR-HR',
      'Amount '];

    let thirdTableCol = [
      'Customer Number',
      'Billing Period',
      'Total for current period'
    ]; // initialization for headers

    let seventhTableCol = ['Charges',
      'Consumption',
      'Measuring Unit',
      'Tariff',
      'Total'];

    for (let a = 0; a < billMaster.bills.length; a++) {
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      row.push(billMaster.bills[a].deviceName)
      row.push(billMaster.bills[a].utilityType)
      if (billMaster.bills[a].utilityType === 'BTU' && billMaster.bills[a].billTransactions && billMaster.bills[a].billTransactions.length && billMaster.bills[a].billTransactions.findIndex(x => x.measuringUnitId && x.measuringUnitId === 2) > -1) {
        const previousReadingTRHR: number = billMaster.bills[a].previousReading * conversionValueTRHR;
        row.push(this.decimalPipe.transform(previousReadingTRHR, this.roundFormat) + ' ' + 'TR-HR');
        const presentReadingTRHR: number = billMaster.bills[a].presentReading * conversionValueTRHR;
        row.push(this.decimalPipe.transform(presentReadingTRHR, this.roundFormat) + ' ' + 'TR-HR')
        const consumptionTRHR: number = billMaster.bills[a].consumption * conversionValueTRHR;
        // row.push('')
        row.push(this.decimalPipe.transform(consumptionTRHR, this.roundFormat) + ' ' + 'TR-HR')
      } else {
        row.push(this.decimalPipe.transform(billMaster.bills[a].previousReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
        row.push(this.decimalPipe.transform(billMaster.bills[a].presentReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
        row.push(this.decimalPipe.transform(billMaster.bills[a].consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
        // row.push('')
      }
      row.push(billMaster.bills[a].consumptionRate)
      row.push(billMaster.bills[a].billAmountLocal)
      firstTableRows.push(row);
      row = [];
    }

    for (let a = 0; a < billMaster.bills.length; a++) {
      const bill = billMaster.bills[a];
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      for (let b = 0; b < bill.billTransactions.length; b++) {
        row.push(bill.utilityType + '-' + bill.billTransactions[b].headDisplay)
        row.push(this.decimalPipe.transform(bill.consumption, this.consumptionRoundOffFormat))
        //row.push(this.decimalPipe.transform(bill.isDifferentiateBill == true && bill.billTransactions[b].headAmount == 0 ? bill.consumption : 0, this.consumptionRoundOffFormat))
        row.push(bill.consumptionUnit)
        row.push(bill.billTransactions[b].rate)
        row.push(this.currencyPipe.transform(bill.billTransactions[b].headAmount, this.currency.toString(), true, this.roundFormat))
        seventhTableRows.push(row);
        row = [];
      }
    }

    row.push(billMaster.accountNumber);
    row.push(billMaster.fromDateLocal + '-' + billMaster.toDateLocal);
    row.push(billMaster.billAmountLocal);
    thirdTableRows.push(row);

    const title = 'Sample Report';

    let otherCharges: ListItem[] = [];

    billMaster.bills.forEach(bill => {
      if (bill.billTransactions && bill.billTransactions.length) {
        const restrictArray: string[] = ['consumption', 'consumptioncharge'];
        bill.billTransactions.forEach(transaction => {
          if (!restrictArray.includes(transaction.headDisplay.toLowerCase())) {
            const existingitem = otherCharges.find(x => x.label === transaction.headDisplay);
            if (existingitem) {
              existingitem.value += transaction.headAmount;
            } else {
              otherCharges.push({ label: transaction.headDisplay, value: transaction.headAmount });
            }
          }
        });
      }
    });
    if (billMaster.billCharges && billMaster.billCharges.length) {
      billMaster.billCharges.sort((a, b) => a.position - b.position).forEach(billCharge => {
        if (billCharge.headDisplay !== 'VAT') {
          const existingitem = otherCharges.find(x => x.label === billCharge.headDisplay);
          if (existingitem) {
            existingitem.value += billCharge.headAmount;
          } else {
            otherCharges.push({ label: billCharge.headDisplay, value: billCharge.headAmount });
          }
        }
      });
    }
    //const vatItem = billMaster.billCharges.find(billCharge => billCharge.headDisplay === 'VAT');

    let totalAmount = 0;
    otherCharges.forEach(x => {
      secondTableRows.push({ label: x.label, value: this.currencyPipe.transform(x.value, this.currency.toString(), true, this.roundFormat) });
      totalAmount += Number(x.value)
    });

    if (billMaster.billTaxDetails && billMaster.billTaxDetails.length) {
      billMaster.billTaxDetails.forEach(billTaxDetail => {
        secondTableRows.push({ label: billTaxDetail.taxDisplayName, value: this.currencyPipe.transform(billTaxDetail.taxAmount, this.currency.toString(), true, this.roundFormat) });
        totalAmount += Number(billTaxDetail.taxAmount)
      });

      if (billMaster.billDiscounts && billMaster.billDiscounts.length) {
        let discountAmount = 0;
        billMaster.billDiscounts.forEach(billDiscount => {
          discountAmount += billDiscount.headAmount;
        });
        eighthTableRows.push({ label: 'Total Discount', value: this.currencyPipe.transform(discountAmount, this.currency.toString(), true, this.roundFormat) });
      }
    }

    eighthTableRows.push({
      label: 'Total for Current Period',
      value: this.currencyPipe.transform(billMaster.billAmount + billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
    })

    fourthTableRows.push({
      label: 'Bill No',
      value: spliter + stringIsNullOrEmpty(billMaster.billNumber)
    }, {
      label: 'Date of issue',
      value: spliter + stringIsNullOrEmpty(billMaster.billDateLocal)
    }, {
      label: 'Due Date',
      value: spliter + stringIsNullOrEmpty(billMaster.dueDateLocal)
    }
    );

    fifthTableRows.push(
      {
        label: 'Billing period',
        value: spliter + ` From: ${stringIsNullOrEmpty(billMaster.fromDateLocal)} To: ${stringIsNullOrEmpty(billMaster.toDateLocal)} `
      },
      {
        label: 'Customer Account',
        value: spliter + stringIsNullOrEmpty(billMaster.accountNumber)
      },
      {
        label: 'Customer Name',
        value: spliter + stringIsNullOrEmpty(billMaster.ownerName)
      },
      {
        label: 'Unit No',
        value: spliter + stringIsNullOrEmpty(billMaster.unitNumber)
      },
      {
        label: 'Address',
        value: spliter + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.address1)
      },
      {
        label: 'City',
        value: spliter + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.city)
      },
      {
        label: 'P.O Box',
        value: spliter + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.zipPostalCode)
      },
      {
        label: 'Phone number',
        value: spliter + stringIsNullOrEmpty(billMaster?.receiverDetails[0]?.phoneNumber)
      },
      {
        label: 'Fax Number',
        value: spliter
      },
      {
        label: 'Client',
        value: spliter + stringIsNullOrEmpty(billMaster?.client?.clientName)
      },
      {
        label: 'Client TRN',
        value: spliter + stringIsNullOrEmpty(billMaster?.client?.trnNo)
      }
    );

    this.getNewBillFormatReport(firstTableCol, firstTableRows, secondTableRows, thirdTableCol, thirdTableRows, fourthTableRows, fifthTableRows, sixthTableRows, title, seventhTableCol, seventhTableRows, billMaster, eighthTableRows);
  }

  // New Bill Print Format added 01/06/2021
  getNewBillFormatReport(firstTableCol: any[], firstTableRows: any[], secondTableRows: any[], thirdTableCol: any[], thirdTableRows: any[], fourthTableRows: any[], fifthTableRows: any[], sixthTableRows: any[], title: string, seventhTableCol: any[], seventhTableRows: any[], billMaster: BillMaster, eighthTableRows: any[]) {

    const totalPagesExp = "1";
    let pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter"
    });

    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    let startX = 30;
    let startY = 15;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.setFont("Cambria");
    pdf.text("Billing Statement".toUpperCase(), 10, startY + 5);
    this.addImage(pdf, billMaster);
    pdf.setLineWidth(.1);
    const autoTable = 'autoTable';
    pdf[autoTable]('', fourthTableRows, {
      startX: 10,
      startY: startY + 20,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: 15 },
      theme: 'plain',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 100,
          halign: 'left'
        },
        1: {
          cellWidth: 190,
          halign: 'left'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center'
      },
      didParseCell: function (fourthTableRows) {
        fourthTableRows.cell.styles.cellPadding = 1.5;
      }
    });

    const firstTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf[autoTable]('', fifthTableRows, {
      startX: 10,
      startY: firstTableEndY,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: 15 },
      theme: 'plain',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 100,
          halign: 'left'
        },
        1: {
          cellWidth: 380,
          halign: 'left'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      didParseCell: function (fifthTableRows) {
        fifthTableRows.cell.styles.cellPadding = 1.5;
      }
    });

    const secondTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    pdf.setFont("Cambria");
    const meterReadingTableHeading = 'Meter Read-Out';
    pdf.text(meterReadingTableHeading.toUpperCase(), 10, secondTableEndY + 15);

    var pageContent = function (data) {
      // HEADER

      // FOOTER
      var str = "Page " + data.pageCount;
      pdf.setFontSize(10);
      var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
      pdf.text(str, data.settings.margin.left, pageHeight - 10); // showing current page number
    };

    pdf[autoTable](firstTableCol, firstTableRows, {
      startX: 10,
      startY: secondTableEndY + 30,
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { top: 180, left: 15 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 70,
          halign: 'center'
        },
        1: {
          cellWidth: 100,
          halign: 'center'
        },
        2: {
          cellWidth: 90,
          halign: 'center'
        },
        3: {
          cellWidth: 90,
          halign: 'center'
        },
        4: {
          cellWidth: 80,
          halign: 'center'
        },
        5: {
          cellWidth: 73,
          halign: 'center'
        },
        6: {
          cellWidth: 73,
          halign: 'center'
        },
        7: {
          cellWidth: 75,
          halign: 'right'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (firstTableRows) {
        firstTableRows.cell.styles.cellPadding = 1.5;
      }
    });


    const thirdTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf[autoTable]('', secondTableRows, {
      startX: 10,
      startY: thirdTableEndY + 10,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { bottom: startY + 20, left: 250 },
      theme: 'plain',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 250,
          fontStyle: "italic"
        },
        1: {
          cellWidth: 90
        }
      },
      didParseCell: function (secondTableRows) {
        const col = secondTableRows.column.index;
        if (col == 1) {
          secondTableRows.cell.styles.halign = 'right';
        }
        secondTableRows.cell.styles.cellPadding = 1.5;
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    });

    const fourthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf.line(5, fourthTableEndY + 10, 607, fourthTableEndY + 10);

    pdf[autoTable]('', eighthTableRows, {
      startX: 10,
      startY: fourthTableEndY + 20,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { bottom: startY + 20, left: 250 },
      theme: 'plain',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 250,
          fontStyle: "italic"
        },
        1: {
          cellWidth: 90
        }
      },
      didParseCell: function (secondTableRows) {
        const col = secondTableRows.column.index;
        if (col == 1) {
          secondTableRows.cell.styles.halign = 'right';
        }
        secondTableRows.cell.styles.cellPadding = 1.5;
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    });

    const fifthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    pdf.line(5, fifthTableEndY + 10, 607, fifthTableEndY + 10);
    if (billMaster?.client?.termsConditions[0]?.termsAndCondition) {
      pdf.text(billMaster?.client?.termsConditions[0]?.termsAndCondition.replace('{{ClientName}}', billMaster.client.clientName).replace('{{TRNNumber}}', billMaster.client.trnNo).replace('{{Currency}}', this.currency), 10, fifthTableEndY + 30);
    }
    var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
    pdf.text("Notice :- Please tear and attach the slip  along with your payment", 10, pageHeight - 60);

    pdf[autoTable](thirdTableCol, thirdTableRows, {
      startX: 10,
      startY: pageHeight - 40,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: 15 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 100,
          halign: 'center'
        },
        1: {
          cellWidth: 340,
          halign: 'center'
        },
        2: {
          cellWidth: 140,
          halign: 'right'
        },
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (thirdTableRows) {
        thirdTableRows.cell.styles.cellPadding = 1.5;
      }
    });

    var output = pdf.output('datauristring')
    this.pdfsToMerge.push(output);
  }

  onRemarksDataRow(row: BillMaster) {
    const item: ListData = { label: 'Rejected Remarks', value: row.rejectedRemarks };
    this.dialog.open(ViewRemarksDialogComponent, { data: item }).afterClosed().subscribe(() => {
      if (row) {
        this.onGetBillsHistory(this.manageParams);
      }
    });
  }

  onFilterDataRow(billMasterDetails: BillMaster[]) {
    let billAmount = 0;
    let receivedAmount = 0;
    let creditNoteAmount = 0;
    let netAmount = 0;
    let balanceAmount = 0;
    if (billMasterDetails && billMasterDetails.length) {
      billMasterDetails.forEach(x => {
        billAmount = billAmount + x.billAmount;
        creditNoteAmount = creditNoteAmount + x.creditNoteAmount;
        netAmount = netAmount + x.netAmount;
        receivedAmount = receivedAmount + x.paid;
        balanceAmount = balanceAmount + x.balanceAmount;
      });
    }
    this.billAmount = this.currencyPipe.transform(billAmount, this.currency.toString(), true, this.roundFormat);
    this.creditNoteAmount = this.currencyPipe.transform(creditNoteAmount, this.currency.toString(), true, this.roundFormat);
    this.netAmount = this.currencyPipe.transform(netAmount, this.currency.toString(), true, this.roundFormat);
    this.receivedAmount = this.currencyPipe.transform(receivedAmount, this.currency.toString(), true, this.roundFormat);
    this.balanceAmount = this.currencyPipe.transform(balanceAmount, this.currency.toString(), true, this.roundFormat);
  }

  // getJsonData() {
  //   this.tableData = [];
  //   if (this.billMasterDetails != undefined) {

  //     this.billMasterDetails.forEach((item) => {
  //       let element = {
  //         BillDate: this.date.transform(item.billDate, 'yyyy-MM-dd'),
  //         BillNumber: item.billNumber,
  //         AccountNumber: item.accountNumber,
  //         TenantName: item.ownerName,
  //         Unit: item.unitNumber,
  //         FromDate: this.date.transform(item.fromDate, 'yyyy-MM-dd'),
  //         ToDate: this.date.transform(item.toDate, 'yyyy-MM-dd'),
  //         DueDate: this.date.transform(item.dueDate, 'yyyy-MM-dd'),
  //         BillAmount: item.billAmountLocal,
  //         CreditNoteAmount: item.creditNoteAmountLocal,
  //         NetBillAmount: item.netAmountLocal,
  //         Paid: item.paidLocal,
  //         BalanceAmount: item.balanceAmountLocal
  //       }
  //       this.tableData.push(element);
  //     })
  //   }
  // }

  onExcelExport() {
    if (this.billMasterDetails && this.billMasterDetails.length > 0) {

      const excelTableData: any[] = this.getData(this.billMasterDetails);
      if (excelTableData && excelTableData.length) {
        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(excelTableData);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

        /* save to file */
        if (this.isApproveBills && !this.isRejectedBills) {
          XLSX.writeFile(wb, 'ApproveBills.xlsx');
        } else {
          XLSX.writeFile(wb, 'BillHistory.xlsx');
        }
      }
    }
    else {
      this.notificationMessage("No Data to Export", "yellow-snackbar");
    }
  }


  getData(billMasters: BillMaster[]): any[] {
    let excelTableData: any[] = [];

    let row: any[] = [];
    let firstTableRows: any[] = [];
    let firstTableCols = [
      'Bill Number',
      'Bill Date',
      'Account Number',
      'Tenant Name',
    ];

    let firstColumns: string[] = [];
    let secondColumns: string[] = [];
    let thirdColumns: string[] = [];
    let fourthColumns: string[] = [];

    billMasters.forEach(x => {
      if (x.bills && x.bills.length) {
        x.bills.forEach(bill => {
          if (bill.billTransactions && bill.billTransactions.length) {
            bill.billTransactions.forEach(transaction => {
              if (!firstColumns.includes(transaction.headDisplay)) {
                firstColumns.push(transaction.headDisplay);
              }
            });
          }
        });
      }
      if (x.billCharges && x.billCharges.length) {
        x.billCharges.forEach(billCharge => {
          if (!secondColumns.includes(billCharge.headDisplay)) {
            secondColumns.push(billCharge.headDisplay);
          }
        });
      }
    });

    firstColumns.forEach(x => {
      firstTableCols.push(x);
    });

    secondColumns.forEach(x => {
      firstTableCols.push(x);
    });

    firstTableCols.push(
      'Bill Amount ',
      'Paid ');

    let totalAmount = 0;
    let totalPaidAmount = 0;

    for (let a = 0; a < billMasters.length; a++) {
      row.push(billMasters[a].billNumber)
      row.push(billMasters[a].billDateLocal)
      row.push(billMasters[a].accountNumber)
      row.push(billMasters[a].ownerName)

      firstColumns.forEach(column => {
        if (billMasters[a].bills && billMasters[a].bills.length) {
          const differentiateBills = billMasters[a].bills.filter(x => x.isDifferentiateBill == true);
          if (differentiateBills && differentiateBills.length && billMasters[a].bills.length == differentiateBills.length) {
            if (differentiateBills[differentiateBills.length - 1].billTransactions && differentiateBills[differentiateBills.length - 1].billTransactions.length) {
              const item = differentiateBills[differentiateBills.length - 1].billTransactions.find(transaction => transaction.headDisplay.toLowerCase() === column.toLowerCase());
              if (item) {
                row.push(this.currencyPipe.transform(item.headAmount, this.currency.toString(), true, this.roundFormat));
              } else {
                row.push(this.currencyPipe.transform(0, this.currency.toString(), true, this.roundFormat));
              }
            }
            else {
              row.push(this.currencyPipe.transform(0, this.currency.toString(), true, this.roundFormat));
            }
          } else {
            if (billMasters[a].isGroupBill) {
              let amount = 0;
              billMasters[a].bills.forEach(bill => {
                if (bill.billTransactions && bill.billTransactions.length) {
                  const item = bill.billTransactions.find(transaction => transaction.headDisplay.toLowerCase() === column.toLowerCase());
                  if (item) {
                    amount += item.headAmount
                  }
                }
              });
              if (amount > 0) {
                row.push(this.currencyPipe.transform(amount, this.currency.toString(), true, this.roundFormat));
              } else {
                row.push(this.currencyPipe.transform(0, this.currency.toString(), true, this.roundFormat));
              }
            } else {
              let headAmount = 0;
              billMasters[a].bills.forEach(bill => {
                if (bill.billTransactions && bill.billTransactions.length) {
                  const item = bill.billTransactions.find(transaction => transaction.headDisplay.toLowerCase() === column.toLowerCase());
                  if (item) {
                    headAmount += item.headAmount;
                  }
                }
              });
              if (headAmount > 0) {
                row.push(this.currencyPipe.transform(headAmount, this.currency.toString(), true, this.roundFormat));
              }
              else {
                row.push(this.currencyPipe.transform(0, this.currency.toString(), true, this.roundFormat));
              }
            }
          }
        } else {
          row.push(this.currencyPipe.transform(0, this.currency.toString(), true, this.roundFormat));
        }
      });

      secondColumns.forEach(column => {
        if (billMasters[a].isGroupBill) {
          let amount = 0;
          if (billMasters[a].billCharges && billMasters[a].billCharges.length) {
            const items = billMasters[a].billCharges.filter(billCharge => billCharge.headDisplay.toLowerCase() === column.toLowerCase());
            if (items && items.length) {
              items.forEach(item => {
                amount += Number(item.headAmount);
              });
            }
          }
          if (amount > 0) {
            row.push(this.currencyPipe.transform(amount, this.currency.toString(), true, this.roundFormat));
          } else {
            row.push(this.currencyPipe.transform(0, this.currency.toString(), true, this.roundFormat));
          }
        }
        else {
          if (billMasters[a].billCharges && billMasters[a].billCharges.length) {
            const item = billMasters[a].billCharges.find(billCharge => billCharge.headDisplay.toLowerCase() === column.toLowerCase());
            if (item) {
              row.push(this.currencyPipe.transform(item.headAmount, this.currency.toString(), true, this.roundFormat));
            } else {
              row.push(this.currencyPipe.transform(0, this.currency.toString(), true, this.roundFormat));
            }
          } else {
            row.push(this.currencyPipe.transform(0, this.currency.toString(), true, this.roundFormat));
          }
        }
      });

      row.push(this.currencyPipe.transform(billMasters[a].billAmount, this.currency.toString(), true, this.roundFormat));
      row.push(this.currencyPipe.transform(billMasters[a].paid, this.currency.toString(), true, this.roundFormat));
      firstTableRows.push(row);

      totalAmount += billMasters[a].billAmount;
      totalPaidAmount += billMasters[a].paid;
      row = [];
    }

    for (let a = 0; a < firstTableCols.length - 2; a++) {
      row.push('');
    }
    row.push(this.currencyPipe.transform(totalAmount, this.currency.toString(), true, this.roundFormat));
    row.push(this.currencyPipe.transform(totalPaidAmount, this.currency.toString(), true, this.roundFormat));
    firstTableRows.push(row);
    row = [];

    firstTableCols.forEach(column => {
      row.push(column);
    });
    excelTableData.push(row);
    firstTableRows.forEach(column => {
      excelTableData.push(column);
    });
    return excelTableData;
  }


  downloadBillFormat1Report(billMaster: BillMaster) {
    const conversionValueTRHR: number = 0.284345;
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: ListItem[] = [];
    let thirdTableRows: any[] = [];
    let fourthTableRows: any[] = [];
    let fifthTableRows: any[] = [];
    let sixthTableRows: any[] = [];
    let seventhTableRows: any[] = [];
    let eighthTableRows: any[] = [];
    let ninthTableRows: any[] = [];
    let firstTableCol = [
      'Unit No',
      'Meter No',
      'Previous Reading',
      'Present Reading',
      'Consumption'];

    let thirdTableCol = [
      'Customer AccountNumber',
      'Billing Period',
      'Previous Due',
      'Total for current period'
    ]; // initialization for headers

    let seventhTableCol = [
      'Bill No',
      'Meter No',
      'Charges',
      'Consumption',
      'Measuring Unit',
      'Tariff',
      'Total'];

    let meterNumber = '';
    billMaster.bills.forEach(x => {
      meterNumber += x.deviceName + ','
    });


    fifthTableRows.push(
      {
        label: 'Account Number:',
        value: billMaster.accountNumber
      },
      {
        label: 'Meter Number:',
        value: meterNumber.slice(0, -1)
      },
      {
        label: 'Unit Number:',
        value: billMaster.unitNumber
      },
      {
        label: 'Billing Date:',
        value: billMaster.billDateLocal
      },
      {
        label: 'Due Date:',
        value: billMaster.dueDateLocal
      },
      {
        label: 'Bill Period',
        value: `${stringIsNullOrEmpty(billMaster.fromDateLocal)} - ${stringIsNullOrEmpty(billMaster.toDateLocal)} `
      }
    );

    let isMultipleBillNumber = false;
    let isMultipleUnitNumber = false;
    let isMultipleMeterNumber = false;
    let isMultipleTariffFormatExists = false;

    if (billMaster && billMaster.bills && billMaster.bills.length) {
      const uniqueBillNumber = Array.from(new Set(billMaster.bills.map(x => x.billNumber)));
      const uniqueUnitNumber = Array.from(new Set(billMaster.bills.map(x => x.unitNumber)));
      const uniqueMeterNumber = Array.from(new Set(billMaster.bills.map(x => x.deviceName)));

      isMultipleBillNumber = uniqueBillNumber && uniqueBillNumber.length > 1 ? true : false;
      isMultipleUnitNumber = uniqueUnitNumber && uniqueUnitNumber.length > 1 ? true : false;
      isMultipleMeterNumber = uniqueMeterNumber && uniqueMeterNumber.length > 1 ? true : false;

      if (!isMultipleMeterNumber) {
        const itemIndex = seventhTableCol.findIndex(x => x === 'Meter No');
        if (itemIndex > -1) {
          seventhTableCol.splice(itemIndex, 1);
        }
      }

      if (!isMultipleBillNumber) {
        seventhTableCol.splice(0, 1);
      }

      if (!isMultipleUnitNumber) {
        firstTableCol.splice(0, 1);
      } else {
        const itemIndex = fifthTableRows.findIndex(x => x.label === 'Unit Number:');
        fifthTableRows.splice(itemIndex, 1);
      }

      const tariffExistingBills = Array.from(new Set(billMaster.bills.filter(x => x.billTariffDetails && x.billTariffDetails.length)));
      const tariffNotExistingBills = Array.from(new Set(billMaster.bills.filter(x => !x.billTariffDetails || x.billTariffDetails.length === 0)));

      if (tariffNotExistingBills && tariffNotExistingBills.length && tariffNotExistingBills && tariffNotExistingBills.length) {
        isMultipleTariffFormatExists = true;
      }
      if (tariffNotExistingBills && tariffNotExistingBills.length && !tariffExistingBills) {
        isMultipleTariffFormatExists = true;
      }
      if (tariffExistingBills && tariffExistingBills.length && (!tariffNotExistingBills || tariffNotExistingBills.length == 0)) {
        for (let a = 0; a < tariffExistingBills.length; a++) {
          const tariffNotExistingItem = tariffExistingBills[a].billTransactions.find(x => !x.tariffId);
          if (tariffNotExistingItem) {
            isMultipleTariffFormatExists = true;
            break;
          }
        };
      }
    }

    if (!isMultipleTariffFormatExists) {
      const tariffIndex = seventhTableCol.findIndex(x => x === 'Tariff');
      if (tariffIndex) {
        seventhTableCol.splice(tariffIndex, 1);
      }
    }

    for (let a = 0; a < billMaster.bills.length; a++) {
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      if (isMultipleUnitNumber) {
        row.push(billMaster.unitNumber)
      }
      row.push(billMaster.bills[a].deviceName)
      row.push(this.decimalPipe.transform(billMaster.bills[a].previousReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      row.push(this.decimalPipe.transform(billMaster.bills[a].presentReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      if (billMaster.bills[a].isDifferentiateBill) {
        if (isMultipleMeterNumber) {
          isMultipleMeterNumber = false;
          const itemIndex = seventhTableCol.findIndex(x => x === 'Meter No');
          if (itemIndex > -1) {
            seventhTableCol.splice(itemIndex, 1);
          }
        }
        const previousReading: number = billMaster.bills[a].previousReading;
        const presentReading: number = billMaster.bills[a].presentReading;
        const consumption: number = presentReading - previousReading;
        row.push(this.decimalPipe.transform(consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      } else {
        row.push(this.decimalPipe.transform(billMaster.bills[a].consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      }
      if (billMaster.bills[a].utilityType === 'BTU' && billMaster.bills[a].billTransactions && billMaster.bills[a].billTransactions.length && billMaster.bills[a].billTransactions.findIndex(x => x.measuringUnitId && x.measuringUnitId === 2) > -1) {
        if (a == 0) {
          firstTableCol.push('Consumption TR-HR');
        }
        const consumptionTRHR: number = billMaster.bills[a].consumption * conversionValueTRHR;
        row.push(this.decimalPipe.transform(consumptionTRHR, this.consumptionRoundOffFormat))
      }
      firstTableRows.push(row);
      row = [];
    }

    let totalAmount = 0;

    for (let a = 0; a < billMaster.bills.length; a++) {
      const bill = billMaster.bills[a];
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      for (let b = 0; b < bill.billTransactions.length; b++) {
        if (isMultipleBillNumber) {
          row.push(bill.billNumber);
        }
        row.push(bill.deviceName);
        if (isMultipleMeterNumber) {
        }
        row.push(bill.billTransactions[b].headDisplay)
        if (bill.utilityType === "BTU" && bill.billTransactions && bill.billTransactions.length && bill.billTransactions[b] && bill.billTransactions[b].measuringUnitId && bill.billTransactions[b].measuringUnitId === 2) {
          const consumptionTRHR: number = bill.consumption * conversionValueTRHR;
          row.push(this.decimalPipe.transform(consumptionTRHR, this.consumptionRoundOffFormat))
          row.push('TR-HR')
          if (isMultipleTariffFormatExists && bill.billTariffDetails && bill.billTariffDetails.length && bill.billTransactions[b].tariffId) {
            row.push('-')
          } else if (isMultipleTariffFormatExists) {
            row.push(bill.billTransactions[b].rate)
          }
        } else {
          row.push(this.decimalPipe.transform(bill.consumption, this.consumptionRoundOffFormat))
          row.push(bill.measuringUnit)
          if (isMultipleTariffFormatExists && bill.billTariffDetails && bill.billTariffDetails.length && bill.billTransactions[b].tariffId) {
            row.push('-')
          } else if (isMultipleTariffFormatExists) {
            row.push(bill.billTransactions[b].rate)
          }
        }
        row.push(this.currencyPipe.transform(bill.billTransactions[b].headAmount, this.currency.toString(), true, this.roundFormat))
        seventhTableRows.push(row);
        row = [];
        totalAmount += bill.billTransactions[b].headAmount;
      }
    }

    row.push(billMaster.accountNumber);
    row.push(billMaster.fromDateLocal + '-' + billMaster.toDateLocal);
    row.push(this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat));
    row.push(billMaster.billAmountLocal);
    thirdTableRows.push(row);

    const title: string = 'Invoice';
    if (billMaster.billCharges && billMaster.billCharges.length) {
      billMaster.billCharges.sort((a, b) => a.position - b.position).forEach(billCharge => {
        if (billCharge.headDisplay !== 'VAT') {
          const existingitem = secondTableRows.find(x => x.label === billCharge.headDisplay);
          if (existingitem) {
            existingitem.value += billCharge.headAmount;
          } else {
            secondTableRows.push({ label: billCharge.headDisplay, value: billCharge.headAmount });
          }
        }
      });

      secondTableRows.forEach(x => {
        sixthTableRows.push({ label: x.label, value: this.currencyPipe.transform(x.value, this.currency.toString(), true, this.roundFormat) });
      })
    }
    sixthTableRows.push(
      {
        label: 'Current Month Total Consumption Charge:',
        value: this.currencyPipe.transform(totalAmount, this.currency.toString(), true, this.roundFormat)
      });

    if (billMaster.billDiscounts && billMaster.billDiscounts.length) {
      let discountAmount = 0;
      billMaster.billDiscounts.forEach(billDiscount => {
        discountAmount += billDiscount.headAmount;
      });
      sixthTableRows.push({ label: 'Total Discount', value: this.currencyPipe.transform(discountAmount, this.currency.toString(), true, this.roundFormat) });
    }

    if (billMaster.billTaxDetails && billMaster.billTaxDetails.length) {
      billMaster.billTaxDetails.forEach(billTaxDetail => {
        sixthTableRows.push(
          {
            label: billTaxDetail.taxDisplayName,
            value: this.currencyPipe.transform(billTaxDetail.taxAmount, this.currency.toString(), true, this.roundFormat)
          });
      });
    } else {
      sixthTableRows.push(
        {
          label: 'TAX:',
          value: this.currencyPipe.transform(0, this.currency.toString(), true, this.roundFormat)
        });
    }

    sixthTableRows.push(
      {
        label: 'Current Month + TAX:',
        value: billMaster.billAmountLocal
      },
      {
        label: 'Previous Bill Outstanding Balance:',
        value: this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
      },
      {
        label: 'Total Due incl TAX:',
        value: this.currencyPipe.transform(billMaster.billAmount + billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
      }
    );

    let isMultipleBillTariffDeatils = false;
    const billTariffDetails = Array.from(new Set(billMaster.bills.map(x => x.billTariffDetails)));
    if (billTariffDetails && billTariffDetails.length > 1) {
      isMultipleBillTariffDeatils = true;
    }

    let ninthTableCol = [];
    let isSlabTariff = false;
    let unitMeterNumbers: string[] = [];
    row = [];
    if (billMaster && billMaster.bills && billMaster.bills.length) {
      billMaster.bills.forEach(bill => {
        this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', bill.utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
        unitMeterNumbers = [];
        let unitMeterNumber: string = 'Unit Number : ' + bill.unitNumber + ' - Meter Number : ' + bill.deviceName;
        if (bill.billTariffDetails && bill.billTariffDetails.length) {
          for (let b = 0; b < bill.billTariffDetails.length; b++) {
            if (bill.billTariffDetails[b].slabSettingsId && bill.billTariffDetails[b].slabSettingsId > 0) {
              let season: string = bill.billTariffDetails[b].season;
              if (Number(bill.billTariffDetails[b].peakType) < Number(bill.billTariffDetails[b].consumption)) {
                const consumptionMax = bill.billTariffDetails[b].consumption;
                const consumptionMin = bill.billTariffDetails[b].peakType;
                season = consumptionMin + ' - ' + consumptionMax;
              }
              if (b == 0) {
                isSlabTariff = true;
                ninthTableCol = [
                  'Slab',
                  'Consumption',
                  'Rate',
                  'Amount '];
              }
              if (unitMeterNumbers && unitMeterNumbers.length) {
                const itemExists = unitMeterNumbers.find(x => x === unitMeterNumber);
                if (!itemExists) {
                  this.createUnitMeterNumberRow(unitMeterNumber, ninthTableCol.length, ninthTableRows);
                }
              } else {
                unitMeterNumbers.push(unitMeterNumber);
                this.createUnitMeterNumberRow(unitMeterNumber, ninthTableCol.length, ninthTableRows);
              }
              row.push(season);
              row.push(this.decimalPipe.transform(bill.billTariffDetails[b].consumption, this.consumptionRoundOffFormat));
              row.push(bill.billTariffDetails[b].rate);
              row.push(this.currencyPipe.transform(bill.billTariffDetails[b].amount, this.currency.toString(), true, this.roundFormat));
            } else if (bill.billTariffDetails[b].slabSettingsId == 0) {
              if (b == 0) {
                ninthTableCol = [
                  'Season',
                  'Week Type',
                  'Peak Type',
                  'Consumption',
                  'Rate',
                  'Amount '];
              }
              if (unitMeterNumbers && unitMeterNumbers.length) {
                const itemExists = unitMeterNumbers.find(x => x === unitMeterNumber);
                if (!itemExists) {
                  this.createUnitMeterNumberRow(unitMeterNumber, ninthTableCol.length, ninthTableRows);
                }
              } else {
                unitMeterNumbers.push(unitMeterNumber);
                this.createUnitMeterNumberRow(unitMeterNumber, ninthTableCol.length, ninthTableRows);
              }
              row.push(bill.billTariffDetails[b].season);
              row.push(bill.billTariffDetails[b].weekType);
              row.push(bill.billTariffDetails[b].peakType);
              row.push(this.decimalPipe.transform(bill.billTariffDetails[b].consumption, this.consumptionRoundOffFormat));
              row.push(bill.billTariffDetails[b].rate);
              row.push(this.currencyPipe.transform(bill.billTariffDetails[b].amount, this.currency.toString(), true, this.roundFormat));
            }
            ninthTableRows.push(row);
            row = [];
          };
        }
      });
    }
    this.getNewBillFormat1Report(firstTableCol, firstTableRows, secondTableRows, thirdTableCol, thirdTableRows, fourthTableRows, fifthTableRows, sixthTableRows, title, seventhTableCol, seventhTableRows, billMaster, eighthTableRows, ninthTableCol, ninthTableRows, isSlabTariff);
  }

  // New Bill Print Format added 27/05/2021
  getNewBillFormat1Report(firstTableCol: any[], firstTableRows: any[], secondTableRows: any[], thirdTableCol: any[], thirdTableRows: any[], fourthTableRows: any[], fifthTableRows: any[], sixthTableRows: any[], title: string, seventhTableCol: any[], seventhTableRows: any[], billMaster: BillMaster, eighthTableRows: any[], ninthTableCol: any[], ninthTableRows: any[], isSlabTariff: boolean = false) {

    const totalPagesExp = "1";
    let pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter"
    });

    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    let startX = 10;
    let startY = 30;
    pdf.setFontSize(30);
    pdf = this.addImage(pdf, billMaster);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.setFont("Cambria", 'bold');
    pdf.text("Tax Invoice", startX + 250, startY);
    pdf.setFontSize(13);
    pdf.setFont('Cambria', 'normal');
    pdf.text(billMaster.client.clientName.toUpperCase(), startX, startY + 30);
    pdf.setFontSize(10);
    pdf.setFont('Cambria');
    pdf.text("TRN: " + billMaster.client.trnNo, startX, startY + 40);
    pdf.text("PO Box " + billMaster.client.addresses[0].zipPostalCode, startX, startY + 50);
    pdf.text(billMaster.client.addresses[0].address1 + ',' + billMaster.client.addresses[0].country, startX, startY + 60);
    pdf.text("Phone: " + billMaster.client.phoneNo, startX, startY + 70);
    pdf.text("Email: " + billMaster.client.email + ',' + ' Web: ' + billMaster.client.website, startX, startY + 80);
    pdf.setFontSize(10);
    const invoiceHeading = 'Invoice#: ';
    pdf.setFont('bold');
    pdf.text(invoiceHeading.toUpperCase(), startX + 360, startY + 80);
    pdf.setTextColor(25, 118, 210);
    const tableHeadingWidth = pdf.getTextWidth(invoiceHeading);
    let billNumber: string = '';
    if (billMaster?.billNumber) {
      billNumber = billMaster.billNumber?.toUpperCase();
    };
    pdf.text(billNumber, 20 + 360 + tableHeadingWidth, startY + 80);
    pdf.setFont('none');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);


    const autoTable = 'autoTable';
    pdf[autoTable]('', fifthTableRows, {
      startY: startY + 90,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX + 360 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 80,
          halign: 'left'
        },
        1: {
          cellWidth: 150,
          halign: 'right'
        }
      },
      didParseCell: function (fifthTableRows) {
        fifthTableRows.cell.styles.cellPadding = fifthTableRows.length === 6 ? 1.8 : 2.7;
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    });

    var pageContent = function (data) {
      // HEADER

      // FOOTER
      var str = "Page " + data.pageCount;
      // Total page number plugin only available in jspdf v1.0+
      if (typeof pdf.putTotalPages === 'function') {
        str = str + " of " + totalPagesExp;
        pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
      }
      pdf.setFontSize(9);
      var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
      pdf.text(str, data.settings.margin.left, pageHeight - 10); // showing current page number
    };


    const firstTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    pdf.setLineWidth(.1);
    pdf.line(5, firstTableEndY + 5, 607, firstTableEndY + 5);
    pdf.setFont("Cambria");
    pdf.setFillColor(241, 241, 244);
    pdf.setDrawColor(206, 203, 203);
    pdf.rect(10, startY + 90, 340, firstTableEndY - (startY + 90), 'FD');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text(billMaster?.ownerName.toUpperCase(), startX + 10, startY + 105);
    pdf.text("CUSTOMER TRN: " + billMaster.trn, startX + 10, startY + 120);
    pdf.text("unit #" + billMaster.unitNumber, startX + 10, startY + 135);
    pdf.setFontSize(10);
    pdf.text(billMaster.clientName, startX + 10, startY + 150);
    pdf.text(stringIsNullOrEmpty(billMaster?.client?.buildingName, ',') + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.location, ',') + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.city, ',') + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.country, ','), startX + 10, startY + 165);
    pdf.setFontSize(10);
    const meterReadingTableHeading = 'Meter Read-Outs';
    pdf.text(meterReadingTableHeading.toUpperCase(), startX, firstTableEndY + 20);

    var pageContent = function (data) {
      // HEADER

      // FOOTER
      var str = "Page " + data.pageCount;
      pdf.setFontSize(10);
      var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
      pdf.text(str, data.settings.margin.left, pageHeight - 10); // showing current page number
    };

    pdf[autoTable](firstTableCol, firstTableRows, {
      startX: startX,
      startY: firstTableEndY + 35,
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { top: 180, left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: firstTableCol.length == 6 ? 120 : (firstTableCol.length == 4 ? 200 : 155),
          halign: 'center'
        },
        1: {
          cellWidth: firstTableCol.length == 6 ? 100 : (firstTableCol.length == 4 ? 135 : 125),
          halign: 'center'
        },
        2: {
          cellWidth: firstTableCol.length == 6 ? 100 : (firstTableCol.length == 4 ? 135 : 125),
          halign: 'center'
        },
        3: {
          cellWidth: firstTableCol.length == 4 ? 120 : 100,
          halign: 'center'
        },
        4: {
          cellWidth: 85,
          halign: 'center'
        },
        5: {
          cellWidth: 85,
          halign: 'center'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (firstTableRows) {
        firstTableRows.cell.styles.cellPadding = 1;
      }
    });

    if (seventhTableRows && seventhTableRows.length) {

      const secondTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
      pdf.setFontSize(10);
      const chargesBreakDownTableHeading = 'Charges Breakdown';
      pdf.text(chargesBreakDownTableHeading.toUpperCase(), startX, secondTableEndY + 15);

      pdf[autoTable](seventhTableCol, seventhTableRows, {
        startX: startX,
        startY: secondTableEndY + 30,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: startX },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            columnWidth: seventhTableCol.length == 6 ? 80 : (seventhTableCol.length == 4 ? 230 : (seventhTableCol.length == 7 ? 70 : 200)),
            halign: 'center'
          },
          1: {
            columnWidth: seventhTableCol.length == 6 ? 180 : (seventhTableCol.length == 4 ? 130 : (seventhTableCol.length == 7 ? 70 : 100)),
            halign: 'center'
          },
          2: {
            columnWidth: seventhTableCol.length == 6 ? 90 : (seventhTableCol.length == 4 ? 130 : (seventhTableCol.length == 7 ? 140 : 100)),
            halign: 'center'
          },
          3: {
            columnWidth: seventhTableCol.length == 6 ? 90 : (seventhTableCol.length == 4 ? 90 : (seventhTableCol.length == 7 ? 70 : 100)),
            halign: seventhTableCol.length == 4 ? 'right' : 'center'
          },
          4: {
            cellWidth: 75, //seventhTableCol.length == 6 ? 75 : 80,
            halign: seventhTableCol.length == 6 || seventhTableCol.length == 7 ? 'center' : 'right'
          },
          5: {
            cellWidth: 75,
            halign: seventhTableCol.length == 7 ? 'center' : 'right'
          },
          6: {
            cellWidth: 75,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (seventhTableRows) {
          seventhTableRows.cell.styles.cellPadding = 1;
        }
      });

    }

    const ThirdTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    let fourthTableEndY = ThirdTableEndY;

    if (isSlabTariff) {
      pdf[autoTable](ninthTableCol, ninthTableRows, {
        startX: startX,
        startY: ThirdTableEndY + 10,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: startX },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            columnWidth: ninthTableCol.length === 4 ? 250 : 120,
            halign: 'center'
          },
          1: {
            columnWidth: ninthTableCol.length === 4 ? 120 : 150,
            halign: 'center'
          },
          2: {
            columnWidth: ninthTableCol.length === 4 ? 120 : 120,
            halign: 'center'
          },
          3: {
            columnWidth: ninthTableCol.length === 4 ? 100 : 100,
            halign: ninthTableCol.length === 4 ? 'right' : 'center'
          },
          4: {
            columnWidth: 100,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (ninthTableRows) {
          ninthTableRows.cell.styles.cellPadding = 1;
          const tdElement: string = ninthTableRows.cell.raw;
          if (tdElement && typeof tdElement === 'string' && tdElement.startsWith('Unit')) {
            ninthTableRows.cell.styles.fontStyle = 'bold';
            ninthTableRows.cell.colSpan = ninthTableCol.length;
            ninthTableRows.cell.styles.halign = 'left';
          }
        }
      });

      fourthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    } else {
      pdf[autoTable](ninthTableCol, ninthTableRows, {
        startX: startX,
        startY: ThirdTableEndY + 10,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: startX },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            columnWidth: ninthTableCol.length === 6 ? 140 : 100,
            halign: 'center'
          },
          1: {
            columnWidth: ninthTableCol.length === 6 ? 100 : 100,
            halign: 'center'
          },
          2: {
            columnWidth: ninthTableCol.length === 6 ? 100 : 80,
            halign: 'center'
          },
          3: {
            columnWidth: ninthTableCol.length === 6 ? 100 : 80,
            halign: 'center'
          },
          4: {
            columnWidth: ninthTableCol.length === 6 ? 75 : 75,
            halign: 'center'
          },
          5: {
            columnWidth: ninthTableCol.length === 6 ? 75 : 75,
            halign: ninthTableCol.length === 6 ? 'right' : 'center'
          },
          6: {
            columnWidth: 80,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (ninthTableRows) {
          ninthTableRows.cell.styles.cellPadding = 1;
          const tdElement: string = ninthTableRows.cell.raw;
          if (tdElement && typeof tdElement === 'string' && tdElement.startsWith('Unit')) {
            ninthTableRows.cell.styles.fontStyle = 'bold';
            ninthTableRows.cell.colSpan = ninthTableCol.length;
            ninthTableRows.cell.styles.halign = 'left';
          }
        }
      });
      fourthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    }

    pdf.setTextColor(25, 118, 210);
    pdf.setFontSize(12);
    pdf.text("Bank Payment Account Details", startX, fourthTableEndY + 20);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text("Account Title: " + stringIsNullOrEmpty(billMaster?.client?.bankDetails[0]?.accountName), startX, fourthTableEndY + 40);
    pdf.text("Account #: " + stringIsNullOrEmpty(billMaster?.client?.bankDetails[0]?.accountNo), startX, fourthTableEndY + 50);
    pdf.text("IBAN #: " + stringIsNullOrEmpty(billMaster?.client?.bankDetails[0]?.ibanNumber), startX, fourthTableEndY + 60);
    pdf.text("Bank Name: " + stringIsNullOrEmpty(billMaster?.client?.bankDetails[0]?.bankName), startX, fourthTableEndY + 70);
    pdf.text("Swift Code: " + + stringIsNullOrEmpty(billMaster?.client?.bankDetails[0]?.swiftCode), startX, fourthTableEndY + 80);
    pdf.setFontSize(9);


    pdf[autoTable]('', sixthTableRows, {
      startX: 300,
      startY: fourthTableEndY + 20,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX + 310 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 180,
          halign: 'left'
        },
        1: {
          cellWidth: 100,
          halign: 'right'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center'
      },
      didParseCell: function (sixthTableRows) {
        sixthTableRows.cell.styles.cellPadding = 1.8;
      }
    });


    const fifthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    let pageHeight = pdf.internal.pageSize.height;

    if (fifthTableEndY + 110 > pageHeight - 190) {
      pdf.addPage();
      pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
      var str = "Page " + pdf.getNumberOfPages();
      pdf.setFontSize(10);
      pdf.text(str, 10, pageHeight - 10); // showing current page number
      pageHeight = 230;
    }
    if (billMaster?.client?.termsConditions[0]?.termsAndCondition) {
      pdf.setFillColor(241, 241, 244);
      pdf.rect(startX, pageHeight - 190, 590, 90, 'FD');
      pdf.setFillColor(0, 0, 0);
      pdf.setFontSize(9);
      pdf.text(billMaster?.client?.termsConditions[0]?.termsAndCondition.replace('{{ClientName}}', billMaster.client.clientName).replace('{{TRNNumber}}', billMaster.client.trnNo).replace('{{Currency}}', this.currency), startX + 30, pageHeight - 175);
    }
    pdf.setTextColor(0, 0, 0);
    pdf.line(5, pageHeight - 95, 607, pageHeight - 95);
    pdf.text("Notice :- Please tear and attach the slip  along with your payment", startX, pageHeight - 60);

    pdf[autoTable](thirdTableCol, thirdTableRows, {
      startX: startX,
      startY: pageHeight - 65,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 130,
          halign: 'center'
        },
        1: {
          cellWidth: 210,
          halign: 'center'
        },
        2: {
          cellWidth: 110,
          halign: 'right'
        },
        3: {
          cellWidth: 140,
          halign: 'right'
        },
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (thirdTableRows) {
        thirdTableRows.cell.styles.cellPadding = 1;
      }
    });

    var output = pdf.output('datauristring')
    this.pdfsToMerge.push(output);
  }


  downloadBillFormat3Report(billMaster: BillMaster) {
    const conversionValueTRHR: number = 0.284345;
    const spliter: string = ': ';
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: ListData[] = [];
    let thirdTableRows: any[] = [];
    let fourthTableRows: any[] = [];
    let fifthTableRows: any[] = [];
    let sixthTableRows: any[] = [];
    let seventhTableRows: any[] = [];
    let eighthTableRows: ListData[] = [];
    let ninthTableRows: any[] = [];
    let firstTableCol = [
      'Unit No',
      'Meter No',
      'Previous Reading',
      'Present Reading',
      'Consumption'];

    let thirdTableCol = [
      'Customer AccountNumber',
      'Billing Period',
      'Previous Due',
      'Total for current period'
    ];

    let seventhTableCol = [
      'Bill No',
      'Meter No',
      'Charges',
      'Consumption',
      'Measuring Unit',
      'Tariff',
      'Total'];

    fourthTableRows.push({
      label: 'Bill No',
      value: spliter + stringIsNullOrEmpty(billMaster.billNumber)
    }, {
      label: 'Date of issue',
      value: spliter + stringIsNullOrEmpty(billMaster.billDateLocal)
    }, {
      label: 'Due Date',
      value: spliter + stringIsNullOrEmpty(billMaster.dueDateLocal)
    }
    );

    fifthTableRows.push(
      {
        label: 'Billing period',
        value: spliter + `From: ${stringIsNullOrEmpty(billMaster.fromDateLocal)} To: ${stringIsNullOrEmpty(billMaster.toDateLocal)} `
      },
      {
        label: 'Customer Account',
        value: spliter + stringIsNullOrEmpty(billMaster.accountNumber)
      },
      {
        label: 'Customer Name',
        value: spliter + stringIsNullOrEmpty(billMaster.ownerName)
      },
      {
        label: 'Unit No',
        value: spliter + stringIsNullOrEmpty(billMaster.unitNumber)
      },
      {
        label: 'Address',
        value: spliter + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.address1)
      },
      {
        label: 'City',
        value: spliter + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.city)
      },
      {
        label: 'P.O Box',
        value: spliter + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.zipPostalCode)
      },
      {
        label: 'Phone number',
        value: spliter + stringIsNullOrEmpty(billMaster?.receiverDetails[0]?.phoneNumber)
      },
      {
        label: 'Fax Number',
        value: spliter
      },
      {
        label: 'Client',
        value: spliter + stringIsNullOrEmpty(billMaster?.client?.clientName)
      },
      {
        label: 'Client TRN',
        value: spliter + stringIsNullOrEmpty(billMaster?.client?.trnNo)
      });

    let isMultipleBillNumber = false;
    let isMultipleUnitNumber = false;
    let isMultipleTariffFormatExists = false;
    let isMultipleMeterNumber = false;

    if (billMaster && billMaster.bills && billMaster.bills.length) {
      const uniqueBillNumber = Array.from(new Set(billMaster.bills.map(x => x.billNumber)));
      const uniqueUnitNumber = Array.from(new Set(billMaster.bills.map(x => x.unitNumber)));
      const uniqueMeterNumber = Array.from(new Set(billMaster.bills.map(x => x.deviceName)));

      isMultipleBillNumber = uniqueBillNumber && uniqueBillNumber.length > 1 ? true : false;
      isMultipleUnitNumber = uniqueUnitNumber && uniqueUnitNumber.length > 1 ? true : false;
      isMultipleMeterNumber = uniqueMeterNumber && uniqueMeterNumber.length > 1 ? true : false;

      if (!isMultipleMeterNumber) {
        const itemIndex = seventhTableCol.findIndex(x => x === 'Meter No');
        if (itemIndex > -1) {
          seventhTableCol.splice(itemIndex, 1);
        }
      }

      if (!isMultipleBillNumber) {
        seventhTableCol.splice(0, 1);
      } else {
        fourthTableRows.splice(0, 1);
      }
      if (!isMultipleUnitNumber) {
        firstTableCol.splice(0, 1);
      } else {
        const itemIndex = fifthTableRows.findIndex(x => x.label === 'Unit No');
        fifthTableRows.splice(itemIndex, 1);
      }

      const tariffExistingBills = Array.from(new Set(billMaster.bills.filter(x => x.billTariffDetails && x.billTariffDetails.length)));
      const tariffNotExistingBills = Array.from(new Set(billMaster.bills.filter(x => !x.billTariffDetails || x.billTariffDetails.length === 0)));

      if (tariffNotExistingBills && tariffNotExistingBills.length && tariffNotExistingBills && tariffNotExistingBills.length) {
        isMultipleTariffFormatExists = true;
      }
      if (tariffNotExistingBills && tariffNotExistingBills.length && !tariffExistingBills) {
        isMultipleTariffFormatExists = true;
      }
      if (tariffExistingBills && tariffExistingBills.length && (!tariffNotExistingBills || tariffNotExistingBills.length == 0)) {
        for (let a = 0; a < tariffExistingBills.length; a++) {
          const tariffNotExistingItem = tariffExistingBills[a].billTransactions.find(x => !x.tariffId);
          if (tariffNotExistingItem) {
            isMultipleTariffFormatExists = true;
            break;
          }
        };
      }
    }

    if (!isMultipleTariffFormatExists) {
      const tariffIndex = seventhTableCol.findIndex(x => x === 'Tariff');
      if (tariffIndex) {
        seventhTableCol.splice(tariffIndex, 1);
      }
    }

    for (let a = 0; a < billMaster.bills.length; a++) {
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      if (isMultipleUnitNumber) {
        row.push(billMaster.unitNumber)
      }
      row.push(billMaster.bills[a].deviceName)
      row.push(this.decimalPipe.transform(billMaster.bills[a].previousReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      row.push(this.decimalPipe.transform(billMaster.bills[a].presentReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      if (billMaster.bills[a].isDifferentiateBill) {
        if (isMultipleMeterNumber) {
          isMultipleMeterNumber = false;
          const itemIndex = seventhTableCol.findIndex(x => x === 'Meter No');
          if (itemIndex > -1) {
            seventhTableCol.splice(itemIndex, 1);
          }
        }
        const previousReading: number = billMaster.bills[a].previousReading;
        const presentReading: number = billMaster.bills[a].presentReading;
        const consumption: number = presentReading - previousReading;
        row.push(this.decimalPipe.transform(consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      } else {
        row.push(this.decimalPipe.transform(billMaster.bills[a].consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      }
      if (billMaster.bills[a].utilityType === 'BTU' && billMaster.bills[a].billTransactions && billMaster.bills[a].billTransactions.length && billMaster.bills[a].billTransactions.findIndex(x => x.measuringUnitId && x.measuringUnitId === 2) > -1) {
        if (a == 0) {
          firstTableCol.push('Consumption TR-HR');
        }
        const consumptionTRHR: number = billMaster.bills[a].consumption * conversionValueTRHR;
        row.push(this.decimalPipe.transform(consumptionTRHR, this.consumptionRoundOffFormat))
      }

      firstTableRows.push(row);
      row = [];
    }

    let totalAmount = 0;

    for (let a = 0; a < billMaster.bills.length; a++) {
      const bill = billMaster.bills[a];
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      for (let b = 0; b < bill.billTransactions.length; b++) {
        if (isMultipleBillNumber) {
          row.push(bill.billNumber);
        }
        if (isMultipleMeterNumber) {
          row.push(bill.deviceName);
        }
        row.push(bill.billTransactions[b].headDisplay)
        if (bill.utilityType === "BTU" && bill.billTransactions && bill.billTransactions.length && bill.billTransactions[b] && bill.billTransactions[b].measuringUnitId && bill.billTransactions[b].measuringUnitId === 2) {
          const consumptionTRHR: number = bill.consumption * conversionValueTRHR;
          row.push(this.decimalPipe.transform(consumptionTRHR, this.consumptionRoundOffFormat))
          row.push('TR-HR')
          if (isMultipleTariffFormatExists && bill.billTariffDetails && bill.billTariffDetails.length && bill.billTransactions[b].tariffId) {
            row.push('-')
          } else if (isMultipleTariffFormatExists) {
            row.push(bill.billTransactions[b].rate)
          }
        } else {
          row.push(this.decimalPipe.transform(bill.consumption, this.consumptionRoundOffFormat))
          row.push(bill.measuringUnit)
          if (isMultipleTariffFormatExists && bill.billTariffDetails && bill.billTariffDetails.length && bill.billTransactions[b].tariffId) {
            row.push('-')
          } else if (isMultipleTariffFormatExists) {
            row.push(bill.billTransactions[b].rate)
          }
        }
        row.push(this.currencyPipe.transform(bill.billTransactions[b].headAmount, this.currency.toString(), true, this.roundFormat))
        seventhTableRows.push(row);
        row = [];
        totalAmount += bill.billTransactions[b].headAmount;
      }
    }

    row.push(billMaster.accountNumber);
    row.push(billMaster.fromDateLocal + '-' + billMaster.toDateLocal);
    row.push(this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat));
    row.push(billMaster.billAmountLocal);
    thirdTableRows.push(row);

    const title: string = 'Invoice';

    let meterNumber = '';
    billMaster.bills.forEach(x => {
      meterNumber += x.deviceName + ','
    });

    let isMultipleBillTariffDeatils = false;
    const billTariffDetails = Array.from(new Set(billMaster.bills.map(x => x.billTariffDetails)));
    if (billTariffDetails && billTariffDetails.length > 1) {
      isMultipleBillTariffDeatils = true;
    }

    let ninthTableCol = [];
    let isSlabTariff = false;
    let unitMeterNumbers: string[] = [];
    row = [];
    if (billMaster && billMaster.bills && billMaster.bills.length) {
      billMaster.bills.forEach(bill => {
        this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', bill.utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
        unitMeterNumbers = [];
        let unitMeterNumber: string = 'Unit Number : ' + bill.unitNumber + ' - Meter Number : ' + bill.deviceName;
        if (bill.billTariffDetails && bill.billTariffDetails.length) {
          for (let b = 0; b < bill.billTariffDetails.length; b++) {

            if (bill.billTariffDetails[b].slabSettingsId && bill.billTariffDetails[b].slabSettingsId > 0) {
              let season: string = bill.billTariffDetails[b].season;
              if (Number(bill.billTariffDetails[b].peakType) < Number(bill.billTariffDetails[b].consumption)) {
                const consumptionMax = bill.billTariffDetails[b].consumption;
                const consumptionMin = bill.billTariffDetails[b].peakType;
                season = consumptionMin + ' - ' + consumptionMax;
              }
              if (b == 0) {
                isSlabTariff = true;
                ninthTableCol = [
                  'Slab',
                  'Consumption',
                  'Rate',
                  'Amount '];
              }
              if (unitMeterNumbers && unitMeterNumbers.length) {
                const itemExists = unitMeterNumbers.find(x => x === unitMeterNumber);
                if (!itemExists) {
                  this.createUnitMeterNumberRow(unitMeterNumber, ninthTableCol.length, ninthTableRows);
                }
              } else {
                unitMeterNumbers.push(unitMeterNumber);
                this.createUnitMeterNumberRow(unitMeterNumber, ninthTableCol.length, ninthTableRows);
              }
              row.push(season);
              row.push(this.decimalPipe.transform(bill.billTariffDetails[b].consumption, this.consumptionRoundOffFormat));
              row.push(bill.billTariffDetails[b].rate);
              row.push(this.currencyPipe.transform(bill.billTariffDetails[b].amount, this.currency.toString(), true, this.roundFormat));
            } else if (bill.billTariffDetails[b].slabSettingsId == 0) {
              if (b == 0) {
                ninthTableCol = [
                  'Season',
                  'Week Type',
                  'Peak Type',
                  'Consumption',
                  'Rate',
                  'Amount '];
              }
              if (unitMeterNumbers && unitMeterNumbers.length) {
                const itemExists = unitMeterNumbers.find(x => x === unitMeterNumber);
                if (!itemExists) {
                  this.createUnitMeterNumberRow(unitMeterNumber, ninthTableCol.length, ninthTableRows);
                }
              } else {
                unitMeterNumbers.push(unitMeterNumber);
                this.createUnitMeterNumberRow(unitMeterNumber, ninthTableCol.length, ninthTableRows);
              }
              row.push(bill.billTariffDetails[b].season);
              row.push(bill.billTariffDetails[b].weekType);
              row.push(bill.billTariffDetails[b].peakType);
              row.push(this.decimalPipe.transform(bill.billTariffDetails[b].consumption, this.consumptionRoundOffFormat));
              row.push(bill.billTariffDetails[b].rate);
              row.push(this.currencyPipe.transform(bill.billTariffDetails[b].amount, this.currency.toString(), true, this.roundFormat));
            }
            ninthTableRows.push(row);
            row = [];
          };
        }
      });
    }

    let otherCharges: ListItem[] = [];

    // billMaster.bills.forEach(bill => {
    //   if (bill.transactions && bill.transactions.length) {
    //     const restrictArray: string[] = ['consumption', 'consumptioncharge'];
    //     bill.transactions.forEach(transaction => {
    //       if (!restrictArray.includes(transaction.headDisplay.toLowerCase())) {
    //         const existingitem = otherCharges.find(x => x.label === transaction.headDisplay);
    //         if (existingitem) {
    //           existingitem.value += transaction.headAmount;
    //         } else {
    //           otherCharges.push({ label: transaction.headDisplay, value: transaction.headAmount });
    //         }
    //       }
    //     });
    //   }
    // });


    if (billMaster.billCharges && billMaster.billCharges.length) {
      billMaster.billCharges.sort((a, b) => a.position - b.position).forEach(billCharge => {
        if (billCharge.headDisplay !== 'VAT') {
          const existingitem = otherCharges.find(x => x.label === billCharge.headDisplay);
          if (existingitem) {
            existingitem.value += billCharge.headAmount;
          } else {
            otherCharges.push({ label: billCharge.headDisplay, value: billCharge.headAmount });
          }
        }
      });
    }

    otherCharges.forEach(x => {
      secondTableRows.push({ label: x.label, value: this.currencyPipe.transform(x.value, this.currency.toString(), true, this.roundFormat) });
    });

    if (billMaster.billTaxDetails && billMaster.billTaxDetails.length) {
      billMaster.billTaxDetails.forEach(billTaxDetail => {
        secondTableRows.push({ label: billTaxDetail.taxDisplayName, value: this.currencyPipe.transform(billTaxDetail.taxAmount, this.currency.toString(), true, this.roundFormat) });
      });
    }

    secondTableRows.push(
      {
        label: 'Total consumption charge for Current Period',
        value: this.currencyPipe.transform(totalAmount, this.currency.toString(), true, this.roundFormat)
      });

    if (billMaster.billDiscounts && billMaster.billDiscounts.length) {
      let discountAmount = 0;
      billMaster.billDiscounts.forEach(billDiscount => {
        discountAmount += billDiscount.headAmount;
      });
      secondTableRows.push({ label: 'Total Discount', value: this.currencyPipe.transform(discountAmount, this.currency.toString(), true, this.roundFormat) });
    }

    secondTableRows.push(
      {
        label: 'Previous Outstanding Amount',
        value: this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
      });

    eighthTableRows.push({
      label: 'Total for Current Period',
      value: this.currencyPipe.transform(billMaster.billAmount + billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
    });

    this.getNewBillFormat3Report(firstTableCol, firstTableRows, secondTableRows, thirdTableCol, thirdTableRows, fourthTableRows, fifthTableRows, sixthTableRows, title, seventhTableCol, seventhTableRows, billMaster, eighthTableRows, ninthTableCol, ninthTableRows, isSlabTariff);
  }

  // New Bill Print Format added 27/05/2021
  getNewBillFormat3Report(firstTableCol: any[], firstTableRows: any[], secondTableRows: any[], thirdTableCol: any[], thirdTableRows: any[], fourthTableRows: any[], fifthTableRows: any[], sixthTableRows: any[], title: string, seventhTableCol: any[], seventhTableRows: any[], billMaster: BillMaster, eighthTableRows: any[], ninthTableCol: any[], ninthTableRows: any[], isSlabTariff: boolean = false) {

    const totalPagesExp = "1";
    let pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter"
    });

    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    let startX = 10;
    let startY = 15;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.setFont("Cambria");
    pdf.text("Billing Statement".toUpperCase(), 10, startY + 5);
    this.addImage(pdf, billMaster);
    pdf.setLineWidth(.1);
    const autoTable = 'autoTable';
    pdf[autoTable]('', fourthTableRows, {
      startX: 10,
      startY: startY + 20,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: 15 },
      theme: 'plain',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 100,
          halign: 'left'
        },
        1: {
          cellWidth: 190,
          halign: 'left'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center'
      },
      didParseCell: function (fourthTableRows) {
        fourthTableRows.cell.styles.cellPadding = 1.5;
      }
    });

    const firstTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf[autoTable]('', fifthTableRows, {
      startX: 10,
      startY: firstTableEndY,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: 15 },
      theme: 'plain',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 100,
          halign: 'left'
        },
        1: {
          cellWidth: 380,
          halign: 'left'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      didParseCell: function (fifthTableRows) {
        fifthTableRows.cell.styles.cellPadding = 1.5;
      }
    });


    var pageContent = function (data) {
      // HEADER

      // FOOTER
      var str = "Page " + data.pageCount;
      // Total page number plugin only available in jspdf v1.0+
      if (typeof pdf.putTotalPages === 'function') {
        str = str + " of " + totalPagesExp;
        pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
      }
      pdf.setFontSize(9);
      var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
      pdf.text(str, data.settings.margin.left, pageHeight - 10); // showing current page number
    };


    const secondTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf.setFont("Cambria");
    pdf.setFontSize(10);
    const meterReadingTableHeading = 'Meter Read-Outs';
    pdf.text(meterReadingTableHeading.toUpperCase(), startX, secondTableEndY + 15);

    pdf[autoTable](firstTableCol, firstTableRows, {
      startX: 10,
      startY: secondTableEndY + 30,
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { top: 180, left: 10 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: firstTableCol.length == 6 ? 120 : (firstTableCol.length == 4 ? 200 : 155),
          halign: 'center'
        },
        1: {
          cellWidth: firstTableCol.length == 6 ? 100 : firstTableCol.length == 4 ? 135 : 125,
          halign: 'center'
        },
        2: {
          cellWidth: firstTableCol.length == 6 ? 100 : firstTableCol.length == 4 ? 135 : 125,
          halign: 'center'
        },
        3: {
          cellWidth: firstTableCol.length == 4 ? 120 : 100,
          halign: 'center'
        },
        4: {
          cellWidth: 85,
          halign: 'center'
        },
        5: {
          cellWidth: 85,
          halign: 'center'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (firstTableRows) {
        firstTableRows.cell.styles.cellPadding = 1;
      }
    });


    const ThirdTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    if (seventhTableRows && seventhTableRows.length) {
      pdf.setFontSize(10);
      const chargesBreakDownTableHeading = 'Charges Breakdown';
      pdf.text(chargesBreakDownTableHeading.toUpperCase(), startX, ThirdTableEndY + 15);

      pdf[autoTable](seventhTableCol, seventhTableRows, {
        startX: 10,
        startY: ThirdTableEndY + 30,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: 10 },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            columnWidth: seventhTableCol.length == 6 ? 80 : (seventhTableCol.length == 4 ? 230 : (seventhTableCol.length === 7 ? 70 : 200)),
            halign: 'center'
          },
          1: {
            columnWidth: seventhTableCol.length == 6 ? 180 : (seventhTableCol.length == 4 ? 130 : (seventhTableCol.length === 7 ? 70 : 100)),
            halign: 'center'
          },
          2: {
            columnWidth: seventhTableCol.length == 6 ? 90 : (seventhTableCol.length == 4 ? 130 : (seventhTableCol.length === 7 ? 140 : 100)),
            halign: 'center'
          },
          3: {
            columnWidth: seventhTableCol.length == 6 ? 90 : (seventhTableCol.length == 4 ? 100 : (seventhTableCol.length === 7 ? 70 : 100)),
            halign: seventhTableCol.length == 4 ? 'right' : 'center'
          },
          4: {
            cellWidth: seventhTableCol.length == 5 ? 90 : 65,
            halign: seventhTableCol.length == 6 || seventhTableCol.length == 7 ? 'center' : 'right'
          },
          5: {
            cellWidth: 50,
            halign: seventhTableCol.length == 7 ? 'center' : 'right'
          },
          6: {
            cellWidth: 75,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (seventhTableRows) {
          seventhTableRows.cell.styles.cellPadding = 1;
        }
      });
    }
    const fourthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    let fifthTableEndY = fourthTableEndY;
    if (isSlabTariff) {
      pdf[autoTable](ninthTableCol, ninthTableRows, {
        startX: 10,
        startY: fourthTableEndY + 10,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: 20 },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            columnWidth: ninthTableCol.length === 4 ? 250 : 120,
            halign: 'center'
          },
          1: {
            columnWidth: ninthTableCol.length === 4 ? 120 : 150,
            halign: 'center'
          },
          2: {
            columnWidth: ninthTableCol.length === 4 ? 120 : 120,
            halign: 'center'
          },
          3: {
            columnWidth: ninthTableCol.length === 4 ? 100 : 100,
            halign: ninthTableCol.length === 4 ? 'right' : 'center'
          },
          4: {
            columnWidth: 100,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (ninthTableRows) {
          ninthTableRows.cell.styles.cellPadding = 1;
          const tdElement: string = ninthTableRows.cell.raw;
          if (tdElement && typeof tdElement === 'string' && tdElement.startsWith('Unit')) {
            ninthTableRows.cell.styles.fontStyle = 'bold';
            ninthTableRows.cell.colSpan = ninthTableCol.length;
            ninthTableRows.cell.styles.halign = 'left';
          }
        }
      });

      fifthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    } else {
      pdf[autoTable](ninthTableCol, ninthTableRows, {
        startX: 10,
        startY: fourthTableEndY + 10,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: 10 },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            columnWidth: ninthTableCol.length === 6 ? 140 : 100,
            halign: 'center'
          },
          1: {
            columnWidth: ninthTableCol.length === 6 ? 100 : 100,
            halign: 'center'
          },
          2: {
            columnWidth: ninthTableCol.length === 6 ? 100 : 80,
            halign: 'center'
          },
          3: {
            columnWidth: ninthTableCol.length === 6 ? 100 : 80,
            halign: 'center'
          },
          4: {
            columnWidth: ninthTableCol.length === 6 ? 75 : 75,
            halign: 'center'
          },
          5: {
            columnWidth: ninthTableCol.length === 6 ? 75 : 75,
            halign: ninthTableCol.length === 6 ? 'right' : 'center'
          },
          6: {
            columnWidth: 80,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (ninthTableRows) {
          ninthTableRows.cell.styles.cellPadding = 1;
          const tdElement: string = ninthTableRows.cell.raw;
          if (tdElement && typeof tdElement === 'string' && tdElement.startsWith('Unit')) {
            ninthTableRows.cell.styles.fontStyle = 'bold';
            ninthTableRows.cell.colSpan = ninthTableCol.length;
            ninthTableRows.cell.styles.halign = 'left';
          }
        }
      });

      fifthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    }
    pdf[autoTable]('', secondTableRows, {
      startX: 10,
      startY: fifthTableEndY + 10,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { bottom: startY + 20, left: 250 },
      theme: 'plain',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 250,
          fontStyle: "italic"
        },
        1: {
          cellWidth: 90
        }
      },
      didParseCell: function (secondTableRows) {
        const col = secondTableRows.column.index;
        if (col == 1) {
          secondTableRows.cell.styles.halign = 'right';
        }
        secondTableRows.cell.styles.cellPadding = 1.5;
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    });

    const sixthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf.line(5, sixthTableEndY + 10, 607, sixthTableEndY + 10);

    pdf[autoTable]('', eighthTableRows, {
      startX: 10,
      startY: sixthTableEndY + 20,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { bottom: startY + 20, left: 250 },
      theme: 'plain',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 250,
          fontStyle: "italic"
        },
        1: {
          cellWidth: 90
        }
      },
      didParseCell: function (secondTableRows) {
        const col = secondTableRows.column.index;
        if (col == 1) {
          secondTableRows.cell.styles.halign = 'right';
        }
        secondTableRows.cell.styles.cellPadding = 1.5;
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    });

    const seventhTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    pdf.line(5, seventhTableEndY + 10, 607, seventhTableEndY + 10);

    let pageHeight = pdf.internal.pageSize.height;

    if (seventhTableEndY + 110 > pageHeight - 190) {
      pdf.addPage();
      pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
      pageHeight = 230;
    }
    if (billMaster?.client?.termsConditions[0]?.termsAndCondition) {
      pdf.setFillColor(241, 241, 244);
      pdf.rect(10, pageHeight - 190, 590, 90, 'FD');
      pdf.setFillColor(0, 0, 0);
      pdf.setFontSize(9);
      pdf.text(billMaster?.client?.termsConditions[0]?.termsAndCondition.replace('{{ClientName}}', billMaster.client.clientName).replace('{{TRNNumber}}', billMaster.client.trnNo).replace('{{Currency}}', this.currency), startX + 20, pageHeight - 175);
    }
    pdf.setTextColor(0, 0, 0);
    pdf.line(5, pageHeight - 95, 607, pageHeight - 95);
    pdf.text("Notice :- Please tear and attach the slip  along with your payment", startX, pageHeight - 80);

    pdf[autoTable](thirdTableCol, thirdTableRows, {
      startX: 10,
      startY: pageHeight - 65,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: 10 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 130,
          halign: 'center'
        },
        1: {
          cellWidth: 210,
          halign: 'center'
        },
        2: {
          cellWidth: 110,
          halign: 'right'
        },
        3: {
          cellWidth: 140,
          halign: 'right'
        },
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (thirdTableRows) {
        thirdTableRows.cell.styles.cellPadding = 1;
      }
    });

    var output = pdf.output('datauristring')
    this.pdfsToMerge.push(output);
  }


  downloadBillFormat1LargeReport(billMaster: BillMaster) {
    const conversionValueTRHR: number = 0.284345;
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: ListItem[] = [];
    let thirdTableRows: any[] = [];
    let fourthTableRows: any[] = [];
    let fifthTableRows: any[] = [];
    let sixthTableRows: any[] = [];
    let seventhTableRows: any[] = [];
    let eighthTableRows: any[] = [];
    let ninthTableRows: any[] = [];
    let firstTableCol = [
      'Unit No',
      'Meter No',
      'Previous Reading',
      'Present Reading',
      'Consumption'];

    let thirdTableCol = [
      'Customer AccountNumber',
      'Billing Period',
      'Previous Due',
      'Total for current period'
    ]; // initialization for headers

    let seventhTableCol = [
      'Bill No',
      'Meter No',
      'Charges',
      'Consumption',
      'Measuring Unit',
      'Tariff',
      'Total'];


    let meterNumber = '';
    billMaster.bills.forEach(x => {
      meterNumber += x.deviceName + ','
    });

    fifthTableRows.push(
      {
        label: 'Account Number:',
        value: billMaster.accountNumber
      },
      {
        label: 'Meter Number:',
        value: meterNumber.slice(0, -1)
      },
      {
        label: 'Unit Number:',
        value: billMaster.unitNumber
      },
      {
        label: 'Billing Date:',
        value: billMaster.billDateLocal
      },
      {
        label: 'Due Date:',
        value: billMaster.dueDateLocal
      },
      {
        label: 'Bill Period',
        value: `${stringIsNullOrEmpty(billMaster.fromDateLocal)} - ${stringIsNullOrEmpty(billMaster.toDateLocal)} `
      }
    );

    let isMultipleBillNumber = false;
    let isMultipleUnitNumber = false;
    let isMultipleTariffFormatExists = false;
    let isMultipleMeterNumber = false;

    if (billMaster && billMaster.bills && billMaster.bills.length) {
      const uniqueBillNumber = Array.from(new Set(billMaster.bills.map(x => x.billNumber)));
      const uniqueUnitNumber = Array.from(new Set(billMaster.bills.map(x => x.unitNumber)));
      const uniqueMeterNumber = Array.from(new Set(billMaster.bills.map(x => x.deviceName)));

      isMultipleBillNumber = uniqueBillNumber && uniqueBillNumber.length > 1 ? true : false;
      isMultipleUnitNumber = uniqueUnitNumber && uniqueUnitNumber.length > 1 ? true : false;
      isMultipleMeterNumber = uniqueMeterNumber && uniqueMeterNumber.length > 1 ? true : false;

      if (!isMultipleMeterNumber) {
        const itemIndex = seventhTableCol.findIndex(x => x === 'Meter No');
        if (itemIndex > -1) {
          seventhTableCol.splice(itemIndex, 1);
        }
      }

      if (!isMultipleBillNumber) {
        seventhTableCol.splice(0, 1);
      }
      if (!isMultipleUnitNumber) {
        firstTableCol.splice(0, 1);
      } else {
        const itemIndex = fifthTableRows.findIndex(x => x.label === 'Unit Number:');
        fifthTableRows.splice(itemIndex, 1);
      }
      const tariffExistingBills = Array.from(new Set(billMaster.bills.filter(x => x.billTariffDetails && x.billTariffDetails.length)));
      const tariffNotExistingBills = Array.from(new Set(billMaster.bills.filter(x => !x.billTariffDetails || x.billTariffDetails.length === 0)));

      if (tariffNotExistingBills && tariffNotExistingBills.length && tariffNotExistingBills && tariffNotExistingBills.length) {
        isMultipleTariffFormatExists = true;
      }
      if (tariffNotExistingBills && tariffNotExistingBills.length && !tariffExistingBills) {
        isMultipleTariffFormatExists = true;
      }
      if (tariffExistingBills && tariffExistingBills.length && (!tariffNotExistingBills || tariffNotExistingBills.length == 0)) {
        for (let a = 0; a < tariffExistingBills.length; a++) {
          const tariffNotExistingItem = tariffExistingBills[a].billTransactions.find(x => !x.tariffId);
          if (tariffNotExistingItem) {
            isMultipleTariffFormatExists = true;
            break;
          }
        };
      }
    }

    if (!isMultipleTariffFormatExists) {
      const tariffIndex = seventhTableCol.findIndex(x => x === 'Tariff');
      if (tariffIndex) {
        seventhTableCol.splice(tariffIndex, 1);
      }
    }

    for (let a = 0; a < billMaster.bills.length; a++) {
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      if (isMultipleUnitNumber) {
        row.push(billMaster.bills[a].unitNumber)
      }
      row.push(billMaster.bills[a].deviceName)
      row.push(this.decimalPipe.transform(billMaster.bills[a].previousReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      row.push(this.decimalPipe.transform(billMaster.bills[a].presentReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      if (billMaster.bills[a].isDifferentiateBill) {

        if (isMultipleMeterNumber) {
          isMultipleMeterNumber = false;
          const itemIndex = seventhTableCol.findIndex(x => x === 'Meter No');
          if (itemIndex > -1) {
            seventhTableCol.splice(itemIndex, 1);
          }
        }

        const previousReading: number = billMaster.bills[a].previousReading;
        const presentReading: number = billMaster.bills[a].presentReading;
        const consumption: number = presentReading - previousReading;
        row.push(this.decimalPipe.transform(consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      } else {
        row.push(this.decimalPipe.transform(billMaster.bills[a].consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      }
      if (billMaster.bills[a].utilityType === 'BTU' && billMaster.bills[a].billTransactions && billMaster.bills[a].billTransactions.length && billMaster.bills[a].billTransactions.findIndex(x => x.measuringUnitId && x.measuringUnitId === 2) > -1) {
        if (a == 0) {
          firstTableCol.push('Consumption TR-HR');
        }
        const consumptionTRHR: number = billMaster.bills[a].consumption * conversionValueTRHR;
        row.push(this.decimalPipe.transform(consumptionTRHR, this.consumptionRoundOffFormat))
      }
      firstTableRows.push(row);
      row = [];
    }

    let totalAmount = 0;

    for (let a = 0; a < billMaster.bills.length; a++) {
      const bill = billMaster.bills[a];
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      for (let b = 0; b < bill.billTransactions.length; b++) {
        if (isMultipleBillNumber) {
          row.push(bill.billNumber);
        }
        if (isMultipleMeterNumber) {
          row.push(bill.deviceName);
        }
        row.push(bill.billTransactions[b].headDisplay)
        if (bill.utilityType === "BTU" && bill.billTransactions && bill.billTransactions.length && bill.billTransactions[b] && bill.billTransactions[b].measuringUnitId && bill.billTransactions[b].measuringUnitId === 2) {
          const consumptionTRHR: number = bill.consumption * conversionValueTRHR;
          row.push(this.decimalPipe.transform(consumptionTRHR, this.consumptionRoundOffFormat))
          row.push('TR-HR')
          if (isMultipleTariffFormatExists && bill.billTariffDetails && bill.billTariffDetails.length && bill.billTransactions[b].tariffId) {
            row.push('-')
          } else if (isMultipleTariffFormatExists) {
            row.push(bill.billTransactions[b].rate)
          }
        } else {
          row.push(this.decimalPipe.transform(bill.consumption, this.consumptionRoundOffFormat))
          row.push(bill.measuringUnit)
          if (isMultipleTariffFormatExists && bill.billTariffDetails && bill.billTariffDetails.length && bill.billTransactions[b].tariffId) {
            row.push('-')
          } else if (isMultipleTariffFormatExists) {
            row.push(bill.billTransactions[b].rate)
          }
        }
        row.push(this.currencyPipe.transform(bill.billTransactions[b].headAmount, this.currency.toString(), true, this.roundFormat))
        seventhTableRows.push(row);
        row = [];
        totalAmount += bill.billTransactions[b].headAmount;
      }
    }

    row.push(billMaster.accountNumber);
    row.push(billMaster.fromDateLocal + '-' + billMaster.toDateLocal);
    row.push(this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat));
    row.push(billMaster.billAmountLocal);
    thirdTableRows.push(row);

    const title: string = 'Invoice';

    if (billMaster.billCharges && billMaster.billCharges.length) {
      billMaster.billCharges.sort((a, b) => a.position - b.position).forEach(billCharge => {
        if (billCharge.headDisplay !== 'VAT') {
          const existingitem = secondTableRows.find(x => x.label === billCharge.headDisplay);
          if (existingitem) {
            existingitem.value += billCharge.headAmount;
          } else {
            secondTableRows.push({ label: billCharge.headDisplay, value: billCharge.headAmount });
          }
        }
      });

      secondTableRows.forEach(x => {
        sixthTableRows.push({ label: x.label, value: this.currencyPipe.transform(x.value, this.currency.toString(), true, this.roundFormat) });
      })
    }
    sixthTableRows.push(
      {
        label: 'Current Month Total Consumption Charge:',
        value: this.currencyPipe.transform(totalAmount, this.currency.toString(), true, this.roundFormat)
      });

    if (billMaster.billDiscounts && billMaster.billDiscounts.length) {
      let discountAmount = 0;
      billMaster.billDiscounts.forEach(billDiscount => {
        discountAmount += billDiscount.headAmount;
      });
      sixthTableRows.push({ label: 'Total Discount', value: this.currencyPipe.transform(discountAmount, this.currency.toString(), true, this.roundFormat) });
    }

    if (billMaster.billTaxDetails && billMaster.billTaxDetails.length) {
      billMaster.billTaxDetails.forEach(billTaxDetail => {
        sixthTableRows.push(
          {
            label: billTaxDetail.taxDisplayName,
            value: this.currencyPipe.transform(billTaxDetail.taxAmount, this.currency.toString(), true, this.roundFormat)
          });
      });
    } else {
      sixthTableRows.push(
        {
          label: 'TAX:',
          value: this.currencyPipe.transform(0, this.currency.toString(), true, this.roundFormat)
        });
    }

    sixthTableRows.push(
      {
        label: 'Current Month + TAX:',
        value: billMaster.billAmountLocal
      },
      {
        label: 'Previous Bill Outstanding Balance:',
        value: this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
      },
      {
        label: 'Total Due incl TAX:',
        value: this.currencyPipe.transform(billMaster.billAmount + billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
      }
    );

    let isMultipleBillTariffDeatils = false;
    const billTariffDetails = Array.from(new Set(billMaster.bills.map(x => x.billTariffDetails)));
    if (billTariffDetails && billTariffDetails.length > 1) {
      isMultipleBillTariffDeatils = true;
    }

    let ninthTableCol = [];
    let isSlabTariff = false;
    let unitMeterNumbers: string[] = [];
    row = [];
    if (billMaster && billMaster.bills && billMaster.bills.length) {
      billMaster.bills.forEach(bill => {
        this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', bill.utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
        unitMeterNumbers = [];
        let unitMeterNumber: string = 'Unit Number : ' + bill.unitNumber + ' - Meter Number : ' + bill.deviceName;
        if (bill.billTariffDetails && bill.billTariffDetails.length) {
          for (let b = 0; b < bill.billTariffDetails.length; b++) {
            if (bill.billTariffDetails[b].slabSettingsId && bill.billTariffDetails[b].slabSettingsId > 0) {
              let season: string = bill.billTariffDetails[b].season;
              if (Number(bill.billTariffDetails[b].peakType) < Number(bill.billTariffDetails[b].consumption)) {
                const consumptionMax = bill.billTariffDetails[b].consumption;
                const consumptionMin = bill.billTariffDetails[b].peakType;
                season = consumptionMin + ' - ' + consumptionMax;
              }
              if (b == 0) {
                isSlabTariff = true;
                ninthTableCol = [
                  'Slab',
                  'Consumption',
                  'Rate',
                  'Amount '];
              }
              if (unitMeterNumbers && unitMeterNumbers.length) {
                const itemExists = unitMeterNumbers.find(x => x === unitMeterNumber);
                if (!itemExists) {
                  this.createUnitMeterNumberRow(unitMeterNumber, ninthTableCol.length, ninthTableRows);
                }
              } else {
                unitMeterNumbers.push(unitMeterNumber);
                this.createUnitMeterNumberRow(unitMeterNumber, ninthTableCol.length, ninthTableRows);
              }
              row.push(season);
              row.push(this.decimalPipe.transform(bill.billTariffDetails[b].consumption, this.consumptionRoundOffFormat));
              row.push(bill.billTariffDetails[b].rate);
              row.push(this.currencyPipe.transform(bill.billTariffDetails[b].amount, this.currency.toString(), true, this.roundFormat));
            } else if (bill.billTariffDetails[b].slabSettingsId == 0) {
              if (b == 0) {
                ninthTableCol = [
                  'Season',
                  'Week Type',
                  'Peak Type',
                  'Consumption',
                  'Rate',
                  'Amount '];
              }
              if (unitMeterNumbers && unitMeterNumbers.length) {
                const itemExists = unitMeterNumbers.find(x => x === unitMeterNumber);
                if (!itemExists) {
                  this.createUnitMeterNumberRow(unitMeterNumber, ninthTableCol.length, ninthTableRows);
                }
              } else {
                unitMeterNumbers.push(unitMeterNumber);
                this.createUnitMeterNumberRow(unitMeterNumber, ninthTableCol.length, ninthTableRows);
              }
              row.push(bill.billTariffDetails[b].season);
              row.push(bill.billTariffDetails[b].weekType);
              row.push(bill.billTariffDetails[b].peakType);
              row.push(this.decimalPipe.transform(bill.billTariffDetails[b].consumption, this.consumptionRoundOffFormat));
              row.push(bill.billTariffDetails[b].rate);
              row.push(this.currencyPipe.transform(bill.billTariffDetails[b].amount, this.currency.toString(), true, this.roundFormat));
            }
            ninthTableRows.push(row);
            row = [];
          };
        }
      });
    }
    this.getNewBillFormat1LargeReport(firstTableCol, firstTableRows, secondTableRows, thirdTableCol, thirdTableRows, fourthTableRows, fifthTableRows, sixthTableRows, title, seventhTableCol, seventhTableRows, billMaster, eighthTableRows, ninthTableCol, ninthTableRows, isSlabTariff);
  }

  // New Bill Print Format added 27/05/2021
  getNewBillFormat1LargeReport(firstTableCol: any[], firstTableRows: any[], secondTableRows: any[], thirdTableCol: any[], thirdTableRows: any[], fourthTableRows: any[], fifthTableRows: any[], sixthTableRows: any[], title: string, seventhTableCol: any[], seventhTableRows: any[], billMaster: BillMaster, eighthTableRows: any[], ninthTableCol: any[], ninthTableRows: any[], isSlabTariff: boolean = false) {

    const totalPagesExp = "1";
    let pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter"
    });

    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    let startX = 10;
    let startY = 30;
    pdf.setFontSize(30);
    pdf = this.addImage(pdf, billMaster);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.setFont("Cambria", 'bold');
    pdf.text("Tax Invoice", startX + 250, startY);
    pdf.setFontSize(13);
    pdf.setFont('Cambria', 'normal');
    pdf.text(billMaster.client.clientName.toUpperCase(), startX, startY + 30);
    pdf.setFontSize(10);
    pdf.setFont('Cambria');
    pdf.text("TRN: " + billMaster.client.trnNo, startX, startY + 40);
    pdf.text("PO Box " + billMaster.client.addresses[0].zipPostalCode, startX, startY + 50);
    pdf.text(billMaster.client.addresses[0].address1 + ',' + billMaster.client.addresses[0].country, startX, startY + 60);
    pdf.text("Phone: " + billMaster.client.phoneNo, startX, startY + 70);
    pdf.text("Email: " + billMaster.client.email + ',' + ' Web: ' + billMaster.client.website, startX, startY + 80);
    pdf.setFontSize(10);
    const invoiceHeading = 'Invoice#: ';
    pdf.setFont('bold');
    pdf.text(invoiceHeading.toUpperCase(), startX + 360, startY + 80);
    pdf.setTextColor(25, 118, 210);
    const tableHeadingWidth = pdf.getTextWidth(invoiceHeading);
    let billNumber: string = '';
    if (billMaster?.billNumber) {
      billNumber = billMaster.billNumber?.toUpperCase();
    };
    pdf.text(billNumber, 20 + 360 + tableHeadingWidth, startY + 80);
    pdf.setFont('none');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);

    const autoTable = 'autoTable';
    pdf[autoTable]('', fifthTableRows, {
      startY: startY + 90,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX + 360 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 80,
          halign: 'left'
        },
        1: {
          cellWidth: 150,
          halign: 'right'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      didParseCell: function (fifthTableRows) {
        fifthTableRows.cell.styles.cellPadding = fifthTableRows.length === 6 ? 1.8 : 2.7;
      }
    });

    const firstTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    pdf.setLineWidth(.1);
    pdf.line(5, firstTableEndY + 5, 607, firstTableEndY + 5);
    pdf.setFont("Cambria");
    pdf.setFillColor(241, 241, 244);
    pdf.setDrawColor(206, 203, 203);
    pdf.rect(10, startY + 90, 340, firstTableEndY - (startY + 90), 'FD');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text(billMaster?.ownerName.toUpperCase(), startX + 10, startY + 105);
    pdf.text("CUSTOMER TRN: " + billMaster.trn, startX + 10, startY + 120);
    pdf.text("unit #" + billMaster.unitNumber, startX + 10, startY + 135);
    pdf.setFontSize(10);
    pdf.text(billMaster.clientName, startX + 10, startY + 150);
    pdf.text(stringIsNullOrEmpty(billMaster?.client?.buildingName, ',') + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.location, ',') + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.city, ',') + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.country, ','), startX + 10, startY + 165);
    pdf.setFontSize(10);
    const meterReadingTableHeading = 'Meter Read-Outs';
    pdf.text(meterReadingTableHeading.toUpperCase(), startX, firstTableEndY + 20);

    var pageContent = function (data) {
      // HEADER

      // FOOTER
    };

    pdf[autoTable](firstTableCol, firstTableRows, {
      startX: 10,
      startY: firstTableEndY + 35,
      showHead: "everyPage",
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: firstTableCol.length == 6 ? 120 : (firstTableCol.length == 4 ? 200 : 155),
          halign: 'center'
        },
        1: {
          cellWidth: firstTableCol.length == 6 ? 100 : (firstTableCol.length == 4 ? 135 : 125),
          halign: 'center'
        },
        2: {
          cellWidth: firstTableCol.length == 6 ? 100 : (firstTableCol.length == 4 ? 135 : 125),
          halign: 'center'
        },
        3: {
          cellWidth: firstTableCol.length == 4 ? 120 : 100,
          halign: 'center'
        },
        4: {
          cellWidth: 85,
          halign: 'center'
        },
        5: {
          cellWidth: 85,
          halign: 'center'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (firstTableRows) {
        firstTableRows.cell.styles.cellPadding = 1;
      }
    });

    if (seventhTableRows && seventhTableRows.length) {

      const secondTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
      pdf.setFontSize(10);
      const chargesBreakDownTableHeading = 'Charges Breakdown';
      pdf.text(chargesBreakDownTableHeading.toUpperCase(), startX, secondTableEndY + 15);

      pdf[autoTable](seventhTableCol, seventhTableRows, {
        startX: 10,
        startY: secondTableEndY + 30,
        showHead: "everyPage",
        didDrawPage: pageContent,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { left: startX },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            columnWidth: seventhTableCol.length == 6 ? 80 : (seventhTableCol.length == 4 ? 230 : (seventhTableCol.length == 7 ? 70 : 200)),
            halign: 'center'
          },
          1: {
            columnWidth: seventhTableCol.length == 6 ? 180 : (seventhTableCol.length == 4 ? 130 : (seventhTableCol.length == 7 ? 70 : 100)),
            halign: 'center'
          },
          2: {
            columnWidth: seventhTableCol.length == 6 ? 90 : (seventhTableCol.length == 4 ? 130 : (seventhTableCol.length == 7 ? 140 : 100)),
            halign: 'center'
          },
          3: {
            columnWidth: seventhTableCol.length == 6 ? 90 : (seventhTableCol.length == 4 ? 100 : (seventhTableCol.length == 7 ? 70 : 100)),
            halign: seventhTableCol.length == 4 ? 'right' : 'center'
          },
          4: {
            cellWidth: 75, //seventhTableCol.length == 6 ? 75 : 90,
            halign: seventhTableCol.length == 6 || seventhTableCol.length == 7 ? 'center' : 'right'
          },
          5: {
            cellWidth: 75,
            halign: seventhTableCol.length == 7 ? 'center' : 'right'
          },
          6: {
            cellWidth: 75,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (seventhTableRows) {
          seventhTableRows.cell.styles.cellPadding = 1;
        }
      });
    }

    let ThirdTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    let pageHeight = pdf.internal.pageSize.height;
    let fourthTableEndY = ThirdTableEndY;

    if (isSlabTariff) {
      pdf[autoTable](ninthTableCol, ninthTableRows, {
        startX: startX,
        startY: fourthTableEndY + 10,
        showHead: "everyPage",
        didDrawPage: pageContent,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: startX },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            columnWidth: ninthTableCol.length === 4 ? 250 : 120,
            halign: 'center'
          },
          1: {
            columnWidth: ninthTableCol.length === 4 ? 120 : 150,
            halign: 'center'
          },
          2: {
            columnWidth: ninthTableCol.length === 4 ? 120 : 120,
            halign: 'center'
          },
          3: {
            columnWidth: ninthTableCol.length === 4 ? 100 : 100,
            halign: ninthTableCol.length === 4 ? 'right' : 'center'
          },
          4: {
            columnWidth: 100,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (ninthTableRows) {
          ninthTableRows.cell.styles.cellPadding = 1;
          const tdElement: string = ninthTableRows.cell.raw;
          if (tdElement && typeof tdElement === 'string' && tdElement.startsWith('Unit')) {
            ninthTableRows.cell.styles.fontStyle = 'bold';
            ninthTableRows.cell.colSpan = ninthTableCol.length;
            ninthTableRows.cell.styles.halign = 'left';
          }
        }
      });

      fourthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    } else {
      pdf[autoTable](ninthTableCol, ninthTableRows, {
        startX: startX,
        startY: ThirdTableEndY + 10,
        showHead: "everyPage",
        didDrawPage: pageContent,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: startX },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            columnWidth: ninthTableCol.length === 6 ? 140 : 100,
            halign: 'center'
          },
          1: {
            columnWidth: ninthTableCol.length === 6 ? 100 : 100,
            halign: 'center'
          },
          2: {
            columnWidth: ninthTableCol.length === 6 ? 100 : 80,
            halign: 'center'
          },
          3: {
            columnWidth: ninthTableCol.length === 6 ? 100 : 80,
            halign: 'center'
          },
          4: {
            columnWidth: ninthTableCol.length === 6 ? 75 : 75,
            halign: 'center'
          },
          5: {
            columnWidth: ninthTableCol.length === 6 ? 75 : 75,
            halign: ninthTableCol.length === 6 ? 'right' : 'center'
          },
          6: {
            columnWidth: 80,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (ninthTableRows) {
          ninthTableRows.cell.styles.cellPadding = 1;
          const tdElement: string = ninthTableRows.cell.raw;
          if (tdElement && typeof tdElement === 'string' && tdElement.startsWith('Unit')) {
            ninthTableRows.cell.styles.fontStyle = 'bold';
            ninthTableRows.cell.colSpan = ninthTableCol.length;
            ninthTableRows.cell.styles.halign = 'left';
          }
        }
      });
      fourthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    }

    if (pageHeight - fourthTableEndY < 200) {
      pdf.addPage();
      pdf.setTextColor(25, 118, 210);
      pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
      fourthTableEndY = 10;
    }

    pdf.setTextColor(25, 118, 210);
    pdf.setFontSize(12);
    pdf.text("Bank Payment Account Details", startX, fourthTableEndY + 20);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text("Account Title: " + stringIsNullOrEmpty(billMaster?.client?.bankDetails[0]?.accountName), startX, fourthTableEndY + 40);
    pdf.text("Account #: " + stringIsNullOrEmpty(billMaster?.client?.bankDetails[0]?.accountNo), startX, fourthTableEndY + 50);
    pdf.text("IBAN #: " + stringIsNullOrEmpty(billMaster?.client?.bankDetails[0]?.ibanNumber), startX, fourthTableEndY + 60);
    pdf.text("Bank Name: " + stringIsNullOrEmpty(billMaster?.client?.bankDetails[0]?.bankName), startX, fourthTableEndY + 70);
    pdf.text("Swift Code: " + + stringIsNullOrEmpty(billMaster?.client?.bankDetails[0]?.swiftCode), startX, fourthTableEndY + 80);
    pdf.setFontSize(9);

    pdf[autoTable]('', sixthTableRows, {
      startX: 300,
      startY: fourthTableEndY + 20,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX + 310 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 180,
          halign: 'left'
        },
        1: {
          cellWidth: 100,
          halign: 'right'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center'
      },
      didParseCell: function (sixthTableRows) {
        sixthTableRows.cell.styles.cellPadding = 1.8;
      }
    });


    const fifthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    if (fifthTableEndY + 110 > pageHeight - 190) {
      pdf.addPage();
      pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
      pageHeight = 230;
    }
    if (billMaster?.client?.termsConditions[0]?.termsAndCondition) {
      pdf.setFillColor(241, 241, 244);
      pdf.rect(startX, pageHeight - 190, 590, 90, 'FD');
      pdf.setFillColor(0, 0, 0);
      pdf.setFontSize(9);
      pdf.text(billMaster?.client?.termsConditions[0]?.termsAndCondition.replace('{{ClientName}}', billMaster.client.clientName).replace('{{TRNNumber}}', billMaster.client.trnNo).replace('{{Currency}}', this.currency), startX + 30, pageHeight - 175);
    }
    pdf.setTextColor(0, 0, 0);
    pdf.line(5, pageHeight - 95, 607, pageHeight - 95);
    pdf.text("Notice :- Please tear and attach the slip  along with your payment", startX, pageHeight - 60);

    pdf[autoTable](thirdTableCol, thirdTableRows, {
      startX: startX,
      startY: pageHeight - 45,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 130,
          halign: 'center'
        },
        1: {
          cellWidth: 210,
          halign: 'center'
        },
        2: {
          cellWidth: 110,
          halign: 'right'
        },
        3: {
          cellWidth: 140,
          halign: 'right'
        },
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (thirdTableRows) {
        thirdTableRows.cell.styles.cellPadding = 1;
      }
    });

    var output = pdf.output('datauristring')
    this.pdfsToMerge.push(output);
  }


  downloadBillFormat3LargeReport(billMaster: BillMaster) {
    const conversionValueTRHR: number = 0.284345;
    const spliter: string = ': ';
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: ListData[] = [];
    let thirdTableRows: any[] = [];
    let fourthTableRows: any[] = [];
    let fifthTableRows: any[] = [];
    let sixthTableRows: any[] = [];
    let seventhTableRows: any[] = [];
    let eighthTableRows: ListData[] = [];
    let ninthTableRows: any[] = [];
    let firstTableCol = [
      'Unit No',
      'Meter No',
      'Previous Reading',
      'Present Reading',
      'Consumption'];

    let thirdTableCol = [
      'Customer AccountNumber',
      'Billing Period',
      'Previous Due',
      'Total for current period'
    ];

    let seventhTableCol = [
      'Bill No',
      'Meter No',
      'Charges',
      'Consumption',
      'Measuring Unit',
      'Tariff',
      'Total'];

    fourthTableRows.push({
      label: 'Bill No',
      value: spliter + stringIsNullOrEmpty(billMaster.billNumber)
    }, {
      label: 'Date of issue',
      value: spliter + stringIsNullOrEmpty(billMaster.billDateLocal)
    }, {
      label: 'Due Date',
      value: spliter + stringIsNullOrEmpty(billMaster.dueDateLocal)
    }
    );

    fifthTableRows.push(
      {
        label: 'Billing period',
        value: spliter + `From: ${stringIsNullOrEmpty(billMaster.fromDateLocal)} To: ${stringIsNullOrEmpty(billMaster.toDateLocal)} `
      },
      {
        label: 'Customer Account',
        value: spliter + stringIsNullOrEmpty(billMaster.accountNumber)
      },
      {
        label: 'Customer Name',
        value: spliter + stringIsNullOrEmpty(billMaster.ownerName)
      },
      {
        label: 'Address',
        value: spliter + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.address1)
      },
      {
        label: 'City',
        value: spliter + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.city)
      },
      {
        label: 'P.O Box',
        value: spliter + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.zipPostalCode)
      },
      {
        label: 'Phone number',
        value: spliter + stringIsNullOrEmpty(billMaster?.receiverDetails[0]?.phoneNumber)
      },
      {
        label: 'Fax Number',
        value: spliter
      },
      {
        label: 'Client',
        value: spliter + stringIsNullOrEmpty(billMaster?.client?.clientName)
      },
      {
        label: 'Client TRN',
        value: spliter + stringIsNullOrEmpty(billMaster?.client?.trnNo)
      }
    );

    let isMultipleBillNumber = false;
    let isMultipleUnitNumber = false;
    let isMultipleTariffFormatExists = false;
    let isMultipleMeterNumber = false;

    if (billMaster && billMaster.bills && billMaster.bills.length) {
      const uniqueBillNumber = Array.from(new Set(billMaster.bills.map(x => x.billNumber)));
      const uniqueUnitNumber = Array.from(new Set(billMaster.bills.map(x => x.unitNumber)));
      const uniqueMeterNumber = Array.from(new Set(billMaster.bills.map(x => x.deviceName)));

      isMultipleBillNumber = uniqueBillNumber && uniqueBillNumber.length > 1 ? true : false;
      isMultipleUnitNumber = uniqueUnitNumber && uniqueUnitNumber.length > 1 ? true : false;
      isMultipleMeterNumber = uniqueMeterNumber && uniqueMeterNumber.length > 1 ? true : false;

      if (!isMultipleMeterNumber) {
        const itemIndex = seventhTableCol.findIndex(x => x === 'Meter No');
        if (itemIndex > -1) {
          seventhTableCol.splice(itemIndex, 1);
        }
      }

      if (!isMultipleBillNumber) {
        seventhTableCol.splice(0, 1);
      } else {
        fourthTableRows.splice(0, 1);
      }
      if (!isMultipleUnitNumber) {
        firstTableCol.splice(0, 1);
      } else {
        const itemIndex = fifthTableRows.findIndex(x => x.label === 'Unit No');
        fifthTableRows.splice(itemIndex, 1);
      }

      const tariffExistingBills = Array.from(new Set(billMaster.bills.filter(x => x.billTariffDetails && x.billTariffDetails.length)));
      const tariffNotExistingBills = Array.from(new Set(billMaster.bills.filter(x => !x.billTariffDetails || x.billTariffDetails.length === 0)));

      if (tariffNotExistingBills && tariffNotExistingBills.length && tariffNotExistingBills && tariffNotExistingBills.length) {
        isMultipleTariffFormatExists = true;
      }
      if (tariffNotExistingBills && tariffNotExistingBills.length && !tariffExistingBills) {
        isMultipleTariffFormatExists = true;
      }
      if (tariffExistingBills && tariffExistingBills.length && (!tariffNotExistingBills || tariffNotExistingBills.length == 0)) {
        for (let a = 0; a < tariffExistingBills.length; a++) {
          const tariffNotExistingItem = tariffExistingBills[a].billTransactions.find(x => !x.tariffId);
          if (tariffNotExistingItem) {
            isMultipleTariffFormatExists = true;
            break;
          }
        };
      }
    }

    if (!isMultipleTariffFormatExists) {
      const tariffIndex = seventhTableCol.findIndex(x => x === 'Tariff');
      if (tariffIndex) {
        seventhTableCol.splice(tariffIndex, 1);
      }
    }

    for (let a = 0; a < billMaster.bills.length; a++) {
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      if (isMultipleUnitNumber) {
        row.push(billMaster.bills[a].unitNumber)
      }
      row.push(billMaster.bills[a].deviceName)
      row.push(this.decimalPipe.transform(billMaster.bills[a].previousReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      row.push(this.decimalPipe.transform(billMaster.bills[a].presentReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      if (billMaster.bills[a].isDifferentiateBill) {
        if (isMultipleMeterNumber) {
          isMultipleMeterNumber = false;
          const itemIndex = seventhTableCol.findIndex(x => x === 'Meter No');
          if (itemIndex > -1) {
            seventhTableCol.splice(itemIndex, 1);
          }
        }
        const previousReading: number = billMaster.bills[a].previousReading;
        const presentReading: number = billMaster.bills[a].presentReading;
        const consumption: number = presentReading - previousReading;
        row.push(this.decimalPipe.transform(consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      } else {
        row.push(this.decimalPipe.transform(billMaster.bills[a].consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      }
      if (billMaster.bills[a].utilityType === 'BTU' && billMaster.bills[a].billTransactions && billMaster.bills[a].billTransactions.length && billMaster.bills[a].billTransactions.findIndex(x => x.measuringUnitId && x.measuringUnitId === 2) > -1) {
        if (a == 0) {
          firstTableCol.push('Consumption TR-HR');
        }
        const consumptionTRHR: number = billMaster.bills[a].consumption * conversionValueTRHR;
        row.push(this.decimalPipe.transform(consumptionTRHR, this.consumptionRoundOffFormat))
      }
      firstTableRows.push(row);
      row = [];
    }

    let totalAmount = 0;

    for (let a = 0; a < billMaster.bills.length; a++) {
      const bill = billMaster.bills[a];
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      for (let b = 0; b < bill.billTransactions.length; b++) {
        if (isMultipleBillNumber) {
          row.push(bill.billNumber);
        }
        if (isMultipleMeterNumber) {
          row.push(bill.deviceName);
        }
        row.push(bill.billTransactions[b].headDisplay)
        if (bill.utilityType === "BTU" && bill.billTransactions && bill.billTransactions.length && bill.billTransactions[b] && bill.billTransactions[b].measuringUnitId && bill.billTransactions[b].measuringUnitId === 2) {
          const consumptionTRHR: number = bill.consumption * conversionValueTRHR;
          row.push(this.decimalPipe.transform(consumptionTRHR, this.consumptionRoundOffFormat))
          row.push('TR-HR')
          if (isMultipleTariffFormatExists && bill.billTariffDetails && bill.billTariffDetails.length && bill.billTransactions[b].tariffId) {
            row.push('-')
          } else if (isMultipleTariffFormatExists) {
            row.push(bill.billTransactions[b].rate)
          }
        } else {
          row.push(this.decimalPipe.transform(bill.consumption, this.consumptionRoundOffFormat))
          row.push(bill.measuringUnit)
          if (isMultipleTariffFormatExists && bill.billTariffDetails && bill.billTariffDetails.length && bill.billTransactions[b].tariffId) {
            row.push('-')
          } else if (isMultipleTariffFormatExists) {
            row.push(bill.billTransactions[b].rate)
          }
        }
        row.push(this.currencyPipe.transform(bill.billTransactions[b].headAmount, this.currency.toString(), true, this.roundFormat))
        seventhTableRows.push(row);
        row = [];
        totalAmount += bill.billTransactions[b].headAmount;
      }
    }

    row.push(billMaster.accountNumber);
    row.push(billMaster.fromDateLocal + '-' + billMaster.toDateLocal);
    row.push(this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat));
    row.push(billMaster.billAmountLocal);
    thirdTableRows.push(row);

    const title: string = 'Invoice';

    let meterNumber = '';
    billMaster.bills.forEach(x => {
      meterNumber += x.deviceName + ','
    });

    let isMultipleBillTariffDeatils = false;
    const billTariffDetails = Array.from(new Set(billMaster.bills.map(x => x.billTariffDetails)));
    if (billTariffDetails && billTariffDetails.length > 1) {
      isMultipleBillTariffDeatils = true;
    }

    let ninthTableCol = [];
    let isSlabTariff = false;
    let unitMeterNumbers: string[] = [];
    row = [];
    if (billMaster && billMaster.bills && billMaster.bills.length) {
      billMaster.bills.forEach(bill => {
        this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', bill.utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
        unitMeterNumbers = [];
        let unitMeterNumber: string = 'Unit Number : ' + bill.unitNumber + ' - Meter Number : ' + bill.deviceName;
        if (bill.billTariffDetails && bill.billTariffDetails.length) {
          for (let b = 0; b < bill.billTariffDetails.length; b++) {
            if (bill.billTariffDetails[b].slabSettingsId && bill.billTariffDetails[b].slabSettingsId > 0) {
              let season: string = bill.billTariffDetails[b].season;
              if (Number(bill.billTariffDetails[b].peakType) < Number(bill.billTariffDetails[b].consumption)) {
                const consumptionMax = bill.billTariffDetails[b].consumption;
                const consumptionMin = bill.billTariffDetails[b].peakType;
                season = consumptionMin + ' - ' + consumptionMax;
              }
              if (b == 0) {
                isSlabTariff = true;
                ninthTableCol = [
                  'Slab',
                  'Consumption',
                  'Rate',
                  'Amount '];
              }
              if (unitMeterNumbers && unitMeterNumbers.length) {
                const itemExists = unitMeterNumbers.find(x => x === unitMeterNumber);
                if (!itemExists) {
                  this.createUnitMeterNumberRow(unitMeterNumber, ninthTableCol.length, ninthTableRows);
                }
              } else {
                unitMeterNumbers.push(unitMeterNumber);
                this.createUnitMeterNumberRow(unitMeterNumber, ninthTableCol.length, ninthTableRows);
              }
              row.push(season);
              row.push(this.decimalPipe.transform(bill.billTariffDetails[b].consumption, this.consumptionRoundOffFormat));
              row.push(bill.billTariffDetails[b].rate);
              row.push(this.currencyPipe.transform(bill.billTariffDetails[b].amount, this.currency.toString(), true, this.roundFormat));
            }
            else if (bill.billTariffDetails[b].slabSettingsId == 0) {
              if (b == 0) {
                ninthTableCol = [
                  'Season',
                  'Week Type',
                  'Peak Type',
                  'Consumption',
                  'Rate',
                  'Amount '];
              }
              if (unitMeterNumbers && unitMeterNumbers.length) {
                const itemExists = unitMeterNumbers.find(x => x === unitMeterNumber);
                if (!itemExists) {
                  this.createUnitMeterNumberRow(unitMeterNumber, ninthTableCol.length, ninthTableRows);
                }
              } else {
                unitMeterNumbers.push(unitMeterNumber);
                this.createUnitMeterNumberRow(unitMeterNumber, ninthTableCol.length, ninthTableRows);
              }
              row.push(bill.billTariffDetails[b].season);
              row.push(bill.billTariffDetails[b].weekType);
              row.push(bill.billTariffDetails[b].peakType);
              row.push(this.decimalPipe.transform(bill.billTariffDetails[b].consumption, this.consumptionRoundOffFormat));
              row.push(bill.billTariffDetails[b].rate);
              row.push(this.currencyPipe.transform(bill.billTariffDetails[b].amount, this.currency.toString(), true, this.roundFormat));
            }
            ninthTableRows.push(row);
            row = [];
          };
        }
      });
    }

    let otherCharges: ListItem[] = [];

    // billMaster.bills.forEach(bill => {
    //   if (bill.transactions && bill.transactions.length) {
    //     const restrictArray: string[] = ['consumption', 'consumptioncharge'];
    //     bill.transactions.forEach(transaction => {
    //       if (!restrictArray.includes(transaction.headDisplay.toLowerCase())) {
    //         const existingitem = otherCharges.find(x => x.label === transaction.headDisplay);
    //         if (existingitem) {
    //           existingitem.value += transaction.headAmount;
    //         } else {
    //           otherCharges.push({ label: transaction.headDisplay, value: transaction.headAmount });
    //         }
    //       }
    //     });
    //   }
    // });

    if (billMaster.billCharges && billMaster.billCharges.length) {
      billMaster.billCharges.sort((a, b) => a.position - b.position).forEach(billCharge => {
        if (billCharge.headDisplay !== 'VAT') {
          const existingitem = otherCharges.find(x => x.label === billCharge.headDisplay);
          if (existingitem) {
            existingitem.value += billCharge.headAmount;
          } else {
            otherCharges.push({ label: billCharge.headDisplay, value: billCharge.headAmount });
          }
        }
      });
    }

    otherCharges.forEach(x => {
      secondTableRows.push({ label: x.label, value: this.currencyPipe.transform(x.value, this.currency.toString(), true, this.roundFormat) });
    });

    if (billMaster.billTaxDetails && billMaster.billTaxDetails.length) {
      billMaster.billTaxDetails.forEach(billTaxDetail => {
        secondTableRows.push({ label: billTaxDetail.taxDisplayName, value: this.currencyPipe.transform(billTaxDetail.taxAmount, this.currency.toString(), true, this.roundFormat) });
      });
    }

    secondTableRows.push(
      {
        label: 'Total consumption charge for Current Period',
        value: this.currencyPipe.transform(totalAmount, this.currency.toString(), true, this.roundFormat)
      });

    if (billMaster.billDiscounts && billMaster.billDiscounts.length) {
      let discountAmount = 0;
      billMaster.billDiscounts.forEach(billDiscount => {
        discountAmount += billDiscount.headAmount;
      });
      secondTableRows.push({ label: 'Total Discount', value: this.currencyPipe.transform(discountAmount, this.currency.toString(), true, this.roundFormat) });
    }

    secondTableRows.push(
      {
        label: 'Previous Outstanding Amount',
        value: this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
      });

    eighthTableRows.push({
      label: 'Total for Current Period',
      value: this.currencyPipe.transform(billMaster.billAmount + billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
    });

    this.getNewBillFormat3LargeReport(firstTableCol, firstTableRows, secondTableRows, thirdTableCol, thirdTableRows, fourthTableRows, fifthTableRows, sixthTableRows, title, seventhTableCol, seventhTableRows, billMaster, eighthTableRows, ninthTableCol, ninthTableRows, isSlabTariff);
  }

  // New Bill Print Format added 27/05/2021
  getNewBillFormat3LargeReport(firstTableCol: any[], firstTableRows: any[], secondTableRows: any[], thirdTableCol: any[], thirdTableRows: any[], fourthTableRows: any[], fifthTableRows: any[], sixthTableRows: any[], title: string, seventhTableCol: any[], seventhTableRows: any[], billMaster: BillMaster, eighthTableRows: any[], ninthTableCol: any[], ninthTableRows: any[], isSlabTariff: boolean = false) {

    const totalPagesExp = "1";
    let pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter"
    });

    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    let startX = 10;
    let startY = 15;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.setFont("Cambria");
    pdf.text("Billing Statement".toUpperCase(), 10, startY + 5);
    this.addImage(pdf, billMaster);
    pdf.setLineWidth(.1);
    const autoTable = 'autoTable';
    pdf[autoTable]('', fourthTableRows, {
      startX: 10,
      startY: startY + 20,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: 15 },
      theme: 'plain',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 100,
          halign: 'left'
        },
        1: {
          cellWidth: 190,
          halign: 'left'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center'
      },
      didParseCell: function (fourthTableRows) {
        fourthTableRows.cell.styles.cellPadding = 1.5;
      }
    });

    const firstTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf[autoTable]('', fifthTableRows, {
      startX: 10,
      startY: firstTableEndY,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: 15 },
      theme: 'plain',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 100,
          halign: 'left'
        },
        1: {
          cellWidth: 380,
          halign: 'left'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      didParseCell: function (fifthTableRows) {
        fifthTableRows.cell.styles.cellPadding = 1.5;
      }
    });


    var pageContent = function (data) {
      // HEADER

      // FOOTER
    };


    const secondTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf.setFont("Cambria");
    pdf.setFontSize(10);
    const meterReadingTableHeading = 'Meter Read-Outs';
    pdf.text(meterReadingTableHeading.toUpperCase(), startX, secondTableEndY + 15);

    pdf[autoTable](firstTableCol, firstTableRows, {
      startX: 10,
      startY: secondTableEndY + 30,
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { top: 180, left: 10 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: firstTableCol.length == 6 ? 120 : (firstTableCol.length == 4 ? 200 : 155),
          halign: 'center'
        },
        1: {
          cellWidth: firstTableCol.length == 6 ? 100 : (firstTableCol.length == 4 ? 135 : 125),
          halign: 'center'
        },
        2: {
          cellWidth: firstTableCol.length == 6 ? 100 : (firstTableCol.length == 4 ? 135 : 125),
          halign: 'center'
        },
        3: {
          cellWidth: firstTableCol.length == 4 ? 120 : 100,
          halign: 'center'
        },
        4: {
          cellWidth: 85,
          halign: 'center'
        },
        5: {
          cellWidth: 85,
          halign: 'center'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (firstTableRows) {
        firstTableRows.cell.styles.cellPadding = 1;
      }
    });


    const ThirdTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    if (seventhTableRows && seventhTableRows.length) {
      pdf.setFontSize(10);
      const chargesBreakDownTableHeading = 'Charges Breakdown';
      pdf.text(chargesBreakDownTableHeading.toUpperCase(), startX, ThirdTableEndY + 15);

      pdf[autoTable](seventhTableCol, seventhTableRows, {
        startX: 10,
        startY: ThirdTableEndY + 30,
        showHead: "everyPage",
        didDrawPage: pageContent,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: 10 },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            cellWidth: seventhTableCol.length === 6 ? 80 : (seventhTableCol.length == 4 ? 230 : (seventhTableCol.length === 7 ? 70 : 200)),
            halign: 'center'
          },
          1: {
            cellWidth: seventhTableCol.length === 6 ? 180 : (seventhTableCol.length == 4 ? 130 : (seventhTableCol.length === 7 ? 70 : 100)),
            halign: 'center'
          },
          2: {
            cellWidth: seventhTableCol.length === 6 ? 90 : (seventhTableCol.length == 4 ? 130 : (seventhTableCol.length === 7 ? 140 : 100)),
            halign: seventhTableCol.length === 6 ? '' : 'center'
          },
          3: {
            cellWidth: seventhTableCol.length === 6 ? 90 : (seventhTableCol.length == 4 ? 100 : (seventhTableCol.length === 7 ? 85 : 100)),
            halign: seventhTableCol.length == 4 ? 'right' : 'center'
          },
          4: {
            cellWidth: 75, //seventhTableCol.length === 6 ? 75 : 90,
            halign: seventhTableCol.length == 6 || seventhTableCol.length == 7 ? 'center' : 'right'
          },
          5: {
            cellWidth: 75,
            halign: seventhTableCol.length == 6 ? 'right' : 'center'
          },
          6: {
            cellWidth: 75,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (seventhTableRows) {
          seventhTableRows.cell.styles.cellPadding = 1;
        }
      });
    }

    let pageHeight = pdf.internal.pageSize.height;
    const fourthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    let fifthTableEndY = fourthTableEndY;
    if (isSlabTariff) {
      pdf[autoTable](ninthTableCol, ninthTableRows, {
        startX: 10,
        startY: fourthTableEndY + 10,
        showHead: "everyPage",
        didDrawPage: pageContent,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: 10 },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            columnWidth: ninthTableCol.length === 4 ? 250 : 120,
            halign: 'center'
          },
          1: {
            columnWidth: ninthTableCol.length === 4 ? 120 : 150,
            halign: 'center'
          },
          2: {
            columnWidth: ninthTableCol.length === 4 ? 120 : 120,
            halign: 'center'
          },
          3: {
            columnWidth: ninthTableCol.length === 4 ? 100 : 100,
            halign: ninthTableCol.length === 4 ? 'right' : 'center'
          },
          4: {
            columnWidth: 100,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (ninthTableRows) {
          ninthTableRows.cell.styles.cellPadding = 1;
          const tdElement: string = ninthTableRows.cell.raw;
          if (tdElement && typeof tdElement === 'string' && tdElement.startsWith('Unit')) {
            ninthTableRows.cell.styles.fontStyle = 'bold';
            ninthTableRows.cell.colSpan = ninthTableCol.length;
            ninthTableRows.cell.styles.halign = 'left';
          }
        }
      });

      fifthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    } else {
      pdf[autoTable](ninthTableCol, ninthTableRows, {
        startX: 10,
        startY: fourthTableEndY + 10,
        showHead: "everyPage",
        didDrawPage: pageContent,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: 10 },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            columnWidth: ninthTableCol.length === 6 ? 140 : 100,
            halign: 'center'
          },
          1: {
            columnWidth: ninthTableCol.length === 6 ? 100 : 100,
            halign: 'center'
          },
          2: {
            columnWidth: ninthTableCol.length === 6 ? 100 : 80,
            halign: 'center'
          },
          3: {
            columnWidth: ninthTableCol.length === 6 ? 100 : 80,
            halign: 'center'
          },
          4: {
            columnWidth: ninthTableCol.length === 6 ? 75 : 75,
            halign: 'center'
          },
          5: {
            columnWidth: ninthTableCol.length === 6 ? 75 : 75,
            halign: ninthTableCol.length === 6 ? 'right' : 'center'
          },
          6: {
            columnWidth: 80,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (ninthTableRows) {
          ninthTableRows.cell.styles.cellPadding = 1;
          const tdElement: string = ninthTableRows.cell.raw;
          if (tdElement && typeof tdElement === 'string' && tdElement.startsWith('Unit')) {
            ninthTableRows.cell.styles.fontStyle = 'bold';
            ninthTableRows.cell.colSpan = ninthTableCol.length;
            ninthTableRows.cell.styles.halign = 'left';
          }
        }
      });

      fifthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    }

    if (pageHeight - fifthTableEndY < 200) {
      pdf.addPage();
      pdf.setTextColor(25, 118, 210);
      pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
      fifthTableEndY = 10;
    }

    pdf[autoTable]('', secondTableRows, {
      startX: 10,
      startY: fifthTableEndY + 10,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { bottom: startY + 20, left: 250 },
      theme: 'plain',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 250,
          fontStyle: "italic"
        },
        1: {
          cellWidth: 90
        }
      },
      didParseCell: function (secondTableRows) {
        const col = secondTableRows.column.index;
        if (col == 1) {
          secondTableRows.cell.styles.halign = 'right';
        }
        secondTableRows.cell.styles.cellPadding = 1.5;
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    });

    const sixthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf.line(5, sixthTableEndY + 10, 607, sixthTableEndY + 10);

    pdf[autoTable]('', eighthTableRows, {
      startX: 10,
      startY: sixthTableEndY + 20,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { bottom: startY + 20, left: 250 },
      theme: 'plain',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 250,
          fontStyle: "italic"
        },
        1: {
          cellWidth: 90
        }
      },
      didParseCell: function (secondTableRows) {
        const col = secondTableRows.column.index;
        if (col == 1) {
          secondTableRows.cell.styles.halign = 'right';
        }
        secondTableRows.cell.styles.cellPadding = 1.5;
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    });

    const seventhTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    pdf.line(5, seventhTableEndY + 10, 607, seventhTableEndY + 10);

    pageHeight = pdf.internal.pageSize.height;

    if (seventhTableEndY > pageHeight - 180) {
      pdf.addPage();
      pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
      pageHeight = 230;
    }

    if (billMaster?.client?.termsConditions[0]?.termsAndCondition) {
      pdf.setFillColor(241, 241, 244);
      pdf.rect(10, pageHeight - 190, 590, 90, 'FD');
      pdf.setFillColor(0, 0, 0);
      pdf.setFontSize(9);
      pdf.text(billMaster?.client?.termsConditions[0]?.termsAndCondition.replace('{{ClientName}}', billMaster.client.clientName).replace('{{TRNNumber}}', billMaster.client.trnNo).replace('{{Currency}}', this.currency), startX + 20, pageHeight - 175);
    }
    pdf.setTextColor(0, 0, 0);
    pdf.line(5, pageHeight - 95, 607, pageHeight - 95);
    pdf.text("Notice :- Please tear and attach the slip  along with your payment", startX, pageHeight - 75);

    pdf[autoTable](thirdTableCol, thirdTableRows, {
      startX: 10,
      startY: pageHeight - 70,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: 10 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 130,
          halign: 'center'
        },
        1: {
          cellWidth: 210,
          halign: 'center'
        },
        2: {
          cellWidth: 110,
          halign: 'right'
        },
        3: {
          cellWidth: 140,
          halign: 'right'
        },
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (thirdTableRows) {
        thirdTableRows.cell.styles.cellPadding = 1;
      }
    });

    var output = pdf.output('datauristring')
    this.pdfsToMerge.push(output);
  }

  createUnitMeterNumberRow(unitMeterNumber: string, columnCount: number, insertTable: any[]) {
    let row = [];
    for (let i = 0; i < columnCount - 1; i++) {
      if (i === 0) {
        row.push(unitMeterNumber);
      } else {
        row.push('');
      }
    }
    insertTable.push(row);
  }

  onFilterChange(value) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

  billConsumptionExcelExport() {
    this.billService.billConsumptionDetails(this.manageParams, !this.isApproveBills).subscribe({
      next: (data: any[]) => {
        if (data && data.length) {
          this.excelDynamicExport(data);
        } else {
          this.notificationMessage('No data to print', 'red-snackbar');
        }
      },
      error: (err) => {
        this.notificationMessage('No data to print', 'red-snackbar');
      }
    });
  }

  excelDynamicExport(excelTableData: any[]) {
    if (excelTableData && excelTableData.length) {
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelTableData);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      /* save to file */
      XLSX.writeFile(wb, 'DetailedBillSummary.xlsx');
    }
    else {
      this.notificationMessage("No Data to Export", "yellow-snackbar");
    }
  }

}

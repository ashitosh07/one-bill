import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { ContractService } from 'src/app/tabs/shared/services/contract.service';
import { Contract } from 'src/app/tabs/owner-tenant/create-contract/contract-create-update/contract.model';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { ContractCreateUpdateComponent } from '../create-contract/contract-create-update/contract-create-update.component';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { BillMaster } from '../../shared/models/bill-master.model';
import { BillSettlementService } from '../../shared/services/billsettlement.service';
import { ListItem } from '../../shared/models/list-item.model';
import { ListData } from '../../shared/models/list-data.model';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BillRefundComponent } from './bill-refund/bill-refund.component';
import { DataService } from '../../../tabs/shared/services/dataservice';
import { CookieService } from 'ngx-cookie-service';
import { getClientDataFormat, stringIsNullOrEmpty } from '../../shared/utilities/utility';
import { ImageProperty } from '../../shared/models/imageProperty.model';
import { Payment } from '../../shared/models/payment.model';
import { BillService } from '../../shared/services/bill.service';
import { ContractEndDetailsComponent } from './contract-end-details/contract-end-details.component';
import { MatOption } from '@angular/material/core';
import * as moment from 'moment';
import { ManageParams } from '../../shared/models/manage-params.model';
import { PDFDocument } from 'pdf-lib';
import { Refund } from '../../shared/models/refund.model';
import { CancelConfirmationDialogComponent } from '../../shared/components/cancel-confirmation-dialog/cancel-confirmation-dialog.component';
import { ClientSelectionService } from '../../shared/services/client-selection.service';
import * as XLSX from 'xlsx';
import { EnvService } from 'src/app/env.service';
import { env } from 'process';
import { WorkflowRuleService } from '../../shared/services/workflow-rule.service';
import { WorkflowRule } from '../../shared/models/workflow-rule.model';

@Component({
  selector: 'create-contract',
  templateUrl: './create-contract.component.html',
  styleUrls: ['./create-contract.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation]
})

export class CreateContractComponent implements OnInit, AfterViewInit, OnDestroy {
  subject$: ReplaySubject<Contract[]> = new ReplaySubject<Contract[]>(1);
  data$: Observable<Contract[]> = this.subject$.asObservable();
  private contracts: Contract[];
  workflowRules: WorkflowRule[] = [];
  payments: Payment[];
  dateFormat = '';
  clientId: number;
  billMaster: BillMaster = {};
  currency = getClientDataFormat('Currency');
  roundFormat = getClientDataFormat('RoundOff');
  consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff');
  filePath = '';
  movedOut: boolean = false;
  reminder: boolean = false;
  tableData: any[];
  message = '';
  checkDues = true;
  filterId: number = 0;
  pdfsToMerge: any[] = [];
  filterModes: ListItem[] = [
    { label: 'Current Contracts', value: 0 },
    { label: 'Expiration Reminder', value: 1 },
    { label: 'Closed Contracts', value: 2 },
    { label: 'Suspended Contracts', value: 3 },
    { label: 'Unpaid SD Contracts', value: 4 }];
  selectFilterModes: any[] = [];
  @Input() public expiryReminder: boolean;
  @Input()
  displayedColumns: ListColumn[] = [
    { name: 'Contract Number', property: 'contractNumber', visible: true, isModelProperty: true },
    { name: 'Contract Date', property: 'contractDateLocal', visible: true, isModelProperty: true },
    { name: 'Contract End Date', property: 'contractEndDateLocal', visible: true, isModelProperty: true },
    { name: 'Tenant Name', property: 'tenantName', visible: true, isModelProperty: true },
    { name: 'Unit Number', property: 'unitNumber', visible: true, isModelProperty: true },
    { name: 'Contract Type', property: 'contractType', visible: true, isModelProperty: true },
    //{ name: 'Security Deposit', property: 'securityDepositLocal', visible: true, isModelProperty: false },
    { name: 'Security Deposit In Hand', property: 'securityDepositInHandLocal', visible: true, isModelProperty: false },
    { name: 'Remaining Amount', property: 'remainingAmountLocal', visible: true, isModelProperty: false },
    { name: 'Status', property: 'status', visible: true, isModelProperty: true },
    { name: 'Actions', property: 'actions', visible: true }
  ] as ListColumn[];

  public pageSize = 8;
  public listData: MatTableDataSource<Contract>;
  public columnsProps: string[] = this.displayedColumns.map((column: ListColumn) => {
    return column.property;
  });

  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort && this.listData) {
      this.listData.sort = this.sort;
    }
  }

  @ViewChild('allSelected') private allSelected: MatOption;

  constructor(private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private date: DatePipe,
    private router: Router,
    private currencyPipe: CurrencyPipe, private dataService: DataService,
    private decimalPipe: DecimalPipe,
    private contractService: ContractService,
    private billSettlementService: BillSettlementService,
    private cookieService: CookieService,
    private clientSelectionService: ClientSelectionService,
    private billService: BillService,
    private envService: EnvService,
    private workflowRuleService: WorkflowRuleService) {
    this.filePath = envService.backendForFiles;
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;;
    this.clientId = Number(this.cookieService.get('globalClientId'));
  }

  get visibleColumns() {
    return this.displayedColumns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit() {

    this.clientSelectionService.setIsClientVisible(true);
    // if(this.route && this.route.queryParams)
    // {
    //   this.route.queryParams
    //     //.filter((params) => params.expiryReminder)
    //     .subscribe((params) => {
    //       this.reminder = params.expiryReminder;
    //       if(this.reminder)
    //         this.toggleContractsReminder(!this.reminder);
    //     });
    // } 
    this.expiryReminder = this.dataService.getMessage();

    if (this.expiryReminder) {
      this.reminder = this.expiryReminder;
    }
    this.getWorkflowRules();
  }

  getReminder($event) {
    this.reminder = $event;
  }

  getContractDetails() {
    if (this.movedOut == true)
      this.getMovedOutTenants();
    else if (this.reminder)
      this.getContractsAboutToExpire();
    else
      this.getContracts();
  }

  ngAfterViewInit() {
    if (this.listData) {
      this.listData.paginator = this.paginator;
      this.listData.sort = this.sort;
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

  createContract() {

    this.dialog.open(ContractCreateUpdateComponent).afterClosed().subscribe((contract: Contract) => {
      /**
       * Contract is the updated contract (if the user pressed Save - otherwise it's null)
       */
      if (contract) {
        /**
         * Here we are updating our local array.
         * You would probably make an HTTP request here.
         */
        contract.mode = 'create';
        this.contractService.createContract(contract).subscribe(() => {
          this.snackbar.open('Contract created successfully', null, {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['green-snackbar'],
          });
          this.onFilterData();
          //}
          // error: (err: any) => {
          //   if (err.indexOf('409') >= 0) {
          //     this.notificationMessage('Contract already exists or Duplicate dates.', 'red-snackbar');
          //   }
          //   else {
          //     this.notificationMessage('Contract creation failed', 'red-snackbar');
          //   }
          // }
        });
      }
    });
  }

  updateContract(contract) {
    contract.mode = 'update';
    contract.type = '';
    this.dialog.open(ContractCreateUpdateComponent, {
      data: contract
    }).afterClosed().subscribe((response: Contract) => {
      /**
       * Contract is the updated contract (if the user pressed Save/Update - otherwise it's null)
       */
      if (response) {
        /**
         * Here we are updating our local array.
         * You would probably make an HTTP request here.
         */
        this.contractService.updateContractById(contract.id, response).subscribe({
          next: () => {
            this.snackbar.open('Contract updated successfully', null, {
              duration: 5000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
              panelClass: ['green-snackbar'],
            });
            this.onFilterData();
          },
          error: () => {
            this.notificationMessage('Contract updation failed', 'red-snackbar');
          }
        })
      }
      this.onFilterData();
    });
  }

  renewContract(contract) {
    contract.mode = 'renew';
    this.dialog.open(ContractCreateUpdateComponent, {
      data: contract
    }).afterClosed().subscribe((contract: Contract) => {
      /** 
       * Contract is the renewed contract (if the user pressed Renew - otherwise it's null)
       */
      if (contract) {
        /**
         * Here we are updating our local array.
         * You would probably make an HTTP request here.
         */
        this.contractService.renewContract(contract.id, contract).subscribe({
          next: () => {
            this.snackbar.open('Contract renewed successfully', null, {
              duration: 5000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
              panelClass: ['green-snackbar'],
            });
            this.onFilterData();
          },
          error: () => {
            this.notificationMessage('Contract renewal failed', 'red-snackbar');
          }
        })
      }
    });
  }

  deleteContract(contract: Contract) {
    contract.checkDues = this.checkDues;
    this.dialog.open(ContractEndDetailsComponent, {
      data: contract
    }).afterClosed().subscribe((contract: Contract) => {
      /**
       * Here we are updating our local array.
       * You would probably make an HTTP request here.
       */
      if (contract) {
        contract.clientId = this.clientId
        this.contractService.deleteContractById(contract.id, contract).subscribe({
          next: () => {
            this.snackbar.open('Contract End Successfull.', null, {
              duration: 5000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
              panelClass: ['green-snackbar'],
            });
            this.onFilterData();
          },
          error: () => {
            this.notificationMessage('Contract End failed', 'red-snackbar');
          }
        });
      }
    })
  }


  onSuspendContract(contract) {
    contract.mode = 'delete';
    contract.type = 'Suspend';
    this.dialog.open(ContractCreateUpdateComponent, {
      data: contract
    }).afterClosed().subscribe((contract: Contract) => {
      if (contract) {
        this.contractService.suspendContractById(contract.id, contract).subscribe({
          next: () => {
            this.snackbar.open('Contract Suspend Successfull.', null, {
              duration: 5000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
              panelClass: ['green-snackbar'],
            });
            this.onFilterData();
          },
          error: () => {
            this.notificationMessage('Contract Suspend failed', 'red-snackbar');
          }
        });
      }
    })
  }


  getContracts(isSuspended: boolean = false, isUnpaid: boolean = false) {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.contractService.getContracts(this.clientId).subscribe((contracts: Contract[]) => {
      contracts = contracts.map(contract => new Contract(contract));
      if (isSuspended) {
        contracts = contracts.filter(x => x.isSuspended == isSuspended);
      }
      if (isUnpaid) {
        contracts = contracts.filter(x => x.receivedAmount == 0 && x.securityDeposit > 0);
      }
      this.dateFormat = getClientDataFormat('DateFormat');
      this.roundFormat = getClientDataFormat('RoundOff');
      this.currency = getClientDataFormat('Currency');

      contracts.forEach(x => {
        x.securityDepositLocal = this.currencyPipe.transform(x.securityDeposit, this.currency.toString(), true, this.roundFormat);
        x.contractDateLocal = this.date.transform(x.contractDate.toString(), this.dateFormat.toString());
        x.contractEndDateLocal = this.date.transform(x.contractEndDate.toString(), this.dateFormat.toString());
        x.securityDepositInHand = x.receivedAmount - x.refundAmount;
        x.securityDepositInHandLocal = this.currencyPipe.transform(x.securityDepositInHand, this.currency.toString(), true, this.roundFormat);
        x.receivedAmountLocal = this.currencyPipe.transform(x.receivedAmount, this.currency.toString(), true, this.roundFormat);
        x.refundAmountLocal = this.currencyPipe.transform(x.refundAmount, this.currency.toString(), true, this.roundFormat);
        x.remainingAmountLocal = this.currencyPipe.transform(x.remainingAmount, this.currency.toString(), true, this.roundFormat);
      });
      this.subject$.next(contracts);
    }
      // ,error: () => {
      //   this.notificationMessage('Contracts Not Found.', 'red-snackbar');
      // }
    );
    this.listData = new MatTableDataSource(this.contracts);

    this.data$.pipe(filter(data => !!data)).subscribe((contracts) => {
      this.contracts = contracts;
      this.listData.data = contracts;
    });
    this.ngAfterViewInit();
  }

  onFilterChange(value) {
    if (!this.listData) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.listData.filter = value;
  }

  ngOnDestroy() { }

  onGenerateInoice(contract: Contract, payment: Payment) {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.billSettlementService.generateOtherTypeInvoiceDetail(this.clientId, contract.id).subscribe({
      next: response => {
        if (response) {
          if (payment) {
            this.updatePaymentDetails(payment, response.id);
            this.onSavePayment(payment);
          }
        } else {
          this.notificationMessage('Security deposit payment save failed', 'red-snackbar');
        }
      },
      error: () => {
        this.notificationMessage('Security deposit payment save failed', 'red-snackbar');
      }
    });
  }

  onPrintInvoice(row: Contract) {
    if (row && row.billMasters) {
      row.billMasters[0].billDateLocal = this.date.transform(row.billMasters[0].billDate.toString(), this.dateFormat.toString());
      row.billMasters[0].fromDateLocal = this.date.transform(row.billMasters[0].fromDate.toString(), this.dateFormat.toString());
      row.billMasters[0].toDateLocal = this.date.transform(row.billMasters[0].toDate.toString(), this.dateFormat.toString());
      row.billMasters[0].dueDateLocal = this.date.transform(row.billMasters[0].dueDate.toString(), this.dateFormat.toString());
      row.billMasters[0].billAmountLocal = this.currencyPipe.transform(row.billMasters[0].billAmount, this.currency.toString(), true, this.roundFormat);
      if (row.billMasters[0].billFormat === 'Bill Format 1') {
        this.downloadBillReport(row.billMasters[0]);
      }
      else if (row.billMasters[0].billFormat === 'Bill Format 2') {
        if (row.billMasters[0].bills && row.billMasters[0].bills.length > 3) {
          this.downloadLargeBillNewReport(row.billMasters[0]);
        } else {
          this.downloadBillNewReport(row.billMasters[0]);
        }
      }
      else if (row.billMasters[0].billFormat === 'Bill Format 3') {
        this.downloadBillNewFormatReport(row.billMasters[0]);
      }
    }
  }

  downloadLargeBillNewReport(billMaster: BillMaster) {
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
      'Consumption',
      'Consumption TR-HR'];

    let thirdTableCol = [
      'Customer AccountNumber',
      'Billing Period',
      'Previous Due',
      'Total for current period'
    ]; // initialization for headers

    let seventhTableCol = [
      'Bill No',
      'Charges',
      'Consumption',
      'Measuring Unit',
      'Tariff',
      'Total'];

    for (let a = 0; a < billMaster.bills.length; a++) {
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      row.push(billMaster.bills[a].unitNumber)
      row.push(billMaster.bills[a].deviceName)
      row.push(this.decimalPipe.transform(billMaster.bills[a].previousReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      row.push(this.decimalPipe.transform(billMaster.bills[a].presentReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      if (billMaster.bills[a].isDifferentiateBill) {
        const previousReading: number = billMaster.bills[a].previousReading;
        const presentReading: number = billMaster.bills[a].presentReading;
        const consumption: number = presentReading - previousReading;
        row.push(this.decimalPipe.transform(consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      } else {
        row.push(this.decimalPipe.transform(billMaster.bills[a].consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      }
      if (billMaster.bills[a].utilityType === 'BTU' && billMaster.bills[a].billTransactions && billMaster.bills[a].billTransactions.length && billMaster.bills[a].billTransactions.findIndex(x => x.measuringUnitId && x.measuringUnitId === 2) > -1) {
        const consumptionTRHR: number = billMaster.bills[a].consumption * conversionValueTRHR;
        row.push(this.decimalPipe.transform(consumptionTRHR, this.consumptionRoundOffFormat))
      } else {
        row.push(0)
      }
      firstTableRows.push(row);
      row = [];
    }

    let totalAmount = 0;
    for (let a = 0; a < billMaster.bills.length; a++) {
      const bill = billMaster.bills[a];
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      for (let b = 0; b < bill.billTransactions.length; b++) {
        if (bill.billTransactions[b].headAmount) {
          row.push(bill.billNumber);
          row.push(bill.billTransactions[b].headDisplay)
          if (bill.utilityType === "BTU" && bill.billTransactions && bill.billTransactions.length && bill.billTransactions[b] && bill.billTransactions[b].measuringUnitId && bill.billTransactions[b].measuringUnitId === 2) {
            const consumptionTRHR: number = bill.consumption * conversionValueTRHR;
            row.push(this.decimalPipe.transform(consumptionTRHR, this.consumptionRoundOffFormat))
            row.push('TR-HR')
            row.push(bill.consumptionRate)
          } else {
            row.push(this.decimalPipe.transform(bill.consumption, this.consumptionRoundOffFormat))
            row.push(bill.measuringUnit)
            row.push(bill.consumptionRate)
          }
          row.push(this.decimalPipe.transform(bill.billTransactions[b].headAmount, this.roundFormat))
          seventhTableRows.push(row);
          row = [];
          totalAmount += bill.billTransactions[b].headAmount;
        }
      }
    }

    row.push(billMaster.accountNumber);
    row.push(billMaster.fromDateLocal + '-' + billMaster.toDateLocal);
    row.push(this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat));
    row.push(billMaster.billAmountLocal);
    thirdTableRows.push(row);


    billMaster.billCharges.forEach(billCharge => {
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

    //const vatItem = billMaster.billCharges.find(billCharge => billCharge.headDisplay === 'VAT');

    eighthTableRows.push(
      {
        label: 'Total Charges for Current Period',
        value: this.currencyPipe.transform(totalAmount, this.currency.toString(), true, this.roundFormat)
      });

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


    fourthTableRows.push(
      // {
      //   label: 'Bill No',
      //   value: billMaster?.billNumber ?? ''
      // },
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
      // {
      //   label: 'Unit No',
      //   value: billMaster?.unitNumber ?? ''
      // },
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

    sixthTableRows.push({
      firstItem: 'Billing period',
      secondItem: 'From:',
      thirdItem: billMaster.fromDateLocal,
      fourthItem: 'To:',
      fifthItem: billMaster.toDateLocal
    });

    let ninthTableCol = [];

    row = [];
    if (billMaster && billMaster.bills && billMaster.bills.length) {
      billMaster.bills.forEach(bill => {
        if (bill.billTariffDetails && bill.billTariffDetails.length) {
          for (let b = 0; b < bill.billTariffDetails.length; b++) {
            if (bill.billTariffDetails[b].slabSettingsId && bill.billTariffDetails[b].slabSettingsId > 0 && b == 0) {
              ninthTableCol = [
                'Slab',
                'Min Consumption',
                'Max Consumption',
                'Consumption',
                'Rate',
                'Amount'];
            } else if (bill.billTariffDetails[b].slabSettingsId == 0 && b == 0) {
              ninthTableCol = [
                'Season',
                'Week Type',
                'Peak Type',
                'Consumption',
                'Rate',
                'Amount'];
            }
            row.push(bill.billTariffDetails[b].season);
            row.push(bill.billTariffDetails[b].weekType);
            row.push(bill.billTariffDetails[b].peakType);
            row.push(bill.billTariffDetails[b].consumption);
            row.push(bill.billTariffDetails[b].rate);
            row.push(bill.billTariffDetails[b].amount);
            ninthTableRows.push(row);
            row = [];
          };
        }
      });
    }

    this.getNewLargeBillReport(firstTableCol, firstTableRows, thirdTableCol, thirdTableRows, fourthTableRows, fifthTableRows, sixthTableRows, seventhTableCol, seventhTableRows, billMaster, eighthTableRows, ninthTableCol, ninthTableRows);
  }

  getNewLargeBillReport(firstTableCol: any[], firstTableRows: any[], thirdTableCol: any[], thirdTableRows: any[], fourthTableRows: any[], fifthTableRows: any[], sixthTableRows: any[], seventhTableCol: any[], seventhTableRows: any[], billMaster: BillMaster, eighthTableRows: any[], ninthTableCol: any[], ninthTableRows: any[]) {


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
          cellWidth: 95,
          halign: 'center'
        },
        4: {
          cellWidth: 95,
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
          cellWidth: 380,
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
          cellWidth: 100,
          halign: 'center'
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
          cellWidth: 95,
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
          cellWidth: 60,
          halign: 'center'
        },
        1: {
          cellWidth: 155,
          halign: 'center'
        },
        2: {
          cellWidth: 85,
          halign: 'center'
        },
        3: {
          cellWidth: 85,
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
      didParseCell: function (seventhTableRows) {
        seventhTableRows.cell.styles.cellPadding = 1;
      }
    });

    const fifthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

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
          cellWidth: 130,
          halign: 'center'
        },
        1: {
          cellWidth: 85,
          halign: 'center'
        },
        2: {
          cellWidth: 85,
          halign: 'center'
        },
        3: {
          cellWidth: 85,
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
      didParseCell: function (ninthTableRows) {
        ninthTableRows.cell.styles.cellPadding = 1;
      }
    });

    let sixthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

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
    pdf.setTextColor(0, 0, 0);
    pdf.line(5, seventhTableEndY + 110, 607, seventhTableEndY + 110);

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

    var blob = pdf.output("blob");
    window.open(URL.createObjectURL(blob));
  }

  downloadBillReport(billMaster: BillMaster) {
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: ListItem[] = [];
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


    billMaster.bills.forEach(bill => {
      if (bill.billTransactions && bill.billTransactions.length) {
        bill.billTransactions.forEach(transaction => {
          // if (transaction.headDisplay && transaction.headDisplay.toLowerCase().includes('consumption')) {
          row.push(transaction.headDisplay)
          row.push(billMaster.fromDateLocal)
          row.push(billMaster.toDateLocal)
          row.push(bill.previousReading)
          row.push(bill.presentReading)
          row.push(bill.consumption + ' ' + bill.measuringUnit)
          row.push(bill.consumptionRate)
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

    billMaster.billCharges.forEach(billCharge => {
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

    this.getBillReport(billMaster, firstTableCol, firstTableRows, fourthTableRows, fifthTableRows, sixthTableRows);
  }

  // addImage(pdf: jsPDF, data: BillMaster) {
  //   try {
  //     if (data && data.client && data.client.imageProperties && data.client.imageProperties.length) {
  //       const imageProperty: ImageProperty = data.client.imageProperties.find(x => x.imageType.trim().toLowerCase() === 'invoice');
  //       if (imageProperty) {
  //         var img = new Image()
  //         img.src = this.filePath + '/uploads/' + data?.client?.photo; //'assets/img/' + data.client.photo
  //         pdf.addImage(img, 'png', imageProperty.imgX, imageProperty.imgY, imageProperty.imgW, imageProperty.imgH);
  //       } else {
  //         this.notificationMessage('Image properties not found. To see image on print, please configure image properties ', 'red-snackbar');
  //       }
  //     } else {
  //       this.notificationMessage('Image properties not found. To see image on print, please configure image properties ', 'red-snackbar');
  //     }
  //   }
  //   catch (err) {
  //     this.notificationMessage('Image not found.', 'red-snackbar');
  //   }
  //   return pdf;
  // }

  getBillReport(data: BillMaster, firstTableCol: any[], firstTableRows: any[], fourthTableRows: any[], fifthTableRows: any[], sixthTableRows: any[]) {

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
    pdf.text(meterReadingTableHeading.toUpperCase(), startX + 390, startY + 80);
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
      margin: { left: startX + 390 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 100,
          halign: 'left'
        },
        1: {
          cellWidth: 100,
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
    pdf.text(footerText, startX + 300, pageHeight - 60);
    pdf.setFont('none');
    pdf.setTextColor(0, 0, 0);
    pdf.text("Pay your bills before due date to avoid late payment surcharge", startX + 300 + footerTextWidth, pageHeight - 60);
    pdf.text("and disconnection.", startX + 300, pageHeight - 50);
    pdf.text(`You can log onto ${stringIsNullOrEmpty(data?.client?.website)} to pay your invoices \nTerms & Conditions for Supply of Utility Services`, startX + 300, pageHeight - 40);

    //for adding total number of pages // i.e 10 etc
    if (typeof pdf.putTotalPages === 'function') {
      pdf.putTotalPages(totalPagesExp);
    }
    var blob = pdf.output("blob");
    window.open(URL.createObjectURL(blob));
  }

  // New Bill Print Format added 27/05/2021
  downloadBillNewReport(billMaster: BillMaster) {
    const conversionKWH: number = 0.2843;
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
      'Consumption',
      'Consumption TR-HR'];

    let thirdTableCol = [
      'Customer AccountNumber',
      'Billing Period',
      'Previous Due',
      'Total for current period'
    ]; // initialization for headers

    let seventhTableCol = ['Charges',
      'Consumption',
      'Measuring Unit',
      'Tariff',
      'Total'];

    for (let a = 0; a < billMaster.bills.length; a++) {
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      row.push(billMaster.unitNumber)
      row.push(billMaster.bills[a].deviceName)
      row.push(this.decimalPipe.transform(billMaster.bills[a].previousReading, this.consumptionRoundOffFormat))
      row.push(this.decimalPipe.transform(billMaster.bills[a].presentReading, this.consumptionRoundOffFormat))
      if (billMaster.bills[a].isDifferentiateBill) {
        const previousReading: number = billMaster.bills[a].previousReading;
        const presentReading: number = billMaster.bills[a].presentReading;
        const consumption: number = presentReading - previousReading;
        row.push(this.decimalPipe.transform(consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      } else {
        row.push(this.decimalPipe.transform(billMaster.bills[a].consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      }
      if (billMaster.bills[a].utilityType === 'BTU' && billMaster.bills[a].billTransactions && billMaster.bills[a].billTransactions.length && billMaster.bills[a].billTransactions.findIndex(x => x.measuringUnitId && x.measuringUnitId === 2) > -1) {
        const consumptioTRHR: number = billMaster.bills[a].consumption * conversionKWH;
        row.push(this.decimalPipe.transform(consumptioTRHR, this.roundFormat))
      } else {
        row.push(0)
      }
      firstTableRows.push(row);
      row = [];
    }

    let totalAmount = 0;
    for (let a = 0; a < billMaster.bills.length; a++) {
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      const bill = billMaster.bills[a];
      for (let b = 0; b < bill.billTransactions.length; b++) {
        if (bill.billTransactions[b].headAmount) {
          row.push(bill.billNumber);
          row.push(bill.billTransactions[b].headDisplay)
          if (bill.utilityType === "BTU" && bill.billTransactions && bill.billTransactions.length && bill.billTransactions[b] && bill.billTransactions[b].measuringUnitId && bill.billTransactions[b].measuringUnitId === 2) {
            const consumptioTRHR: number = bill.consumption * conversionKWH;
            row.push(this.decimalPipe.transform(consumptioTRHR, this.roundFormat))
            row.push('TR-HR')
            row.push(bill.consumptionRate)
          } else {
            row.push(this.decimalPipe.transform(bill.consumption, this.consumptionRoundOffFormat))
            row.push(bill.measuringUnit)
            row.push(bill.consumptionRate)
          }
          row.push(this.decimalPipe.transform(bill.billTransactions[b].headAmount, this.roundFormat))
          seventhTableRows.push(row);
          row = [];
          totalAmount += bill.billTransactions[b].headAmount;
        }
      }
    }

    row.push(billMaster.accountNumber);
    row.push(billMaster.fromDateLocal + '-' + billMaster.toDateLocal);
    row.push(this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat));
    row.push(billMaster.billAmountLocal);
    thirdTableRows.push(row);


    billMaster.billCharges.forEach(billCharge => {
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

    //const vatItem = billMaster.billCharges.find(billCharge => billCharge.headDisplay === 'VAT');

    eighthTableRows.push(
      {
        label: 'Total Charges for Current Period',
        value: this.currencyPipe.transform(totalAmount, this.currency.toString(), true, this.roundFormat)
      });

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

    sixthTableRows.push({
      firstItem: 'Billing period',
      secondItem: 'From:',
      thirdItem: billMaster.fromDateLocal,
      fourthItem: 'To:',
      fifthItem: billMaster.toDateLocal
    });


    let ninthTableCol = [];

    row = [];
    if (billMaster && billMaster.bills && billMaster.bills.length) {
      billMaster.bills.forEach(bill => {
        if (bill.billTariffDetails && bill.billTariffDetails.length) {
          for (let b = 0; b < bill.billTariffDetails.length; b++) {
            if (bill.billTariffDetails[b].slabSettingsId && bill.billTariffDetails[b].slabSettingsId > 0 && b == 0) {
              ninthTableCol = [
                'Slab',
                'Min Consumption',
                'Max Consumption',
                'Consumption',
                'Rate',
                'Amount'];
            } else if (bill.billTariffDetails[b].slabSettingsId == 0 && b == 0) {
              ninthTableCol = [
                'Season',
                'Week Type',
                'Peak Type',
                'Consumption',
                'Rate',
                'Amount'];
            }
            row.push(bill.billTariffDetails[b].season);
            row.push(bill.billTariffDetails[b].weekType);
            row.push(bill.billTariffDetails[b].peakType);
            row.push(bill.billTariffDetails[b].consumption);
            row.push(bill.billTariffDetails[b].rate);
            row.push(bill.billTariffDetails[b].amount);
            ninthTableRows.push(row);
            row = [];
          };
        }
      });
    }

    this.getNewBillReport(firstTableCol, firstTableRows, thirdTableCol, thirdTableRows, fourthTableRows, fifthTableRows, sixthTableRows, seventhTableCol, seventhTableRows, billMaster, eighthTableRows, ninthTableCol, ninthTableRows);
  }

  // New Bill Print Format added 27/05/2021
  getNewBillReport(firstTableCol: any[], firstTableRows: any[], thirdTableCol: any[], thirdTableRows: any[], fourthTableRows: any[], fifthTableRows: any[], sixthTableRows: any[], seventhTableCol: any[], seventhTableRows: any[], billMaster: BillMaster, eighthTableRows: any[], ninthTableCol: any[], ninthTableRows: any[]) {

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
    let address: string = '';
    if (billMaster && billMaster.client && billMaster.client.addresses[0]) {
      address = billMaster.client.addresses[0].address1?.toLowerCase() ?? '' + ',' + billMaster.client.addresses[0].city?.toLowerCase() ?? '';
      if (address.trim() == ',') {
        address = '';
      }
    }
    pdf.text(address, Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0) + 5, startY + 15);
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
          cellWidth: 95,
          halign: 'center'
        },
        4: {
          cellWidth: 95,
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
          cellWidth: 380,
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
          cellWidth: 100,
          halign: 'center'
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
          cellWidth: 95,
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
          cellWidth: 60,
          halign: 'center'
        },
        1: {
          cellWidth: 155,
          halign: 'center'
        },
        2: {
          cellWidth: 85,
          halign: 'center'
        },
        3: {
          cellWidth: 85,
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
      didParseCell: function (seventhTableRows) {
        seventhTableRows.cell.styles.cellPadding = 1;
      }
    });

    const fifthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

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
          cellWidth: 130,
          halign: 'center'
        },
        1: {
          cellWidth: 85,
          halign: 'center'
        },
        2: {
          cellWidth: 85,
          halign: 'center'
        },
        3: {
          cellWidth: 85,
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
      didParseCell: function (ninthTableRows) {
        ninthTableRows.cell.styles.cellPadding = 1;
      }
    });

    const sixthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

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
    pdf.setTextColor(0, 0, 0);
    pdf.line(5, seventhTableEndY + 110, 607, seventhTableEndY + 110);



    const pageHeight = pdf.internal.pageSize.height;
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
    //for adding total number of pages // i.e 10 etc
    if (typeof pdf.putTotalPages === 'function') {
      pdf.putTotalPages(totalPagesExp);
    }
    var blob = pdf.output("blob");
    window.open(URL.createObjectURL(blob));
  }

  // New Bill Print Format added 01/06/2021
  downloadBillNewFormatReport(billMaster: BillMaster) {
    const conversionKWH: number = 0.2843;
    const spliter: string = ': ';
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: ListData[] = [];
    let thirdTableRows: any[] = [];
    let fourthTableRows: any[] = [];
    let fifthTableRows: any[] = [];
    let seventhTableRows: any[] = [];
    let eighthTableRows: ListData[] = [];
    let firstTableCol = [
      'Meter No',
      'Tarif',
      'Previous Reading KWH',
      'Present Reading KWH',
      'Consumption',
      'Consumption TR-HR',
      'Unit Rate ' + this.currency + '/TR-HR',
      'Amount'];

    let thirdTableCol = [
      'Customer Number',
      'Billing Period',
      'Total for current period'
    ]; // initialization for headers




    for (let a = 0; a < billMaster.bills.length; a++) {
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      row.push(billMaster.bills[a].deviceName)
      row.push(billMaster.bills[a].utilityType)
      row.push(this.decimalPipe.transform(billMaster.bills[a].previousReading, this.consumptionRoundOffFormat))
      row.push(this.decimalPipe.transform(billMaster.bills[a].presentReading, this.consumptionRoundOffFormat))
      row.push(this.decimalPipe.transform(billMaster.bills[a].consumption, this.consumptionRoundOffFormat))
      if (billMaster.bills[a].utilityType === 'BTU' && billMaster.bills[a].billTransactions && billMaster.bills[a].billTransactions.length && billMaster.bills[a].billTransactions.findIndex(x => x.measuringUnitId && x.measuringUnitId === 2) > -1) {
        const consumptioTRHR: number = billMaster.bills[a].consumption * conversionKWH;
        row.push(this.decimalPipe.transform(consumptioTRHR, this.roundFormat))
      } else {
        row.push(0)
      }
      row.push(billMaster.bills[a].consumptionRate)
      row.push(billMaster.bills[a].billAmountLocal)
      firstTableRows.push(row);
      row = [];
    }

    for (let a = 0; a < billMaster.bills.length; a++) {
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      const bill = billMaster.bills[a];
      for (let b = 0; b < bill.billTransactions.length; b++) {
        row.push(bill.utilityType + '-' + bill.billTransactions[b].headDisplay)
        row.push(this.decimalPipe.transform(bill.consumption, this.consumptionRoundOffFormat))
        row.push(bill.consumptionUnit)
        row.push(bill.consumptionRate)
        row.push(this.decimalPipe.transform(bill.billTransactions[b].headAmount, this.roundFormat))
        seventhTableRows.push(row);
        row = [];
      }
    }

    row.push(billMaster.accountNumber);
    row.push(billMaster.fromDateLocal + '-' + billMaster.toDateLocal);
    row.push(billMaster.billAmountLocal);
    thirdTableRows.push(row);


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

    billMaster.billCharges.forEach(billCharge => {
      if (billCharge.headDisplay !== 'VAT') {
        const existingitem = otherCharges.find(x => x.label === billCharge.headDisplay);
        if (existingitem) {
          existingitem.value += billCharge.headAmount;
        } else {
          otherCharges.push({ label: billCharge.headDisplay, value: billCharge.headAmount });
        }
      }
    });

    //const vatItem = billMaster.billCharges.find(billCharge => billCharge.headDisplay === 'VAT');

    otherCharges.forEach(x => {
      secondTableRows.push({ label: x.label, value: this.currencyPipe.transform(x.value, this.currency.toString(), true, this.roundFormat) });
    });

    if (billMaster.billTaxDetails && billMaster.billTaxDetails.length) {
      billMaster.billTaxDetails.forEach(billTaxDetail => {
        secondTableRows.push({ label: billTaxDetail.taxDisplayName, value: this.currencyPipe.transform(billTaxDetail.taxAmount, this.currency.toString(), true, this.roundFormat) });
      });
    }

    eighthTableRows.push({
      label: 'Total for Current Period',
      value: this.currencyPipe.transform(billMaster.billAmount + billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
    })

    fourthTableRows.push({
      label: 'Bill No',
      value: spliter + billMaster.billNumber
    }, {
      label: 'Date of issue',
      value: spliter + billMaster.billDateLocal
    }, {
      label: 'Due Date',
      value: spliter + billMaster.dueDateLocal
    }
    );

    fifthTableRows.push(
      {
        label: 'Billing period',
        value: spliter + ` From: ${billMaster.fromDateLocal} To: ${billMaster.toDateLocal} `
      },
      {
        label: 'Customer Account',
        value: spliter + billMaster.accountNumber
      },
      {
        label: 'Customer Name',
        value: spliter + billMaster.ownerName
      },
      {
        label: 'Unit No',
        value: spliter + billMaster.unitNumber
      },
      {
        label: 'Address',
        value: spliter + billMaster?.client?.addresses[0]?.address1
      },
      {
        label: 'City',
        value: spliter + billMaster?.client?.addresses[0]?.city
      },
      {
        label: 'P.O Box',
        value: spliter + billMaster?.client?.addresses[0]?.zipPostalCode
      },
      {
        label: 'Phone number',
        value: spliter + billMaster?.receiverDetails[0]?.phoneNumber ?? ''
      },
      {
        label: 'Fax Number',
        value: spliter
      },
      {
        label: 'Client',
        value: spliter + billMaster?.client?.clientName
      },
      {
        label: 'Client TRN',
        value: spliter + billMaster?.client?.trnNo
      }
    );

    this.getNewBillFormatReport(firstTableCol, firstTableRows, secondTableRows, thirdTableCol, thirdTableRows, fourthTableRows, fifthTableRows, billMaster, eighthTableRows);
  }

  // New Bill Print Format added 01/06/2021
  getNewBillFormatReport(firstTableCol: any[], firstTableRows: any[], secondTableRows: any[], thirdTableCol: any[], thirdTableRows: any[], fourthTableRows: any[], fifthTableRows: any[], billMaster: BillMaster, eighthTableRows: any[]) {

    const totalPagesExp = "1";
    var img = new Image()
    img.src = this.filePath + '/uploads/' + billMaster.client.photo
    let pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter"
    });

    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    let startY = 15;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.setFont("Cambria");
    pdf.text("Billing Statement".toUpperCase(), 10, startY + 5);
    if (img.height) {
      pdf.addImage(img, 'png', 450, 35, 80, 55);
    }
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
          cellWidth: 65,
          halign: 'center'
        },
        1: {
          cellWidth: 72,
          halign: 'center'
        },
        2: {
          cellWidth: 80,
          halign: 'center'
        },
        3: {
          cellWidth: 80,
          halign: 'center'
        },
        4: {
          cellWidth: 72,
          halign: 'center'
        },
        5: {
          cellWidth: 72,
          halign: 'center'
        },
        6: {
          cellWidth: 72,
          halign: 'center'
        },
        7: {
          cellWidth: 72,
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
          cellWidth: 100
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
          cellWidth: 100
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
    pdf.text(billMaster?.client?.termsConditions[0]?.termsAndCondition.replace('{{ClientName}}', billMaster.client.clientName).replace('{{TRNNumber}}', billMaster.client.trnNo).replace('{{Currency}}', this.currency), 10, fifthTableEndY + 30);
    var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
    pdf.text("Notice :- Please tear and attach the slip  along with your payment", 10, pageHeight - 90);

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
          cellWidth: 150,
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

    //for adding total number of pages // i.e 10 etc
    if (typeof pdf.putTotalPages === 'function') {
      pdf.putTotalPages(totalPagesExp);
    }
    var blob = pdf.output("blob");
    window.open(URL.createObjectURL(blob));
  }


  // downloadReport(billMaster: BillMaster) {
  //   let row: any[] = [];
  //   let firstTableRows: any[] = [];
  //   let secondTableRows: ListItem[] = [];
  //   let thirdTableRows: any[] = [];
  //   let fourthTableRows: ListData[] = [];
  //   let fifthTableRows: any[] = [];
  //   let sixthTableRows: ListData[] = [];
  //   let firstTableCol = [
  //     'Services Description',
  //     'From',
  //     'To',
  //     'Previous',
  //     'Current',
  //     '(KWH)',
  //     'Rate ',
  //     'Charges ' + this.currency];

  //   let thirdTableCol = [
  //     'Customer Id',
  //     'Billing Period',
  //     'Total for current period'
  //   ]; // initialization for headers

  //   for (let a = 0; a < billMaster.billCharges.length; a++) {
  //     if (billMaster.billCharges[a].headDisplay !== 'VAT') {
  //       row.push(billMaster.billCharges[a].headDisplay)
  //       row.push(billMaster.fromDateLocal)
  //       row.push(billMaster.toDateLocal)
  //       row.push('')
  //       row.push('')
  //       row.push('')
  //       row.push('')
  //       row.push(billMaster.billCharges[a].headAmount)
  //       firstTableRows.push(row);
  //       row = [];
  //     }
  //   }

  //   const title = 'Invoice';

  //   billMaster.billCharges.forEach(billCharge => {
  //     if (billCharge.headDisplay !== 'VAT') {
  //       const existingitem = secondTableRows.find(x => x.label === billCharge.headDisplay);
  //       if (existingitem) {
  //         existingitem.value += billCharge.headAmount;
  //       } else {
  //         secondTableRows.push({ label: billCharge.headDisplay, value: billCharge.headAmount });
  //       }
  //     }
  //   });





  //   fourthTableRows.push(
  //     {
  //       label: 'Billing Period                                 Meter Reading                    Consumption',
  //       value: ''
  //     });


  //   fifthTableRows.push(
  //     {
  //       label: 'Account Number:',
  //       value: billMaster.accountNumber
  //     },
  //     {
  //       label: 'Meter Number:',
  //       value: ''
  //     },
  //     {
  //       label: 'Unit Number:',
  //       value: billMaster.unitNumber
  //     },
  //     {
  //       label: 'Billing Date:',
  //       value: billMaster.billDateLocal
  //     },
  //     {
  //       label: 'Due Date:',
  //       value: billMaster.dueDateLocal
  //     }
  //   );

  //   const vatItem = billMaster.billCharges.find(billCharge => billCharge.headDisplay === 'VAT');

  //   let totalAmount = 0;
  //   firstTableRows.forEach(x => {
  //     totalAmount += Number(x[7])
  //   })


  //   sixthTableRows.push(
  //     {
  //       label: 'Current Month Total:',
  //       value: this.currencyPipe.transform(totalAmount, this.currency.toString(), true, this.roundFormat)
  //     },
  //     {
  //       label: 'VAT 5%:',
  //       value: this.currencyPipe.transform(vatItem?.headAmount, this.currency.toString(), true, this.roundFormat)
  //     },
  //     {
  //       label: 'Current Month + VAT:',
  //       value: billMaster.billAmountLocal
  //     },
  //     {
  //       label: 'Previous Bill Outstanding Balance:',
  //       value: this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
  //     },
  //     {
  //       label: 'Total Due incl VAT:',
  //       value: this.currencyPipe.transform(billMaster.billAmount + billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
  //     }
  //   );

  //   this.getReport(billMaster, firstTableCol, firstTableRows, secondTableRows, thirdTableCol, thirdTableRows, fourthTableRows, fifthTableRows, sixthTableRows, title);
  // }

  // getReport(data: BillMaster, firstTableCol: any[], firstTableRows: any[], secondTableRows: any[], thirdTableCol: any[], thirdTableRows: any[], fourthTableRows: any[], fifthTableRows: any[], sixthTableRows: any[], title: string) {

  //   const totalPagesExp = "1";
  //   var img = new Image()
  //   img.src = 'assets/img/logo.png'
  //   var img1 = new Image()
  //   img1.src = 'assets/img/lu.JPG'
  //   let pdf = new jsPDF({
  //     orientation: "portrait",
  //     unit: "pt",
  //     format: "letter"
  //   });

  //   pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
  //   let startX = 10;
  //   let startY = 30;
  //   pdf.setFontSize(30);
  //   pdf.addImage(img, 'png', 5, 5, 190, img.height);
  //   pdf.addImage(img1, 'png', 547, 10, 56, 56);
  //   pdf.setTextColor(0, 0, 0);
  //   pdf.setFontSize(14);
  //   pdf.setFont("Cambria");
  //   pdf.text("Tax Invoice", startX + 250, startY);
  //   pdf.setFontSize(9);
  //   pdf.setTextColor(25, 118, 210);
  //   pdf.setFont('Cambria', 'bold');
  //   pdf.text("Logic Utilities District Cooling Services LLC", startX, startY + 30);
  //   pdf.setFont('Cambria', 'normal');
  //   pdf.text("TRN: 100567483100003", startX, startY + 40);
  //   pdf.text("PO Box 127404", startX, startY + 50);
  //   pdf.text("Office 201, Al Zarouni Business Centre, Al Barsha 1, Dubai, UAE", startX, startY + 60);
  //   pdf.text("Phone:800 Logic (56442)", startX, startY + 70);
  //   pdf.text("Email: enquiry@logicutilities.com, Web: www.logicutilities.com", startX, startY + 80);
  //   pdf.setFillColor(241, 241, 244);
  //   pdf.setDrawColor(206, 203, 203);
  //   pdf.rect(10, startY + 90, 250, 90, 'FD');
  //   pdf.setTextColor(0, 0, 0);
  //   pdf.setFontSize(12);
  //   pdf.text(data?.ownerName.toUpperCase(), startX + 10, startY + 105);
  //   pdf.text("CUSTOMER TRN: " + data.trn, startX + 10, startY + 125);
  //   pdf.text("unit #" + data.unitNumber, startX + 10, startY + 140);
  //   pdf.setFontSize(10);
  //   pdf.text(data.clientName, startX + 10, startY + 155);
  //   pdf.text("Al Barsha 1, Dubai, UAE", startX + 10, startY + 170);
  //   pdf.setFontSize(9);

  //   pdf.setLineWidth(.1);
  //   pdf.line(5, startY + 235, 607, startY + 235);
  //   pdf.setFontSize(10);
  //   const meterReadingTableHeading = 'Invoice#: ';
  //   pdf.setFont('bold');
  //   pdf.text(meterReadingTableHeading.toUpperCase(), startX + 390, startY + 80);
  //   pdf.setTextColor(25, 118, 210);
  //   const tableHeadingWidth = pdf.getTextWidth(meterReadingTableHeading);
  //   let billNumber: string = '';
  //   if (data?.billNumber) {
  //     billNumber = data.billNumber?.toUpperCase();
  //   };
  //   pdf.text(billNumber, 20 + 390 + tableHeadingWidth, startY + 80);
  //   pdf.setFont('none');
  //   pdf.setTextColor(0, 0, 0);
  //   pdf.setFontSize(9);


  //   const autoTable = 'autoTable';
  //   pdf[autoTable]('', fifthTableRows, {
  //     startX: startX + 200,
  //     startY: startY + 90,
  //     styles: {
  //       overflow: 'linebreak',
  //       cellWidth: 'wrap',
  //       fontSize: 9,
  //       cellPadding: 4,
  //       overflowColumns: 'linebreak',
  //       lineColor: [0, 0, 0]
  //     },
  //     margin: { left: startX + 390 },
  //     theme: 'grid',
  //     tableWidth: 'auto',
  //     cellWidth: 'wrap',
  //     columnStyles: {
  //       0: {
  //         cellWidth: 100,
  //         halign: 'left'
  //       },
  //       1: {
  //         cellWidth: 100,
  //         halign: 'right'
  //       }
  //     },
  //     didParseCell: function (fourthTableRows) {
  //       const col = fourthTableRows.column.index;
  //       if (col == 0 || col == 1) {
  //         fourthTableRows.cell.styles.rowHeight = 1;
  //       }
  //     },
  //     headStyles: {
  //       lineWidth: 0.1,
  //       lineColor: [0, 0, 0]
  //     }
  //   });

  //   var pageContent = function (data) {
  //     // HEADER

  //     // FOOTER
  //     var str = "Page " + data.pageCount;
  //     // Total page number plugin only available in jspdf v1.0+
  //     if (typeof pdf.putTotalPages === 'function') {
  //       str = str + " of " + totalPagesExp;
  //     }
  //     pdf.setFontSize(9);
  //     var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
  //     pdf.text(str, data.settings.margin.left, pageHeight - 10); // showing current page number
  //   };

  //   pdf[autoTable]('', fourthTableRows, {
  //     startX: 10,
  //     startY: startY + 190,
  //     styles: {
  //       overflow: 'linebreak',
  //       cellWidth: 'wrap',
  //       fontSize: 9,
  //       cellPadding: 4,
  //       overflowColumns: 'linebreak',
  //       lineColor: [0, 0, 0]
  //     },
  //     margin: { top: startY + 190, left: 10 },
  //     theme: 'grid',
  //     tableWidth: 'auto',
  //     cellWidth: 'wrap',
  //     columnStyles: {
  //       0: {
  //         cellWidth: 515,
  //         fontStyle: 'bold'
  //       },
  //       1: {
  //         cellWidth: 75,
  //         fontStyle: 'bold',
  //         halign: 'right'
  //       }
  //     },
  //     didParseCell: function (fourthTableRows) {
  //       const col = fourthTableRows.column.index;
  //       if (col == 0 || col == 1) {
  //         fourthTableRows.cell.styles.rowHeight = 1;
  //       }
  //     },
  //     headStyles: {
  //       lineWidth: 0.1,
  //       lineColor: [0, 0, 0]
  //     }
  //   });

  //   const secondTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));


  //   pdf[autoTable](firstTableCol, firstTableRows, {
  //     startX: 10,
  //     startY: secondTableEndY,
  //     didDrawPage: pageContent,
  //     styles: {
  //       overflow: 'linebreak',
  //       cellWidth: 'wrap',
  //       fontSize: 9,
  //       cellPadding: 6,
  //       overflowColumns: 'linebreak',
  //       lineColor: [0, 0, 0]
  //     },
  //     margin: { top: secondTableEndY, left: 10 },
  //     theme: 'grid',
  //     tableWidth: 'auto',
  //     cellWidth: 'wrap',
  //     columnStyles: {
  //       0: {
  //         cellWidth: 100,
  //         halign: 'left'
  //       },
  //       1: {
  //         cellWidth: 80,
  //         halign: 'center'
  //       },
  //       2: {
  //         cellWidth: 80,
  //         halign: 'center'
  //       },
  //       3: {
  //         cellWidth: 60,
  //         halign: 'center'
  //       },
  //       4: {
  //         cellWidth: 60,
  //         halign: 'center'
  //       },
  //       5: {
  //         cellWidth: 75,
  //         halign: 'center'
  //       },
  //       6: {
  //         cellWidth: 60,
  //         halign: 'right'
  //       },
  //       7: {
  //         cellWidth: 75,
  //         halign: 'right'
  //       }
  //     },
  //     headStyles: {
  //       lineWidth: 0.1,
  //       lineColor: [0, 0, 0],
  //       halign: 'center',
  //       fillColor: [25, 118, 210]
  //     }
  //   });
  //   pdf.setTextColor(0, 0, 0);

  //   const thirdTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

  //   pdf.setTextColor(25, 118, 210);
  //   pdf.setFontSize(12);
  //   pdf.text("Bank Payment Account Details", startX, thirdTableEndY + 20);
  //   pdf.setTextColor(0, 0, 0);
  //   pdf.setFontSize(9);
  //   pdf.text("Account Title: LOGIC UTILITIES DISTRICT COOLING SERVICES L.L.C", startX, thirdTableEndY + 40);
  //   pdf.text("Account #: 019100074892", startX, thirdTableEndY + 50);
  //   pdf.text("IBAN #: AE54 0330 0000 1910 0074 892", startX, thirdTableEndY + 60);
  //   pdf.text("Bank Name: MASHREQ BANK - DUBAI MALL BRANCH", startX, thirdTableEndY + 70);
  //   pdf.text("Swift Code: BOMLAEAD", startX, thirdTableEndY + 80);
  //   pdf.setFontSize(9);


  //   pdf[autoTable]('', sixthTableRows, {
  //     startX: 300,
  //     startY: thirdTableEndY + 20,
  //     styles: {
  //       overflow: 'linebreak',
  //       cellWidth: 'wrap',
  //       fontSize: 9,
  //       cellPadding: 4,
  //       overflowColumns: 'linebreak',
  //       lineColor: [0, 0, 0]
  //     },
  //     margin: { left: startX + 310 },
  //     theme: 'grid',
  //     tableWidth: 'auto',
  //     cellWidth: 'wrap',
  //     columnStyles: {
  //       0: {
  //         cellWidth: 180,
  //         halign: 'left'
  //       },
  //       1: {
  //         cellWidth: 100,
  //         halign: 'right'
  //       }
  //     },
  //     headStyles: {
  //       lineWidth: 0.1,
  //       lineColor: [0, 0, 0],
  //       halign: 'center'
  //     }
  //   });

  //   const fourthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
  //   pdf.setTextColor(255, 0, 0);
  //   pdf.text("Note: A Late Fee will be applied after the due date. A Default Payment \nPenalty will be added to any unit that is 45 days or more in arrears.", startX + 310, fourthTableEndY + 10);

  //   pdf.setTextColor(25, 118, 210);
  //   pdf.setFontSize(12);
  //   pdf.text("USAGE TIPS to reduce consumption:", startX, fourthTableEndY + 10);
  //   pdf.text("Please Try to:", startX, fourthTableEndY + 30);
  //   pdf.setTextColor(0, 0, 0);
  //   pdf.setFontSize(9);
  //   pdf.text("- Keep filters clean", startX + 20, fourthTableEndY + 40);
  //   pdf.text("- Set thermostats between 23C and 25C", startX + 20, fourthTableEndY + 50);
  //   pdf.text("- Keep vents unblocked", startX + 20, fourthTableEndY + 60);
  //   pdf.text("- Keep doors and windows closed", startX + 20, fourthTableEndY + 70);
  //   pdf.text("- Undertake regular maintenance of the system", startX + 20, fourthTableEndY + 80);
  //   pdf.setTextColor(25, 118, 210);
  //   pdf.setFontSize(12);
  //   pdf.text("Please Do Not:", startX, fourthTableEndY + 100);
  //   pdf.setTextColor(0, 0, 0);
  //   pdf.setFontSize(9);
  //   pdf.text("- Set thermostats to 20C or lower", startX + 20, fourthTableEndY + 110);
  //   pdf.text("- Block vents", startX + 20, fourthTableEndY + 120);
  //   pdf.text("- Leave doors and windows open", startX + 20, fourthTableEndY + 130);
  //   pdf.text("- Leave heat producing appliances near thermostats", startX + 20, fourthTableEndY + 140);


  //   pdf.setFillColor(119, 183, 11);
  //   var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
  //   pdf.rect(startX + 310, fourthTableEndY + 30, 280, pageHeight - 80 - (fourthTableEndY + 30), 'FD');
  //   pdf.setFont("Comic Sans");
  //   pdf.setTextColor(255, 255, 255);
  //   pdf.setFontSize(16);
  //   const boldText = 'ADVERTISE WITH US';
  //   pdf.text(boldText, startX + 350, fourthTableEndY + 50);
  //   const boldTextWidth = pdf.getTextWidth(boldText);
  //   pdf.setLineWidth(.1);
  //   pdf.line(startX + 350, fourthTableEndY + 55, startX + 350 + boldTextWidth, fourthTableEndY + 55);
  //   pdf.setFontSize(9);
  //   pdf.text("For advertisement, contact at", startX + 380, fourthTableEndY + 65);
  //   pdf.text("800 Logic (56442)", startX + 380, fourthTableEndY + 75);
  //   pdf.text("enquiry@logicutilities.com", startX + 380, fourthTableEndY + 85);
  //   pdf.text("www.logicutilities.com", startX + 380, fourthTableEndY + 95);

  //   pdf.setTextColor(0, 0, 0);
  //   pdf.setLineWidth(.1);
  //   pdf.line(5, pageHeight - 70, 607, pageHeight - 70);
  //   pdf.text("For any enquiries, write to us enquiry@logicutilities.com \nor Logon to www.logicutilites.com", startX, pageHeight - 60);
  //   pdf.setTextColor(255, 0, 0);
  //   pdf.setFont('bold');
  //   const footerText = "Notice:";
  //   const footerTextWidth = pdf.getTextWidth(footerText);
  //   pdf.text(footerText, startX + 330, pageHeight - 60);
  //   pdf.setFont('none');
  //   pdf.setTextColor(0, 0, 0);
  //   pdf.text("Pay your bills before due date to avoid late payment surcharge", startX + 330 + footerTextWidth, pageHeight - 60);
  //   pdf.text("and disconnection.", startX + 330, pageHeight - 50);
  //   pdf.text("You can log onto www.logicutilites.com to pay your invoices \nTerms & Conditions for Supply of Utility Services", startX + 330, pageHeight - 40);

  //   //for adding total number of pages // i.e 10 etc
  //   if (typeof pdf.putTotalPages === 'function') {
  //     pdf.putTotalPages(totalPagesExp);
  //   }
  //   var blob = pdf.output("blob");
  //   window.open(URL.createObjectURL(blob));
  // }

  onRefund(row: Contract) {
    row.type = 'Refund';
    this.dialog.open(BillRefundComponent, { data: row }).afterClosed().subscribe((refund: Refund) => {
      if (refund) {
        this.billSettlementService.saveRefund(refund).subscribe({
          next: response => {
            this.notificationMessage('Refund saved successfully', 'green-snackbar');
            this.onFilterData();
          },
          error: (err) => {
            this.notificationMessage(err, 'red-snackbar');
          }
        });
      }
    });
  }



  getMovedOutTenants() {
    this.contracts = null;
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.contractService.getMovedOutTenants(this.clientId).subscribe((contracts: Contract[]) => {
      contracts = contracts.map(contract => new Contract(contract));
      contracts.forEach(x => {
        x.securityDepositLocal = this.currencyPipe.transform(x.securityDeposit, this.currency.toString(), true, this.roundFormat);
        x.contractDateLocal = this.date.transform(x.contractDate.toString(), this.dateFormat.toString());
        x.contractEndDateLocal = this.date.transform(x.contractEndDate.toString(), this.dateFormat.toString());
        x.securityDepositInHand = x.receivedAmount - x.refundAmount;
        x.securityDepositInHandLocal = this.currencyPipe.transform(x.securityDepositInHand, this.currency.toString(), true, this.roundFormat);
        x.receivedAmountLocal = this.currencyPipe.transform(x.receivedAmount, this.currency.toString(), true, this.roundFormat);
        x.refundAmountLocal = this.currencyPipe.transform(x.refundAmount, this.currency.toString(), true, this.roundFormat);
        x.remainingAmountLocal = this.currencyPipe.transform(x.remainingAmount, this.currency.toString(), true, this.roundFormat);
      });
      this.subject$.next(contracts);
    },
      // error: () => {
      //   this.notificationMessage('End Contracts Not Found.', 'red-snackbar');
      //   this.contracts = null;
      //   this.listData = new MatTableDataSource(this.contracts);
      // }
    );
    this.listData = new MatTableDataSource(this.contracts);

    this.data$.pipe(filter(data => !!data)).subscribe((contracts) => {
      this.contracts = contracts;
      this.listData.data = contracts;
    });
    this.ngAfterViewInit();
  }

  //Get Contracts about to Expire in 30 days.
  getContractsAboutToExpire() {
    this.contracts = [];
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.contractService.getContractsAboutToExpire(this.clientId).subscribe((contracts: Contract[]) => {
      contracts = contracts.map(contract => new Contract(contract));

      contracts.forEach(x => {
        x.securityDepositLocal = this.currencyPipe.transform(x.securityDeposit, this.currency.toString(), true, this.roundFormat);
        x.contractDateLocal = this.date.transform(x.contractDate.toString(), this.dateFormat.toString());
        x.contractEndDateLocal = this.date.transform(x.contractEndDate.toString(), this.dateFormat.toString());
        x.securityDepositInHand = x.receivedAmount - x.refundAmount;
        x.securityDepositInHandLocal = this.currencyPipe.transform(x.securityDepositInHand, this.currency.toString(), true, this.roundFormat);
        x.receivedAmountLocal = this.currencyPipe.transform(x.receivedAmount, this.currency.toString(), true, this.roundFormat);
        x.refundAmountLocal = this.currencyPipe.transform(x.refundAmount, this.currency.toString(), true, this.roundFormat);
        x.remainingAmountLocal = this.currencyPipe.transform(x.remainingAmount, this.currency.toString(), true, this.roundFormat);
      });
      this.subject$.next(contracts);
    }
      // error: () => {
      //   this.notificationMessage('Contracts Not Found.', 'red-snackbar');

      //   this.listData = new MatTableDataSource(this.contracts);
      // }
    );
    this.listData = new MatTableDataSource(this.contracts);

    this.data$.pipe(filter(data => !!data)).subscribe((contracts) => {
      this.contracts = contracts;
      this.listData.data = contracts;
    });
    this.ngAfterViewInit();
  }

  toggleMovedOutTenant(value) {
    this.movedOut = !value;
    if (this.movedOut)
      this.reminder = value;
    this.getContractDetails();
  }

  toggleContractsReminder(value) {
    this.reminder = !value;
    if (this.reminder)
      this.movedOut = value;
    this.getContractDetails();
  }

  onRefundHistory(row) {
    this.router.navigate(['bills/create-refund'], { queryParams: { id: row.tenantId } });
  }

  toggleAllSelection() {
    if (this.allSelected.selected) {
      this.selectFilterModes = [this.filterModes.map(item => item.value), 0];
    } else {
      this.selectFilterModes = [];
    }
  }

  togglePerOne() {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
    }
    if (this.selectFilterModes.length >= this.filterModes.length) {
      this.allSelected.select();
    }
  }

  onReceivePayment(row: Contract) {
    if (row) {
      row.type = 'Receive SD Payment';
      this.dialog.open(BillRefundComponent, { data: row }).afterClosed().subscribe((payment: Payment) => {
        if (payment) {
          this.onGenerateInoice(row, payment);
        }
      });
    }
  }

  onSavePayment(payment: Payment) {
    this.billSettlementService.saveBillPayments(payment).subscribe({
      next: response => {
        if (response) {
          this.notificationMessage('Security deposit payment save successfully', 'green-snackbar');
          this.getContractDetails();
        } else {
          this.notificationMessage('Security deposit payment save failed', 'red-snackbar');
        }
      },
      error: (err) => {
        this.notificationMessage('Security deposit payment save failed', 'red-snackbar');
      }
    });
  }

  updatePaymentDetails(payment: Payment, billMasterId: number) {
    payment.paymentTransactions.forEach(x => x.billId = billMasterId);
  };

//Security Deposit Print
  onPrintReceipt(row: Contract) {
    this.pdfsToMerge = [];

    if (row.billMasters && row.billMasters.length) {
      let securityDepositBillMasters: BillMaster[] = row.billMasters.filter(x => x.paymentId && x.paymentId > 0 && x.billTypeId == 5);      
      securityDepositBillMasters.forEach(x => {
          this.onGetPaymentDetail(x.paymentId);
      });
    }
  }

  receiptView(payments: Payment[]) {
    this.billService.sdReceiptView(payments).subscribe({
      next: data => {
        if (data) {
          this.downloadSDFile(data);
        } else {
          this.notificationMessage('No data to print', 'red-snackbar');
        }
      },
      error: (err) => {
        this.notificationMessage('No data to print', 'red-snackbar');
      }
    });
  }

  async downloadSDFile(data: any[]) {
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

  onGetPaymentDetail(paymentId: number, count: number = 0) {    
    this.payments = [];
    const clientId = Number(this.cookieService.get('globalClientId'));
    this.billService.getPaymentDetail(paymentId, clientId).subscribe(
      {
        next: payments => {
          payments.forEach(payment => {
            payment.paymentDateLocal = this.date.transform(payment.paymentDate.toString(), this.dateFormat.toString());
            payment.referenceDateLocal = this.date.transform(payment.referenceDate.toString(), this.dateFormat.toString());
            payment.paymentAmountLocal = this.currencyPipe.transform(payment.paymentAmount, this.currency.toString(), true, this.roundFormat);
            payment.advanceAmountLocal = this.currencyPipe.transform(payment.advanceAmount, this.currency.toString(), true, this.roundFormat);
            if (payment.billMasters && payment.billMasters.length) {
              payment.billMasters.forEach(billMaster => {
                billMaster.billDateLocal = this.date.transform(billMaster?.billDate?.toString(), this.dateFormat.toString());
                billMaster.billAmountLocal = this.currencyPipe.transform(billMaster?.billAmount, this.currency.toString(), true, this.roundFormat);
                billMaster.fromDateLocal = this.date.transform(billMaster?.fromDate?.toString(), this.dateFormat.toString());
                billMaster.toDateLocal = this.date.transform(billMaster?.toDate?.toString(), this.dateFormat.toString());
                billMaster.dueDateLocal = this.date.transform(billMaster?.dueDate?.toString(), this.dateFormat.toString());
                billMaster.paidLocal = this.currencyPipe.transform(billMaster?.paid?.toString(), this.currency.toString(), true, this.roundFormat);
              });
            }            
            //this.downloadReport(payment);
            // if (this.pdfsToMerge.length == count) {
            //   this.downloadFile();
            // }
          });
          this.payments = payments;
          this.receiptView(this.payments);
        },
        error: () => {
          this.notificationMessage('Payment details not found', 'red-snackbar');
        }
      });
      
  }

  async downloadFile() {
    const mergedPdf = await PDFDocument.create();
    for (const pdfCopyDoc of this.pdfsToMerge) {
      const pdfBytes = await fetch(pdfCopyDoc).then(res => res.arrayBuffer())
      //const pdfBytes = fs.readFileSync(pdfCopyDoc);
      const pdf = await PDFDocument.load(pdfBytes);
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



  downloadReport(payment: Payment) {
    let firstTableRows: any[] = [];
    let secondTableRows: ListData[] = [];
    let thirdTableRows: any[] = [];
    let fourthTableRows: ListData[] = [];
    let fifthTableRows: any[] = [];
    let sixthTableRows: ListData[] = [];
    let firstTableCol = [];
    let thirdTableCol = [];

    const title = 'Receipt';

    let invoiceNumber = '';
    let unitNumber = '';

    const uniqueBillNumbers = Array.from(new Set(payment.billMasters.map(x => x.billNumber)));
    const uniqueUnitNumbers = Array.from(new Set(payment.billMasters.map(x => x.unitNumber)));

    if (uniqueBillNumbers && uniqueBillNumbers.length) {
      uniqueBillNumbers.forEach(x => {
        invoiceNumber += x + ',';
      });
    }

    if (uniqueUnitNumbers && uniqueUnitNumbers.length) {
      uniqueUnitNumbers.forEach(x => {
        unitNumber += x + ',';
      });
    }

    fifthTableRows.push(
      {
        label: 'Receipt Number:',
        value: payment.paymentNumber
      },
      {
        label: 'Receipt Date:',
        value: payment.paymentDateLocal
      },
      {
        label: 'Account Number:',
        value: payment.accountNumber
      },
      {
        label: 'Unit Number:',
        value: unitNumber.trim().indexOf(',') === 0 ? unitNumber.trim().slice(1).slice(0, -1) : unitNumber.trim().slice(0, -1)
      },
      {
        label: 'Mode of payment:',
        value: payment.paymentMode
      }
    );


    let paidAmount = 0;
    payment.billMasters.forEach(x => {
      paidAmount += x.paid;
    })

    const balanceAmount = payment.outStandingAmount - paidAmount;

    secondTableRows.push(
      {
        label: 'Total Outstanding Amount :',
        value: this.currencyPipe.transform(payment.outStandingAmount, this.currency.toString(), true, this.roundFormat)
      },
      {
        label: 'Received Payments :',
        value: payment.paymentAmountLocal
      },
      {
        label: '',
        value: ''
      },
      {
        label: 'Balance Outstanding :',
        value: this.currencyPipe.transform(balanceAmount, this.currency.toString(), true, this.roundFormat)
      }
    );

    this.getReport(payment, secondTableRows, fifthTableRows);
  }

  addImage(pdf: jsPDF, data: Payment) {
    try {
      if (data && data.billMasters && data.billMasters.length && data.billMasters[0] && data.billMasters[0].client && data.billMasters[0].client.imageProperties && data.billMasters[0].client.imageProperties.length) {
        const imageProperty: ImageProperty = data.billMasters[0].client.imageProperties.find(x => x.imageType.trim().toLowerCase() === 'receipt');
        if (imageProperty) {
          var img = new Image()
          img.src = this.filePath + '/uploads/' + data?.billMasters[0].client?.photo; //'assets/img/' + data.client.photo
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

  getReport(data: Payment, secondTableRows: any[], fifthTableRows: any[]) {
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
    this.addImage(pdf, data);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont("Cambria", 'bold');
    pdf.text("SECURITY DEPOSIT PAYMENT RECEIPT", startX + 170, startY);
    pdf.setFont('Cambria', 'normal');
    pdf.setFontSize(14);
    pdf.text(stringIsNullOrEmpty(data?.billMasters[0]?.client?.clientName).toUpperCase(), startX, startY + 20);
    pdf.setFontSize(10);
    pdf.text("TRN: " + stringIsNullOrEmpty(data?.billMasters[0]?.client?.trnNo), startX, startY + 30);
    pdf.text("PO Box " + stringIsNullOrEmpty(data?.billMasters[0]?.client?.addresses[0]?.zipPostalCode), startX, startY + 40);
    pdf.text(stringIsNullOrEmpty(data?.billMasters[0]?.client?.addresses[0]?.location, ',') + stringIsNullOrEmpty(data?.billMasters[0]?.client?.addresses[0]?.city, ',') + stringIsNullOrEmpty(data?.billMasters[0]?.client?.addresses[0]?.country, ','), startX, startY + 50);
    pdf.text("Phone: " + stringIsNullOrEmpty(data?.billMasters[0]?.client?.phoneNo), startX, startY + 60);
    pdf.text("Email: " + stringIsNullOrEmpty(data?.billMasters[0]?.client?.email), startX, startY + 70);
    pdf.text('Web: ' + stringIsNullOrEmpty(data?.billMasters[0]?.client?.website), startX, startY + 80);
    pdf.setFillColor(241, 241, 244);
    pdf.setDrawColor(206, 203, 203);
    pdf.rect(10, startY + 90, 250, 90, 'FD');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text(stringIsNullOrEmpty(data?.tenantName).toUpperCase(), startX + 10, startY + 105);
    pdf.text("CUSTOMER TRN: " + stringIsNullOrEmpty(data?.trn), startX + 10, startY + 125);
    pdf.text("unit #" + stringIsNullOrEmpty(data?.billMasters[0]?.unitNumber), startX + 10, startY + 140);
    pdf.setFontSize(10);
    pdf.text(stringIsNullOrEmpty(data?.billMasters[0]?.clientName), startX + 10, startY + 155);
    pdf.text(stringIsNullOrEmpty(data?.billMasters[0].client?.addresses[0]?.city, ',') + stringIsNullOrEmpty(data?.billMasters[0]?.client?.addresses[0]?.country, ','), startX + 10, startY + 170);
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
      margin: { left: startX + 390 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 100,
          halign: 'left'
        },
        1: {
          cellWidth: 100,
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

    const firstTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf.setLineWidth(.1);
    pdf.line(5, firstTableEndY + 10, 607, firstTableEndY + 10);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.text("Management here by acknowledges the receipt of a security deposit on behalf of " + data.tenantName, startX + 10, firstTableEndY + 30);
    pdf.text("tenant/owner in the amount of " + data.paymentAmountLocal + " for unit #" + data?.billMasters[0]?.unitNumber, startX + 10, firstTableEndY + 45);
    pdf.text("Authorised signatory", startX + 10, firstTableEndY + 100);
    pdf.setTextColor(0, 0, 0);


    const thirdTableEndY = firstTableEndY + 120;

    pdf.setTextColor(255, 0, 0);
    pdf.setFontSize(9);
    pdf.text(`Note: A Late Fee will be applied after the due date. A Default Payment \nPenalty will be added to any unit that is ${data?.billMasters[0]?.penaltyAfter} days or more in arrears.`, startX + 310, thirdTableEndY + 20);
    pdf.setTextColor(25, 118, 210);
    pdf.setFontSize(12);
    pdf.text("USAGE TIPS to reduce consumption:", startX, thirdTableEndY + 80);
    pdf.text("Please Try to:", startX, thirdTableEndY + 100);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text("- Keep filters clean", startX + 20, thirdTableEndY + 110);
    pdf.text("- Set thermostats between 23C and 25C", startX + 20, thirdTableEndY + 120);
    pdf.text("- Keep vents unblocked", startX + 20, thirdTableEndY + 130);
    pdf.text("- Keep doors and windows closed", startX + 20, thirdTableEndY + 140);
    pdf.text("- Undertake regular maintenance of the system", startX + 20, thirdTableEndY + 150);
    pdf.setTextColor(25, 118, 210);
    pdf.setFontSize(12);
    pdf.text("Please Do Not:", startX, thirdTableEndY + 170);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text("- Set thermostats to 20C or lower", startX + 20, thirdTableEndY + 180);
    pdf.text("- Block vents", startX + 20, thirdTableEndY + 190);
    pdf.text("- Leave doors and windows open", startX + 20, thirdTableEndY + 200);
    pdf.text("- Leave heat producing appliances near thermostats", startX + 20, thirdTableEndY + 210);


    pdf.setFillColor(119, 183, 11);
    var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
    pdf.rect(startX + 310, thirdTableEndY + 60, 280, pageHeight - 80 - (thirdTableEndY + 60), 'FD');
    pdf.setFont("Comic Sans");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    const boldText = 'ADVERTISE WITH US';
    pdf.text(boldText, startX + 350, thirdTableEndY + 80);
    const boldTextWidth = pdf.getTextWidth(boldText);
    pdf.setLineWidth(.1);
    pdf.line(startX + 350, thirdTableEndY + 85, startX + 350 + boldTextWidth, thirdTableEndY + 85);
    pdf.setFontSize(9);
    pdf.text("For advertisement, contact at", startX + 380, thirdTableEndY + 95);
    pdf.text(stringIsNullOrEmpty(data?.billMasters[0]?.client?.phoneNo), startX + 380, thirdTableEndY + 105);
    pdf.text(stringIsNullOrEmpty(data?.billMasters[0]?.client?.email), startX + 380, thirdTableEndY + 115);
    pdf.text(stringIsNullOrEmpty(data?.billMasters[0]?.client?.website), startX + 380, thirdTableEndY + 125);

    pdf.setTextColor(0, 0, 0);
    pdf.setLineWidth(.1);
    pdf.line(5, pageHeight - 70, 607, pageHeight - 70);
    pdf.text("For any enquiries, write to us " + data?.billMasters[0]?.client?.email ?? '' + "\n or Logon to " + data.billMasters[0]?.client?.website ?? '', startX, pageHeight - 60);
    pdf.setTextColor(255, 0, 0);
    pdf.setFont('bold');
    const footerText = "Notice:";
    const footerTextWidth = pdf.getTextWidth(footerText);
    pdf.text(footerText, startX + 330, pageHeight - 60);
    pdf.setFont('none');
    pdf.setTextColor(0, 0, 0);
    pdf.text("Pay your bills before due date to avoid late payment surcharge", startX + 330 + footerTextWidth, pageHeight - 60);
    pdf.text("and disconnection.", startX + 330, pageHeight - 50);
    pdf.text("You can log onto " + data?.billMasters[0]?.client?.website + " to pay your invoices \nTerms & Conditions for Supply of Utility Services", startX + 330, pageHeight - 40);

    //for adding total number of pages // i.e 10 etc
    if (typeof pdf.putTotalPages === 'function') {
      pdf.putTotalPages(totalPagesExp);
    }
    var output = pdf.output('datauristring')
    this.pdfsToMerge.push(output);
  }

  selectFilter(event) {
    this.filterId = event.value;
    this.onFilterData();
  }

  onFilterData() {
    if (this.filterId == 1) {
      this.getContractsAboutToExpire();
    } else if (this.filterId == 2) {
      this.getMovedOutTenants();
    } else if (this.filterId == 3) {
      this.getContracts(true);
    } else if (this.filterId == 4) {
      this.getContracts(false, true);
    } else {
      this.getContracts();
    }
  }


  onPrintAccountStatement(row: Contract) {
    const manageParams: ManageParams = {
      fromDate: moment(row.contractDate).format('YYYY-MM-DD'),
      toDate: moment(row.contractEndDate).format('YYYY-MM-DD'),
      tenantId: `${row.tenantId ?? 0}`,
      clientId: this.clientId
    };
    this.billService.getAccountStatement(manageParams).subscribe({
      next:
        (billMasterDetails) => {
          billMasterDetails = billMasterDetails.filter(x => x.isBillFailed === false);
          let balanceAmount = null;
          billMasterDetails.forEach(x => {
            x.billDateLocal = this.date.transform(x.billDate.toString(), this.dateFormat.toString());
            x.billAmountLocal = this.currencyPipe.transform(x.billAmount, this.currency.toString(), true, this.roundFormat);
            x.creditNoteAmountLocal = this.currencyPipe.transform(x.creditNoteAmount, this.currency.toString(), true, this.roundFormat);
            x.paidLocal = this.currencyPipe.transform(Number(x.paid), this.currency.toString(), true, this.roundFormat);
            if (balanceAmount != null && x.entityType === 'Invoice' || x.entityType === 'CreditNote') {
              x.previousDueAmount = Number(balanceAmount) + Number(x.billAmount) - Number(x.paid) - Number(x.creditNoteAmount)
            } else if (balanceAmount != null && x.entityType === 'Payment') {
              x.previousDueAmount = Number(balanceAmount) - Number(x.billAmount) - Number(x.paid) - Number(x.creditNoteAmount)
            }
            x.previousDueAmountLocal = this.currencyPipe.transform(x.previousDueAmount, this.currency.toString(), true, this.roundFormat);
            balanceAmount = Number(x.previousDueAmount);
          });
          this.downloadAccountStatementReport(billMasterDetails, manageParams, row);
        },
      error: (err) => {
        this.notificationMessage('Account statement not found.', 'red-snackbar');
      }
    });

  }

  downloadAccountStatementReport(billMasters: BillMaster[], manageParams: ManageParams, contract: Contract) {
    let row: any[] = [];
    let firstTableRows: ListData[] = [];
    let secondTableRows: any[] = [];



    let secondTableCols = [
      'Date',
      'Transactions',
      'Details',
      'Amount',
      'Payments',
      'Balance'
    ];


    let invoiceAmount: number = 0;
    let paidAmount: number = 0;

    billMasters.forEach(x => {
      if (x.entityType !== 'Opening Due') {
        invoiceAmount += Number(x.billAmount);
        paidAmount += Number(x.paid);
      }
    });


    for (let a = 0; a < billMasters.length; a++) {
      row.push(billMasters[a].billDateLocal)
      row.push(billMasters[a].entityType)
      row.push(billMasters[a].status)
      row.push(billMasters[a].billAmountLocal)
      row.push(billMasters[a].paidLocal)
      row.push(billMasters[a].previousDueAmountLocal)
      secondTableRows.push(row);
      row = [];
    }

    row.push('')
    row.push('')
    row.push('')
    row.push('')
    row.push('Balance Due')
    row.push(billMasters[billMasters.length - 1].previousDueAmountLocal)
    secondTableRows.push(row);

    firstTableRows.push(
      {
        label: 'Opening Balance',
        value: billMasters[0].previousDueAmountLocal
      },
      {
        label: 'Invoiced Amount',
        value: this.currencyPipe.transform(invoiceAmount, this.currency.toString(), true, this.roundFormat)
      },
      {
        label: 'Amount Paid',
        value: this.currencyPipe.transform(paidAmount, this.currency.toString(), true, this.roundFormat)
      },
      {
        label: 'Balance Due',
        value: billMasters[billMasters.length - 1].previousDueAmountLocal
      },
      {
        label: 'Security Deposit Paid',
        value: contract.receivedAmountLocal
      },
      {
        label: 'Security Deposit Refunded',
        value: contract.refundAmountLocal
      }
    );

    const title = 'Invoice';
    this.onExport(billMasters, firstTableRows, secondTableCols, secondTableRows);
    //this.getAccountStatementReport(billMasters, firstTableRows, secondTableCols, secondTableRows, title, manageParams, contract);
  }


  getAccountStatementReport(data: BillMaster[], firstTableRows: ListData[], secondTableCols: any[], secondTableRows: any[], title: string, manageParams: ManageParams, contract: Contract) {

    const totalPagesExp = "1";
    let pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter"
    });

    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    let startX = 10;
    let startY = 30;
    this.addAccountStatementImage(pdf, data, 'Account Statement');
    pdf.setFontSize(30);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont('Cambria');
    pdf.text(stringIsNullOrEmpty(data[0].client.clientName).toUpperCase(), pdf.internal.pageSize.width - 600, startY + 20);
    pdf.setFontSize(10);
    pdf.text("TRN: " + data[0].client.trnNo, pdf.internal.pageSize.width - 600, startY + 30);
    pdf.text("PO Box " + data[0].client.addresses[0].zipPostalCode, pdf.internal.pageSize.width - 600, startY + 40);
    pdf.text(data[0].client.addresses[0].address1 + ',' + data[0].client.addresses[0].country, pdf.internal.pageSize.width - 600, startY + 50);
    pdf.text("Phone: " + data[0].client.phoneNo, pdf.internal.pageSize.width - 600, startY + 60);
    pdf.text("Email: " + data[0].client.email + ',' + ' Web: ' + data[0].client.website, pdf.internal.pageSize.width - 600, startY + 70);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    const meterReadingTableHeading = 'Statement of Accounts';
    pdf.setFont('Cambria', 'bold');
    pdf.text(meterReadingTableHeading.toUpperCase(), pdf.internal.pageSize.width - 250, startY + 40);
    pdf.setFont('Cambria', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.line(pdf.internal.pageSize.width - 250, startY + 50, 607, startY + 50);
    let fromDate: string = this.date.transform(manageParams.fromDate.toString(), this.dateFormat.toString());
    let toDate: string = this.date.transform(manageParams.toDate.toString(), this.dateFormat.toString());
    let period: string = fromDate + ' - ' + toDate;
    pdf.text(period.toString(), pdf.internal.pageSize.width - 250, startY + 60);
    pdf.line(pdf.internal.pageSize.width - 250, startY + 70, 607, startY + 70);
    pdf.setFontSize(10);
    pdf.text("Account Summary", pdf.internal.pageSize.width - 250, startY + 90);
    pdf.setFontSize(9);
    const autoTable = 'autoTable';
    pdf[autoTable]('', firstTableRows, {
      startX: pdf.internal.pageSize.width - 250,
      startY: startY + 100,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: pdf.internal.pageSize.width - 250 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 135,
          halign: 'left'
        },
        1: {
          cellWidth: 100,
          halign: 'right'
        }
      },
      didParseCell: function (firstTableRows) {
        firstTableRows.cell.styles.cellPadding = 1.8;
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    });

    const firstTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf.setFontSize(10);
    pdf.text("Customer Details", 10, startY + 90);
    pdf.setFillColor(241, 241, 244);
    pdf.setDrawColor(206, 203, 203);
    pdf.rect(10, startY + 100, 250, (firstTableEndY - startY - 100), 'FD');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text(data[0]?.ownerName.toUpperCase(), startX + 10, startY + 115);
    pdf.text("CUSTOMER TRN: " + data[0]?.trn, startX + 10, startY + 130);
    pdf.text("unit #" + contract?.unitNumber, startX + 10, startY + 145);
    pdf.text("Account Number: " + data[0]?.accountNumber, startX + 10, startY + 160);
    pdf.setFontSize(9);

    pdf.setLineWidth(.1);
    pdf.line(5, firstTableEndY + 10, 607, firstTableEndY + 10);

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


    pdf[autoTable](secondTableCols, secondTableRows, {
      startX: 10,
      startY: firstTableEndY + 20,
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { top: firstTableEndY + 20, left: 10 },
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
          cellWidth: 180,
          halign: 'center'
        },
        3: {
          cellWidth: 80,
          halign: 'right'
        },
        4: {
          cellWidth: 80,
          halign: 'right'
        },
        5: {
          cellWidth: 80,
          halign: 'right'
        }
      },
      didParseCell: function (secondTableRows) {
        const tdElement = secondTableRows.cell.raw;
        if (tdElement === 'Balance Due') {
          secondTableRows.cell.styles.fontStyle = 'bold';
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

    //for adding total number of pages // i.e 10 etc
    if (typeof pdf.putTotalPages === 'function') {
      pdf.putTotalPages(totalPagesExp);
    }
    var blob = pdf.output("blob");
    window.open(URL.createObjectURL(blob));
  }

  addAccountStatementImage(pdf: jsPDF, billMasterDetails: BillMaster[], type: string) {
    try {
      if (billMasterDetails && billMasterDetails.length && billMasterDetails[0] && billMasterDetails[0].client && billMasterDetails[0].client.imageProperties && billMasterDetails[0].client.imageProperties.length) {
        const imageProperty: ImageProperty = billMasterDetails[0].client.imageProperties.find(x => x.imageType.trim().toLowerCase() === type.toLowerCase());
        if (imageProperty) {
          var img = new Image()
          img.src = this.filePath + '/uploads/' + billMasterDetails[0].client?.photo; //'assets/img/' + data.client.photo
          img.onload = function () {
            pdf.addImage(img, imageProperty.imgX, imageProperty.imgY, imageProperty.imgW, imageProperty.imgH);
          };

          // pdf.addImage(img, 'png', imageProperty.imgX, imageProperty.imgY, imageProperty.imgW, imageProperty.imgH);
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


  activateContract(row: Contract) {
    const anotherContractExist = this.contracts.findIndex(x => x.unitId === row.unitId && x.id !== row.id && x.isDeleted == false);
    if (anotherContractExist > -1) {
      this.notificationMessage("Already a contract active on this unit", 'red-snackbar');
      return;
    }
    const confirmMessage: ListItem = {
      label: "Do you want to activate contract?",
      selected: false
    };
    this.dialog.open(CancelConfirmationDialogComponent, { data: confirmMessage }).afterClosed().subscribe((message: any) => {
      if (message) {
        this.contractService.activateContractById(row.id).subscribe({
          next: () => {
            this.snackbar.open('Contract activated successfully', null, {
              duration: 5000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
              panelClass: ['green-snackbar'],
            });
            this.getContractDetails();
          },
          error: () => {
            this.notificationMessage('Contract activation failed', 'red-snackbar');
          }
        });
      }
    });
  }

  onExport(billMasters, firstTableRows, secondTableCols, secondTableRows) {
    if (billMasters && billMasters.length > 0) {
      this.getJsonData(billMasters, firstTableRows, secondTableCols, secondTableRows);
      if ((this.tableData != undefined) && (this.tableData.length > 0)) {
        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.tableData);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        /* save to file */
        XLSX.writeFile(wb, 'Statement of Accounts.xlsx');
      }
    }
    else {
      this.notificationMessage("No Data to Export", "yellow-snackbar");
    }
  }

  getJsonData(billMasters, firstTableRows, secondTableCols, secondTableRows) {
    this.tableData = [];
    let row: any[] = [];
    row.push('Account Summary');
    this.tableData.push(row);
    row = [];
    firstTableRows.forEach(element => {
      row.push(element.label);
      row.push(element.value);
      this.tableData.push(row);
      row = [];
    });

    secondTableCols.forEach(column => {
      row.push(column);
    });
    this.tableData.push(row);
    secondTableRows.forEach(element => {
      this.tableData.push(element);
    });
  }

  getWorkflowRules() {
    this.workflowRuleService.getWorkflowRules(Number(this.clientId)).subscribe({
      next: (workflowRules) => {
        if (workflowRules && workflowRules.length) {
          this.workflowRules = workflowRules;
          if (this.workflowRules && this.workflowRules.length) {
            const workflowRule = this.workflowRules.find(x => x.constraint === 'Check Dues');
            if (workflowRule) {
              this.checkDues = workflowRule.value;
            }
          }
        }
        this.getContractDetails();
      },
      error: (err) => {
        this.workflowRules = [];
        this.getContractDetails();
      }
    })
  }
}

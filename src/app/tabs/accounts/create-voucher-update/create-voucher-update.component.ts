import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { VoucherEntryService } from '../../shared/services/voucher-entry.service';
import { Voucher } from '../create-voucher-update/voucher.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MetadataService } from '../../shared/services/metadata.service';
import { Metadata } from '../../shared/models/metadata.model';
import { MetadataVoucherType } from '../../shared/models/metadata.voucher-type.model';
import { Router } from '@angular/router';
import { BillSettlementService } from '../../shared/services/billsettlement.service';
import { BillMaster } from '../../shared/models/bill-master.model';
import * as moment from 'moment';
import { CreditNote } from '../../shared/models/credit-note.model';
import { Payment } from '../../shared/models/payment.model';
import { Refund } from '../../shared/models/refund.model';
import { MasterService } from '../../shared/services/master.service';
import { Master } from '../../shared/models/master.model';
import { CookieService } from 'ngx-cookie-service';
import { getClientDataFormat } from '../../shared/utilities/utility';
import { ClientSelectionService } from '../../shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-create-voucher-update',
  templateUrl: './create-voucher-update.component.html',
  styleUrls: ['./create-voucher-update.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation]
})
export class CreateVoucherUpdateComponent implements OnInit, AfterViewInit, OnDestroy {
  subject$: ReplaySubject<Voucher[]> = new ReplaySubject<Voucher[]>(1);
  data$: Observable<Voucher[]> = this.subject$.asObservable();
  private vouchers: Voucher[];
  dateFormat = '';
  currencyFormat = '';
  roundFormat = '';
  form: FormGroup;
  metadata: Metadata;
  metadataVoucherType: Master[];
  selectedVoucherType: number = 0;
  fromDate: string = '';
  toDate: string = '';
  voucherName: string;
  clientId: number;
  numberOfVouchers: number = 0;
  showSpinner: boolean = false;

  @Input()
  displayedColumns: ListColumn[] = [
    { name: 'Date', property: 'bllDateLocal', visible: true, isModelProperty: true },
    { name: 'Voucher Number', property: 'billNumber', visible: true, isModelProperty: true },
    { name: 'Description', property: 'ledgerDescription', visible: true, isModelProperty: true },
    { name: 'Amount', property: 'billAmountLocal', visible: true, isModelProperty: true },
  ] as ListColumn[];

  public pageSize = 8;
  public dataSource: MatTableDataSource<Voucher>;
  public columnsProps: string[] = this.displayedColumns.map((column: ListColumn) => {
    return column.property;
  });

  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort && this.dataSource) {
      this.dataSource.sort = this.sort;
    }
  }

  constructor(private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private currency: CurrencyPipe,
    private date: DatePipe,
    private fb: FormBuilder,
    private router: Router,
    private metadataService: MetadataService,
    private masterService: MasterService,
    private voucherEntryService: VoucherEntryService,
    private billSettlementService: BillSettlementService,
    private clientSelectionService: ClientSelectionService,
    private cookieService: CookieService,
    private envService: EnvService) {
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;;
    this.currencyFormat = getClientDataFormat('Currency') ?? envService.currencyFormat;
    this.roundFormat = getClientDataFormat('RoundOff') ?? envService.roundOffFormat;
  }

  get visibleColumns() {
    return this.displayedColumns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit() {
    this.clientSelectionService.setIsClientVisible(true);
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    // this.metadataService.invokeMetadata();
    // this.metadata = this.metadataService.getMetadata();
    // if (this.metadata)
    //   this.metadataVoucherType = this.metadata.voucherTypes;
    //this.getVoucherEntries();

    this.masterService.getSystemMasterdata(62, 0).subscribe((data: Master[]) => {
      this.metadataVoucherType = data;
    });
    this.form = this.fb.group({
      voucherType: [''],
      fromDate: [''],
      toDate: ['']
    });
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
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

  // getVoucherEntries()
  // {
  //   this.voucherEntryService.getVoucherEntries().subscribe({next:(voucherEntries: VoucherEntry[]) => {
  //     voucherEntries = voucherEntries.map(voucherEntry => new VoucherEntry(voucherEntry));
  //     voucherEntries.forEach(x => {x.voucherDateLocal = this.date.transform(x.voucherDate.toString(), this.dateFormat.toString());})
  //     this.subject$.next(voucherEntries);
  //   },
  //   error: (err) => {
  //     this.notificationMessage('Accounts Bulk Update Not Found.', 'red-snackbar');
  //   }    
  // });

  //   this.dataSource = new MatTableDataSource(this.voucherEntries);

  //   this.data$.pipe(
  //     filter(data => !!data)
  //   ).subscribe((voucherEntries) => {
  //     this.voucherEntries = voucherEntries;      
  //     voucherEntries.forEach(x => {x.creditLocal = this.currency.transform(x.credit, this.currencyFormat.toString(), 'symbol');})
  //     voucherEntries.forEach(x => {x.debitLocal = this.currency.transform(x.debit, this.currencyFormat.toString(), 'symbol');})
  //     this.dataSource.data = voucherEntries;
  //   });
  //   this.ngAfterViewInit();
  // }

  onFilterChange(value) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

  onChangeVoucherType(value) {
    this.selectedVoucherType = value;
    if (this.metadataVoucherType && value) {
      let voucher = this.metadataVoucherType.find(s => s.id == value);
      if (voucher)
        this.voucherName = voucher.description;
    }
    else
      this.voucherName = '';
  }

  FilterVouchers() {
    //this.fromDate = this.form.controls.fromDate.value;
    //this.toDate = this.form.controls.toDate.value;
    this.showSpinner = true;
    let datFrom = moment(this.fromDate).format('YYYY-MM-DD');
    let datTo = moment(this.toDate).format('YYYY-MM-DD');

    if (this.fromDate && this.toDate && this.selectedVoucherType) {
      this.voucherEntryService.getVouchersToExport(this.selectedVoucherType, this.voucherName, datFrom, datTo, this.clientId).subscribe({
        next: (vouchers: Voucher[]) => {
          this.vouchers = vouchers.map(voucher => new Voucher(voucher));
          this.vouchers.forEach(x => { x.bllDateLocal = this.date.transform(x.billDate.toString(), this.dateFormat.toString()); })
          this.subject$.next(this.vouchers);
          this.numberOfVouchers = vouchers.length;

        },
        error: (err) => {
          this.notificationMessage('There is no Vouchers available to Export.', 'yellow-snackbar');
          this.dataSource = new MatTableDataSource(null);
          this.ngAfterViewInit();
          this.showSpinner = false;
        }
      });

      this.dataSource = new MatTableDataSource(this.vouchers);

      this.data$.pipe(
        filter(data => !!data)
      ).subscribe((vouchers) => {
        this.vouchers = vouchers;
        this.roundFormat = getClientDataFormat('RoundOff');
        vouchers.forEach(x => { x.billAmountLocal = this.currency.transform(x.billAmount, this.currencyFormat.toString(), true, this.roundFormat); })
        this.dataSource.data = vouchers;
      });
      this.ngAfterViewInit();
      this.showSpinner = false;
    }
    else {
      this.snackbar.open('Invalid search parameters', null, {
        duration: 5000,
        verticalPosition: 'top',
        horizontalPosition: 'end',
        panelClass: ['yellow-snackbar'],
      });
      this.showSpinner = false;
    }
  }

  ngOnDestroy() { }

  updateVouchers() {
    this.voucherEntryService.createVoucherEntry(this.vouchers).subscribe({
      next: (data: boolean) => {
        if (data) {
          if (this.voucherName === 'Sales') {
            this.updateBillMasterSyncStatus();
          } else if (this.voucherName === 'Receipt') {
            this.updatePaymentSyncStatus();
          } else if (this.voucherName === 'Refund') {
            this.updateRefundSyncStatus();
          } else {
            this.updateCreditNoteSyncStatus();
          }
          this.notificationMessage('Vocher entry updated successfully', 'green-snackbar');
        } else {
          this.notificationMessage('Vocher entry update failed.', 'red-snackbar');
        }
      },
      error: (err) => {
        this.notificationMessage('Vocher entry update failed.', 'red-snackbar');
      }
    });
  }

  updateBillMasterSyncStatus() {
    let billMasterDetails: BillMaster[] = [];
    this.vouchers.forEach(voucher => {
      const billMaster: BillMaster = {
        id: voucher.id,
        isSynced: true
      }
      billMasterDetails.push(billMaster);
    })
    this.billSettlementService.updateBillMasterSyncStatus(billMasterDetails).subscribe(response => {
      if (response) {
        this.notificationMessage('Vocher entry updated successfully', 'green-snackbar');
      } else {
        this.notificationMessage('Vocher entry updatio failed', 'red-snackbar');
      }
    });
  }

  updatePaymentSyncStatus() {
    let paymentDetails: Payment[] = [];
    this.vouchers.forEach(voucher => {
      const payment: Payment = {
        id: voucher.id,
        isSynced: true
      }
      paymentDetails.push(payment);
    })
    this.billSettlementService.updatePaymentSyncStatus(paymentDetails).subscribe(response => {
      if (response) {
        this.notificationMessage('Vocher entry updated successfully', 'green-snackbar');
      } else {
        this.notificationMessage('Vocher entry updatio failed', 'red-snackbar');
      }
    });
  }

  updateRefundSyncStatus() {
    let refundDetails: Refund[] = [];
    this.vouchers.forEach(voucher => {
      const refund: Refund = {
        id: voucher.id,
        isSynced: true
      }
      refundDetails.push(refund);
    })
    this.billSettlementService.updateRefundSyncStatus(refundDetails).subscribe(response => {
      if (response) {
        this.notificationMessage('Vocher entry updated successfully', 'green-snackbar');
      } else {
        this.notificationMessage('Vocher entry updatio failed', 'red-snackbar');
      }
    });
  }

  updateCreditNoteSyncStatus() {
    let creditNoteDetails: CreditNote[] = [];
    this.vouchers.forEach(voucher => {
      const creditNote: CreditNote = {
        id: voucher.id,
        isSynced: true
      }
      creditNoteDetails.push(creditNote);
    })
    this.billSettlementService.updateCreditNoteSyncStatus(creditNoteDetails).subscribe(response => {
      if (response) {
        this.notificationMessage('Vocher entry updated successfully', 'green-snackbar');
      } else {
        this.notificationMessage('Vocher entry updatio failed', 'red-snackbar');
      }
    });
  }
}

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
import { HttpErrorResponse } from '@angular/common/http';
import { VoucherEntryService } from '../../shared/services/voucher-entry.service';
import { VoucherEntry } from '../create-voucher-entry/voucher-entry.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MetadataService } from '../../shared/services/metadata.service';
import { Metadata } from '../../shared/models/metadata.model';
import { MetadataVoucherType } from '../../shared/models/metadata.voucher-type.model';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { MasterService } from '../../shared/services/master.service';
import { Master } from '../../shared/models/master.model';
import { getClientDataFormat } from '../../shared/utilities/utility';
import { ClientSelectionService } from '../../shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-create-voucher-entry',
  templateUrl: './create-voucher-entry.component.html',
  styleUrls: ['./create-voucher-entry.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation]
})
export class CreateVoucherEntryComponent implements OnInit, AfterViewInit, OnDestroy {
  subject$: ReplaySubject<VoucherEntry[]> = new ReplaySubject<VoucherEntry[]>(1);
  data$: Observable<VoucherEntry[]> = this.subject$.asObservable();
  private voucherEntries: VoucherEntry[];
  dateFormat = '';
  currencyFormat = '';
  roundFormat = '';
  form: FormGroup;
  metadata: Metadata;
  metadataVoucherType: Master[];
  selectedVoucherType: number;
  fromDate: Date;
  toDate: Date;
  voucherName: string;
  numberOfVouchers: number = 0;
  showSpinner: boolean = false;

  @Input()
  displayedColumns: ListColumn[] = [
    //{ name: 'Checkbox', property: 'checkbox', visible: true },
    { name: 'Voucher Date', property: 'voucherDateLocal', visible: true, isModelProperty: true },
    { name: 'Voucher Number', property: 'voucherNo', visible: true, isModelProperty: true },
    { name: 'Ledger Name', property: 'ledgerName', visible: true, isModelProperty: true },
    { name: 'Voucher Type', property: 'voucherTypeName', visible: true, isModelProperty: true },
    { name: 'Debit', property: 'debitAmountLocal', visible: true, isModelProperty: true },
    { name: 'Credit', property: 'creditAmountLocal', visible: true, isModelProperty: true }
    //{ name: 'Actions', property: 'actions', visible: true }
  ] as ListColumn[];

  public pageSize = 8;
  public dataSource: MatTableDataSource<VoucherEntry>;
  public columnsProps: string[] = this.displayedColumns.map((column: ListColumn) => {
    return column.property;
  });

  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  constructor(private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private currency: CurrencyPipe,
    private date: DatePipe,
    private fb: FormBuilder,
    private router: Router,
    //private metadataService: MetadataService,
    private masterService: MasterService,
    private clientSelectionService: ClientSelectionService,
    private voucherEntryService: VoucherEntryService,
    private envService: EnvService) {
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;
    this.currencyFormat = getClientDataFormat('Currency') ?? envService.currencyFormat;
    this.roundFormat = getClientDataFormat('RoundOff') ?? envService.roundOffFormat;
  }

  get visibleColumns() {
    return this.displayedColumns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit() {
    this.clientSelectionService.setIsClientVisible(true);
    // this.metadataService.invokeMetadata();
    // this.metadata = this.metadataService.getMetadata();
    // if (this.metadata)
    //   this.metadataVoucherType = this.metadata.voucherTypes;
    this.masterService.getSystemMasterdata(62, 0).subscribe((data: Master[]) => {
      this.metadataVoucherType = data;
    });
    this.getVoucherEntries();

    this.form = this.fb.group({
      voucherType: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required]
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  getVoucherEntries() {
    this.voucherEntryService.getVoucherEntries().subscribe({
      next:
        (voucherEntries: VoucherEntry[]) => {
          voucherEntries = voucherEntries.map(voucherEntry => new VoucherEntry(voucherEntry));
          voucherEntries.forEach(x => {
            x.voucherDateLocal = this.date.transform(x.voucherDate.toString(), this.dateFormat.toString());
          })
          this.subject$.next(voucherEntries);
          this.numberOfVouchers = voucherEntries.length;
        },
      error: (err) => {
        this.notificationMessage('Export History Not Found.', 'yellow-snackbar');
      }
    });

    this.dataSource = new MatTableDataSource(this.voucherEntries);

    this.data$.pipe(
      filter(data => !!data)
    ).subscribe((voucherEntries) => {
      this.voucherEntries = voucherEntries;
      this.roundFormat = getClientDataFormat('RoundOff');
      voucherEntries.forEach(x => {
        x.amountLocal = this.currency.transform(x.amount, this.currencyFormat.toString(), true, this.roundFormat);
        x.creditAmountLocal = x.creditAmount == 0 ? '' : this.currency.transform(x.creditAmount.toString(), this.currencyFormat.toString(), true, this.roundFormat);
        x.debitAmountLocal = this.currency.transform(x.debitAmount.toString(), this.currencyFormat.toString(), true, this.roundFormat);
        // x.amountLocal = this.currency.transform(x.amount, this.currencyFormat.toString(), 'symbol');
        // x.creditAmountLocal = x.creditAmount == 0 ? '' : this.currency.transform(x.creditAmount.toString(), this.currencyFormat.toString(), 'symbol');
        // x.debitAmountLocal = this.currency.transform(x.debitAmount.toString(), this.currencyFormat.toString(), 'symbol');
      })
      this.dataSource.data = voucherEntries;
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

  onChangeVoucherType(value) {
    this.selectedVoucherType = value;
    let voucher = this.metadataVoucherType.find(s => s.id == value);
    if (voucher) {
      this.voucherName = voucher.description;
    }
  }

  FilterVouchers() {
    this.showSpinner = true;
    this.fromDate = this.form.controls.fromDate.value;
    this.toDate = this.form.controls.toDate.value;
    let datFrom = moment(this.fromDate).format('YYYY-MM-DD');
    let datTo = moment(this.toDate).format('YYYY-MM-DD');

    this.voucherEntryService.getFilteredVoucherEntries(this.selectedVoucherType, this.voucherName, datFrom, datTo).subscribe({
      next: (voucherEntries: VoucherEntry[]) => {
        voucherEntries = voucherEntries.map(voucherEntry => new VoucherEntry(voucherEntry));
        voucherEntries.forEach(x => { x.voucherDateLocal = this.date.transform(x.voucherDate.toString(), this.dateFormat.toString()); })
        this.subject$.next(voucherEntries);
        this.numberOfVouchers = voucherEntries.length;
      },
      error: (err) => {
        this.notificationMessage('Accounts Bulk Update Not Found.', 'red-snackbar');
        this.showSpinner = false;
      }
    });
    this.dataSource = new MatTableDataSource(this.voucherEntries);

    this.data$.pipe(
      filter(data => !!data)
    ).subscribe((voucherEntries) => {
      this.voucherEntries = voucherEntries;
      voucherEntries.forEach(x => { x.amountLocal = this.currency.transform(x.amount, this.currencyFormat.toString(), true, this.roundFormat); })
      this.dataSource.data = voucherEntries;
    });
    this.showSpinner = false;
    this.ngAfterViewInit();
  }

  ngOnDestroy() { }

  exportToXML() {
    const voucherEntry: VoucherEntry = {
      voucherType: this.voucherName, voucherDate: this.toDate
    }
    this.voucherEntryService.updateVoucherEntryToXML(voucherEntry).subscribe({
      next: (response) => {
        if (response)
          this.notificationMessage('Exported to tally successfully.', 'green-snackbar');
        else
          this.notificationMessage('Exported to tally failed.', 'red-snackbar');
      },
      error: (err) => {
        this.notificationMessage('Exported to tally failed.', 'red-snackbar');
      }
    }
    );
  }

}

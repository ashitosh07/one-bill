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
import { BillPeriodService } from '../../shared/services/billperiod.service';
import { BillPeriod } from '../create-billperiod/billperiod-create-update/billperiod.model';
import { BillperiodCreateUpdateComponent } from '../create-billperiod/billperiod-create-update/billperiod-create-update.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { HttpErrorResponse } from '@angular/common/http';
import { UserConfirmationPopupComponent } from '../../shared/components/user-confirmation-popup/user-confirmation-popup.component';
import { CookieService } from 'ngx-cookie-service';
import { getClientDataFormat } from '../../shared/utilities/utility';
import { ClientSelectionService } from '../../shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-create-billperiod',
  templateUrl: './create-billperiod.component.html',
  styleUrls: ['./create-billperiod.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation]
})
export class CreateBillperiodComponent implements OnInit, AfterViewInit, OnDestroy {
  subject$: ReplaySubject<BillPeriod[]> = new ReplaySubject<BillPeriod[]>(1);
  data$: Observable<BillPeriod[]> = this.subject$.asObservable();
  private billPeriods: BillPeriod[];
  dateFormat = '';
  clientId: number;

  @Input()
  displayedColumns: ListColumn[] = [
    { name: 'Bill Settings Name', property: 'billSettingsName', visible: true, isModelProperty: true },
    { name: 'Period Description', property: 'periodDescription', visible: true, isModelProperty: true },
    { name: 'Period Start', property: 'periodStartLocal', visible: true, isModelProperty: true },
    { name: 'Period End', property: 'periodEndLocal', visible: true, isModelProperty: true },
    { name: 'Actions', property: 'actions', visible: true }
  ] as ListColumn[];

  public pageSize = 8;
  public dataSource: MatTableDataSource<BillPeriod>;
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
    private date: DatePipe,
    private billPeriodService: BillPeriodService,
    private clientSelectionService: ClientSelectionService,
    private cookieService: CookieService,
    private envService: EnvService) {
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat
  }

  get visibleColumns() {
    return this.displayedColumns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit() {
    this.clientSelectionService.setIsClientVisible(true);
    this.getBillPeriods();
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

  createBillPeriod() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "60%";

    this.dialog.open(BillperiodCreateUpdateComponent).afterClosed().subscribe((billPeriod: BillPeriod) => {
      /**
       * BillPeriod is the updated billPeriod (if the user pressed Save - otherwise it's null)
       */
      if (billPeriod) {
        /**
         * Here we are updating our local array.
         * You would probably make an HTTP request here.
         */
        this.billPeriodService.createBillPeriod(billPeriod).subscribe((billPeriodObj: BillPeriod) => {
          this.snackbar.open('Bill Period created successfully.', null, {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['green-snackbar'],
          });
          this.getBillPeriods();
        }
        );
      }
    });
    this.getBillPeriods();
  }

  updateBillPeriod(billPeriod) {
    this.dialog.open(BillperiodCreateUpdateComponent, {
      data: billPeriod
    }).afterClosed().subscribe((billPeriod: BillPeriod) => {
      /**
       * BillPeriod is the updated billPeriod (if the user pressed Save/Update - otherwise it's null)
       */
      if (billPeriod) {
        /**
         * Here we are updating our local array.
         * You would probably make an HTTP request here.
         */
        this.billPeriodService.updateBillPeriodById(billPeriod.id, billPeriod).subscribe((billPeriod: BillPeriod) => {
          this.snackbar.open('Bill Period updated successfully.', null, {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['green-snackbar'],
          });
          this.getBillPeriods();
        });
      }
    });
    this.getBillPeriods();
  }

  deleteBillPeriod(billPeriod) {
    this.dialog.open(UserConfirmationPopupComponent).afterClosed().subscribe((message: any) => {
      if (message) {
        /* Here we are updating our local array.
        * You would probably make an HTTP request here.
        */
        if (billPeriod) {
          this.billPeriodService.deleteBillPeriodById(billPeriod.id, billPeriod).subscribe({
            next: (data) => {
              this.snackbar.open('Bill Period deleted successfully', null, {
                duration: 5000,
                verticalPosition: 'top',
                horizontalPosition: 'center',
                panelClass: ['green-snackbar'],
              });
              this.getBillPeriods();
            },
            error: (err: HttpErrorResponse) => {
              this.notificationMessage('Bill Period deletion failed.', 'red-snackbar');
            }
          });
        }
      }
    })
    this.getBillPeriods();
  }

  getBillPeriods() {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.dateFormat = getClientDataFormat('DateFormat');
    this.billPeriodService.getBillPeriods(this.clientId).subscribe({
      next: (billPeriods: BillPeriod[]) => {
        billPeriods = billPeriods.map(billPeriod => new BillPeriod(billPeriod));
        billPeriods.forEach(x => {
          x.periodStartLocal = this.date.transform(x.periodStart.toString().replace(/-/g, '\/').replace(/T.+/, ''), this.dateFormat.toString());
          x.periodEndLocal = this.date.transform(x.periodEnd.toString().replace(/-/g, '\/').replace(/T.+/, ''), this.dateFormat.toString());
        })
        this.subject$.next(billPeriods);
      },
      error: (err) => {
        this.notificationMessage('Bill Periods Not Found.', 'red-snackbar');
      }
    });

    this.dataSource = new MatTableDataSource(this.billPeriods);

    this.data$.pipe(
      filter(data => !!data)
    ).subscribe((billPeriods) => {
      this.billPeriods = billPeriods;
      this.dataSource.data = billPeriods;
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

  ngOnDestroy() { }

}


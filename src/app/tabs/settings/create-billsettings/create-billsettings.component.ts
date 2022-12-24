import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, of, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ListColumn } from '../../../../@fury/shared/list/list-column.model';
import { BillsettingsCreateUpdateComponent } from "./billsettings-create-update/billsettings-create-update.component";
import { BillSettings } from "./billsettings-create-update/billsettings.model";
import { fadeInRightAnimation } from '../../../../@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from '../../../../@fury/animations/fade-in-up.animation';
import { BillsettingsService } from "../../shared/services/billsettings.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserConfirmationPopupComponent } from '../../shared/components/user-confirmation-popup/user-confirmation-popup.component';
import { ClientSelectionService } from '../../shared/services/client-selection.service';
import { FileService } from '../../shared/services/file.service';

@Component({
  selector: 'create-billsettings',
  templateUrl: './create-billsettings.component.html',
  styleUrls: ['./create-billsettings.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation]
})
export class CreateBillsettingsComponent implements OnInit, AfterViewInit, OnDestroy {

  subject$: ReplaySubject<BillSettings[]> = new ReplaySubject<BillSettings[]>(1);
  data$: Observable<BillSettings[]> = this.subject$.asObservable();
  billsettings: BillSettings[];


  @Input()
  columns: ListColumn[] = [

    { name: 'Bill Settings Name', property: 'billSettingsName', visible: true, isModelProperty: true },
    { name: 'Average Months Number', property: 'averageMonthsNumber', visible: true, isModelProperty: true },
    { name: 'Bill Format ', property: 'billFormat', visible: true, isModelProperty: true },
    { name: 'Bill Due Days', property: 'billDueDays', visible: true, isModelProperty: true },
    { name: 'Actions', property: 'actions', visible: true }

  ] as ListColumn[];

  pageSize = 8;
  dataSource: MatTableDataSource<BillSettings> | null;

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
    private billSettingsService: BillsettingsService,
    private snackbar: MatSnackBar,
    private clientSelectionService: ClientSelectionService,
    private fileService: FileService) { }

  get visibleColumns() {
    return this.columns.filter(columns => columns.visible).map(columns => columns.property);
  }

  ngOnInit() {
    this.clientSelectionService.setIsClientVisible(false);
    this.getBillSettings();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  createBillsettings() {
    this.dialog.open(BillsettingsCreateUpdateComponent, { minWidth: "600px" }).afterClosed().subscribe((billsettings: BillSettings) => {
      if (billsettings) {
        this.billSettingsService.createBillSettings(billsettings).subscribe(
          {
            next: (data: BillSettings) => {
              if (billsettings.file) {
                this.uploadFile(billsettings.file, 'Created');
              } else {
                this.notificationMessage('Bill Settings Created Successfully', 'green-snackbar');
                this.getBillSettings();
              }
              // this.billsettings.unshift(new BillSettings(billsettings));
              // this.subject$.next(this.billsettings);
            },
            error: (err) => {
              this.getBillSettings();
              this.notificationMessage('Bill Settings Creation Failed', 'red-snackbar');
            }
          })
      }
    });
    this.getBillSettings();
  }

  updateBillsettings(billsettings) {
    this.dialog.open(BillsettingsCreateUpdateComponent, {
      data: billsettings, minWidth: '600px'
    }).afterClosed().subscribe((billsettings: BillSettings) => {
      if (billsettings) {
        this.billSettingsService.updateBillsettingsById(billsettings.id, billsettings)
          .subscribe({
            next: (data: BillSettings) => {
              if (billsettings.file) {
                this.uploadFile(billsettings.file, 'Updated');
              } else {
                this.notificationMessage('Bill Settings Updated Successfully', 'green-snackbar');
                this.getBillSettings();
              }
              // const index=this.billsettings.findIndex((existingBillsettings)=>existingBillsettings.id===billsettings.id);
              // this.billsettings[index]=new BillSettings(billsettings);
              // this.subject$.next(this.billsettings);
            },
            error: (err) => {
              this.getBillSettings();
              this.notificationMessage('Bill Settings Update Failed', 'red-snackbar');
            }
          });
      }
    });
    this.getBillSettings();
  }


  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }


  deleteBillsettings(billsettings) {
    this.dialog.open(UserConfirmationPopupComponent).afterClosed().subscribe((message: any) => {
      if (message) {
        this.billSettingsService.deleteBillsettingsById(billsettings.id).subscribe({
          next: (data) => {
            this.getBillSettings();
            this.notificationMessage('Bill Settings Deleted Successfully', 'green-snackbar');
            // this.billsettings.splice(this.billsettings.findIndex((existingBillsettings)=>existingBillsettings.id===billsettings.id),1);
            // this.subject$.next(this.billsettings);
          },
          error(err) {
            this.notificationMessage(err, 'red-snackbar');
          }
        })
      }
    })
    this.getBillSettings();
  }

  uploadFile(file: File, status: string = '') {
    this.fileService.upload(file, "rdlc")
      .subscribe({
        next: (image) => {
          this.getBillSettings();
          this.notificationMessage(`Bill Settings ${status} Successfully`, 'green-snackbar');
        },
        error: (err) => {
          this.notificationMessage('Bill Settings Update Failed', 'red-snackbar');
        }
      });
  }


  onFilterChange(value) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

  getBillSettings() {
    this.billSettingsService.getBillSettings().subscribe((billsettings: BillSettings[]) => {
      billsettings = billsettings.map(billsettings => new BillSettings(billsettings));
      this.subject$.next(billsettings);
    });

    this.dataSource = new MatTableDataSource(this.billsettings);

    this.data$.pipe(
      filter(data => !!data)
    ).subscribe((billsettings) => {
      this.billsettings = billsettings;
      this.dataSource.data = billsettings;
    });

    this.ngAfterViewInit();
  }

  ngOnDestroy() { }

}

import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { MeterReplacementService } from '../../shared/services/meterreplacement.service';
import { MeterReplacement } from './meter-replacement-create-update/meter-replacement.model';
import { FormValidators } from '../../shared/methods/form-validators';
import { MetadataService } from 'src/app/tabs/shared/services/metadata.service';
import { MeterReplacementCreateUpdateComponent } from './meter-replacement-create-update/meter-replacement-create-update.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { HttpErrorResponse } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { getClientDataFormat } from '../../shared/utilities/utility';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-create-meter-replacement',
  templateUrl: './create-meter-replacement.component.html',
  styleUrls: ['./create-meter-replacement.component.scss']
})
export class CreateMeterReplacementComponent implements OnInit, AfterViewInit, OnDestroy {
  subject$: ReplaySubject<MeterReplacement[]> = new ReplaySubject<MeterReplacement[]>(1);
  data$: Observable<MeterReplacement[]> = this.subject$.asObservable();
  private meterReplacements: MeterReplacement[];
  dateFormat = '';
  clientId: number;

  @Input()
  displayedColumns: ListColumn[] = [
    { name: 'Date', property: 'replacementDateLocal', visible: true, isModelProperty: true },
    { name: 'Meter Name', property: 'deviceName', visible: true, isModelProperty: true },
    { name: 'Utility Type', property: 'utilityType', visible: true, isModelProperty: true },
    { name: 'Last Reading', property: 'reading', visible: true, isModelProperty: true },
    { name: 'Issue', property: 'remarks', visible: true, isModelProperty: true }
  ] as ListColumn[];

  public pageSize = 8;
  public dataSource: MatTableDataSource<MeterReplacement>;
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


  constructor(private meterReplacementService: MeterReplacementService,
    private snackbar: MatSnackBar,
    private date: DatePipe,
    private dialog: MatDialog,
    private cookieService: CookieService,
    private envService: EnvService) {
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;
  }

  get visibleColumns() {
    return this.displayedColumns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit() {
    this.getReplacedMetersList();
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

  createMeterReplacements() {
    this.dialog.open(MeterReplacementCreateUpdateComponent).afterClosed().subscribe((meterReplacement: MeterReplacement) => {
      /**
       * MeterReplacement is the updated MeterReplacement (if the user pressed Save - otherwise it's null)
       */
      if (meterReplacement) {
        /**
         * Here we are updating our local array.
         * You would probably make an HTTP request here.
         */
        this.meterReplacementService.createMeterReplacement(meterReplacement).subscribe({
          next: (meterReplacementObj: MeterReplacement) => {
            this.snackbar.open('Meter Replaced successfully.', null, {
              duration: 5000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
              panelClass: ['green-snackbar']
            });
            this.getReplacedMetersList();
          },
          error: (err: HttpErrorResponse) => {
            this.notificationMessage('Meter Replacement failed.', 'red-snackbar');
          }
        });
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

  getReplacedMetersList() {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.meterReplacementService.getReplacedMeters(this.clientId).subscribe({
      next: (meterReplacements: MeterReplacement[]) => {
        meterReplacements = meterReplacements.map(meterReplacement => new MeterReplacement(meterReplacement));
        this.subject$.next(meterReplacements);
      },
      error: (err) => {
        this.notificationMessage('Meter Replacements Not Found.', 'red-snackbar');
      }
    });

    this.dataSource = new MatTableDataSource(this.meterReplacements);

    this.data$.pipe(
      filter(data => !!data)
    ).subscribe((meterReplacements) => {
      this.meterReplacements = meterReplacements;
      meterReplacements.forEach(x => { x.replacementDateLocal = this.date.transform(x.replacementDate.toString(), this.dateFormat.toString()); })
      this.dataSource.data = meterReplacements;
    });

    this.ngAfterViewInit();
  }

  ngOnDestroy() { }
}

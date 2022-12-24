import { DatePipe } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, ReplaySubject } from 'rxjs';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { environment } from 'src/environments/environment';
import { TaxSettings } from '../create-tax-settings/tax-settings-create-update/tax-settings.model';
import { TaxSettingsService } from '../../shared/services/tax-settings.service';
import { filter } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { UserConfirmationPopupComponent } from '../../shared/components/user-confirmation-popup/user-confirmation-popup.component';
import { TaxSettingsCreateUpdateComponent } from './tax-settings-create-update/tax-settings-create-update.component';
import { getClientDataFormat } from '../../shared/utilities/utility';
import { ClientSelectionService } from '../../shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-create-tax-settings',
  templateUrl: './create-tax-settings.component.html',
  styleUrls: ['./create-tax-settings.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation]
})
export class CreateTaxSettingsComponent implements OnInit {

  subject$: ReplaySubject<TaxSettings[]> = new ReplaySubject<TaxSettings[]>(1);
  data$: Observable<TaxSettings[]> = this.subject$.asObservable();
  private taxSettings: TaxSettings[];
  dateFormat = '';
  clientId: number;

  @Input()
  displayedColumns: ListColumn[] = [
    { name: 'Tax Name', property: 'taxName', visible: true, isModelProperty: true },
    { name: 'Tax Display Name', property: 'taxDisplayName', visible: true, isModelProperty: true },
    //{ name: 'Effective From', property: 'effectiveFromLocal', visible: true, isModelProperty: true },
    { name: 'Computation Type', property: 'computationTypeName', visible: true, isModelProperty: true },
    { name: 'Actions', property: 'actions', visible: true }
  ] as ListColumn[];

  public pageSize = 8;
  public dataSource: MatTableDataSource<TaxSettings>;
  public columnsProps: string[] = this.displayedColumns.map((column: ListColumn) => {
    return column.property;
  });

  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  get visibleColumns() {
    return this.displayedColumns.filter(column => column.visible).map(column => column.property);
  }

  constructor(private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private date: DatePipe,
    private clientSelectionService: ClientSelectionService,
    private taxSettingsService: TaxSettingsService,
    private envService: EnvService) {
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;
  }

  ngOnInit(): void {
    this.clientSelectionService.setIsClientVisible(false);
    this.getTaxSettings();
  }

  getTaxSettings() {
    this.taxSettingsService.getTaxSettings().subscribe({
      next: (taxSettings: TaxSettings[]) => {
        taxSettings = taxSettings;
        taxSettings.forEach(x => {
          x.effectiveFromLocal = this.date.transform(x.effectiveFrom.toString().replace(/-/g, '\/').replace(/T.+/, ''), this.dateFormat.toString());
        })
        this.subject$.next(taxSettings);
      },
      error: (err) => {
        this.notificationMessage('Tax Settings Not Found.', 'red-snackbar');
      }
    });

    this.dataSource = new MatTableDataSource(this.taxSettings);

    this.data$.pipe(
      filter(data => !!data)
    ).subscribe((taxSettings) => {
      this.taxSettings = taxSettings;
      this.dataSource.data = taxSettings;
    });
    this.ngAfterViewInit();
  }

  createTaxSetting() {
    this.dialog.open(TaxSettingsCreateUpdateComponent).afterClosed().subscribe((taxSetting: TaxSettings) => {
      if (taxSetting) {
        /**
         * Here we are updating our local array.
         * You would probably make an HTTP request here.
         */
        this.taxSettingsService.createTaxSetting(taxSetting).subscribe((taxSetting: TaxSettings) => {
          this.notificationMessage('Tax Setting Created Successfully.', 'green-snackbar');
          this.getTaxSettings();
        }
        );
      }
    });
    this.getTaxSettings();
  }

  updateTaxSetting(taxSetting) {
    this.dialog.open(TaxSettingsCreateUpdateComponent, {
      data: taxSetting
    }).afterClosed().subscribe((taxSetting: TaxSettings) => {
      /**
       * taxSetting is the updated taxSetting (if the user pressed Save/Update - otherwise it's null)
       */
      if (taxSetting) {
        /**
         * Here we are updating our local array.
         * You would probably make an HTTP request here.
         */
        this.taxSettingsService.updateTaxSettingById(taxSetting.id, taxSetting).subscribe((taxSetting: TaxSettings) => {
          this.notificationMessage('Tax Setting Updated Successfully.', 'green-snackbar');
          this.getTaxSettings();
        });
      }
    });
    this.getTaxSettings();
  }

  deleteTaxSetting(taxSetting) {
    this.dialog.open(UserConfirmationPopupComponent).afterClosed().subscribe((message: any) => {
      if (message) {
        /* Here we are updating our local array.
        * You would probably make an HTTP request here.
        */
        if (taxSetting) {
          this.taxSettingsService.deleteTaxSettingById(taxSetting.id).subscribe(
            {
              next:
                (data) => {
                  this.notificationMessage('Tax Setting Deleted Successfully.', 'green-snackbar');
                  this.getTaxSettings();
                },
              error: (err) => {
                this.notificationMessage(err, 'red-snackbar');
              }
            });
        }
      }
    })
    this.getTaxSettings();
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

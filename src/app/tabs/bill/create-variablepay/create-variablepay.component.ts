import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, of, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ListColumn } from '../../../../@fury/shared/list/list-column.model';
import { fadeInRightAnimation } from '../../../../@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from '../../../../@fury/animations/fade-in-up.animation';
import { VariablepayCreateUpdateComponent } from './variablepay-create-update/variablepay-create-update.component';
import { VariablePay } from './variablepay-create-update/variablepay.model';
import { VariablePayService } from '../../shared/services/variablepay.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CurrencyPipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { HttpErrorResponse } from '@angular/common/http';
import { UserConfirmationPopupComponent } from '../../shared/components/user-confirmation-popup/user-confirmation-popup.component';
import { CookieService } from 'ngx-cookie-service';
import { getClientDataFormat } from '../../shared/utilities/utility';
import { ClientSelectionService } from '../../shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-create-variablepay.component',
  templateUrl: './create-variablepay.component.html',
  styleUrls: ['./create-variablepay.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation]
})

export class CreateVariablepayComponent implements OnInit, AfterViewInit, OnDestroy {

  subject$: ReplaySubject<VariablePay[]> = new ReplaySubject<VariablePay[]>(1);
  data$: Observable<VariablePay[]> = this.subject$.asObservable();
  variablePays: VariablePay[];
  dateFormat = getClientDataFormat('DateFormat');
  currencyFormat = '';
  roundFormat = '';
  clientId: number;

  @Input()
  displayedColumns: ListColumn[] = [
    { name: 'Period Description', property: 'periodDescription', visible: true, isModelProperty: true },
    //{ name: 'tenantId', property: 'tenantId', visible: false, isModelProperty: true },    
    //{ name: 'Tenant Number', property: 'tenantNumber', visible: true, isModelProperty: true },
    { name: 'Tenant Name', property: 'tenantName', visible: true, isModelProperty: true },
    //{ name: 'unitId', property: 'unitId', visible: false, isModelProperty: true },
    { name: 'Unit Number', property: 'unitNumber', visible: true, isModelProperty: true },
    //{ name: 'accountHeadId', property: 'accountHeadId', visible: false, isModelProperty: true },
    { name: 'Account Head Name', property: 'accountHeadName', visible: true, isModelProperty: true },
    //{ name: 'Bill Type', property: 'billTypeName', visible: true, isModelProperty: true },
    { name: 'Amount', property: 'amountLocal', visible: true, isModelProperty: false },
    { name: 'Actions', property: 'actions', visible: true }
  ] as ListColumn[];
  pageSize = 8;
  dataSource: MatTableDataSource<VariablePay> | null;

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
    private variablePayService: VariablePayService,
    private clientSelectionService: ClientSelectionService,
    private cookieService: CookieService,
    private envService: EnvService) {
    this.currencyFormat = getClientDataFormat('Currency') ?? envService.currencyFormat;
    this.roundFormat = getClientDataFormat('RoundOff') ?? envService.roundOffFormat;
  }

  get visibleColumns() {
    return this.displayedColumns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit() {
    this.clientSelectionService.setIsClientVisible(true);
    this.getVariablePays();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  createVariablePay() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "60%";

    this.dialog.open(VariablepayCreateUpdateComponent).afterClosed().subscribe((variablePay: VariablePay) => {
      /**
       * VariablePay is the updated VariablePay (if the user pressed Save - otherwise it's null)
       */
      if (variablePay) {
        /**
         * Here we are updating our local array.
         * You would probably make an HTTP request here.
         */
        this.variablePayService.createVariablePay(variablePay).subscribe((variablePayObj: VariablePay) => {
          this.snackbar.open('Variable Pay created successfully.', null, {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['green-snackbar'],
          });
          this.getVariablePays();
        });
      }
    });
  }

  updateVariablePay(variablePay) {
    this.dialog.open(VariablepayCreateUpdateComponent, {
      data: variablePay
    }).afterClosed().subscribe((variablePay: VariablePay) => {
      /**
       * VariablePay is the updated VariablePay (if the user pressed Save/Update - otherwise it's null)
       */
      if (variablePay) {
        /**
         * Here we are updating our local array.
         * You would probably make an HTTP request here.
         */
        this.variablePayService.updateVariablePayById(variablePay.id, variablePay).subscribe((variablePay: VariablePay) => {
          this.snackbar.open('Variable Pay updated successfully.', null, {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['green-snackbar'],
          });
          this.getVariablePays();
        })
      }
    });
  }

  deleteVariablePay(variablePay: VariablePay) {
    if (variablePay && variablePay.isVariablePayUsed) {
      this.notificationMessage('Cant delete this variable pay, its alreday used for bills.', 'red-snackbar');
      return;
    }
    this.dialog.open(UserConfirmationPopupComponent).afterClosed().subscribe((message: any) => {
      if (message) {
        this.variablePayService.deleteVariablePayById(variablePay.id, variablePay).subscribe({
          next: (data) => {
            this.snackbar.open('Variable Pay deleted successfully.', null, {
              duration: 5000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
              panelClass: ['green-snackbar'],
            });
            this.getVariablePays();
          },
          error: (err: HttpErrorResponse) => {
            this.notificationMessage('Variable Pay deletion failed.', 'red-snackbar');
          }
        })
      }
    })
  }

  getVariablePays() {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.variablePayService.getVariablePays(this.clientId).subscribe((variablePays: VariablePay[]) => {
      variablePays = variablePays.map(variablePay => new VariablePay(variablePay));
      this.subject$.next(variablePays);
    }
      // ,error: (err) => {
      //   this.notificationMessage('Variable Pays Not Found.', 'red-snackbar');
      // }
    );
    this.dataSource = new MatTableDataSource(this.variablePays);

    this.data$.pipe(
      filter(data => !!data)
    ).subscribe((variablePays) => {
      this.variablePays = variablePays;
      this.dateFormat = getClientDataFormat('DateFormat');
      this.roundFormat = getClientDataFormat('RoundOff');
      this.currencyFormat = getClientDataFormat('Currency');
      variablePays.forEach(x => { x.amountLocal = this.currency.transform(x.amount, this.currencyFormat.toString(), true, this.roundFormat); })
      this.dataSource.data = variablePays;
    });
    this.ngAfterViewInit();
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

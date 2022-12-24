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
import { ServiceDisconnectionService } from '../../shared/services/service.disconnection.service';
import { ServiceDisconnection } from './service-disconnection-create-update/service-disconnection.model';
import { FormValidators } from '../../shared/methods/form-validators';
import { MetadataService } from 'src/app/tabs/shared/services/metadata.service';
import { ServiceDisconnectionCreateUpdateComponent } from './service-disconnection-create-update/service-disconnection-create-update.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { HttpErrorResponse } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { getClientDataFormat } from '../../shared/utilities/utility';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-create-service-disconnection',
  templateUrl: './create-service-disconnection.component.html',
  styleUrls: ['./create-service-disconnection.component.scss']
})
export class CreateServiceDisconnectionComponent implements OnInit, AfterViewInit, OnDestroy {

  subject$: ReplaySubject<ServiceDisconnection[]> = new ReplaySubject<ServiceDisconnection[]>(1);
  data$: Observable<ServiceDisconnection[]> = this.subject$.asObservable();
  private serviceDisconnections: ServiceDisconnection[];
  dateFormat = '';
  clientId: number;

  @Input()
  displayedColumns: ListColumn[] = [
    { name: 'Date', property: 'date', visible: true, isModelProperty: true },
    { name: 'Utility Type', property: 'utilityType', visible: true, isModelProperty: true },
    { name: 'Unit Number', property: 'unitNumber', visible: true, isModelProperty: true },
    { name: 'Meter Name', property: 'meterName', visible: true, isModelProperty: true },
    { name: 'Connection Status', property: 'isConnectedString', visible: true, isModelProperty: true },
    { name: 'Remarks', property: 'remarks', visible: true, isModelProperty: true },
    { name: 'Actions', property: 'actions', visible: true }
  ] as ListColumn[];

  public pageSize = 8;
  public dataSource: MatTableDataSource<ServiceDisconnection>;
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

  constructor(private serviceDisconnectionService: ServiceDisconnectionService,
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
    this.getConnectionHistory();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  createServiceDisconnection() {
    this.dialog.open(ServiceDisconnectionCreateUpdateComponent).afterClosed().subscribe((serviceDisconnection: ServiceDisconnection) => {
      /**
       * ServiceDisconnection is the updated ServiceDisconnection (if the user pressed Save - otherwise it's null)
       */
      this.serviceDisconnection(serviceDisconnection);
    });
  }

  serviceDisconnection(connection) {
    if (connection) {
      /**
       * Here we are updating our local array.
       * You would probably make an HTTP request here.
       */
      this.serviceDisconnectionService.createServiceDisconnection(connection).subscribe({
        next: (serviceDisconnectionObj: ServiceDisconnection) => {
          this.snackbar.open('Service connected/disconnected successfully.', null, {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['green-snackbar'],
          });
          this.getConnectionHistory();
        },
        error: (err: HttpErrorResponse) => {
          this.notificationMessage('Service connection/disconnection failed.', 'red-snackbar');
        }
      });
    }
  }

  updateConnection(connectionObj) {
    connectionObj.isConnected = true;
    this.serviceDisconnection(connectionObj);
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

  getConnectionHistory() {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.serviceDisconnectionService.getConnectionHistory(this.clientId).subscribe({
      next: (serviceDisconnections: ServiceDisconnection[]) => {
        serviceDisconnections = serviceDisconnections.map(serviceDisconnection =>
          new ServiceDisconnection(serviceDisconnection));
        //serviceDisconnections.forEach(x => {x.dateLocal = this.date.transform(x.date.toString(), this.dateFormat.toString());})    
        this.subject$.next(serviceDisconnections);
      },
      error: (err) => {
        this.notificationMessage('Service Disconnections Not Found.', 'red-snackbar');
      }
    });

    this.dataSource = new MatTableDataSource(this.serviceDisconnections);

    this.data$.pipe(
      filter(data => !!data)
    ).subscribe((serviceDisconnections) => {
      this.serviceDisconnections = serviceDisconnections;
      this.dataSource.data = serviceDisconnections;
    });
    this.ngAfterViewInit();
  }

  ngOnDestroy() { }
}

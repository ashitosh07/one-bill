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
import { UnitMasterService } from '../../shared/services/unit-master.service';
import { UnitMaster } from './unit-master-create-update/unit-master.model';
import { UnitMasterCreateUpdateComponent } from './unit-master-create-update/unit-master-create-update.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { UserConfirmationPopupComponent } from '../../shared/components/user-confirmation-popup/user-confirmation-popup.component';
import { CookieService } from 'ngx-cookie-service';
import { ClientSelectionService } from '../../shared/services/client-selection.service';

@Component({
  selector: 'fury-create-unit-master',
  templateUrl: './create-unit-master.component.html',
  styleUrls: ['./create-unit-master.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation]
})

export class CreateUnitMasterComponent implements OnInit, AfterViewInit, OnDestroy {

  // vacantUnit: boolean = false;
  // occupiedUnit: boolean = false;
  // occupiedByTenant: boolean = false;
  // occupiedByOwner: boolean = false;
  occupancyStatus: string ='Vacant,Owner,Tenant';
  occupancies = ['Select All','Vacant Units','Occupied By Tenant','Occupied By Owner','Occupied By Owner/Tenant'];
  occupancy: string='Select All';

  subject$: ReplaySubject<UnitMaster[]> = new ReplaySubject<UnitMaster[]>(1);
  data$: Observable<UnitMaster[]> = this.subject$.asObservable();
  private units: UnitMaster[];
  clientId: number;

  @Input()
  displayedColumns: ListColumn[] = [

    //{ name: 'Unit Number', property: 'unitNumber', visible: true, isModelProperty: true },
    { name: 'Unit Number', property: 'aliasName', visible: true, isModelProperty: true },
    { name: 'Meter Number', property: 'meterNumber', visible: true, isModelProperty: true },
    //{ name: 'Building Name', property: 'buildingName', visible: true, isModelProperty: true },
    { name: 'Owner Name', property: 'ownerName', visible: true, isModelProperty: true },
    { name: 'Tenant Name', property: 'tenantName', visible: true, isModelProperty: true },
    { name: 'Unit Type', property: 'unitType', visible: true, isModelProperty: true },
    { name: 'Occupied By', property: 'posession', visible: true, isModelProperty: true },
    { name: 'Area (SqFt)', property: 'areaSqFt', visible: true, isModelProperty: true },
    { name: 'Capacity (Ton)', property: 'capacityTon', visible: true, isModelProperty: true },
    { name: 'Actions', property: 'actions', visible: true }
  ] as ListColumn[];

  public pageSize = 7;
  public dataSource: MatTableDataSource<UnitMaster>;
  public columnsProps: string[] = this.displayedColumns.map((column: ListColumn) => {
    return column.property;
  });

  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort){
       this.dataSource.sort = this.sort;  
    }
  }

  constructor(private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private unitMasterService: UnitMasterService,
    private clientSelectionService: ClientSelectionService,
    private cookieService: CookieService) { }

  get visibleColumns() {
    return this.displayedColumns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit() {
    this.clientSelectionService.setIsClientVisible(true);
    this.getUnits();
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  createUnit() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "60%";
    this.dialog.open(UnitMasterCreateUpdateComponent).afterClosed().subscribe((unit: UnitMaster) => {
      /**
       * Unit is the updated unit (if the user pressed Save - otherwise it's null)
       */
      if (unit) {
        /**
         * Here we are updating our local array.
         * You would probably make an HTTP request here.
         */
        this.unitMasterService.createUnit(unit).subscribe({
          next: (data: any) => {
            this.notificationMessage('Unit created successfully.', 'green-snackbar');
            this.getUnits();
          },
          error: (err: any) => {
            if (err.indexOf('409') >= 0) {
              this.notificationMessage('Unit Number already exists.', 'red-snackbar');
            }
            else {
              this.notificationMessage('Unit creation failed.', 'red-snackbar');
            }
          }
        });
      }
    });
  }

  updateUnit(unit) {
    this.dialog.open(UnitMasterCreateUpdateComponent, {
      data: unit
    }).afterClosed().subscribe((unit: UnitMaster) => {
      /**
       * Unit is the updated unit (if the user pressed Save - otherwise it's null)
       */
      if (unit) {
        /**
         * Here we are updating our local array.
         * You would probably make an HTTP request here.
         */
        this.unitMasterService.updateUnitById(unit.id, unit).subscribe({
          next: (unit: UnitMaster) => {
            this.notificationMessage('Unit updated successfully.', 'green-snackbar');
            this.getUnits();
          },
          error: (err: HttpErrorResponse) => {
            this.notificationMessage('Unit updation failed.', 'red-snackbar');
          }
        });
      }
    });
  }

  deleteUnit(unit) {
    this.dialog.open(UserConfirmationPopupComponent).afterClosed().subscribe((message: any) => {
      if (message) {
        /**
         * Here we are updating our local array.
         * You would probably make an HTTP request here.
         */
        if (unit) {
          this.unitMasterService.deleteUnitById(unit.id, unit).subscribe({
            next: (data) => {
              this.notificationMessage('Unit deleted successfully.', 'green-snackbar');
              this.getUnits();
            },
            error: (err: HttpErrorResponse) => {
              this.notificationMessage('Unit deletion failed.', 'red-snackbar');
            }
          })
        }
      }
    })
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onFilterChange(value) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

  getUnits() {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.setOccupancyStatus();
    this.unitMasterService.getUnitDetails(this.clientId,this.occupancyStatus).subscribe({
      next: (units: UnitMaster[]) => {
        units = units.map(unit => new UnitMaster(unit));
        this.subject$.next(units);
      },
      error: (err: HttpErrorResponse) => {
        this.notificationMessage('Units Not Found.', 'red-snackbar');
      }
    });
    this.dataSource = new MatTableDataSource();

    this.data$.pipe(
      filter(data => !!data)
    ).subscribe((units) => {
      this.units = units;
      this.dataSource.data = units;
    });

    this.ngAfterViewInit();
  }

  // toggleVacantUnits(value) {
  //   this.vacantUnit = !value;
  //   if (this.vacantUnit)
  //   {
  //     this.occupiedUnit = value;
  //     this.occupiedByTenant = value;
  //     this.occupiedByOwner = value;
  //   }    
  //   this.getUnits();
  // }

  // toggleTenantOccupiedUnits(value)
  // {
  //   this.occupiedByTenant = !value;
  //   if (this.occupiedByTenant)
  //   {
  //     this.occupiedUnit = value;
  //     this.vacantUnit = value;
  //     this.occupiedByOwner = value;
  //   }    
  //   this.getUnits();
  // }

  // toggleOwnerOccupiedUnits(value)
  // {
  //   this.occupiedByOwner = !value;
  //   if (this.occupiedByOwner)
  //   {
  //     this.occupiedUnit = value;
  //     this.vacantUnit = value;
  //     this.occupiedByTenant = value;
  //   }    
  //   this.getUnits();
  // }

  // toggleOccupiedUnits(value)
  // {
  //   this.occupiedUnit = !value;    
  //   if (this.occupiedUnit)
  //   {
  //     this.occupiedByOwner = value;
  //     this.vacantUnit = value;
  //     this.occupiedByTenant = value;
  //   }    
  //   this.getUnits();
  // }

  // setOccupancyStatus()
  // {
  //   if(this.occupiedByOwner)
  //   {
  //     this.occupancyStatus = 'Owner';
  //   }
  //   else if(this.occupiedByTenant)
  //   {
  //     this.occupancyStatus = 'Tenant';
  //   }
  //   else if(this.vacantUnit)
  //   {
  //     this.occupancyStatus = 'Vacant';
  //   }
  //   else if(this.occupiedUnit)
  //   {
  //     this.occupancyStatus = 'Owner,Tenant';
  //   }
  //   else {
  //     this.occupancyStatus = 'Vacant,Owner,Tenant';
  //   }
  // }

  setOccupancyStatus()
  {
    if(this.occupancy == 'Vacant Units')
    {      
      this.occupancyStatus = 'Vacant';
    }
    else if(this.occupancy == 'Occupied By Tenant')
    {
      this.occupancyStatus = 'Tenant';
    }
    else if(this.occupancy == 'Occupied By Owner')
    {
      this.occupancyStatus = 'Owner';
    }
    else if(this.occupancy == 'Occupied By Owner/Tenant')
    {
      this.occupancyStatus = 'Owner,Tenant';
    }
    else {
      this.occupancyStatus = 'Vacant,Owner,Tenant';
    }
  }

  selectFilter(event)
  {
    this.occupancy = event.value;
    this.getUnits();
  }

  ngOnDestroy() { }
}


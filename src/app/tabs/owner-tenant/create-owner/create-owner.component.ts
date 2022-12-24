import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ListColumn } from '../../../../@fury/shared/list/list-column.model';
import { OwnerCreateUpdateComponent } from './owner-create-update/owner-create-update.component';
import { Owner } from './owner-create-update/owner.model';
import { fadeInRightAnimation } from '../../../../@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from '../../../../@fury/animations/fade-in-up.animation';
import { OwnerService } from '../../shared/services/owner.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { UserConfirmationPopupComponent } from '../../shared/components/user-confirmation-popup/user-confirmation-popup.component';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
import { MasterService } from '../../shared/services/master.service';
import { ClientSelectionService } from '../../shared/services/client-selection.service';

@Component({
  selector: 'create-owner',
  templateUrl: './create-owner.component.html',
  styleUrls: ['./create-owner.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation]
})
export class CreateOwnerComponent implements OnInit, AfterViewInit, OnDestroy {

  /**
   * Simulating a service with HTTP that returns Observables
   * You probably want to remove this and do all requests in a service with HTTP
   */
  subject$: ReplaySubject<Owner[]> = new ReplaySubject<Owner[]>(1);
  data$: Observable<Owner[]> = this.subject$.asObservable();
  owners: Owner[];
  clientId: number;
  movedOut: boolean = false;
  isParameterTrue: boolean = true;

  @Input()
  columns: ListColumn[] = [
    //{ name: 'Checkbox', property: 'checkbox', visible: true },
    { name: 'Account Number', property: 'accountNumber', visible: true, isModelProperty: true },
    { name: 'Owner Name', property: 'ownerName', visible: true, isModelProperty: true },
    { name: 'Mobile', property: 'mobile', visible: true, isModelProperty: true },
    { name: 'Email', property: 'email', visible: true, isModelProperty: true },
    { name: 'Tenant/Owner', property: 'entityType', visible: true, isModelProperty: true },
    { name: 'Actions', property: 'actions', visible: true }

  ] as ListColumn[];
  pageSize = 8;
  dataSource: MatTableDataSource<Owner> | null;

  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort && this.dataSource) {
      this.dataSource.sort = this.sort;
    }
  }

  constructor(
    private dialog: MatDialog,
    private ownerService: OwnerService,
    private snackbar: MatSnackBar,
    private router: Router,
    private masterService: MasterService,
    private authenticationService: AuthenticationService,
    private clientSelectionService: ClientSelectionService,
    private cookieService: CookieService) {
  }

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit() {
    this.clientSelectionService.setIsClientVisible(true);
    this.clientId = parseInt(this.cookieService.get('globalClientId'));

    this.getAllOwners(this.clientId);

    this.masterService.getParameterValue('OwnerDetails').subscribe((parameterValue: boolean) => {
      if (!parameterValue) {
        this.isParameterTrue = parameterValue;
      }
    })
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  createOwner() {
    this.dialog.open(OwnerCreateUpdateComponent).afterClosed().subscribe((owner: Owner) => {
      if (owner) {
        owner.clientId = this.clientId;
        this.authenticationService.register(owner.userDetails, owner.clientId).subscribe(
          {
            next: (data: any) => {
              if (data && data.status === 'Success' && data.id) {
                owner.userId = data.id;
                this.createOwnerDetails(owner);
              } else {
                if (!data.isSuccess) {
                  const message: string = data.message;
                  this.notificationMessage(message, 'red-snackbar');
                } else {
                  this.notificationMessage('Failed to Save Data', 'red-snackbar');
                }
              }
            },
            error: (err) => {
              this.notificationMessage('Failed to Save Data', 'red-snackbar');
            }
          });
      }
    });
  }

  createOwnerDetails(owner: Owner) {
    this.ownerService.createOwner(owner).subscribe({
      next: (owner: Owner) => {
        if (owner) {
          this.notificationMessage('Data Saved Successfully', 'green-snackbar');
        } else {
          this.notificationMessage('Failed to Save Data', 'red-snackbar');
        }
        this.getAllOwners(this.clientId);
      },
      error: (err) => {
        this.notificationMessage('Failed to Save Data', 'red-snackbar');
      }
    });
  }

  updateOwner(owner) {
    this.dialog.open(OwnerCreateUpdateComponent, {
      data: owner
    }).afterClosed().subscribe((owner: Owner) => {
      if (owner) {
        this.updateUserDetail(owner, this.clientId);
      }
    });
  }

  updateUserDetail(owner: Owner, clientId: number) {
    this.authenticationService.updateUserDetail(owner.userDetails, clientId).subscribe({
      next: (data: any) => {
        if (data && data.status === 'Success') {
          this.updateOwnerDetails(owner, data);
        } else {
          if (data && data.status === "Error") {
            const message: string = data.message;
            this.notificationMessage(message, 'red-snackbar');
          } else {
            this.notificationMessage('Failed to Update Data', 'red-snackbar');
          }
        }
      },
      error: (err) => {
        this.notificationMessage('Failed to Update Data', 'red-snackbar');
      }
    });
  }

  updateOwnerDetails(owner: Owner, data: any) {
    this.ownerService.updateOwnerById(owner.id, owner).subscribe(
      {
        next: (owner: Owner) => {
          if (owner) {
            if (data.responseDetails) {
              if (data.responseDetails.status) {
                const message: string = `Notifications send failed. ${data.responseDetails.status ?? ''}`
                this.notificationMessage(message, 'red-snackbar');
              } else {
                const message: string = 'Data Updated Successfully'
                  + '\n'
                  + 'Total Requests : ' + data.responseDetails?.totalRequests
                  + '\n'
                  + 'Successfull Requests : ' + data.responseDetails?.successFullRequests
                  + '\n'
                  + 'Failed Requests : ' + data.responseDetails?.failedRequests;

                this.notificationMessage(message, 'green-snackbar');
              }
            } else {
              if (data && data.status === 'Success') {
                const message: string = 'Data Updated Successfully'
                this.notificationMessage(message, 'green-snackbar');
                //this.getAllOwners(this.clientId);
              } else {
                const message: string = data.message;
                this.notificationMessage(message, 'red-snackbar');
              }
            }
          } else {
            this.notificationMessage('Failed to Update Data', 'red-snackbar');
          }
          this.getAllOwners(this.clientId);
          // const index = this.owners.findIndex((existingOwner) => existingOwner.id === owner.id);
          // this.owners[index] = new Owner(owner);
          // this.subject$.next(this.owners);
        },
        error: (err) => {
          this.notificationMessage('Failed to Update Data', 'red-snackbar');
        }
      });
  }

  deleteOwner(owner: Owner) {
    if (owner && owner.isContractExists) {
      this.notificationMessage('Active Contract Exists,Hence Consumer can’t be deleted', 'red-snackbar');
      return;
    }
    this.dialog.open(UserConfirmationPopupComponent).afterClosed().subscribe((message: any) => {
      if (message) {
        this.ownerService.deleteOwnerById(owner.id).subscribe(() => {
          this.getAllOwners(this.clientId);
          // this.owners.splice(this.owners.findIndex((existingOwner) => existingOwner.id === owner.id), 1);
          // this.subject$.next(this.owners);
        })
      }
    })
  }

  ownerDetails(owner) {
    this.cookieService.set('ownerId', owner.id);
    this.cookieService.set('ownerName', owner.ownerName);
    // this.router.navigate([`/owner-tenant/create-owner/${owner.id}`]);
    this.router.navigate([`/openticketsdashboard`]);

  }

  onFilterChange(value) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

  getAllOwners(clientId) {
    this.ownerService.getclientOwners(clientId).subscribe((owners: Owner[]) => {
      owners = owners.map(owner => new Owner(owner));
      this.subject$.next(owners);
    });

    this.dataSource = new MatTableDataSource();

    this.data$.pipe(
      filter(data => !!data)
    ).subscribe((owners) => {
      this.owners = owners;
      this.dataSource.data = owners;
    });

    this.ngAfterViewInit();
  }

  ngOnDestroy() { }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: [cssClass],
    });
  }

  getMovedOutTenants() {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.ownerService.getMovedOutTenants(this.clientId).subscribe({
      next: (owners: Owner[]) => {
        owners = owners.map(owner => new Owner(owner));
        this.subject$.next(owners);
      },
      error: (err) => {
        this.notificationMessage('Moved Out Tenants Not Found.', 'red-snackbar');
        this.owners = null;
        this.dataSource = new MatTableDataSource(this.owners);
      }

    });

    this.dataSource = new MatTableDataSource(this.owners);

    this.data$.pipe(
      filter(data => !!data)
    ).subscribe((owners) => {
      this.owners = owners;
      this.dataSource.data = owners;
    });

    this.ngAfterViewInit();
  }

  toggleMovedOutTenant(value) {
    this.movedOut = !value;
    if (this.movedOut == true) {
      this.getMovedOutTenants();
    }
    else {
      this.getAllOwners(this.clientId);
    }
  }

}

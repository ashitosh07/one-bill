import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ListColumn } from '../../../../@fury/shared/list/list-column.model';
import { OwnerRegisteredCreateUpdateComponent } from './owner-registered-create-update/owner-registered-create-update.component';
import { Owner } from '../create-owner/owner-create-update/owner.model';
import { fadeInRightAnimation } from '../../../../@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from '../../../../@fury/animations/fade-in-up.animation';
import { OwnerService } from '../../shared/services/owner.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { UserConfirmationPopupComponent } from '../../shared/components/user-confirmation-popup/user-confirmation-popup.component';
import { CookieService } from 'ngx-cookie-service';
import { ClientSelectionService } from '../../shared/services/client-selection.service';

@Component({
  selector: 'fury-create-owner-registered',
  templateUrl: './create-owner-registered.component.html',
  styleUrls: ['./create-owner-registered.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation]
})
export class CreateOwnerRegisteredComponent implements OnInit, AfterViewInit, OnDestroy {

  /**
   * Simulating a service with HTTP that returns Observables
   * You probably want to remove this and do all requests in a service with HTTP
   */
  subject$: ReplaySubject<Owner[]> = new ReplaySubject<Owner[]>(1);
  data$: Observable<Owner[]> = this.subject$.asObservable();
  owners: Owner[];
  clientId: number;
  @Input()
  columns: ListColumn[] = [
    //{ name: 'Account Number', property: 'accountNumber', visible: true, isModelProperty: true },
    { name: 'Owner Name', property: 'ownerName', visible: true, isModelProperty: true },
    { name: 'Mobile', property: 'mobile', visible: true, isModelProperty: true },
    { name: 'Email', property: 'email', visible: true, isModelProperty: true },
    { name: 'Tenant/Owner', property: 'entityType', visible: true, isModelProperty: true },
    { name: 'Actions', property: 'actions', visible: true },
    //{ name: 'Checkbox', property: 'checkbox', visible: true }
  ] as ListColumn[];
  pageSize = 8;
  dataSource: MatTableDataSource<Owner> | null;

  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort){
       this.dataSource.sort = this.sort;  
    }
  }

  constructor(
    private dialog: MatDialog,
    private ownerService: OwnerService,
    private snackbar: MatSnackBar,
    private router: Router,
    private authenticationService: AuthenticationService,
    private clientSelectionService: ClientSelectionService,
    private cookieService: CookieService) {
  }

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit() {
    this.clientSelectionService.setIsClientVisible(true);
    this.getAllOwners();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  updateOwner(owner) {
    this.dialog.open(OwnerRegisteredCreateUpdateComponent, {
      data: owner
    }).afterClosed().subscribe((owner: Owner) => {
      if (owner) {
        if (!owner.userId && owner.userDetails) {
          this.authenticationService.register(owner.userDetails, owner.clientId).subscribe((data: any) => {
            if (data) {
              owner.userId = data.id;
              this.updateOwnerDetails(owner);
            };
          });
        }
        else {
          this.updateOwnerDetails(owner);
        }
      }
    })
    this.getAllOwners();
  }

  updateOwnerDetails(owner: Owner) {
    this.ownerService.updateOwnerById(owner.id, owner).subscribe({
      next: (owner: Owner) => {
        this.snackbar.open('Successfully moved to Owner-Tenant', null, {
          duration: 5000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['green-snackbar'],
        });
        this.getAllOwners();
        // const index = this.owners.findIndex((existingOwner) => existingOwner.id === owner.id);
        // this.owners[index] = new Owner(owner);
        // this.subject$.next(this.owners);
      },
      error: (err) => {
        this.notificationMessage('Newly Registered Owner/Tenant updation failed', 'red-snackbar');
      }
    });
  }

  deleteOwner(owner) {
    this.dialog.open(UserConfirmationPopupComponent).afterClosed().subscribe((message: any) => {
      if (message) {
        this.ownerService.deleteOwnerById(owner.id).subscribe({
          next: () => {
            this.getAllOwners();
            // this.owners.splice(this.owners.findIndex((existingOwner) => existingOwner.id === owner.id), 1);
            // this.subject$.next(this.owners);
          },
          error: (err) => {
            this.notificationMessage('Newly Registered Owner/Tenant deletion failed', 'red-snackbar');
          }
        })
      }
    })
  }

  onFilterChange(value) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  getAllOwners() {
    this.clientId = parseInt(this.cookieService.get('globalClientId'))
    this.ownerService.getNewlyRegisteredUsers(this.clientId).subscribe({
      next: (owners: Owner[]) => {
        owners = owners.map(owner => new Owner(owner));
        this.subject$.next(owners);
      },
      error: (err) => {
        this.notificationMessage('Newly Registered Owner/Tenant Not Found.', 'green-snackbar');
      }
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
}

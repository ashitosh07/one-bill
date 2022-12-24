import { Component, OnInit, ChangeDetectorRef, ViewChild, Input, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { scaleInAnimation } from 'src/@fury/animations/scale-in.animation';
import { MasterService } from '../../shared/services/master.service';
import { ListItem } from '../../shared/models/list-item.model';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { ClientService } from '../../shared/services/client.service';
import { CreateUserFormComponent } from './create-user-form/create-user-form.component';
import { UserDetails } from '../../shared/models/user-details';
import { UserClients } from '../../shared/models/user-clients.model';
import { Client } from 'src/app/pages/client/client-create-update/client.model';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { UserConfirmationPopupComponent } from '../../shared/components/user-confirmation-popup/user-confirmation-popup.component';
import { ClientSelectionService } from '../../shared/services/client-selection.service';

@Component({
  selector: 'create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation]
})
export class CreateUserComponent implements OnInit {

  subject$: ReplaySubject<UserDetails[]> = new ReplaySubject<UserDetails[]>(1);
  data$: Observable<UserDetails[]> = this.subject$.asObservable();
  userDetails: UserDetails[];

  private _gap = 16;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`;

  roles: ListItem[] = [];
  clients: ListItem[] = [];

  @ViewChild(CreateUserFormComponent, { static: true }) createUserFormComponent: CreateUserFormComponent;

  @Input()
  columns: ListColumn[] = [
    //{ name: 'Id', property: 'id', visible: false, isModelProperty: true },
    { name: 'User Name', property: 'username', visible: true, isModelProperty: true },
    { name: 'Email', property: 'email', visible: true, isModelProperty: true },
    { name: 'Role', property: 'role', visible: true, isModelProperty: true },
    { name: 'Designation', property: 'designation', visible: true, isModelProperty: true },
    { name: 'Actions', property: 'actions', visible: true },
    // { name: 'Checkbox', property: 'checkbox', visible: true }
  ] as ListColumn[];

  pageSize = 10;
  dataSource: MatTableDataSource<UserDetails> | null;

  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort){
       this.dataSource.sort = this.sort;  
    }
  }

  constructor(private fb: FormBuilder, private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private snackbar: MatSnackBar,
    private authenticationService: AuthenticationService,
    private clientSelectionService: ClientSelectionService,
    private ClientService: ClientService
  ) {
  }

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit() {
    this.clientSelectionService.setIsClientVisible(false);
    this.getUsers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
  saveUserDetails() {
    this.dialog.open(CreateUserFormComponent,{width:'620px'}).afterClosed().subscribe((userDetail: UserDetails) => {
      if (userDetail) {
        this.authenticationService.register(userDetail).subscribe({
          next: (data: any) => {
            if (data) {
              if (data.responseDetails) {
                if (data.responseDetails.status) {
                  const message: string = `Notifications send failed. ${data.responseDetails.status ?? ''}`
                  this.notificationMessage(message, 'red-snackbar');
                } else {
                  const message: string = 'User created successfully'
                    + '\n'
                    + 'Total Requests : ' + data.responseDetails?.totalRequests
                    + '\n'
                    + 'Successfull Requests : ' + data.responseDetails?.successFullRequests
                    + '\n'
                    + 'Failed Requests : ' + data.responseDetails?.failedRequests;

                  this.notificationMessage(message, 'green-snackbar');
                }
              } else {
                if (data.isSuccess) {
                  const message: string = 'User created successfully'
                  this.notificationMessage(message, 'green-snackbar');
                } else {
                  if (data && data.status === 'Success') {
                    const message: string = 'User created successfully'
                    this.notificationMessage(message, 'green-snackbar');
                  } else {
                    const message: string = data.message;
                    this.notificationMessage(message, 'red-snackbar');
                  }
                }
              }
            }
            this.getUsers();
            // this.userDetails.unshift(new UserDetails(userDetail));
            // this.subject$.next(this.userDetails);
          },
          error: (err) => {
            this.notificationMessage(err, 'red-snackbar');
          }

        });
      }
    });
  }

  updateUserDetail(userDetail) {
    this.dialog.open(CreateUserFormComponent, {
      data: userDetail
    }).afterClosed().subscribe((userDetail: UserDetails) => {

      if (userDetail) {
        this.authenticationService.updateUserDetailbyId(userDetail.id, userDetail).subscribe({
          next:
            (data: any) => {
              this.snackbar.open('User updated successfully', null, {
                duration: 5000,
                verticalPosition: 'top',
                horizontalPosition: 'center',
                panelClass: ['green-snackbar'],
              });
              this.getUsers();
              // const index = this.userDetails.findIndex((existingUserDetails) => existingUserDetails.id === userDetail.id);
              // this.userDetails[index] = new UserDetails(userDetail);
              // this.subject$.next(this.userDetails);
            },
          error: (err) => {
            this.notificationMessage('User updation failed', 'red-snackbar');
          }
        });
      }
    });
  }

  deleteUserDetail(userDetail) {
    this.dialog.open(UserConfirmationPopupComponent).afterClosed().subscribe((message: any) => {
      if (message) {
        this.authenticationService.deleteUserDetailbyId(userDetail.id).subscribe({
          next: () => {
            this.snackbar.open('User deleted successfully', null, {
              duration: 5000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
              panelClass: ['green-snackbar'],
            });
            this.getUsers();
            // this.userDetails.splice(this.userDetails.findIndex((existingUser) => existingUser.id === userDetail.id), 1);
            // this.subject$.next(this.userDetails);
            // this.dataSource.data = this.userDetails;
          },
          error: (err) => {
            this.notificationMessage('User deletion failed', 'red-snackbar');
          }
        })
      }
    })
  }


  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
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

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  getUsers() {
    this.authenticationService.getUsers().subscribe({
      next: (userDetails: UserDetails[]) => {
        userDetails = userDetails.map(userDetail => new UserDetails(userDetail));
        this.subject$.next(userDetails);
      },
      error: (err) => {
        this.notificationMessage('Users not found.', 'red-snackbar');
      }
    });

    this.dataSource = new MatTableDataSource(this.userDetails);

    this.data$.pipe(
      filter(data => !!data)
    ).subscribe((userDetails) => {
      this.userDetails = userDetails;
      this.dataSource.data = userDetails;
    });

    this.ngAfterViewInit();
  }

  ngOnDestroy() { }
}

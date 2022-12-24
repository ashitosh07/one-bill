import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, of, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ListColumn } from '../../../../@fury/shared/list/list-column.model';
import { CREATE_TENANT_DEMO_DATA } from './users.demo';
import { UserCreateUpdateComponent } from './user-create-update/user-create-update.component';
import { Tenant } from './user-create-update/user.model';
import { fadeInRightAnimation } from '../../../../@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from '../../../../@fury/animations/fade-in-up.animation';

@Component({
  selector: 'users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation]
})
export class UsersComponent implements OnInit, AfterViewInit, OnDestroy {

  /**
   * Simulating a service with HTTP that returns Observables
   * You probably want to remove this and do all requests in a service with HTTP
   */
  subject$: ReplaySubject<Tenant[]> = new ReplaySubject<Tenant[]>(1);
  data$: Observable<Tenant[]> = this.subject$.asObservable();
  customers: Tenant[];

  @Input()
  columns: ListColumn[] = [
    { name: 'Checkbox', property: 'checkbox', visible: false },
    { name: 'Image', property: 'image', visible: true },
    { name: 'Name', property: 'name', visible: true, isModelProperty: true },
    { name: 'First Name', property: 'firstName', visible: false, isModelProperty: true },
    { name: 'Last Name', property: 'lastName', visible: false, isModelProperty: true },
    { name: 'Street', property: 'street', visible: true, isModelProperty: true },
    { name: 'Zipcode', property: 'zipcode', visible: true, isModelProperty: true },
    { name: 'City', property: 'city', visible: true, isModelProperty: true },
    { name: 'Phone', property: 'phoneNumber', visible: true, isModelProperty: true },
    { name: 'Actions', property: 'actions', visible: true },
  ] as ListColumn[];
  pageSize = 10;
  dataSource: MatTableDataSource<Tenant> | null;

  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort){
       this.dataSource.sort = this.sort;  
    }
  }

  constructor(private dialog: MatDialog) {
  }

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  /**
   * Example on how to get data and pass it to the table - usually you would want a dedicated service with a HTTP request for this
   * We are simulating this request here.
   */
  getData() {
    return of(CREATE_TENANT_DEMO_DATA.map(customer => new Tenant(customer)));
  }

  ngOnInit() {
    this.getData().subscribe(customers => {
      this.subject$.next(customers);
    });

    this.dataSource = new MatTableDataSource();

    this.data$.pipe(
      filter(data => !!data)
    ).subscribe((customers) => {
      this.customers = customers;
      this.dataSource.data = customers;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  createCustomer() {
    this.dialog.open(UserCreateUpdateComponent).afterClosed().subscribe((customer: Tenant) => {
      /**
       * Customer is the updated customer (if the user pressed Save - otherwise it's null)
       */
      if (customer) {
        /**
         * Here we are updating our local array.
         * You would probably make an HTTP request here.
         */
        this.customers.unshift(new Tenant(customer));
        this.subject$.next(this.customers);
      }
    });
  }

  updateCustomer(customer) {
    this.dialog.open(UserCreateUpdateComponent, {
      data: customer
    }).afterClosed().subscribe((customer) => {
      /**
       * Customer is the updated customer (if the user pressed Save - otherwise it's null)
       */
      if (customer) {
        /**
         * Here we are updating our local array.
         * You would probably make an HTTP request here.
         */
        const index = this.customers.findIndex((existingCustomer) => existingCustomer.id === customer.id);
        this.customers[index] = new Tenant(customer);
        this.subject$.next(this.customers);
      }
    });
  }

  deleteCustomer(customer) {
    /**
     * Here we are updating our local array.
     * You would probably make an HTTP request here.
     */
    this.customers.splice(this.customers.findIndex((existingCustomer) => existingCustomer.id === customer.id), 1);
    this.subject$.next(this.customers);
  }

  onFilterChange(value) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

  ngOnDestroy() {
  }
}

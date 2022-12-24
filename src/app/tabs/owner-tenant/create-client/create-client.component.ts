import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, of, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ListColumn } from '../../../../@fury/shared/list/list-column.model';
import { ClientCreateUpdateComponent } from './client-create-update/client-create-update.component';
import { Client } from '../../shared/models/client.model ';
import { fadeInRightAnimation } from '../../../../@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from '../../../../@fury/animations/fade-in-up.animation';
import { TenantService } from "../../shared/services/tenant.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserConfirmationPopupComponent } from '../../shared/components/user-confirmation-popup/user-confirmation-popup.component';
import { ClientSelectionService } from '../../shared/services/client-selection.service';

@Component({
  selector: 'create-client',
  templateUrl: './create-client.component.html',
  styleUrls: ['./create-client.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation]
})
export class CreateClientComponent implements OnInit, AfterViewInit, OnDestroy {

  /**
   * Simulating a service with HTTP that returns Observables
   * You probably want to remove this and do all requests in a service with HTTP
   */
  subject$: ReplaySubject<Client[]> = new ReplaySubject<Client[]>(1);
  data$: Observable<Client[]> = this.subject$.asObservable();
  clients: Client[];

  @Input()
  columns: ListColumn[] = [

    { name: 'Client Name', property: 'clientName', visible: true, isModelProperty: true },
    { name: 'Mobile', property: 'phoneNo', visible: true, isModelProperty: true },
    { name: 'Email', property: 'email', visible: true, isModelProperty: true },
    { name: 'Account Number', property: 'accountNumber', visible: true, isModelProperty: true },
    { name: 'Status', property: 'status', visible: true, isModelProperty: true },
    { name: 'Actions', property: 'actions', visible: true },

  ] as ListColumn[];
  pageSize = 10;
  dataSource: MatTableDataSource<Client> | null;

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
    private tenantService: TenantService,
    private snackBar: MatSnackBar,
    private clientSelectionService: ClientSelectionService,
    private router: Router) {
  }

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit() {
    this.clientSelectionService.setIsClientVisible(false);
    this.getAllClients();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  createClient() {
    this.dialog.open(ClientCreateUpdateComponent).afterClosed().subscribe((client: Client) => {
      /**
       * Customer is the updated customer (if the user pressed Save - otherwise it's null)
       */
      if (client) {
        this.tenantService.createClient(client).subscribe((client: Client) => {
          this.snackBar.open('Client created successfully', null, {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['green-snackbar'],
          });
          this.getAllClients();
          //this.clients.unshift(new Client(client));
        });
      }
    });
    this.getAllClients();
  }

  updateClient(client) {
    this.dialog.open(ClientCreateUpdateComponent, {
      data: client
    }).afterClosed().subscribe((client: Client) => {
      /**
       * Customer is the updated customer (if the user pressed Save - otherwise it's null)
       */
      if (client) {
        this.tenantService.updateClientbyId(client.id, client).subscribe((client: Client) => {
          this.snackBar.open('Client updated successfully', null, {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['green-snackbar'],
          });
          this.getAllClients();
          //   const index = this.clients.findIndex((existingClient) => existingClient.id === client.id);
          // this.clients[index] = new Client(client);
          // this.subject$.next(this.clients);
        });
      }
    });
    this.getAllClients();
  }

  deleteClient(client) {
    this.dialog.open(UserConfirmationPopupComponent).afterClosed().subscribe((message: any) => {
      if (message) {
        this.tenantService.deleteClientbyId(client.id).subscribe(() => {
          this.clients.splice(this.clients.findIndex((existingClient) => existingClient.id === client.id), 1);
          this.subject$.next(this.clients);
        })
        this.getAllClients();
      }
    })
    this.getAllClients();
  }

  onFilterChange(value) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

  getAllClients() {
    let availableClients: Client[] = [];
    this.tenantService.getClients().subscribe((clients: Client[]) => {
      // const userClients = localStorage.getItem('userClients');
      // if (userClients) {
      //   const assignedClients = JSON.parse(userClients);
      //   if (assignedClients && assignedClients.length) {
      //     assignedClients.forEach(element => {
      //       const client = clients.find(x => x.id == element.clientId);
      //       if (client) {
      //         availableClients.push(client);
      //       }
      //     });
      //   }
      // }
      // clients = availableClients;
      this.subject$.next(clients);
    });
    this.dataSource = new MatTableDataSource();

    this.data$.pipe(
      filter(data => !!data)
    ).subscribe((clients) => {
      this.clients = clients;
      this.dataSource.data = clients;
    });
    this.ngAfterViewInit();
  }

  ngOnDestroy() {
  }

  tenantDetails(tenant) {
    this.router.navigate([`/owner-tenant/create-client/${tenant.id}`]);
  }
}

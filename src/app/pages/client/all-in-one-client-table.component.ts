import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, of, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ListColumn } from '../../../@fury/shared/list/list-column.model';
import { ClientCreateUpdateComponent } from './client-create-update/client-create-update.component';
import { Client } from './client-create-update/client.model';
import { fadeInRightAnimation } from '../../../@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from '../../../@fury/animations/fade-in-up.animation';
import { ClientService } from './client.service'
import { CircleManager } from '@agm/core';
@Component({
  selector: 'fury-all-in-one-client-table',
  templateUrl: './all-in-one-client-table.component.html',
  styleUrls: ['./all-in-one-client-table.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation]
})
export class AllInOneClientTableComponent implements OnInit, AfterViewInit, OnDestroy {

  /**
   * Simulating a service with HTTP that returns Observables
   * You probably want to remove this and do all requests in a service with HTTP
   */
  subject$: ReplaySubject<Client[]> = new ReplaySubject<Client[]>(1);
  data$: Observable<Client[]> = this.subject$.asObservable();
  Clients: Client[];

  @Input()
  columns: ListColumn[] = [

    { name: 'Name', property: 'clientName', visible: true, isModelProperty: true },
    { name: 'Mobile', property: 'mobile', visible: true, isModelProperty: true },
    { name: 'Actions', property: 'actions', visible: true },

  ] as ListColumn[];
  pageSize = 10;
  dataSource: MatTableDataSource<Client> | null;

  test = [ { title:"hello"}];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private dialog: MatDialog, private clientService: ClientService) {
  }

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  /**
   * Example on how to get data and pass it to the table - usually you would want a dedicated service with a HTTP request for this
   * We are simulating this request here.
   */


  ngOnInit() {
      this.dataSource = new MatTableDataSource();
      this.clientService.getClientData().subscribe( (data: Client[]) => {
        this.Clients = data,
        this.dataSource.data = data
        
      });

    }


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  createClient() {
    this.dialog.open(ClientCreateUpdateComponent).afterClosed().subscribe((Client: Client) => {
      /**
       * Client is the updated Client (if the user pressed Save - otherwise it's null)
       */
      if (Client) {
        /**
         * Here we are updating our local array.
         * You would probably make an HTTP request here.
         */
        // this.Clients.unshift(new Client(Client));
        // this.subject$.next(this.Clients);
   
        // this.clientService.updateClientData(this.test)
        this.clientService.addClient(Client).subscribe ( (data)=> {
        })
      }
    });
  }

  updateClient(Client) {
    this.dialog.open(ClientCreateUpdateComponent, {
      data: Client
    }).afterClosed().subscribe((Client) => {
      /**
       * Client is the updated Client (if the user pressed Save - otherwise it's null)
       */
      if (Client) {
        /**
         * Here we are updating our local array.
         * You would probably make an HTTP request here.
         */
        // const index = this.Clients.findIndex((existingClient) => existingClient.clientId === Client.clientId);
        // this.Clients[index] = new Client(Client);
        // this.subject$.next(this.Clients);
        this.clientService.modifyClient(Client).subscribe ( (data)=> {

        })
      }
    });
  }

  deleteClient(Client) {
    /**
     * Here we are updating our local array.
     * You would probably make an HTTP request here.
     */
    // this.Clients.splice(this.Clients.findIndex((existingClient) => existingClient.id === Client.id), 1);
    // this.subject$.next(this.Clients);
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

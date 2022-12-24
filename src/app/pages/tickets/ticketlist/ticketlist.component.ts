import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TicketlistService } from '../ticketlist.service';
import { Mail } from '../../apps/inbox/shared/mail.interface';
import { takeUntil } from 'rxjs/operators';
import { componentDestroyed } from './../../../../@fury/shared/component-destroyed';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';
import { JwtHelperService } from '@auth0/angular-jwt';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { CookieService } from 'ngx-cookie-service';
import { getClientDataFormat } from 'src/app/tabs/shared/utilities/utility';
import { ClientSelectionService } from 'src/app/tabs/shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-ticketlist',
  templateUrl: './ticketlist.component.html',
  styleUrls: ['./ticketlist.component.scss']
})
export class TicketlistComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private router: Router,
    private date: DatePipe,
    private ticketService: TicketlistService,
    private jwtHelperService: JwtHelperService,
    private snackbar: MatSnackBar,
    private clientSelectionService: ClientSelectionService,
    private cookieService: CookieService,
    private envService: EnvService
  ) {
    if (this.statusName == 'Closed') {
      this.columns = this.closedColumns;
    }
    else {
      this.columns = this.openColumns;
    }
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;
  }

  dateFormat = '';
  pageSize: Number = 10;
  dataSource = new MatTableDataSource([]);

  clientId: string;
  blnShow: string = 'none';
  isClosed: boolean = false;

  columns: ListColumn[];

  lstStatus = ['Open', 'Close'];
  @Input()
  closedColumns: ListColumn[] = [
    { name: 'Date', property: 'date', visible: true, isModelProperty: true },
    { name: 'Ticket No.', property: 'ticketNumber', visible: true, isModelProperty: true },
    { name: 'Title', property: 'title', visible: true, isModelProperty: true },
    { name: 'Ticket Message', property: 'descText', visible: true, isModelProperty: true },
    { name: 'Type', property: 'sentToName', visible: true, isModelProperty: true },
    { name: 'Status', property: 'ticketStatusName', visible: true, isModelProperty: true },
    { name: 'Closed Date', property: 'closedDate', visible: true, isModelProperty: false },
    { name: 'Actions', property: 'actions', visible: true },
  ] as ListColumn[];

  @Input()
  openColumns: ListColumn[] = [
    { name: 'Date', property: 'date', visible: true, isModelProperty: true },
    { name: 'Ticket No.', property: 'ticketNumber', visible: true, isModelProperty: true },
    { name: 'Title', property: 'title', visible: true, isModelProperty: true },
    { name: 'Ticket Message', property: 'descText', visible: true, isModelProperty: true },
    { name: 'Type', property: 'sentToName', visible: true, isModelProperty: true },
    { name: 'Status', property: 'ticketStatusName', visible: true, isModelProperty: true },
    //{ name: 'Closed Date', property: 'closedDate', visible: true, isModelProperty: false },
    { name: 'Actions', property: 'actions', visible: true },
  ] as ListColumn[];
  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  lstData1 = [];

  statusName: string = '';
  blnOpen: boolean = true;
  statusLabel: string = 'Open Tickets';

  ownerId: number = 0;
  createdUserId: string = '';
  role: string = '';
  public columnsProps: string[];

  ngOnInit(): void {
    this.columnsProps = this.columns.map((column: ListColumn) => column.property);

    let token = this.cookieService.get('access_token');

    const decodedToken = this.jwtHelperService.decodeToken(token);
    if (decodedToken)
      this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    if (this.statusName == 'Closed') {
      this.columns = this.closedColumns;
    }
    else {
      this.columns = this.openColumns;
    }
    this.createdUserId = this.cookieService.get('userId');
    this.ownerId = parseInt(this.cookieService.get('ownerId') ?? '0');
    this.clientId = this.cookieService.get('globalClientId');
    if (this.ownerId && this.ownerId > 0) {
      this.clientSelectionService.setIsClientVisible(false);
    }
    else {
      this.clientSelectionService.setIsClientVisible(true);
    }

    this.getData();
  }

  onStatusChange(event) {

    if (event != 'initial')
      this.blnOpen = event.checked;

    let tempLst = [];
    if (this.blnOpen) {
      this.statusName = 'Open';
      this.statusLabel = 'Open Tickets'
      this.isClosed = false;
    }

    else {
      this.statusName = 'Closed';
      this.statusLabel = 'Closed Tickets'
      this.isClosed = true;
    }

    if (this.statusName == 'Closed') {
      this.columns = this.closedColumns;
    }
    else {
      this.columns = this.openColumns;
    }

    this.lstData1.forEach(element => {
      if (element.ticketStatusName == this.statusName)
        tempLst.push(element);
    })
    this.columnsProps = this.columns.map((column: ListColumn) => column.property);

    this.dataSource = new MatTableDataSource(tempLst);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getvisibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  onFilterChange(value) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }


  viewTickets(ticketId) {

    this.router.navigate(['/tickets/view', ticketId]);
  }

  changeStatus(row) {
    let dctData = {};
    if (row.ticketStatusName == 'Open') {
      row['ticketStatusName'] = 'Closed';
    }
    else {
      row['ticketStatusName'] = 'Open';
    }

    // dctData['sentTo'] = row.sentTo;
    // dctData['description'] = row.description;
    // dctData['attachment'] = row.attachment;
    // dctData['assignedTo'] = 1;
    // // dctData['assignedTo']=assignedTo;

    // dctData['createdUser'] = row.createdUser;
    // dctData['clientId']=Number(this.cookieService.get('globalClientId'));

    // dctData['role'] = this.role;
    // // let date = new Date();
    // // dctData['date'] =row.date;

    // dctData['ownerId']= Number(this.cookieService.get('ownerId'));
    // dctData['date'] = new Date();

    row.date = new Date();
    // row['ticketTransaction'].push(dctData);

    this.ticketService.updateTicketById(Number(row.id), row).subscribe((data: any) => {
      if (data) {
        this.popupMsg('success', 'Status updated Successfully');
        this.getData();
      } else {

      }
    })
  }

  popupMsg(type, msg) {

    let snackbarColor;
    if (type == 'error') {
      snackbarColor = 'red-snackbar';
    }
    else if (type == 'success') {
      snackbarColor = 'green-snackbar';
    }
    this.snackbar.open(msg, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: [snackbarColor],
    });
  }

  getData() {
    this.ticketService.getTickets(this.clientId, this.role, this.ownerId, this.createdUserId).subscribe((data: any) => {

      if (data) {

        this.blnShow = 'block';
        if (data.length == 0)
          this.blnShow = 'none';

        this.lstData1 = data;
        this.dateFormat = getClientDataFormat('DateFormat');

        this.lstData1.forEach(element => {
          element.date = this.date.transform(element.date.toString(), this.dateFormat.toString());

          element['descText'] = '';
          var span = document.createElement('span');
          span.innerHTML = element.description;
          element['descText'] = span.innerText;

          if (element['descText'].length > 20) { //Slice text message to short
            element['descText'] = element['descText'].slice(0, 20) + ' ...'
          }

        });

        this.dataSource = new MatTableDataSource(this.lstData1);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.onStatusChange('initial'); //Initially setting Open status for tickets
      }
      else {
        this.blnShow = 'none';
      }
    }),
      (error => {
        this.blnShow = 'none';
      })
  }


}

import { AfterContentInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { componentDestroyed } from 'src/@fury/shared/component-destroyed';
import { environment } from 'src/environments/environment';
import { InboxNavigationComponent } from '../../apps/inbox/inbox-navigation/inbox-navigation.component';
import { Mail } from '../../apps/inbox/shared/mail.interface';
import { SendemailComponent } from '../../sendsms/sendemail/sendemail.component';
import { ListemailsService } from '../listemails.service';

@Component({
  selector: 'fury-listemails',
  templateUrl: './listemails.component.html',
  styleUrls: ['./listemails.component.scss'],
})
export class ListemailsComponent implements OnInit {

  mailType: string = '';
  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private inboxService: ListemailsService,
    private cookieService: CookieService
  ) { }

  sendTo: string = '';

  ngOnInit(): void {
  }
  receiveMailType(mailType) {
    this.mailType = mailType;
  }

  ngAfterViewInit() {
  }

  ngOnDestroy(): void {
  }

  openCompose() {

    let entityType = '';
    let clientId = this.cookieService.get('globalClientId');
    this.sendTo = '';

    this.inboxService.getNotificationEntities(entityType, clientId).subscribe((data: any) => {
      if (data) {
        let ownerId = this.cookieService.get('ownerId');
        if (ownerId) {
          const item = data.find(element => element.id == ownerId);
          if(item){
            this.sendTo = item.email;
            const dialogConfig = new MatDialogConfig();
  
            dialogConfig.data = item; //Compose send empty string as receiver address
            // dialogConfig.height = "500px"
  
            this.dialog.open(SendemailComponent, dialogConfig);
          } 
        }
        if (this.sendTo == '') {
          this.openDialog();
        }

      }
      else {
        this.openDialog();
      }
    },
      (error) => {
        this.openDialog();
      })


  }

  openDialog() {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.data = { sendTo: this.sendTo }; //Compose send empty string as receiver address

    this.dialog.open(SendemailComponent, dialogConfig);
  }
}

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LIST_FADE_ANIMATION } from '../../../../@fury/shared/list.animation';
import { LayoutService } from '../../layout.service';
import { MenuItemService } from 'src/app/tabs/shared/services/menu-item.service';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-toolbar-notifications',
  templateUrl: './toolbar-notifications.component.html',
  styleUrls: ['./toolbar-notifications.component.scss'],
  animations: [...LIST_FADE_ANIMATION],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarNotificationsComponent implements OnInit {

  notifications: any[] = [];
  isOpen: boolean;

  clientId: string;
  userId: string = '';
  external_role: string = '';
  ownerId: number = 0;
  role: string;

  constructor(
    private layoutService: LayoutService,
    private jwtHelperService: JwtHelperService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private snackbar: MatSnackBar,
    private cookieService: CookieService,
    private envService: EnvService
  ) {
  }

  ngOnInit() {
    // this.menuItemService.isClientChangedHandler.subscribe(changed => {
    //   this.onInitalizeData();
    // });
    this.onInitalizeData();
  }

  onInitalizeData() {
    this.clientId = this.cookieService.get('globalClientId');
    this.userId = this.cookieService.get('userId');
    let token = this.cookieService.get('access_token');
    this.ownerId = parseInt(this.cookieService.get('ownerId') ?? '0');
    this.external_role = this.cookieService.get('external_role');
    const decodedToken = this.jwtHelperService.decodeToken(token);
    if (decodedToken) {
      this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    }
    if (this.external_role !== this.envService.externalRoles.tenantExternal.toString()) {
      this.getNotifications();
    }
    this.getTicketsNotifications();
    this.getAlarmNotifications();
  }

  getNotifications() {
    // this.clientId = this.cookieService.get('globalClientId');
    // this.userId = this.cookieService.get('userId');

    if (this.ownerId == null) {
      this.ownerId = 0;
    }
    // let token = this.cookieService.get('access_token');

    // const decodedToken = this.jwtHelperService.decodeToken(token);
    // if (decodedToken)
    //   this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    // this.notifications = [
    //   {
    //     icon: 'notifications',
    //     name: 'This is a notification',
    //     time: 'few sec ago',
    //     read: false,
    //     colorClass: ''
    //   },
    //   {
    //     icon: 'shopping_basket',
    //     name: 'User bought your template',
    //     time: '23 min ago',
    //     read: false,
    //     colorClass: 'primary'
    //   },
    //   {
    //     icon: 'eject',
    //     name: 'Server Crashed',
    //     time: 'an hour ago',
    //     read: false,
    //     colorClass: 'accent'
    //   },
    //   {
    //     icon: 'cached',
    //     name: 'New user registered',
    //     time: '6 hours ago',
    //     read: true,
    //     colorClass: ''
    //   },
    //   {
    //     icon: 'code',
    //     name: 'John added you as friend',
    //     time: 'yesterday',
    //     read: true,
    //     colorClass: ''
    //   }
    // ];

    this.notifications = [];
    this.layoutService.getEmailNotifications(this.ownerId, this.role, this.userId).subscribe((data: any) => {
      if (data) {
        data.forEach(element => {
          element['notificationType'] = 'email';
        });
        this.notifications.push(...data.filter(mail => mail.isRead === false));
        this.changeDetectorRef.detectChanges();
      }
      else {
        this.notifications = [];
      }
    }),
      (error => {
        this.notificationMessage("No notifications found.", "red-snackbar");
      });
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  getTicketsNotifications() {
    this.layoutService.getTicketNotifications(this.ownerId ?? 0, this.role, this.userId).subscribe((data: any) => {
      if (data) {
        data.forEach(element => {
          element['subject'] = '';
          element['subject'] = element['title'];
          element['notificationType'] = 'ticket';
        });
        this.notifications.push(...data.filter(ticket => ticket.ticketStatusName = 'Open'));
        this.changeDetectorRef.detectChanges();
      }
    }),
      (error => {
        this.notificationMessage("No notifications found.", "red-snackbar");
      });
  }

  getAlarmNotifications() {
    if (this.role != 'External') {
      this.layoutService.getAlarms(this.clientId).subscribe((data: any) => {
        if (data) {
          data.forEach(element => {
            element['subject'] = '';
            element['subject'] = element['alarmName'];
            element['notificationType'] = 'alarm';
            element['isNotify'] = false;
          });
          //this.notifications.push(data);
          this.notifications.push(...data.filter(alarm => alarm.isNotify === false));
          this.changeDetectorRef.detectChanges();
        }
      }),
        (error => {
        })
    }
  }

  markAsRead(notification, type) {
    if (notification.isRead != undefined)
      notification.isRead = true;

    if (notification.notificationType == 'ticket') {
      let ticket = {
        id: Number(notification.id),
        notificationType: notification.notificationType,
        isRead: true
      }
      this.layoutService.updateIsReadForTickets(ticket).subscribe((data: any) => {
        this.getNotifications();
        this.getTicketsNotifications();
        this.getAlarmNotifications();
      },
      )
      if (type == 'read')
        this.router.navigate(['/tickets/view', notification.id]);
    }
    else if (notification.notificationType == 'email') {
      let mail = {
        id: Number(notification.id),
        notificationType: notification.notificationType,
        isRead: true
      }
      this.ownerId = parseInt(this.cookieService.get('ownerId') ?? '0');
      this.layoutService.updateIsReadForMail(mail).subscribe((data: any) => {
        this.getNotifications();
        this.getTicketsNotifications();
        this.getAlarmNotifications();
      },
      )
      if ((type == 'read') && (this.role != 'External'))
        this.router.navigate(['listemails/mail', notification.id])
    }
    else if (notification.notificationType == 'alarm') {
      let alarm = {
        id: Number(notification.id),
        notificationType: notification.notificationType,
        isNotify: true
      }
      this.ownerId = parseInt(this.cookieService.get('ownerId') ?? '0');
      this.layoutService.updateIsNotifyForAlarm(alarm).subscribe((data: any) => {
        this.getNotifications();
        this.getTicketsNotifications();
        this.getAlarmNotifications();
      },
      )
      if ((type == 'read') && (this.role != 'External')) {
        const currentRoute = this.router.url;
        if (currentRoute.includes('/EmsAlarm')) {
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['EmsAlarm'], { queryParams: { id: notification.id } }); // navigate to same route
          });
        }
        else {
          this.router.navigate(['EmsAlarm'], { queryParams: { id: notification.id } });
        }
        //this.router.navigate(['EmsAlarm'], { queryParams: { id: notification.id } })
      }

    }
  }

  dismiss(notification, event) {
    this.markAsRead(notification, 'close');
    event.stopPropagation();
    this.notifications.splice(this.notifications.indexOf(notification), 1);
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  onClickOutside() {
    this.isOpen = false;
  }

  markAllAsRead() {

    this.notifications.forEach(notification => {
      notification.isRead = true;
      let mail = {
        id: Number(notification.id),
        isRead: true
      }

      if (notification.notificationType == 'email') {
        this.layoutService.updateIsReadForMail(mail).subscribe((data: any) => {
          this.getNotifications();
          this.getTicketsNotifications();
          this.getAlarmNotifications();
        },
        )
      }
      else if (notification.notificationType == 'ticket') {
        this.layoutService.updateIsReadForTickets(mail).subscribe((data: any) => {
          this.getNotifications();
          this.getTicketsNotifications();
          this.getAlarmNotifications();
        },
        )
      }
      else if (notification.notificationType == 'alarm') {
        let alarm = {
          id: Number(notification.id),
          isNotify: true
        }
        this.layoutService.updateIsNotifyForAlarm(alarm).subscribe((data: any) => {
          this.getNotifications();
          this.getTicketsNotifications();
          this.getAlarmNotifications();
        },
        )
      }
    }
    );
  }
}

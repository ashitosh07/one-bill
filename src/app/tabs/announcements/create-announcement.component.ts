import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, of, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ListColumn } from '../../../@fury/shared/list/list-column.model';
import { fadeInRightAnimation } from '../../../@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from '../../../@fury/animations/fade-in-up.animation';
import { AnnouncementCreateUpdateComponent } from '../announcements/announcement-create-update/announcement-create-update.component';
import { Announcement } from './announcement-create-update/announcement.model';
import { AnnouncementService } from '../shared/services/announcement.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { HttpErrorResponse } from '@angular/common/http';
import { UserConfirmationPopupComponent } from '../shared/components/user-confirmation-popup/user-confirmation-popup.component';
import { CookieService } from 'ngx-cookie-service';
import { getClientDataFormat } from '../shared/utilities/utility';
import { ClientSelectionService } from '../shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-create-announcement',
  templateUrl: './create-announcement.component.html',
  styleUrls: ['./create-announcement.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation]
})
export class CreateAnnouncementComponent implements OnInit, AfterViewInit, OnDestroy {
  subject$: ReplaySubject<Announcement[]> = new ReplaySubject<Announcement[]>(1);
  data$: Observable<Announcement[]> = this.subject$.asObservable();
  announcements: Announcement[];
  dateFormat = '';
  clientId: number;

  @Input()
  displayedColumns: ListColumn[] = [
    { name: 'Title', property: 'title', visible: true, isModelProperty: true },
    { name: 'Content', property: 'content', visible: true, isModelProperty: true },
    //{ name: 'Clients', property: 'clients', visible: true, isModelProperty: true },
    { name: 'Actions', property: 'actions', visible: true }
  ] as ListColumn[];
  pageSize = 8;
  dataSource: MatTableDataSource<Announcement> | null;

  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }


  constructor(private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private date: DatePipe,
    private announcementService: AnnouncementService,
    private clientSelectionService: ClientSelectionService,
    private cookieService: CookieService,
    private envService: EnvService) {
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;
  }

  get visibleColumns() {
    return this.displayedColumns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit() {
    this.clientSelectionService.setIsClientVisible(false);
    this.getAnnouncements();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  createAnnouncement() {
    this.dialog.open(AnnouncementCreateUpdateComponent).afterClosed().subscribe((announcement: Announcement) => {
      /**
       * Announcement is the updated Announcement (if the user pressed Save - otherwise it's null)
       */
      if (announcement) {
        /**
         * Here we are updating our local array.
         * You would probably make an HTTP request here.
         */
        this.announcementService.createAnnouncement(announcement).subscribe({
          next: (announcementObj: Announcement) => {
            this.snackbar.open('Announcement created successfully.', null, {
              duration: 5000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
              panelClass: ['green-snackbar'],
            });
            this.getAnnouncements();
          },
          error: (err: HttpErrorResponse) => {
            this.notificationMessage('Announcement creation failed.', 'red-snackbar');
          }
        });
      }
    });
  }

  updateAnnouncement(announcement) {
    this.dialog.open(AnnouncementCreateUpdateComponent, {
      data: announcement
    }).afterClosed().subscribe((announcement: Announcement) => {
      /**
       * Announcement is the updated Announcement (if the user pressed Save/Update - otherwise it's null)
       */
      if (announcement) {
        /**
         * Here we are updating our local array.
         * You would probably make an HTTP request here.
         */
        this.announcementService.updateAnnouncementById(announcement.id, announcement).subscribe({
          next: (announcement: Announcement) => {
            this.snackbar.open('Announcement updated successfully.', null, {
              duration: 5000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
              panelClass: ['green-snackbar'],
            });
            this.getAnnouncements();
          },
          error: (err: HttpErrorResponse) => {
            this.notificationMessage('Announcement updation failed.', 'red-snackbar');
          }
        })
      }
    });
  }

  deleteAnnouncement(announcement) {
    this.dialog.open(UserConfirmationPopupComponent).afterClosed().subscribe((message: any) => {
      if (message) {
        this.announcementService.deleteAnnouncementById(announcement.id, announcement).subscribe({
          next: (data) => {
            this.snackbar.open('Announcement deleted successfully.', null, {
              duration: 5000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
              panelClass: ['green-snackbar'],
            });
            this.getAnnouncements();
          },
          error: (err: HttpErrorResponse) => {
            this.notificationMessage('Announcement deletion failed.', 'red-snackbar');
          }
        })
      }
    })
  }

  getAnnouncements() {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));

    this.announcementService.getAnnouncements(this.clientId).subscribe((announcements: Announcement[]) => {
      announcements = announcements.map(announcement => new Announcement(announcement));
      this.announcements = announcements;
      this.subject$.next(announcements);
    });
    this.dataSource = new MatTableDataSource(this.announcements);

    this.data$.pipe(
      filter(data => !!data)
    ).subscribe((announcements) => {
      this.announcements = announcements;
      announcements.forEach(x => { x.validTillLocal = this.date.transform(x.validTill.toString(), this.dateFormat.toString()); })
      this.dataSource.data = announcements;
    });
    this.ngAfterViewInit();
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
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

  ngOnDestroy() { }
}

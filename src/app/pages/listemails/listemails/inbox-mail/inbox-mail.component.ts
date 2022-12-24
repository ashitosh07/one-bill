import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { InboxMailConfirmDialogComponent } from '../inbox-mail-confirm-dialog/inbox-mail-confirm-dialog.component';
import { ListemailsService } from '../../listemails.service';
import { MailLabel } from '../shared/mail-label.interface';
import { Mail } from '../shared/mail.interface';
import { SendemailComponent } from 'src/app/pages/sendsms/sendemail/sendemail.component';

import * as FileSaver from 'file-saver';
import { CookieService } from 'ngx-cookie-service';
import { EnvService } from 'src/app/env.service';
@Component({
  selector: 'fury-inbox-mail',
  templateUrl: './inbox-mail.component.html',
  styleUrls: ['./inbox-mail.component.scss']
})
export class InboxMailComponent implements OnInit {

  private baseUrl = '';
  id: number | string;
  mail$: Mail = {
    subject: '',
    labels: [],
    attachments: [],
  };
  availableLabels: MailLabel[];
  private _mail: Mail;
  fileName = [];
  downloadFile: string = '';
  clientId: string;
  userId: string;
  ownerId: number = parseInt(this.cookieService.get('ownerId') ?? '0');
  replying: boolean;

  sendTo = '';

  mailListType: string = 'view';

  constructor(private route: ActivatedRoute,
    private inboxService: ListemailsService,
    private dialog: MatDialog,
    private router: Router,
    private snackbar: MatSnackBar,
    private listEmailsService: ListemailsService,
    private cookieService: CookieService,
    private envService: EnvService) {
    this.baseUrl = envService.backendForFiles;
  }

  ngOnInit() {

    this.clientId = this.cookieService.get('globalClientId');
    this.userId = this.cookieService.get('userId');
    this.availableLabels = this.inboxService.availableLabels;

    this.route.paramMap.subscribe(paramMap => {
      this.id = paramMap.get('id');
      this.listEmailsService.getEmailList(this.mailListType, this.clientId, this.userId, this.ownerId, 0, Number(this.id)).subscribe(x => {
        if (x.length > 0) {
          // x[0].labels = [
          //   { name: 'Business', color: '#3F51B5' },
          //   { name: 'Priority', color: '#f44336' }
          // ];
          this.mail$ = x[0];
          this.mail$.attachments.forEach(attachment => {

            if (attachment.hasOwnProperty('attachmentName')) {
              this.fileName.push(attachment['attachmentName']);

            }

          })
        }

      });


      this.enableIsread(true);
    });


  }

  enableIsread(blnIsRead) {

    let mail = {
      id: Number(this.id),
      isRead: blnIsRead
    }

    this.inboxService.updateIsReadForMail(mail).subscribe((data: any) => {
    },
    )
  }

  downloadDocument() {

    this.downloadFile = this.baseUrl + '/uploads/' + this.fileName;

    FileSaver.saveAs(this.downloadFile, this.fileName);

  }

  openCompose() {
    this.sendTo = '';

    this.sendTo = this.mail$.from.mail;
    this.openDialog();
  }

  openDialog() {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.data = { sendTo: this.sendTo }; //Compose send empty string as receiver address
    dialogConfig.height = "500px"
    this.dialog.open(SendemailComponent, dialogConfig);
  }

  toggleStarred() {
    this.inboxService.toggleStarred(this._mail);
  }

  addLabel(label: MailLabel) {
    this.inboxService.addLabel(label, this._mail);
  }

  removeLabel(label: MailLabel) {
    this.inboxService.removeLabel(label, this._mail);
  }

  removeMail() {
    this.dialog.open(InboxMailConfirmDialogComponent, {
      data: {
        content: 'Are you sure you want to delete this mail?'
      }
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.inboxService.removeMail(this._mail);
        this.router.navigate(['../../'], { relativeTo: this.route });
        this.snackbar.open(`You deleted the mail from: ${this._mail.from.name}`, 'UNDO', {
          duration: 3000
        })
          .onAction().subscribe(() => {
            const mail = this.inboxService.undoRemove();
            if (mail) {
              this.router.navigate(['/apps/inbox/mail', mail.id]);
              this.snackbar.open(`Restored your mail from: ${mail.from.name}`, null, {
                duration: 3000
              });
            } else {
              this.snackbar.open('Could not UNDO last delete action. Sorry!', null, {
                duration: 3000
              });
            }
          });
      }
    });
  }

  showReply() {
    this.replying = true;
  }

  hideReply(send?: boolean) {
    this.replying = false;

    if (send) {
      this.snackbar.open(`You replied to ${this._mail.from.name}`, 'UNDO', {
        duration: 3000
      });
    }
  }
}

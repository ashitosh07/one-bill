import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationLog } from 'src/app/tabs/notificatoin-logs/notification-log.model';
import { AlertSetting } from '../../models/alert-setting.model';
import { BillMaster } from '../../models/bill-master.model';
import { NotificationAlert } from '../../models/notification-alert.model';

@Component({
  selector: 'fury-notifications-send-dialog',
  templateUrl: './notifications-send-dialog.component.html',
  styleUrls: ['./notifications-send-dialog.component.scss']
})
export class NotificationsSendDialogComponent implements OnInit {

  form: FormGroup;
  notificationType: string = '';
  options: AlertSetting[] = [];
  billMasters: BillMaster[] = [];
  notificationLabel: string = '';
  constructor(private fb: FormBuilder,
    private dialogRef: MatDialogRef<NotificationsSendDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: NotificationAlert) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.options = this.data.alertSettings;
    this.billMasters = this.data.billMasters;
  }

  close() {
    this.notificationType = '';
    this.dialogRef.close();
  }

  send(isSkipExisting = false) {
    const response: NotificationLog = { notificationType: this.notificationType, isSkipExisting: isSkipExisting };
    this.dialogRef.close(response);
  }

  onChangeTemplate(value) {
    this.notificationType = value;
    let alreadySentNotificationLogs: NotificationLog[] = [];
    if (this.billMasters && this.billMasters.length) {
      const billMasters = this.billMasters.filter(x => x.notificationLogs && x.notificationLogs.length > 0);
      if (billMasters && billMasters.length) {
        billMasters.forEach(x => {
          const alreadySentNotificationLog = x.notificationLogs.find(y => y.notificationType === this.notificationType);
          if (alreadySentNotificationLog) {
            alreadySentNotificationLogs.push(alreadySentNotificationLog);
          }
        });
      }
    }
    this.notificationLabel = `Total requests :${this.billMasters.length} \n New requests: ${this.billMasters.length - alreadySentNotificationLogs.length} \n Already send requests : ${alreadySentNotificationLogs.length}`
  }
}

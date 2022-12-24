import { Component, ElementRef, Inject, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { scaleInAnimation } from 'src/@fury/animations/scale-in.animation';
import { ClientService } from 'src/app/tabs/shared/services/client.service';
import { FileService } from 'src/app/tabs/shared/services/file.service';
import { environment } from 'src/environments/environment';
import { SendsmsService } from '../sendsms.service';
import { EntityNotification } from "../../../tabs/shared/models/entity-notification.model";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Attachment } from "../../../tabs/shared/models/attachments.model";
import { MatOption } from '@angular/material/core';
import { NotificationTemplate } from 'src/app/tabs/shared/models/notification-template.model';
import { ResponseDetails } from 'src/app/tabs/shared/models/response-details.model';
import { TemplateContent } from 'src/app/tabs/shared/models/template-content.model';
import { TemplateService } from 'src/app/tabs/shared/services/template.service';
import { TemplatesService } from '../../templates/templates.service';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { CookieService } from 'ngx-cookie-service';
import { AlertSetting } from 'src/app/tabs/shared/models/alert-setting.model';
import { EnvService } from 'src/app/env.service';
@Component({
  selector: 'fury-sendemail',
  templateUrl: './sendemail.component.html',
  styleUrls: ['./sendemail.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation, scaleInAnimation],
  encapsulation: ViewEncapsulation.None
})
export class SendemailComponent implements OnInit {


  @ViewChild('emailAttachment') emailAttachment: ElementRef;
  @ViewChild('allSelected') private allSelected: MatOption;

  image: any;
  attachments: Attachment[];
  baseUrl = '';
  ownerId: string;
  public txtForm: FormGroup;

  selectedEntity: any[] = [];
  textData = '';
  form = new FormControl(this.textData);
  entityId: number;
  emailTo: string;
  entityName: string;
  templateType: number = 0;
  subject;
  emailData = {};
  entityTypes = [];
  entityType: string;
  clientId;
  userId;
  file;
  attachment: string = '';
  lstTemplateType: AlertSetting[] = [];
  entityNotification: EntityNotification;
  entityNotifications: EntityNotification[];
  filteredEntities: EntityNotification[];
  hide: boolean = false;
  constructor(
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private sendService: SendsmsService,
    private fileService: FileService,
    private templateService: TemplateService,
    private templateNotifcationService: TemplatesService,
    private sendsmsService: SendsmsService,
    @Inject(MAT_DIALOG_DATA) data: EntityNotification,
    private cookieService: CookieService,
    private envService: EnvService,
    private dialogRef: MatDialogRef<SendemailComponent>,
  ) {
    dialogRef.disableClose = true;
    this.baseUrl = envService.backendForFiles;
    if (data) {
      this.emailTo = data.email;
      this.entityNotifications = [];
      this.entityNotifications.push(data);
    }
  }

  ngOnInit(): void {

    this.userId = this.cookieService.get('userId');
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.ownerId = this.cookieService.get('ownerId');

    this.txtForm = this.fb.group({
      entityName: [this.entityName],
      templateType: [this.templateType, Validators.required],
      emailTo: [this.emailTo, Validators.compose([Validators.required])],
      subject: [this.subject, Validators.compose([Validators.required])],
      form: [this.form, Validators.compose([Validators.required])],
      file: [this.file],
    });

    this.getClientAlertSettings();

    if (this.ownerId !== '0') {
      this.hide = true;
    }
  }

  filterEntities(name: string) {
    if(name != null && name != undefined && name != '')
    {
      return this.entityNotifications.filter(entity =>
        entity.entityName.toLowerCase().indexOf(name.toLowerCase()) === 0);
    }
    else {
      return this.filteredEntities;
    }
  }

  uploadPhoto(fileInputEvent: any) {
    // var nativeElement: HTMLInputElement = this.emailAttachment.nativeElement;

    // this.fileService.upload(nativeElement.files[0])
    // .subscribe( image => { 
    //   this.attachment = image
    //   this.image = this.baseUrl + '/uploads/' + this.attachment;

    // });

    this.attachment = fileInputEvent.target.files[0].name;
    this.fileService.upload(fileInputEvent.target.files[0])
      .subscribe(fileName => {

        this.file = fileName
        this.image = this.baseUrl + '/uploads/' + fileName
      });
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

  sendEmail() {
    // this.emailData = {};
    // this.attachments = [];
    // this.attachments.push({
    //   id: 0,
    //   attachmentName: this.file,
    //   mailId: 0
    // });
    // this.emailData['content'] = this.textData;
    // this.emailData['clientId'] = this.clientId;
    // this.emailData['subject'] = this.subject;
    // this.emailData['attachments'] = this.attachments;
    // this.emailData['toAddress'] = this.emailTo;
    // this.emailData['notificationType'] = 'EMAIL';
    // this.emailData['createdUser'] = this.userId;
    // this.sendService.sendEmail(this.emailData, this.userId, this.clientId).subscribe((data: any) => {
    //   this.popupMsg('success', 'Email Send Successfully');
    //   this.dialog.closeAll();
    // })



    const notificationType = this.lstTemplateType.find(x => x.notificationTypeId === this.templateType);

    let entityNotifications: EntityNotification[] = [];

    if (this.selectedEntity && this.selectedEntity.length) {
      this.selectedEntity.forEach(x => {
        const entityNotification: EntityNotification = this.entityNotifications.find(entity => entity.entityName === x);
        entityNotifications.push(entityNotification);
      });
    } else {
      entityNotifications = this.entityNotifications;
    }
    this.attachments = [];
    this.attachments.push({
      id: 0,
      attachmentName: this.file + "," + this.attachment,
      mailId: 0,
      folderName: "uploads"
    });
    const templateContent: TemplateContent = {
      clientId: this.clientId,
      templateName: notificationType.notificationType,
      notificationType: notificationType.notificationType,
      notificationMode: 'Email',
      notificationEntities: entityNotifications,
      subject: this.subject,
      attachments: this.attachments,
      content: this.textData,
      isManual: true
    };

    this.templateService.emailCustomTemplate(templateContent).subscribe(
      {
        next: (response: ResponseDetails) => {
          if (response && response.status) {
            this.notificationMessage('Notifications send failed.', 'red-snackbar');
          } else if (response && response.isSuccess) {
            this.notificationMessage('Notifications send successfully.', 'green-snackbar');
          } else {
            this.notificationMessage('Notifications send failed.', 'red-snackbar');
          }
        },
        error: (err) => {
          this.notificationMessage('Notifications send failed.', 'red-snackbar');
        }
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

  onChangeEntityType(value) {
    this.entityType = value;
    this.selectedEntity = [];
    this.txtForm.controls.emailTo.setValue('');
    this.sendService.getNotificationEntities(value, this.clientId).subscribe((data: any) => {
      if (data) {

        this.entityNotifications = [];

        data.forEach(element => {
          this.entityNotifications.push(element);
          this.filteredEntities = this.entityNotifications;
        });
        this.txtForm.controls.entityName.setValue('');

        this.txtForm.controls.entityName.valueChanges.subscribe(newEntity => {
          this.filteredEntities = this.filterEntities(newEntity);
        });

      }
    })
  }

  getDataById() {
    if (this.templateType && this.templateType != 0) {
      this.templateNotifcationService.getTemplateByTemplateTypeId(this.templateType, this.clientId, 'Email').subscribe(
        {
          next: (data: NotificationTemplate) => {
            if (data) {
              this.textData = data.content;
              this.subject = data.subject;
            }
            else {
              this.textData = '';
              this.subject = '';
            }
          },
          error: (err) => {
          }
        });
    }
  }


  selectEntity() {
    let emails: string = '';
    if (this.selectedEntity) {
      this.selectedEntity.forEach(y => {
        const selectedEntity = this.entityNotifications.find(x => x.entityName == y);
        if (selectedEntity) {
          emails += selectedEntity.email + ',';
        }
      })
    }
    emails = emails.slice(0, -1);
    this.txtForm.controls.emailTo.setValue(emails);
  }


  toggleAllSelection() {
    this.selectedEntity = [];
    if (this.allSelected.selected) {
      this.txtForm.controls.entityName
        .patchValue([...this.filteredEntities.map(item => item.entityName), 0]);
    } else {
      this.txtForm.controls.entityName.patchValue([]);
    }
    this.selectedEntity = this.txtForm.controls.entityName.value;
    this.selectEntity();
  }

  tosslePerOne(all) {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }
    if (this.txtForm.controls.entityName.value.length == this.filteredEntities.length) {
      this.allSelected.select();
    }
    this.selectEntity();
  }

  // getTemplateTypes() {
  //   this.lstTemplateType = [];
  //   this.templateNotifcationService.getTemplateTypes().subscribe((data: Master[]) => {
  //     if (data) {
  //       this.lstTemplateType = data.filter(x => x.defaultValue == "1");
  //     } else {
  //       this.lstTemplateType = [];
  //     }
  //   })
  // }

  getClientAlertSettings() {
    this.lstTemplateType = [];
    //this.templateNotifcationService.getClientAlertSettings(this.clientId).subscribe({
    this.sendsmsService.getTemplateTypes(this.clientId).subscribe({    
      next: (response: AlertSetting[]) => {
        if (response) {
          const alertSettings: AlertSetting[] = response.filter(x => x.notificationCategory && x.notificationCategory.toLowerCase() === 'general');
          if (alertSettings) {
            this.lstTemplateType = alertSettings;
          }
        }
      },
      error: (err) => {
      }
    });
  }

  onTemplateTypeChange() {
    this.getDataById();
  }

  close() {
    this.dialogRef.close();
  }
}

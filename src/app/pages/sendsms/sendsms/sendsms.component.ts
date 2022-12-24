import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CookieService } from 'ngx-cookie-service';
import { EntityNotification } from 'src/app/tabs/shared/models/entity-notification.model';
import { ResponseDetails } from 'src/app/tabs/shared/models/response-details.model';
import { TemplateContent } from 'src/app/tabs/shared/models/template-content.model';
import { ClientSelectionService } from 'src/app/tabs/shared/services/client-selection.service';
import { TemplatesService } from '../../templates/templates.service';
import { SendsmsService } from '../sendsms.service';

@Component({
  selector: 'fury-sendsms',
  templateUrl: './sendsms.component.html',
  styleUrls: ['./sendsms.component.scss']
})
export class SendsmsComponent implements OnInit {


  public txtForm: FormGroup;

  textData = '';
  templateType = '';
  clientId;
  ownerId = '';
  PhoneNo;
  secondaryPh;

  lstSmsTemplates = [];
  lstTemplates = [];
  lstTemplateType = [];
  templateContent: TemplateContent = {};
  entityType: string;
  selectedEntity: any[] = [];
  entityNotifications: EntityNotification[];
  filteredEntities: EntityNotification[];

  charLeft = 160;
  userId;

  @ViewChild('allSelected') private allSelected: MatOption;

  constructor(private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private templateService: TemplatesService,
    private sendService: SendsmsService,
    private clientSelectionService: ClientSelectionService,
    private cookieService: CookieService) { }

  ngOnInit(): void {
    this.clientSelectionService.setIsClientVisible(true);
    this.userId = this.cookieService.get('userId');
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.ownerId = this.cookieService.get('ownerId') == '' ? '0' : this.cookieService.get('ownerId');

    this.getTemplates();
    this.getTemplateTypes();
    if (this.ownerId != '0') {
      this.updateOwnerPhoneNo();
    }
    this.txtForm = this.fb.group({
      PhoneNo: ['', Validators.required],
      entityTypes: ['', Validators.required],
      entityName: ['', Validators.required],
      templateType: ['', Validators.required],
      textData: ['', Validators.required]
    });

  }

  ngAfterViewChecked() {
    //your code to update the model
    this.cdr.detectChanges();
  }

  getTemplates() {
    this.templateService.getSmsTemplates(this.clientId).subscribe((data: any) => {
      if (data) {

        this.lstTemplates = [];
        this.lstSmsTemplates = [];
        this.lstSmsTemplates = data;

        data.forEach(element => {
          this.lstTemplates.push(element.templateTypeId);
        });

      } else {
        this.lstTemplates = [];
        this.lstSmsTemplates = [];
      }
    })
  }

  getTemplateTypes() {

    this.templateService.getTemplateTypes().subscribe((data: any) => {
      if (data) {

        this.lstTemplateType = [];
        this.lstTemplateType = data.filter(x => x.defaultValue == "1");

        // data.forEach(element => {

        //   if(this.lstTemplates.includes(element.id))
        //       this.lstTemplateType.push(element);
        // });          

      } else {
        this.lstTemplateType = [];
      }
    })
  }

  onChangeEntityType(value) {
    this.entityType = value;
    this.selectedEntity = [];
    this.txtForm.controls.PhoneNo.setValue('');
    this.sendService.getNotificationEntities(value, this.clientId).subscribe((data: any) => {
      if (data) {

        this.entityNotifications = [];

        data.forEach(element => {
          this.entityNotifications.push(element);
          this.filteredEntities = this.entityNotifications;
        });
        this.txtForm.controls.entityName.setValue('');
      }
    })
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

  togglePerOne(all) {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }
    if (this.txtForm.controls.entityName.value.length == this.filteredEntities.length) {
      this.allSelected.select();
    }
    this.selectEntity();
  }

  selectEntity() {
    let sms: string = '';
    if (this.selectedEntity) {
      this.selectedEntity.forEach(y => {
        const selectedEntity = this.entityNotifications.find(x => x.entityName == y);
        if (selectedEntity) {
          sms += selectedEntity.phoneNumber + ',';
        }
      })
    }
    sms = sms.slice(0, -1);
    this.txtForm.controls.PhoneNo.setValue(sms);
  }

  updateOwnerPhoneNo() {
    this.sendService.getOwnerPhoneNumber(this.ownerId).subscribe((data: any) => {
      if (data) {
        this.PhoneNo = data;
      }
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

  onTemplateTypeChange() {
    this.getContent();
  }

  getContent() {
    this.textData = '';
    this.lstSmsTemplates.forEach(element => {
      if (this.templateType == element.templateType)
        this.textData = element.content;
    });
  }

  sendSms() {
    // this.smsData['primaryPh']= this.primaryPh;
    // this.smsData['secondaryPh']= this.secondaryPh;

    let entityNotifications: EntityNotification[] = [];

    if (this.selectedEntity && this.selectedEntity.length) {
      this.selectedEntity.forEach(x => {
        const entityNotification: EntityNotification = this.entityNotifications.find(entity => entity.entityName === x);
        entityNotifications.push(entityNotification);
      });
    } else {
      entityNotifications = this.entityNotifications;
    }
    this.templateContent = {};
    this.templateContent.notificationEntities = entityNotifications;
    this.templateContent.content = this.textData;
    this.templateContent.clientId = this.clientId;
    this.templateContent.notificationMode = "SMS";
    this.templateContent.notificationType = this.templateType;
    // this.templateContent['createdUser'] = this.userId;

    this.sendService.sendSms(this.templateContent).subscribe({
      next: (data: ResponseDetails) => {
        if (data && data.status) {
          const message: string = `SMS Send Failed. ${data.status}`;
          this.popupMsg('success', message);
        }
        else if ((data) && (data.isSuccess == true)) {
          const message: string = 'SMS Send Successfully.'
            + '\n'
            + 'Total Requests : ' + data?.totalRequests
            + '\n'
            + 'Successfull Requests : ' + data?.successFullRequests
            + '\n'
            + 'Failed Requests : ' + data?.failedRequests;
          this.popupMsg('success', message);
        }
        else {
          const message: string = 'SMS Send Failed.'
            + '\n'
            + 'Total Requests : ' + (data?.totalRequests ?? '0')
            + '\n'
            + 'Successfull Requests : ' + (data?.successFullRequests ?? '0')
            + '\n'
            + 'Failed Requests : ' + (data?.failedRequests ?? '0');
          this.popupMsg('error', message);
        }
      },
      error: (err) => {
        this.popupMsg('error', 'SMS Send Failed.');
      }
    })

  }

  calcCharLength() {
    this.charLeft = 160 - this.textData.length;
    if (this.charLeft == 0) {
      return;
    }

  }


}

import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, Inject } from '@angular/core';
import { fadeInUpAnimation } from '../../../../../@fury/animations/fade-in-up.animation';
import { fadeInRightAnimation } from '../../../../../@fury/animations/fade-in-right.animation';
import { scaleInAnimation } from '../../../../../@fury/animations/scale-in.animation';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { PagesserviceService } from '../../../pagesservice.service';
import { TitleCasePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MetadataService } from '../../../../tabs/shared/services/metadata.service';
import { FileService } from '../../../../tabs/shared/services/file.service';
import { TicketlistService } from '../../ticketlist.service';
import { EntityNotification } from '../../../../tabs/shared/models/entity-notification.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../../../environments/environment';
import { TemplateContent } from 'src/app/tabs/shared/models/template-content.model';
import { TemplateService } from 'src/app/tabs/shared/services/template.service';
import { ResponseDetails } from 'src/app/tabs/shared/models/response-details.model';
import { MasterService } from 'src/app/tabs/shared/services/master.service';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { CookieService } from 'ngx-cookie-service';
import { FormValidators } from 'src/app/tabs/shared/methods/form-validators';
import { ListFilterPipe } from 'ng-multiselect-dropdown/list-filter.pipe';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';
import { Attachment } from 'src/app/tabs/shared/models/attachments.model';
import { ClientSelectionService } from 'src/app/tabs/shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  providers: [PagesserviceService, TitleCasePipe],
  animations: [fadeInUpAnimation, fadeInRightAnimation, scaleInAnimation],
  encapsulation: ViewEncapsulation.None
})
export class CreateComponent implements OnInit {

  @ViewChild('ticketPhoto') ticketPhoto: ElementRef;
  image: any;

  isUploadSuccess: boolean = true;
  errorMessage: string = '';
  entityName: string = '';
  lstEntities: ListItem[] = [];
  filteredEntities: EntityNotification[];
  lstEntityValues: EntityNotification[];
  attachments: Attachment[] = [];

  // pdfSource = "https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf";

  text: string = '';

  baseUrl = '';

  type: string = '';

  form = new FormControl(this.text);

  public txtForm: FormGroup;

  ticketTitle: string;
  sentTo: string;
  assignedTo: string = 'ADMIN';
  status: string = '';
  role: string = '';
  attachment: string = '';
  fileName: string = '';
  lstsentTo = [];
  lstStatus = [];
  userId: string;
  clientId = this.cookieService.get('globalClientId');
  entityId: number = null;
  ImageSrc: string = '';
  ImageLocation: string = '';
  validationStatus: Boolean = true;
  ownerId: number = 0;
  constructor(private fb: FormBuilder,
    private pagesService: PagesserviceService,
    private masterService: MasterService,
    private snackbar: MatSnackBar,
    private metadataService: MetadataService,
    private fileService: FileService,
    private ticketService: TicketlistService,
    private jwtHelperService: JwtHelperService,
    private templateService: TemplateService,
    private cookieService: CookieService,
    private clientSelectionService: ClientSelectionService,
    private fv: FormValidators,
    private envService: EnvService
  ) {
    this.baseUrl = envService.backendForFiles;
    this.lstEntities = [{ label: 'Owner', value: this.envService.externalRoles.ownerExternal }, { label: 'Tenant', value: this.envService.externalRoles.tenantExternal }];
  }

  ngOnInit() {

    let token = this.cookieService.get('access_token');
    this.image = 'assets/img/avatars/two.png';

    const decodedToken = this.jwtHelperService.decodeToken(token);
    if (decodedToken)
      this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    this.userId = this.cookieService.get('userId');
    this.ownerId = parseInt(this.cookieService.get('ownerId')) ?? 0;
    if (this.ownerId && this.ownerId > 0) {
      this.clientSelectionService.setIsClientVisible(false);
      this.entityChanged();
    }
    else {
      this.clientSelectionService.setIsClientVisible(true);
    }

    // if(this.role == 'External'){
    this.txtForm = this.fb.group({
      tname: [null, Validators.compose([this.fv.subjectValidator])],
      sendTo: [null, Validators.compose([Validators.required])],
      entities: [null],
      form: [null, Validators.compose([Validators.required])],
      ticketPhoto: [null]
    });
    // }
    // else{
    // this.txtForm = this.fb.group({
    //   tname: [null, Validators.compose([Validators.required ])],
    //   sendTo: [null, Validators.compose([Validators.required ])],
    //   entityName: [null,Validators.compose([Validators.required ])],
    //   form: [null, Validators.compose([Validators.required ])],
    //   entities: [null, Validators.compose([Validators.required ])],

    // });
    // }

    this.getSendTo();

    this.txtForm.controls.entities.valueChanges.subscribe(newEntity => {
      if (newEntity)
        this.filteredEntities = this.filterEntities(newEntity);
    });
  }

  getEntities(name: string) {
    this.filteredEntities = this.filterEntities(name);
  }

  filterEntities(name: string) {
    if ((this.lstEntityValues) && (this.lstEntityValues != undefined)) {
      if (name != '') {
        return this.lstEntityValues.filter(entity =>
          entity['entityName'].toLowerCase().indexOf(name.toLowerCase()) === 0);
      }
      else {
        return this.lstEntityValues;
      }
    }
  }

  entityChanged() {

    this.filteredEntities = [];
    this.lstEntityValues = [];

    this.entityId = null;

    if (this.txtForm) {
      this.txtForm.controls['entities'].setValue(null);
    }

    this.ownerId = this.ownerId ? this.ownerId : 0;
    this.entityName = this.entityName ? this.entityName : '';
    if (this.entityName != '' || this.ownerId != 0) {
      this.ticketService.getNotificationEntities(this.entityName, this.clientId, this.ownerId).subscribe((data: any) => {
        //this.ticketService.getEntities(this.entityName, this.clientId).subscribe((data: any) => {
        if (data) {
          this.filteredEntities = data;
          this.lstEntityValues = this.filteredEntities;
          if (this.ownerId > 0 && data[0] && data[0].entityName) {
            const externalRole = this.cookieService.get('external_role');
            if (externalRole) {
              const entity = this.lstEntities.find(x => x.value === parseInt(externalRole));
              if (entity) {
                this.entityId = data[0]?.id;
                this.entityName = entity.label;
              }
            }
            this.txtForm.controls['entities'].disable();
            this.txtForm.controls['entities'].setValue(data[0]?.entityName);
          }
        }
        else {
          this.filteredEntities = [];
          this.lstEntityValues = [];
        }
      },
        (error) => {
          this.filteredEntities = [];
          this.lstEntityValues = [];
        })
    }
  }

  selectEntity(event) {
    this.lstEntityValues.forEach(entity => {
      if (event.option.value == entity.entityName) {
        this.entityId = entity.id;
      }
    })

  }


  getSendTo() {

    this.lstsentTo = [];
    this.lstStatus = [];
    this.masterService.getSystemMasterdata(45, 0).subscribe((data: Master[]) => {
      this.lstStatus = data;
    });
    this.masterService.getSystemMasterdata(43, 0).subscribe((data: Master[]) => {
      this.lstsentTo = data;
    });

    // this.pagesService.getMetadata().subscribe((data: any) => {
    //   if (data) {
    //     this.lstsentTo = [];
    //     this.lstsentTo = data['sentToList'];

    //      this.lstStatus = [];
    //      this.lstStatus = data['ticketStatus'];

    //   } else {

    //   }
    // })

  }


  validateDatas() {
    this.validationStatus = true;

    if (this.ticketTitle == null || this.ticketTitle == undefined || this.ticketTitle.trim() == '') {
      this.popupMsg('error', 'Please enter ticket Title');
      this.validationStatus = false;
      return;
    }

    else if (this.sentTo == undefined || this.sentTo == '') {
      this.validationStatus = false;
      this.popupMsg('error', 'Please select Send To');

      return;
    }

    // else if (!this.image) {
    //   this.validationStatus = false;
    //   this.popupMsg('error','No image uploaded');
    //   return;

    // }
    else if (this.text == '') {

      this.validationStatus = false;
      this.popupMsg('error', 'Please enter Ticket Message.' + this.text);
      return;

    }
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


  uploadPhoto() {
    var nativeElement: HTMLInputElement = this.ticketPhoto.nativeElement;
    this.errorMessage = "";
    this.image = '';
    this.attachment = '';

    if (nativeElement.files[0] && nativeElement.files[0].type.includes('application/')) {
      this.type = 'pdf';
      this.image = 'assets/img/avatars/three.png';
    }
    else {
      this.type = 'image';
      this.image = 'assets/img/avatars/two.png';
    }

    this.fileName = nativeElement.files[0].name;
    this.fileService.upload(nativeElement.files[0])
      .subscribe({
        next: (image) => {
          this.attachment = image;
          if (this.type == 'image') {
            this.image = this.baseUrl + "/uploads/" + this.attachment;
          }
          this.isUploadSuccess = true;
        },
        error: (err) => {
          this.isUploadSuccess = false;
          this.errorMessage = err["error"].message;
          //this.notificationMessage('File upload failed. Please check the File Format and Size.', 'red-snackbar');
        }
        // .subscribe(image => {
        //   this.attachment = image
        //   this.image = this.baseUrl + '/uploads/' + this.attachment
      });
  }


  saveData() {

    let date = new Date();

    let assignedTo = this.cookieService.get('loginId');
    this.validateDatas();


    if (!this.validationStatus) {
      return;
    }
    let dctData = {};


    dctData['title'] = this.ticketTitle;
    dctData['sentTo'] = this.sentTo;
    dctData['date'] = date;
    dctData['description'] = this.text;
    dctData['attachment'] = this.attachment + ',' + this.fileName;
    dctData['assignedTo'] = this.entityId ?? 0;
    // dctData['assignedTo']=assignedTo;
    // dctData['ticketStatus']=this.status;
    dctData['ticketStatusName'] = 'Open';
    dctData['createdUser'] = this.userId;
    dctData['clientId'] = Number(this.cookieService.get('globalClientId'));
    dctData['role'] = this.role;

    dctData['entityName'] = this.entityName;
    // if (this.entityId == null)
    //   dctData['ownerId'] = Number(this.cookieService.get('ownerId'));
    // else
    dctData['ownerId'] = this.ownerId ?? 0;


    this.ticketService.createTicket(dctData).subscribe((data: any) => {
      if (data) {
        this.getTicketDetails(data);
      } else {
        this.notificationMessage('Ticket save failed.', 'red-snackbar');
      }
    })
  }


  getTicketDetails(ticketId: number) {
    this.ticketService.getTicketById(ticketId).subscribe({
      next: (data: any) => {
        this.onSendEmail(data.ticketNumber);
        this.notificationMessage('Ticket saved successfully.', 'green-snackbar');
        this.cancelData();
      },
      error: (err) => {
        this.notificationMessage('Ticket save failed.', 'red-snackbar');
      }
    });
  }


  cancelData() {
    // this.text='';
    this.txtForm.controls['entities'].setValue(null);
    // this.entityId = null;
    // this.entityName ='';
    // this.ticketTitle='';
    // this.sentTo='';
    // this.status='';
    this.attachment = '';
    this.image = '';
    this.ticketPhoto.nativeElement.value = null;
    this.filteredEntities = [];
    this.entityName = '';
    this.isUploadSuccess = true;

    this.validationStatus = true;
    this.txtForm = this.fb.group({
      tname: [null, Validators.compose([this.fv.subjectValidator])],
      sendTo: [null, Validators.compose([Validators.required])],
      entityName: [],
      form: [null, Validators.compose([Validators.required])],
      entities: [null],
      ticketPhoto: [null]

    });
    this.ownerId = parseInt(this.cookieService.get('ownerId'));
    if (this.ownerId) {
      this.entityChanged();
    }
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  onSendEmail(ticketNumber: string) {
    this.attachments = [];
    if (this.filteredEntities && this.filteredEntities.length) {
      if (this.attachment != '' && this.fileName != '') {
        let a = new Attachment({
          attachmentName: this.attachment + ',' + this.fileName,
          folderName: "uploads"          
        })
        this.attachments.push(a);
      }

      const templateContent: TemplateContent = {
        clientId: Number(this.clientId),
        templateName: 'Ticket Submitted',
        notificationType: 'Ticket Submitted',
        notificationEntities: this.filteredEntities,
        subject: this.ticketTitle,
        attachments: this.attachments,
        content: this.text,
        externalVariable: ticketNumber,
        isManual: true
      };
      this.templateService.emailCustomTemplate(templateContent).subscribe(
        {
          next: (response: ResponseDetails) => {
            if (response && response.status) {
              const message: string = `Notifications send failed. ${response.status}`;
              this.notificationMessage(message, 'red-snackbar');
            } else if (response && response.isSuccess) {
              const message: string = 'Notifications send successfully.';

              this.notificationMessage(message, 'green-snackbar');
            } else {
              const message: string = 'Notifications send failed.';
              this.notificationMessage(message, 'red-snackbar');
            }
          },
          error: (err) => {
            this.notificationMessage('Notifications send failed.', 'red-snackbar');
          }
        });
    } else {
      this.notificationMessage("No tenant details found.", 'red-snackbar');
    }
  }
}

import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, Inject } from '@angular/core';
import { fadeInUpAnimation } from '../../../../../@fury/animations/fade-in-up.animation';
import { fadeInRightAnimation } from '../../../../../@fury/animations/fade-in-right.animation';
import { scaleInAnimation } from '../../../../../@fury/animations/scale-in.animation';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { PagesserviceService } from '../../../pagesservice.service';
import { TitleCasePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig, MAT_DIALOG_DEFAULT_OPTIONS, MatDialog } from '@angular/material/dialog';
import { FileService } from 'src/app/tabs/shared/services/file.service';
import { environment } from '../../../../../environments/environment';
import { Router } from '@angular/router';
import { EntityNotification } from 'src/app/tabs/shared/models/entity-notification.model';
import { TicketlistService } from '../../ticketlist.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TemplateService } from 'src/app/tabs/shared/services/template.service';
import { TemplateContent } from 'src/app/tabs/shared/models/template-content.model';
import { ResponseDetails } from 'src/app/tabs/shared/models/response-details.model';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { MasterService } from 'src/app/tabs/shared/services/master.service';
import { CookieService } from 'ngx-cookie-service';
import { Attachment } from 'src/app/tabs/shared/models/attachments.model';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],

  providers: [PagesserviceService, TitleCasePipe],
  animations: [fadeInUpAnimation, fadeInRightAnimation, scaleInAnimation],
  encapsulation: ViewEncapsulation.None
})
export class EditorComponent implements OnInit {

  @ViewChild('ticketPhoto') ticketPhoto: ElementRef;
  image: any
  baseUrl = '';
  entityId: Number = null;
  clientId = this.cookieService.get('globalClientId');
  ownerId = this.cookieService.get('ownerId');
  text: string = '';
  type: string;
  errorMessage: string = '';

  entityName: string = '';
  lstEntities = ['Owner', 'Tenant'];
  filteredEntities: EntityNotification[];
  lstEntityValues: EntityNotification[];
  Entities: EntityNotification[];
  form = new FormControl(this.text);
  attachments: Attachment[] = [];

  public txtForm: FormGroup;

  ticketData: string;
  sentTo: string;
  assignedTo: string = 'ADMIN';
  status: string;
  // domain;
  ticketId: Number;

  attachment: string = '';
  fileName: string = '';

  role: string = '';

  lstsentTo = [
  ];

  lstStatus = [
  ]

  ImageSrc: string = '';
  ImageLocation: string = '';
  isUploadSuccess: boolean = true;
  validationStatus: boolean = true;

  userId: string;

  constructor(private fb: FormBuilder,
    private pagesService: PagesserviceService,
    private masterService: MasterService,
    private snackbar: MatSnackBar,
    private fileService: FileService,
    public router: Router,
    private ticketService: TicketlistService,
    private dialogRef: MatDialogRef<EditorComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private jwtHelperService: JwtHelperService,
    private templateService: TemplateService,
    private dialog: MatDialog,
    private cookieService: CookieService,
    private envService: EnvService

  ) {
    this.ticketData = data.ticketData;
    dialogRef.disableClose = true;
    this.baseUrl = envService.backend
  }

  ngOnInit() {
    let token = this.cookieService.get('access_token');
    this.image = 'assets/img/avatars/two.png';
    const decodedToken = this.jwtHelperService.decodeToken(token);
    if (decodedToken)
      this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    this.userId = this.cookieService.get('userId');
    this.ownerId = this.ticketData["assignedTo"];

    this.txtForm = this.fb.group({
      form: [null, Validators.compose([Validators.required])],
      ticketPhoto: [null]

    });

    this.getSendTo();

    this.getEntities();
    // this.txtForm.controls.entities.valueChanges.subscribe(newEntity => {
    //   this.filteredEntities = this.filterEntities(newEntity);
    // });
  }

  filterEntities(name: string) {
    if ((this.lstEntityValues) && (this.lstEntityValues != undefined)) {
      return this.lstEntityValues.filter(entity =>
        entity['entityName'].toLowerCase().indexOf(name.toLowerCase()) === 0);
    }
  }

  getEntities() {
    this.Entities = [];
    this.ownerId = this.ownerId ? this.ownerId : '0';
    const userId = this.ticketData ? this.ticketData['createdUser'] : null;
    this.ticketService.getNotificationEntities('', this.clientId, Number(this.ownerId), userId).subscribe((data: any) => {
      if (data) {
        this.Entities = data;
      }
      else {
        this.Entities = [];
      }
    },
      (error) => {
        this.Entities = [];
      })
  }

  entityChanged() {

    this.filteredEntities = [];
    this.lstEntityValues = [];

    this.entityId = null;
    this.txtForm.controls['entities'].setValue(null);

    this.ticketService.getNotificationEntities(this.entityName, this.clientId).subscribe((data: any) => {
      if (data) {
        this.filteredEntities = data;
        this.lstEntityValues = this.filteredEntities;

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

  selectEntity(event) {
    this.lstEntityValues.forEach(entity => {
      if (event.option.value == entity.entityName) {
        this.entityId = entity.id;
      }
    })

  }

  uploadPhoto() {
    var nativeElement: HTMLInputElement = this.ticketPhoto.nativeElement;
    this.errorMessage = '';
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
      });
    // .subscribe(image => {
    //   this.attachment = image
    //   this.image = this.baseUrl + '/uploads/' + this.attachment
    // });
    this.fileName = nativeElement.files[0].name;
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
    //     this.lstStatus = [];

    //     this.lstsentTo = data['sentToList'];
    //     this.lstStatus = data['ticketStatus'];

    //   } else {

    //   }
    // })

  }

  validateDatas() {
    this.validationStatus = true;

    // if(this.sentTo==undefined || this.sentTo==''){
    //   this.validationStatus = false ;
    //   this.popupMsg('error','Please select send to');

    //   return;
    // }

    // else if (!this.image) {
    //   this.validationStatus = false;
    //   this.popupMsg('error','No image uploaded');
    //   return;

    // }
    if (this.text == '') {

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



  updateData() {

    let assignedTo = this.cookieService.get('loginId');
    let date = new Date();

    this.validateDatas();

    if (!this.validationStatus) {
      return;
    }

    let dctData = {};
    dctData['sentTo'] = this.sentTo;
    dctData['date'] = date;
    dctData['description'] = this.text;
    dctData['attachment'] = this.attachment + ',' + this.fileName;
    dctData['assignedTo'] = this.ownerId;
    // dctData['assignedTo']=assignedTo;
    // dctData['ticketStatus']=this.status;
    // dctData['ticketStatus'] = 1;
    dctData['createdUser'] = this.userId;
    dctData['clientId'] = Number(this.cookieService.get('globalClientId'));

    dctData['role'] = this.role;

    dctData['entityName'] = this.entityName;
    if (this.entityId == null)
      dctData['ownerId'] = Number(this.cookieService.get('ownerId'));
    else
      dctData['ownerId'] = this.entityId;

    this.ticketData['ticketTransaction'].push(dctData);

    this.ticketService.updateTicketById(Number(this.ticketData['id']), this.ticketData).subscribe((data: any) => {
      if (data) {
        this.closeDialog();
        this.getTicketDetails(Number(this.ticketData['id']));
      } else {

      }
    })

  }

  closeDialog() {
    this.dialog.closeAll();
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }


  getTicketDetails(ticketId: number) {
    this.ticketService.getTicketById(ticketId).subscribe({
      next: (data: any) => {
        this.ticketData = data;
        this.onSendEmail(data.ticketNumber);
        this.notificationMessage('Ticket updated Successfully.', 'green-snackbar');
      },
      error: (err) => {
        this.notificationMessage('Ticket update failed.', 'red-snackbar');
      }
    });
  }


  onSendEmail(ticketNumber: string) {
    this.attachments = [];
    if (this.Entities && this.Entities.length) {
      if (this.attachment != '' && this.fileName != '') {
        let a = new Attachment({
          attachmentName: this.attachment + ',' + this.fileName,
          folderName: "uploads"
        })
        this.attachments.push(a);
      }
      const templateContent: TemplateContent = {
        clientId: Number(this.clientId),
        templateName: 'Ticket Update',
        notificationType: 'Ticket Update',
        notificationEntities: this.Entities,
        subject: 'Ticket Update',
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
              this.router.navigateByUrl['/tickets'];
              this.dialogRef.close();
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
  cancelData() {

    // this.text = '';

    // this.sentTo = '';

    this.attachment = '';
    this.image = '';
    this.ticketPhoto.nativeElement.value = null;
    this.isUploadSuccess = true;

    this.validationStatus = true;
    this.txtForm = this.fb.group({
      form: [null, Validators.compose([Validators.required])],
      ticketPhoto: [null]

    });
  }

  close() {
    this.dialogRef.close();
  }

}

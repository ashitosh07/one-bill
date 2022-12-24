import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, Inject } from '@angular/core';
import { fadeInUpAnimation } from '../../../../@fury/animations/fade-in-up.animation';
import { fadeInRightAnimation } from '../../../../@fury/animations/fade-in-right.animation';
import { scaleInAnimation } from '../../../../@fury/animations/scale-in.animation';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { TemplatesService } from '../templates.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as Quill from 'quill';
import { QuillModule } from 'ngx-quill';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MasterService } from 'src/app/tabs/shared/services/master.service';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { FormValidators } from 'src/app/tabs/shared/methods/form-validators';
import { MatDialog } from '@angular/material/dialog';
import { CopyNotificationTemplateComponent } from '../copy-notification-template/copy-notification-template.component';
import { ClientSelectionService } from 'src/app/tabs/shared/services/client-selection.service';
// import { ToolbarComponent } from 'src/app/layout/toolbar/toolbar.component';

@Component({
  selector: 'fury-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  // providers: [{provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: false}}, MatDialogRef,PagesserviceService,TitleCasePipe],

  providers: [TemplatesService],
  animations: [fadeInUpAnimation, fadeInRightAnimation, scaleInAnimation],
  encapsulation: ViewEncapsulation.None
})
export class EditorComponent implements OnInit {


  txtForm: FormGroup;
  templateType: number;
  notificationModeName: string = '';
  notificationMode: number;
  notificationCategory: number;
  condition: number;
  conditionName: string = '';
  keyword: String;
  textData: String = '';
  texts: string = '';
  form = new FormControl(this.textData);
  lstTemplates = [];
  lstTemplateType = [];
  lstkeyword = [];
  validationStatus = true;
  @ViewChild('textId') textId;
  @ViewChild('text') text: ElementRef;
  cursorPos;
  afterCursor: number;
  subject: String;
  editor: any;
  templateId: Number;
  dctData = {};
  clientId;
  keywordError: string = '';
  isEnableAutoSend: boolean = false;
  lstNotificationCategory: Master[];
  lstNotificationMode: Master[];
  lstConditions: Master[];
  days: string = '';

  constructor(private fb: FormBuilder,
    private templateService: TemplatesService,
    private snackbar: MatSnackBar,private fv: FormValidators,
    private _Activatedroute: ActivatedRoute,
    private cookieService: CookieService,
    private clientSelectionService: ClientSelectionService,
    private masterService: MasterService,private dialog: MatDialog) { }
   

  ngOnInit() {
    this.clientSelectionService.setIsClientVisible(true);
    this.templateId = Number(this._Activatedroute.snapshot.paramMap.get("id"));
    // this.templateId=1;
    this.clientId = parseInt(this.cookieService.get('globalClientId'));

    // this.getTemplates();
    //this.getTemplateTypes();
    // this.getDataById();
    this.masterService.getSystemMasterdata(72, 0).subscribe((data: Master[]) => {
      this.lstNotificationCategory = data;
    });

    this.templateService.getNotificationModes(this.clientId).subscribe((data:Master[]) => {
      this.lstNotificationMode = data;
    });

    // this.masterService.getSystemMasterdata(11, 0).subscribe((data: Master[]) => {
    //   this.lstNotificationMode = data;
    // });
    // this.masterService.getSystemMasterdata(69, 0).subscribe((data: Master[]) => {
    //   this.lstConditions = data;
    // });

    this.txtForm = this.fb.group({
      notificationCategory: [this.notificationCategory,Validators.required],
      templateType: [this.templateType, Validators.compose([Validators.required])],
      notificationMode: [this.notificationMode, Validators.required],
      condition: [this.condition],
      keyword: [this.keyword, null],
      subject: [this.subject],
      form: [this.form],
      texts: [this.texts,''],
      isEnableAutoSend: [false],
      days: ['']
    });
  }

  getTemplates() {
    this.templateService.getEmailTemplates(this.clientId).subscribe((response: any) => {
      if (response) {
        this.lstTemplates = response;
        // this.templateType = this.lstTemplates[0].templateTypeId;
      } 
    }
    )
  }

  getTemplateTypes() {
    this.templateService.getTemplateTypes().subscribe((data: any) => {
      if (data) {
        this.lstTemplates = [];
        this.lstTemplates = data;
        this.templateType = this.lstTemplates[0].id
      } else {
        this.lstTemplateType = [];
      }
    })
  }

  onTemplateTypeChange() {
    //this.getKeywords();
    this.isEnableAutoSend = false;
    this.getDataById();
  }

  getKeywords() {
    this.lstkeyword = [];
    if(this.notificationCategory != undefined || this.notificationCategory != null || this.notificationCategory > 0)
    {
      this.templateService.getKeywords(this.notificationCategory).subscribe((data: any) => {
        if (data) {
          this.lstkeyword = data;
        } else {
          this.lstkeyword = [];
        }
      })
    }    
  }

  // getDataById() {

  //   if (this.templateType != 0) {
  //     this.templateService.getTemplateByTemplateTypeId(this.templateType, this.clientId, 'Email').subscribe((data: any) => {

  //       if (data) {

  //         this.textData = data['content'];
  //         this.subject = data['subject'];
  //         this.clientId = data['clientId'];
  //         this.clientId = parseInt(this.cookieService.get('globalClientId'));
  //       }
  //     })
  //   }    
  // }

  getConditions() {
    this.lstConditions = [];
    this.condition = null;
    this.conditionName = '';
    if(this.notificationCategory != undefined || this.notificationCategory != null || this.notificationCategory > 0)
    {
      this.templateService.getConditions(this.notificationCategory).subscribe((data: any) => {
        if (data) {
          this.lstConditions = data;
        }
      })
    }    
  }

  getDataById() {
    this.textData = '';
    this.texts = '';
    this.subject = '';
    this.txtForm.controls['subject'].markAsUntouched();
    if ((this.templateType != null) && (this.templateType != 0) && (this.notificationModeName != '')) {
      this.templateService.getTemplateByTemplateTypeId(this.templateType, this.clientId,this.notificationModeName).subscribe((data: any) => {

        if (data) {        
          if(this.notificationModeName == 'Email') {
            this.textData = data['content'];
            this.subject = data['subject'];
          }
          else {
            this.texts = data['content'];
          }                    
          this.condition = data['conditionId'];
          this.conditionName = data['condition'];
          this.isEnableAutoSend = data['isEnableAutoSend'];
          this.days = data['days'] == 0 ? '' : data['days'];

          //this.clientId = data['clientId'];
          //this.clientId = parseInt(sessionStorage.getItem('globalClientId'));
        }
        else {
          this.textData = '';
          this.texts = '';
          this.subject = '';
        }
      })
    }
  }

  addKeyword(text) {
    if(this.notificationModeName == 'Email')
    {
      this.cursorPos = this.textId.quillEditor.getSelection();
      if (this.cursorPos && this.keyword){
        this.keywordError = '';
        this.textId.quillEditor.insertText(this.cursorPos.index, this.keyword,"user"); // insert text into the cursor position      
      }
      else if (!this.keyword)
        this.keywordError = "Please select keyword";
        //this.popupMsg('error', 'Please select keyword');
      else
        this.keywordError = "Please select cursor position";
        //this.popupMsg('error', 'Please select cursor position');
    }      
    else
    {
      // this.cursorPos = text.selectionStart;
       this.afterCursor = this.cursorPos; //text.selectionEnd;
      if (this.cursorPos >= 0 && this.keyword != '') {
        this.keywordError = '';
        if(this.texts == null)
          this.texts ='';
        this.texts = this.texts.slice(0, this.cursorPos) + this.keyword + this.texts.slice(this.afterCursor);
      }
      else if (!this.keyword)
        this.keywordError = "Please select keyword";
      else
        this.keywordError = "Please select cursor position";
    }    
  }

  getCaretPos(oField) {
    if (oField.selectionStart || oField.selectionStart == '0') {
       this.cursorPos = oField.selectionStart;
    }
  }

  validateDatas() {
    this.validationStatus = true;

    if (this.templateType == undefined || this.templateType == null) {
      this.validationStatus = false;
      // this.txtForm.controls.templateType.setErrors({required: true});
      // this.txtForm.controls.templateType.markAsTouched();
      this.popupMsg('error', 'Please select Template Type');
      return;
    }
    else if (this.subject == undefined || this.subject == '') {
      this.validationStatus = false;
      // this.txtForm.controls.subject.setErrors({required: true});
      // this.txtForm.controls.subject.markAsTouched();
      this.popupMsg('error', 'Please enter Subject');
      return;
    }
    else if (this.textData == undefined || this.textData == '') {
      this.validationStatus = false;
      // this.txtForm.controls.form.setErrors({required: true});
      // this.txtForm.controls.form.markAsTouched();
      this.popupMsg('error', 'Please enter text');
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

  cancelData() {
    this.notificationCategory = null;
    this.templateType = null;    
    this.notificationMode = null;
    this.notificationModeName = '';
    this.isEnableAutoSend = false;
    this.condition = null;
    this.keyword = '';
    this.subject = '';
    this.textData = '';
    this.texts = '';
    this.days = '';

    this.txtForm = this.fb.group({
      notificationCategory: [this.notificationCategory,Validators.required],
      templateType: [this.templateType, Validators.compose([Validators.required])],
      notificationMode: [this.notificationMode, Validators.required],
      keyword: [this.keyword, null],
      subject: [this.subject],
      form: [this.form],
      texts: [this.texts,''],
      isEnableAutoSend: [false],
      days: [this.days]
    });
    this.setValidators();
  }

  updateData() {
    this.validateCondition();
    if(this.txtForm.invalid)
    {
      this.txtForm.setErrors({required: true});
      this.txtForm.markAllAsTouched();
      return;
    }
    // this.validateDatas();

    // if (!this.validationStatus) {
    //   return;
    // }
    let dctData = {};
    dctData['notificationCategoryId'] = this.notificationCategory;
    dctData['templateTypeId'] = this.templateType;
    dctData['templateType'] = '';
    dctData['notificationTypeId'] = this.notificationMode;
    dctData['notificationType'] = this.notificationModeName;
    dctData['isEnableAutoSend'] = this.isEnableAutoSend;
    dctData['conditionId'] = this.condition == null ? 0 : this.condition; 
    dctData['days'] = this.days == '' ? 0 : parseInt(this.days); 
    if(this.notificationModeName == 'Email') {
      dctData['subject'] = this.subject;
      dctData['content'] = this.textData;
    }
    else {
      dctData['content'] = this.texts;    
    }
    dctData['clientId'] = this.clientId;
    
    //console.log(JSON.stringify(dctData))

    this.templateService.CheckForTemplateType(this.templateType,this.notificationModeName,this.clientId).subscribe((data: number) => {

      if (data == 0) {
        this.templateService.insertTemplate(dctData).subscribe((data: any) => {
          this.popupMsg('success', 'Notification saved Successfully');
        });
      }
      else {
        this.templateService.updateTemplateById(this.templateType, dctData).subscribe((data: any) => {
          this.popupMsg('success', 'Notification updated Successfully');
        })
      }
    })
  }

  onNotificationCategoryChange()
  {
    this.templateType = null;
    this.lstTemplates = [];
    this.lstkeyword = [];    
    //this.notificationCategory = this.notificationCategory == undefined ? 0 : this.notificationCategory;
    if(this.notificationCategory)
    {
      this.templateService.getNotificationTemplates(this.notificationCategory).subscribe((data: Master[]) => {
        this.lstTemplates = data      
      });
    }
    this.getConditions();    
    this.getKeywords();
    this.getDataById();
    this.validateCondition();
  }

  enableAutoSendChanged(event)
  {
    if(event)
    {
      this.isEnableAutoSend = event.checked;
      this.condition = null;
    }
    this.validateCondition();  
  }

  validateCondition()
  {
    if(this.isEnableAutoSend)
    {
      this.txtForm.controls["condition"].setValidators([Validators.required]);
      this.txtForm.controls["days"].setValidators([Validators.required]);
    }
    else
    {
      this.txtForm.controls["condition"].clearValidators();
      this.txtForm.controls["condition"].markAsUntouched();      
      this.txtForm.controls["days"].clearValidators();
      this.txtForm.controls["days"].markAsUntouched();      
    }
    this.txtForm.controls["condition"].updateValueAndValidity();
    this.txtForm.controls["days"].updateValueAndValidity();
  }

  onKeywordChange()
  {
    this.keywordError = '';
  }

  onNotificationModeChange() {
    this.notificationModeName = '';
    if(this.lstNotificationMode)
    {
      this.lstNotificationMode.forEach((item) => {
        if(item.id == this.notificationMode) {
          this.notificationModeName = item.description;
        }
      })            
      this.setValidators();
      this.getDataById();
    }
  }

  setValidators()
  {
    if(this.notificationModeName == 'Email')
    {
      //this.txtForm.controls["subject"].setValidators([this.fv.subjectValidator]);
      this.txtForm.controls["form"].setValidators([Validators.required]);
      this.txtForm.controls["texts"].clearValidators();
      this.txtForm.controls["texts"].markAsUntouched();
    }
    else
    {
      this.txtForm.controls["subject"].clearValidators();
      this.txtForm.controls["subject"].markAsUntouched();
      this.txtForm.controls["form"].clearValidators();
      this.txtForm.controls["form"].markAsUntouched(); 
      this.txtForm.controls["texts"].setValidators([Validators.required]);
    }
    this.txtForm.controls["subject"].updateValueAndValidity();
    this.txtForm.controls["form"].updateValueAndValidity();
    this.txtForm.controls["texts"].updateValueAndValidity();
  }

  copyNotificationTemplates()
  {
    this.dialog.open(CopyNotificationTemplateComponent).afterClosed().subscribe();
  }

  onConditionChange()
  {
    if(this.lstConditions)
    {
      this.lstConditions.forEach((condition) => {
        if(this.conditionName == condition.description)
        {
          this.condition = condition.id;
        }
      });
    }
  }

}

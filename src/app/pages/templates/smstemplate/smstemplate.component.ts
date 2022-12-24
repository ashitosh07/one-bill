import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { TemplatesService } from '../templates.service';

@Component({
  selector: 'fury-smstemplate',
  templateUrl: './smstemplate.component.html',
  styleUrls: ['./smstemplate.component.scss']
})
export class SmstemplateComponent implements OnInit {

  public txtForm: FormGroup;
  templateType: number = 0;
  keyword: string;
  textData: string = '';

  lstTemplates = [];

  lstTemplateType = [];
  lstkeyword = [];

  validationStatus = true;
  @ViewChild('textId') textId: ElementRef;

  cursorPos;
  afterCursor: number;

  dctData = {};
  templateId: number;
  clientId: number;

  constructor(private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private templateService: TemplatesService,
    private cookieService: CookieService
  ) { }

  ngOnInit(): void {

    this.clientId = parseInt(this.cookieService.get('globalClientId'));

    this.txtForm = this.fb.group({
      templateType: [0, Validators.compose([Validators.required])],
      textData: [null, Validators.compose([Validators.required])],
      keyword: [null, null],
    });
    

    // this.getTemplates();
    this.getTemplateTypes();


  }

  ngAfterViewInit() {

  }


  onTemplateTypeChange() {
    this.getKeywords();
    if(this.templateType!=0)
    this.getDataById();
  }

  getTemplates() {
    this.templateService.getSmsTemplates(this.clientId).subscribe((response: any) => {
      if (response) {
        this.lstTemplates = response;
        this.templateType = this.lstTemplates[0].templateTypeId;
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

  getKeywords() {

    this.templateService.getKeywords().subscribe((data: any) => {
      if (data) {

        this.lstkeyword = data;

      } else {
        this.lstkeyword = [];
      }
    })

  }

  getDataById() {
    
    this.templateService.getTemplateByTemplateTypeId(this.templateType, this.clientId,'SMS').subscribe((data: any) => {
      if (data) {
        this.textData = data['content'];
      } else {
          this.textData = '';
      }
    })
  }

  validateDatas() {
    this.validationStatus = true;

    if (this.templateType == undefined || this.templateType == null) {
      this.validationStatus = false;
      this.popupMsg('error', 'Please Template Type');

      return;
    }
    else if (this.textData == undefined || this.textData == '') {
      this.validationStatus = false;
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


  addKeyword(textId) {

    if (!this.keyword) {
      this.popupMsg('error', 'Please select keyword');
      return;
    }
    this.cursorPos = textId.selectionStart;
    this.afterCursor = textId.selectionEnd;
    this.textData = this.textData.slice(0, this.cursorPos) + this.keyword + this.textData.slice(this.afterCursor);

  }

  cancelData() {
    this.templateType = null;
    this.keyword = '';
    this.textData = '';

    this.txtForm = this.fb.group({
      templateType: [null, Validators.compose([Validators.required])],
      textData: [null, Validators.compose([Validators.required])],
      keyword: [null, null],
    });
  }

  updateData() {

    this.validateDatas();

    if (!this.validationStatus) {
      return;
    }
    let dctData = {};

    dctData['templateTypeId'] = this.templateType;
    dctData['content'] = this.textData;
    dctData['clientId'] = this.clientId;

    dctData['notificationType'] = 'SMS';

    this.templateService.CheckForTemplateType(this.templateType,'SMS',this.clientId).subscribe((data: number) => {

      if (data == 0) {
        this.templateService.insertTemplate(dctData).subscribe((data: any) => {
          this.popupMsg('success', 'Data inserted Successfully');

        });
      }
      else {
        this.templateService.updateTemplateById(this.templateType, dctData).subscribe((data: any) => {
          this.popupMsg('success', 'Data updated Successfully');

        })
      }
    })

  }

}

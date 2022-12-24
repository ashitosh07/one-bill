import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BulkImportService } from './bulk-import.service';
import * as XLSX from 'xlsx';
import {
  AccountHeadResponse, BulkImportResponse, ImportEntityTypes, EntityTemplateNames,
  OwnerDetail, TenantAndContractDetail, UnitDetail, UnitChargeDetail, AdvancePaymentDetail,
  PaymentDueDetail, MeterReading, VariablePayDetails, PaymentDetails
} from './bulk-import-response.model'
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountHead } from '../shared/models/account-head.model';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { environment } from './../../../environments/environment';
import { VariablePayService } from '../shared/services/variablepay.service';
import { MetadataAccountHead } from '../shared/models/metadata.account-head.model';
import { CookieService } from 'ngx-cookie-service';
import { ClientSelectionService } from '../shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';

//Need refactoring and optimization as per TS lang specs

type AOA = any[][];

@Component({
  selector: 'fury-bulk-import',
  templateUrl: './bulk-import.component.html',
  styleUrls: ['./bulk-import.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation]
})
export class BulkImportComponent implements OnInit {


  @ViewChild('UploadFileInput', { static: false }) uploadFileInput: ElementRef;
  fileUploadForm: FormGroup;
  fileInputLabel: string;

  private _gap = 16;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`;


  entityTypeId: any;
  clientId: any;
  entityDataType: any;
  data: any;
  tableData: any;
  fileLink: any;
  fileName: any;
  MeterReadingsFileName: any;
  AdvancePaymentReadingsFileName: any;
  PaymentDuesFileName: any;
  UnitDetailsFileName: any;
  UnitChargeDetailsFileName: any;
  MeterReadingsFileLink: string;
  AdvancePaymentReadingsFileLink: string;
  PaymentDuesFileLink: string;
  UnitDetailsFileLink: string;
  UnitChargeDetailsFileLink: string;
  baseUrl = '';
  alertMessage: string;
  allowedFileExtension = '.xlsx'


  accountHeadId: Number;
  accountHead: string;
  accountHeadsForImports: AccountHeadResponse[];
  bulkImportResult: BulkImportResponse;
  displayAccountHeads: boolean = false;
  displaySuccessMessage: string = '';
  displayFailedMessage: string = '';
  displaySpinner: boolean = false;
  entityDataTypes: ImportEntityTypes[];
  gotResponse: boolean = false;
  userId: string;
  isDisabled: boolean = true;
  importFileHeaderRow: any



  queryParams = {
    entityTypeId: 0,
    clientId: 0
  }

  constructor(private bulkImportService: BulkImportService,
    private formBuilder: FormBuilder,
    private snackbar: MatSnackBar,
    private variablePayService: VariablePayService,
    private clientSelectionService: ClientSelectionService,
    private cookieService: CookieService,
    private envService: EnvService) { 
      this.  baseUrl = envService.backendForFiles;
    }

  ngOnInit(): void {
    this.clientSelectionService.setIsClientVisible(true);
    // this.bulkImportResult.insertFailedCount = 0;
    this.queryParams.clientId = Number(this.cookieService.get('globalClientId'));
    this.userId = this.cookieService.get('userId');
    this.fileUploadForm = this.formBuilder.group({
      myfile: ['']
    });
    this.getEntityTypes(this.queryParams.clientId);
    this.getMeterReadingsFileName(this.queryParams.clientId);
    this.getUnitDetailsFileName(this.queryParams.clientId);
    this.getAdvancePaymentReadingsFileName(this.queryParams.clientId);
    this.getPaymentDuesFileName(this.queryParams.clientId);
    this.getUnitChargeDetailsFileName(this.queryParams.clientId);

  }

  getEntityTypes(clientId) {
    this.bulkImportService.getEntityTypes().subscribe((response: ImportEntityTypes[]) => {
      if (response) {
        this.entityDataTypes = response
      }
    });
  }

  getAccountHeadsForUnitCharge(clientId) {
    this.accountHeadsForImports = [];
    this.bulkImportService.getAccountHeadsForUnitCharge(clientId).subscribe((data: AccountHeadResponse[]) => {
      if (data) {
        this.accountHeadsForImports = data;
      }
    });
  }

  getAccountHeadsForVariablePay(clientId) {
    this.accountHeadsForImports = [];
    this.variablePayService.getAccountHeads(clientId).subscribe((data: MetadataAccountHead[]) => {
      if (data) {
        data.forEach(x => {
          this.accountHeadsForImports.push({ id: x.id, accountHeadName: x.description })
        });
      }
    });
  }

  onFileSelect(evt) {
    this.data = undefined;

    this.displaySuccessMessage = undefined;
    this.displayFailedMessage = undefined;


    let importedFileExtension = '.' + evt.target.files[0].name.split('.').pop()
    if (!(this.allowedFileExtension == importedFileExtension)) {
      this.alertMessage = "The uploaded file has incorrect extension. Upload accepts only files with .xlsx extension!"
      alert(this.alertMessage);
      this.uploadFileInput.nativeElement.value = "";
      return false;
    }

    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      let wb: XLSX.WorkBook = null;
      wb = XLSX.read(bstr, { type: 'binary', cellDates: true, dateNF: 'mm/dd/yyyy;@' });
      if ( evt.target.files[0].name.split('.')[0] == "MeterReadings" ) {
         wb = XLSX.read(bstr, { type: 'binary', cellDates: true,dateNF: 'mm/dd/yyyy hh:mm;@' });
      }

      /* grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* save data */
      this.data = <AOA>(XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, raw: false, dateNF: 'yyyy-mm-dd' }));
      if ( evt.target.files[0].name.split('.')[0] == "MeterReadings" ) {
        this.data = <AOA>(XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, raw: false, dateNF: 'yyyy-mm-dd hh:mm' }));
     }
   
      const [keys, ...values] = this.data;
      const objects = values.map(array => array.reduce((a, v, i) => ({ ...a, [keys[i]]: v }), {}));
      this.tableData = objects;
      

    };


    reader.readAsBinaryString(target.files[0]);
    const file = evt.target.files[0];
    this.fileUploadForm.get('myfile').setValue(file);

  }

  onFormSubmit() {
    let file = this.fileUploadForm.get('myfile').value
    if(!this.entityDataType) {
      this.alertMessage = "Please select the entity type!"
      alert(this.alertMessage);
      return false;
    }
    if (!file) {
      this.alertMessage = "Please choose file before you click upload!"
      alert(this.alertMessage);
      return false;
    }


    let isValid = this.validateFileHeaders(this.data, file, this.entityDataType)
    if (!isValid) {
      alert(this.alertMessage);
      return false;
    }
    if (this.displayAccountHeads) {
      if (!this.accountHead) {
        alert('Please select the bill head for uploading unit charges!');
        return false;
      }
    }

    this.displaySpinner = true;


    let formData = new FormData();
    formData.append('file', this.fileUploadForm.get('myfile').value);

    formData.append('clientId', this.queryParams.clientId.toString());
    formData.append('entityTypeId', this.entityDataType);
    formData.append('userId', this.userId);
    if (this.accountHead) {
      formData.append('accountHeadId', this.accountHead.toString());
    }
    else {
      formData.append('accountHeadId', "0");
    }

    this.bulkImportService.uploadImportFile(formData).subscribe((response: BulkImportResponse) => {
      if (response) {
        // Reset the file input
        this.uploadFileInput.nativeElement.value = "";
        this.fileInputLabel = undefined;
        this.bulkImportResult = response;
        this.gotResponse = true;
        this.displaySpinner = false;
        this.hideloader();
        this.fileUploadForm.reset();
        if (this.bulkImportResult.insertFailedCount > 0) {
          this.displayFailedMessage = "No: of records failed to insert: " + this.bulkImportResult.insertFailedCount
        }
        this.displaySuccessMessage = "No: of records inserted successfully: " + this.bulkImportResult.insertSuccessCount;

      }
    }, error => {
      this.displaySpinner = false;
    });

  }

  downloadFile() {
    let link = document.createElement("a");
    link.download = this.fileName;
    link.href = this.fileLink;
    link.click();
  }

  setFileTemplate(evt) {

    this.uploadFileInput.nativeElement.value = "";
    this.fileInputLabel = undefined;
    this.data = undefined;
    this.accountHeadsForImports = undefined;
    this.displayAccountHeads = false;
    this.displaySuccessMessage = undefined;
    this.displayFailedMessage = undefined;
    this.isDisabled = false;

    switch (evt.value) {
      case 1:
        this.fileLink = "assets/importTemplates/OwnerDetails.xlsx"
        this.fileName = "OwnerDetails.xlsx"

        break;
      case 2:
        this.fileLink = "assets/importTemplates/TenantAndContractDetails.xlsx"
        this.fileName = "TenantAndContractDetails.xlsx"

        break;
      case 3:
        // this.fileLink = "assets/importTemplates/UnitDetails.xlsx"
        // this.fileName = "UnitDetails.xlsx"
        this.fileLink = this.UnitDetailsFileLink
        this.fileName = this.UnitDetailsFileName
        break;
      case 4:
        this.displayAccountHeads = true;
        this.getAccountHeadsForUnitCharge(this.queryParams.clientId);
        // this.fileLink = "assets/importTemplates/UnitChargeDetails.xlsx"
        // this.fileName = "UnitChargeDetails.xlsx"
        this.fileLink = this.UnitChargeDetailsFileLink
        this.fileName = this.UnitChargeDetailsFileName
        break;
      case 5:
        this.fileLink = this.AdvancePaymentReadingsFileLink
        this.fileName = this.AdvancePaymentReadingsFileName
        break;
      case 6:
        this.fileLink = this.PaymentDuesFileLink
        this.fileName = this.PaymentDuesFileName
        break;
      case 7:
        this.fileLink = this.MeterReadingsFileLink
        this.fileName = this.MeterReadingsFileName
        break;
      case 8:
        this.displayAccountHeads = true;
        this.getAccountHeadsForVariablePay(this.queryParams.clientId);
        this.fileLink = "assets/importTemplates/VariablePayDetails.xlsx"
        this.fileName = "VariablePayDetails.xlsx"
        break;
      case 9:
        this.displayAccountHeads = false;
        this.fileLink = "assets/importTemplates/PaymentDetails.xlsx"
        this.fileName = "PaymentDetails.xlsx"
        break;
      default:
        break;
    }
  }

  getMeterReadingsFileName(clientId) {
    this.bulkImportService.getMeterReadingsFileName(clientId).subscribe(response => {
      this.MeterReadingsFileName = response
      this.MeterReadingsFileLink = this.baseUrl + "/uploads/bulkImports/" + this.MeterReadingsFileName.fileName
    });
  }

  getAdvancePaymentReadingsFileName(clientId) {
    this.bulkImportService.getAdvancePaymentReadingsFileName(clientId).subscribe(response => {
      this.AdvancePaymentReadingsFileName = response
      this.AdvancePaymentReadingsFileLink = this.baseUrl + "/uploads/bulkImports/" + this.AdvancePaymentReadingsFileName.fileName
    });
  }

  getPaymentDuesFileName(clientId) {
    this.bulkImportService.getPaymentDuesFileName(clientId).subscribe(response => {
      this.PaymentDuesFileName = response
      this.PaymentDuesFileLink = this.baseUrl + "/uploads/bulkImports/" + this.PaymentDuesFileName.fileName
    });
  }

  getUnitDetailsFileName(clientId) {
    this.bulkImportService.getUnitDetailsFileName(clientId).subscribe(response => {
      this.UnitDetailsFileName = response
      this.UnitDetailsFileLink = this.baseUrl + "/uploads/bulkImports/" + this.UnitDetailsFileName.fileName
    });
  }

  getUnitChargeDetailsFileName(clientId) {
    this.bulkImportService.getUnitChargeDetailsFileName(clientId).subscribe(response => {
      this.UnitChargeDetailsFileName = response
      this.UnitChargeDetailsFileLink = this.baseUrl + "/uploads/bulkImports/" + this.UnitChargeDetailsFileName.fileName
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

  resizeTable() {
    if (this.data.length < 3) {
      let elements = document.getElementsByClassName('table-wrapper') as HTMLCollectionOf<HTMLElement>;    
      elements[0].style.height = "100px"
    }

  }


  hideloader() {

    // Setting display of spinner 
    // element to none 
    document.getElementById('loading')
      .style.display = 'none';
  }

  validateFileHeaders(inputHeaderData, file, entityDataType) {
    let flag = true;
    let fileName = file.name
    let fromEnumValue = EntityTemplateNames[entityDataType]
    let finalFileName = fileName.substr(0, fileName.lastIndexOf('.'))

    //first check file name is correct or not
    if (!(fromEnumValue == finalFileName)) {
      this.alertMessage = `Invalid template name found for the selected import option. The correct format should be "${fromEnumValue + this.allowedFileExtension}".Please click TEMPLATE button to get the required template for the specific import option.`;
      flag = false
      return flag
    }

    //check headers of imported file gets matched with the actual template
    this.importFileHeaderRow = inputHeaderData[0];
    let pass: any = this.getEnumType(entityDataType)

    this.importFileHeaderRow.every(element => {
      if (!Object.values(pass).includes(element.trim())) {
        this.alertMessage = `Unexpected column "${element}" found in the uploaded template.Please click TEMPLATE button to get the required template for the specific import option.`
        flag = false
        return flag

      }
      return flag
    });

    return flag
  }

  getEnumType(id) {
    switch (id) {
      case 1:
        return OwnerDetail
      case 2:
        return TenantAndContractDetail
      case 3:
        return UnitDetail
      case 4:
        return UnitChargeDetail
      case 5:
        return AdvancePaymentDetail
      case 6:
        return PaymentDueDetail
      case 7:
        return MeterReading
      case 8:
        return VariablePayDetails
      case 9:
        return PaymentDetails
    }

  }
}

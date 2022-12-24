import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTableDataSource } from "@angular/material/table";
import { Observable, ReplaySubject } from "rxjs";
import { filter } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";
import "rxjs/add/operator/filter";
import { ListColumn } from "src/@fury/shared/list/list-column.model";
import { FormValidators } from "src/app/tabs/shared/methods/form-validators";
import { Documents } from "src/app/tabs/shared/models/documents.model";
import { MetadataDocumentType } from "src/app/tabs/shared/models/metadata.document-type.model";
import { MetadataUnit } from "../../../tabs/shared/models/metadata.unit.model";
import { Client } from "../../../tabs/shared/models/client.model ";
import { Metadata } from "src/app/tabs/shared/models/metadata.model";
import { Tenant } from "src/app/tabs/shared/models/tenant.model";
import { FileService } from "src/app/tabs/shared/services/file.service";
import { OwnerService } from "../../../tabs/shared/services/owner.service";
import { fadeInUpAnimation } from "../../../../@fury/animations/fade-in-up.animation";
import { RegisterService } from "../../../tabs/shared/services/register.service";
import { Owner } from "src/app/tabs/owner-tenant/create-owner/owner-create-update/owner.model";
import { HttpErrorResponse } from "@angular/common/http";
import { EnvService } from 'src/app/env.service';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';

@Component({
  selector: "fury-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
  animations: [fadeInUpAnimation],
})

export class RegisterComponent implements OnInit {

  @Input() role = "Tenant";

  @ViewChild("fileInput") fileInput: ElementRef;
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  fileSize = 0;
  baseUrl = '';
  form: FormGroup;
  visible = false;
  isOwner: boolean = false;
  isTermsAccepted: boolean = false;

  isDocumentsValid: boolean = true;
  isCommercialOwner: boolean = false;
  isDuplicate: boolean = false;
  validationMessage: string = 'Please upload ';

  owner = new Owner({});
  defaults = new Tenant({});

  errorMessage: string = '';
  isDocumentUploadSuccess: boolean = true;

  documentsRequired: any = [];
  documentsValidated: any = [];
  documents: any = [];
  addresses: any = [];
  ownership: any = [];
  selectedUnits = [];

  response: any;

  logoFileName: any;
  fileName: any;
  clientId: number = 0;
  selectedDocument: File;
  metadata: Metadata;
  metadataDocumentTypes: MetadataDocumentType[];
  metadataUnits: MetadataUnit[];
  clients: Client[];
  filteredDocumentTypes: MetadataDocumentType[];
  data: MetadataDocumentType[];
  filteredClients: Client[];
  clientValidationMsg: string;
  duplicateTRN: string = '';
  tenantItem: ListItem = { label: 'Tenant', value: 1 };
  ownerItem: ListItem = { label: 'Owner', value: 2 };
  residentialItem: ListItem = { label: 'Residential', value: 3 };
  commercialItem: ListItem = { label: 'Commercial', value: 4 };
  tenantOwnerOptions: ListItem[] = [this.tenantItem, this.ownerItem];
  residentialCommercialOptions: ListItem[] = [this.residentialItem, this.commercialItem];
  selectedTenantOwnerOption: ListItem = this.tenantItem;
  selectedResidentialCommercialOption: ListItem = this.residentialItem;
  subject$: ReplaySubject<Documents[]> = new ReplaySubject<Documents[]>(1);
  data$: Observable<Documents[]> = this.subject$.asObservable();

  @Input()
  displayedColumns: ListColumn[] = [
    {
      name: "DOCUMENT TYPE",
      property: "document",
      visible: true,
      isModelProperty: true,
    },
    {
      name: "PATH",
      property: "documentType",
      visible: true,
      isModelProperty: true,
    },
    { name: "Modify", property: "actions", visible: true },
  ] as ListColumn[];

  dataSource: MatTableDataSource<Documents> | null;

  constructor(
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private fv: FormValidators,
    private fileService: FileService,
    private ownerService: OwnerService,
    private registerService: RegisterService,
    private route: ActivatedRoute,
    envService: EnvService
  ) {

    this.fileSize = Math.floor(envService.MaxBytes / 1000000);
    this.baseUrl = envService.fakeUrl;
  }

  get visibleColumns() {
    return this.displayedColumns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit() {
    this.route.queryParams
      .filter((params) => params.clientId)
      .subscribe((params) => {
        this.clientId = params.clientId;
      });

    this.registerService.getCompanyLogo().subscribe(data => {
      if (data) {
        this.response = data;
        this.logoFileName = 'assets/img/' + this.response.logoName
      }
    });

    //setTimeout(() => this.formGroupDirective.resetForm(), 0);
    this.registerService
      .getDocuments()
      .subscribe((documents: MetadataDocumentType[]) => {
        this.metadataDocumentTypes = documents;
        //this.filteredDocumentTypes = documents;
      });

    this.registerService.getClients().subscribe((clients: Client[]) => {
      this.clients = this.filteredClients = clients;
      this.selectedClient();
    });

    this.initialise();
    this.registerService
      .getDocuments()
      .subscribe((documents: MetadataDocumentType[]) => {
        this.metadataDocumentTypes = documents;
        this.filterDocuments();
      });
    this.validateDocumentType();
    this.form.controls.documentType.valueChanges.subscribe(newDocumentType => {
      this.filteredDocumentTypes = this.filterDocumentTypes(newDocumentType);
    });
  }

  filterDocument(name: string) {
    if (name && name != '') {
      this.filteredDocumentTypes = this.data.filter(document =>
        document.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
    }
    else {
      this.filterDocuments();
    }
    return this.filteredDocumentTypes;
  }

  initialise() {
    if (this.selectedTenantOwnerOption == this.tenantItem) {
      this.form = this.fb.group({
        companyName: "",
        firstName: ["", this.fv.nameValidators],
        lastName: ["", this.fv.nameValidators],
        email: ["", this.fv.emailValidators],
        phoneNo: ["", this.fv.mobileNumberValidators],
        address: [""],
        documentType: "",
        documentTypeId: 0,
        trn: "",
        units: "",
        client: ["", Validators.required],
        clientId: ["", Validators.required],
        isOwner: "",
        termsAccepted: ["", Validators.required],
        tenantOwnerOption: [null, Validators.required],
        residentialCommercialOption: [null, Validators.required],
        btnSubmit: "",
      });
      //this.documentsRequired.push("Passport Copy");
      //this.documentsRequired.push("Ejari Copy");
      this.documentsRequired.push("Title Deed / Lease Agreement");
    } else if (this.selectedTenantOwnerOption == this.ownerItem) {
      this.form = this.fb.group({
        companyName: "",
        firstName: ["", this.fv.nameValidators],
        lastName: ["", this.fv.nameValidators],
        email: ["", this.fv.emailValidators],
        phoneNo: ["", this.fv.mobileNumberValidators],
        address: [""],
        documentType: "",
        documentTypeId: 0,
        trn: "",
        units: [""],
        client: ["", Validators.required],
        clientId: ["", Validators.required],
        isOwner: "",
        tenantOwnerOption: [null, Validators.required],
        residentialCommercialOption: [null, Validators.required],
        termsAccepted: ["", Validators.required],
        btnSubmit: "",
      });
      //this.documentsRequired.push("Passport Copy");
      this.documentsRequired.push("Title Deed / Lease Agreement");
    } else if (this.selectedResidentialCommercialOption == this.commercialItem) {
      this.form = this.fb.group({
        companyName: ["", Validators.required],
        firstName: ["", this.fv.nameValidators],
        lastName: ["", this.fv.nameValidators],
        email: ["", this.fv.emailValidators],
        phoneNo: ["", this.fv.mobileNumberValidators],
        address: [""],
        documentType: "",
        documentTypeId: 0,
        trn: "",
        units: "",
        client: ["", Validators.required],
        clientId: ["", Validators.required],
        isOwner: "",
        tenantOwnerOption: [null, Validators.required],
        residentialCommercialOption: [null, Validators.required],
        termsAccepted: ["", Validators.required],
        btnSubmit: "",
      });
      if (this.selectedResidentialCommercialOption == this.commercialItem && this.selectedTenantOwnerOption == this.ownerItem) {
        //this.documentsRequired.push("Passport Copy");
        //this.documentsRequired.push("Trade License Copy");
        this.documentsRequired.push("Title Deed / Lease Agreement");
        this.form.controls["units"].setValidators([Validators.required]);
      } else {
        //this.documentsRequired.push("Passport Copy");
        //this.documentsRequired.push("Trade License Copy");
        this.documentsRequired.push("Title Deed / Lease Agreement");
      }
    }

    this.subject$.next(this.documents);
    this.dataSource = new MatTableDataSource(this.documents);

    this.data$.pipe(filter((data) => !!data)).subscribe((documents) => {
      this.documents = documents;
      this.dataSource.data = documents;
    });
    this.form.controls.documentType.valueChanges.subscribe(
      (newDocumentType) => {
        this.filteredDocumentTypes = this.filterDocumentTypes(newDocumentType);
      }
    );
    this.form.controls.client.valueChanges.subscribe((newClient) => {
      this.filteredClients = this.filterClients(newClient);
    });
  }



  filterDocumentTypes(name: string) {
    if ((name != null) && (name != '')) {
      if (this.filteredDocumentTypes && this.filteredDocumentTypes != undefined) {
        return this.filteredDocumentTypes.filter(
          (documentType) =>
            documentType.description.toLowerCase().indexOf(name.toLowerCase()) ===
            0
        );
      }
    }
    else {
      this.filterDocuments();
      return this.filteredDocumentTypes;
    }
  }

  filterClients(name: string) {
    if (name != null) {
      if (this.clients != null && this.clients != undefined) {
        return this.clients.filter(
          (client) =>
            client.clientName.toLowerCase().indexOf(name.toLowerCase()) === 0
        );
      }
    }
    else {
      return this.clients;
    }
  }

  checkDuplication() {
    this.isDuplicate = false;
    for (let k = 0; k < this.documents.length; k++) {
      let a = this.form.controls.documentType.value;
      if (this.documents[k].document.indexOf(a) >= 0) {
        this.isDuplicate = true;
        this.validationMessage = a + " already uploaded"
        return this.isDuplicate;
      }
    }
    return this.isDuplicate;
  }

  uploadDocument() {
    if (
      this.form.controls.documentType.value &&
      this.form.controls.documentType.value !== "" &&
      this.selectedDocument
    ) {
      let item = this.filteredDocumentTypes.filter(x => x.description === this.form.controls.documentType.value);
      if (item.length == 0) {
        return;
      }
      if (!this.checkDuplication()) {
        this.documents.push({
          documentTypeId: this.form.controls.documentTypeId.value,
          document: this.form.controls.documentType.value,
          documentType: this.selectedDocument.name,
          documentPath: this.response + ',' + this.selectedDocument.name,
        });

        this.subject$.next(this.documents);

        this.selectedDocument = null;
        this.filterDocuments();
        this.validateDocuments();
        this.form.controls.documentType.setValue("");
        this.form.controls.documentTypeId.setValue(0);
        this.fileInput.nativeElement.value = ""
        //this.isDocumentsValid = false;
        if (this.isDocumentsValid == true && (this.documents && this.documents.length > 0)) {
          this.form.controls.documentType.clearValidators();
          this.form.controls.documentType.markAsUntouched();
          this.form.controls.documentType.updateValueAndValidity();
        }
      }
    }
  }

  deleteDocument(existingDocument) {
    this.documents.splice(
      this.documents.findIndex(
        (element) => element.document === existingDocument.document
      ),
      1
    );
    this.subject$.next(this.documents);
  }

  save() {
    this.createOwner();
  }

  createOwner() {
    this.validateDocuments();
    if (this.documentsRequired.length == this.documentsValidated.length) {
      this.isDocumentsValid = true;

      if (this.documents) {
        this.owner.documents = this.documents;
      }

      Object.assign(this.owner, this.form.value);
      this.owner.trn = this.form.controls.trn.value != null ? this.form.controls.trn.value.toString() : '';
      this.owner.clientId = parseInt(this.form.controls.clientId.value);
      if (this.selectedResidentialCommercialOption == this.commercialItem) {
        this.owner.isOwner = this.selectedTenantOwnerOption == this.ownerItem;
        this.owner.ownerName = this.form.controls.companyName.value;
        this.owner.entityType = this.selectedTenantOwnerOption.label;
        this.owner.isCompany = true;
      } else {
        this.owner.isOwner = this.selectedTenantOwnerOption == this.ownerItem;
        this.owner.ownerName = this.owner.firstName + " " + this.owner.lastName;
        this.owner.entityType = this.selectedTenantOwnerOption.label;
        this.owner.isCompany = false;
      }

      if (this.form.controls.address.value != "") {
        this.addresses.push({
          address1: this.form.controls.address.value,
          addressTypeId: 24,
        });
      }

      let date_ob = new Date();
      let date = ("0" + date_ob.getDate()).slice(-2); // adjust 0 before single digit date.
      let month = ("0" + (date_ob.getMonth() + 1)).slice(-2); // current month.
      let year = date_ob.getFullYear(); // current year.
      let today = month + "/" + date + "/" + year; // get date in MM-DD-YYYY format.

      this.owner.dob = null;
      this.owner.mobile = this.form.controls.phoneNo.value.toString();
      this.owner.addresses = this.addresses;
      for (let i = 0; i < this.selectedUnits.length; i++) {
        this.ownership.push({
          unitId: this.selectedUnits[i],
          startDate: new Date(today),
        });
      }
      this.owner.ownerships = this.ownership;

      this.ownerService.registerOwner(this.owner).subscribe({
        next: () => {
          this.snackbar.open("Registration successfull.", null, {
            duration: 5000,
            verticalPosition: "top",
            horizontalPosition: "center",
            panelClass: ["green-snackbar"],
          });
          this.resetControls();
        },
        error: (err: HttpErrorResponse) => {
          this.notificationMessage(err.toString(), "red-snackbar");
        },
      });
    } else {
      this.isDocumentsValid = false;
    }
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: "top",
      horizontalPosition: "end",
      panelClass: [cssClass],
    });
  }

  residentialCommercialChange(option: any) {
    this.documentsRequired = [];
    this.documentsValidated = [];
    if (this.commercialItem == option.value && this.selectedTenantOwnerOption == this.ownerItem) {
      //this.documentsRequired.push("Passport Copy");
      //this.documentsRequired.push("Trade License Copy");
      this.documentsRequired.push("Title Deed / Lease Agreement");
    } else {
      //this.documentsRequired.push("Passport Copy");
      //this.documentsRequired.push("Trade License Copy");
      this.documentsRequired.push("Title Deed / Lease Agreement");
    }
    this.filterDocuments();
    this.validateDocuments();
  }

  ownerTenantChange(option: any) {
    this.documentsRequired = [];
    this.documentsValidated = [];
    if (this.selectedResidentialCommercialOption == this.commercialItem && this.ownerItem == option.value) {
      //this.documentsRequired.push("Passport Copy");
      //this.documentsRequired.push("Trade License Copy");
      this.documentsRequired.push("Title Deed / Lease Agreement");
    } else {
      //this.documentsRequired.push("Passport Copy");
      //this.documentsRequired.push("Trade License Copy");
      this.documentsRequired.push("Title Deed / Lease Agreement");
    }
    this.filterDocuments();
    this.validateDocuments();
  }

  selectDocument(fileInputEvent: any) {

    // this.fileService
    //   .upload(fileInputEvent.target.files[0])
    //   .subscribe({next:(fileName) => {
    //     this.response = fileName;
    //     this.fileName = this.baseUrl + "uploads/" + fileName;
    //     this.selectedDocument = fileInputEvent.target.files[0];
    //   },
    //   error: (err) => {
    //     this.notificationMessage('File upload failed.', 'red-snackbar');
    //   }
    // });

    this.selectedDocument = null;
    this.fileService.upload(fileInputEvent.target.files[0])
      .subscribe({
        next: (fileName) => {
          this.response = fileName;
          this.fileName = this.baseUrl + "uploads/" + fileName;
          this.selectedDocument = fileInputEvent.target.files[0];
          this.isDocumentUploadSuccess = true;
        },
        error: (err) => {
          this.isDocumentUploadSuccess = false;
          this.errorMessage = err["error"].message == undefined ? err["error"].Message : err["error"].message;
          if (this.errorMessage == 'Request body too large.') {
            this.errorMessage = "Max. allowed File size is " + this.fileSize + "MB. Please upload file with smaller size.";
          }
        }
      });
  }

  selectDocumentType(event) {
    this.fileInput.nativeElement.value = ""
    this.metadataDocumentTypes.forEach((documentType) => {
      if (event.option.value == documentType.description) {
        this.form.controls.documentTypeId.setValue(documentType.id);
      }
    });
  }

  selectClient(event) {
    this.clients.forEach((client) => {
      if (event.option.value == client.clientName) {
        this.form.controls.clientId.setValue(client.id);
        this.form.controls.client.setValue(client.clientName);
        // this.registerService.getUnits(client.id).subscribe((units: MetadataUnit[]) => {
        //   this.metadataUnits = units
        // });
      }
    });
  }

  resetControls() {
    this.selectedDocument = null;
    this.documents = [];
    this.dataSource = new MatTableDataSource();
    this.addresses = [];
    //this.filteredDocumentTypes = this.metadataDocumentTypes;
    this.filterDocuments();
    this.filteredClients = this.clients;
    this.validationMessage = '';
    this.fileInput.nativeElement.value = "";
    this.validateDocumentType();
    this.resetAllFormFields(this.form);
  }

  resetAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        if (field != "residentialCommercialOption" && field != "tenantOwnerOption" && field != 'client' && field !='clientId') {
          control.reset();
        }
      } else if (control instanceof FormGroup) {
        if (field != "residentialCommercialOption" && field != "tenantOwnerOption" && field != 'client' && field !='clientId') {
          control.reset();
        }
      }
    });
  }

  validateDocumentType() {
    if (this.isDocumentsValid == true && (this.documents && this.documents.length > 0)) {
      this.form.controls.documentType.clearValidators();
      this.form.controls.documentType.markAsUntouched();
      this.form.controls.documentType.updateValueAndValidity();
    }
    else {
      this.form.controls.documentType.setValidators([Validators.required]);
      this.form.controls.documentType.updateValueAndValidity();
    }
    this.form.controls.documentType.valueChanges.subscribe(newDocumentType => {
      this.filteredDocumentTypes = this.filterDocumentTypes(newDocumentType);
    });
  }

  onChangeUnits(value) {
    if (this.selectedUnits.indexOf(value[0]) < 0)
      this.selectedUnits.push(value[0]);
  }

  toggleTermsNConditions(value) {
    this.isTermsAccepted = !value;
    this.validateDocuments();
  }

  filterDocuments() {
    this.filteredDocumentTypes = [];
    this.data = [];

    if (this.metadataDocumentTypes) {
      this.metadataDocumentTypes.forEach((element: MetadataDocumentType) => {
        if (this.documentsRequired.includes(element.description))
          this.data.push({ id: element.id, description: element.description })
        //this.filteredDocumentTypes.push({id: element.id, description: element.description})
      })
      this.filteredDocumentTypes = this.data;
    }
    // for(let i=0;i<this.documentsRequired.length;i++)
    // {
    //   this.metadataDocumentTypes.forEach((element: MetadataDocumentType) => { 
    //   if(element.description === this.documentsRequired[i])
    //   {            
    //     this.filteredDocumentTypes.push({id: element.id, description: element.description});
    //   }})      
    // }      
  }

  validateDocuments() {
    this.documentsValidated = [];
    this.isDocumentsValid = false;
    //    this.filterDocuments();

    for (let i = 0; i < this.documents.length; i++) {
      for (let k = 0; k < this.documentsRequired.length; k++) {
        if (this.documents[i].document == this.documentsRequired[k]) {
          this.documentsValidated.push(this.documentsRequired[k]);
        }
      }
    }
    if (this.documentsRequired.length <= this.documentsValidated.length) {
      this.isDocumentsValid = true;
    }
    else {
      this.isDocumentsValid = false;
      this.validationMessage = 'Please upload '
      this.filteredDocumentTypes.forEach((element) => {
        if ((element.description != this.form.controls.documentType.value) && (!this.documentsValidated.includes(element.description))) {
          this.validationMessage += element.description + ' & ';
        }
        // this.documentsValidated.forEach((x) => {
        //   if((element.description != x) && (!this.validationMessage.includes(element.description)))
        //   {
        //     this.validationMessage += element.description + ' & ';
        //   }
        // })
        // if(element.description != this.form.controls.documentType.value)
        // {
        //   this.validationMessage += element.description + ' & ';
        // }          
      })
      if (this.validationMessage.includes('&', this.validationMessage.length - 2))
        this.validationMessage = this.validationMessage.substr(0, this.validationMessage.length - 3);
      if (this.validationMessage == 'Please upload ')
        this.validationMessage = '';
    }

    if (this.form && this.form.controls.termsAccepted.value == true)
      this.isTermsAccepted = true;
    else this.isTermsAccepted = false;
    if (this.form.valid && this.isDocumentsValid && this.isTermsAccepted) {
      this.form.controls.btnSubmit.enable();
    } else {
      this.form.controls.btnSubmit.disable();
    }
  }

  checkTower() {
    let clientName = this.form.controls.client.value;
    let client = this.clients.find((item) => item.clientName.toLowerCase() == clientName.toLowerCase());
    this.clientValidationMsg = '';
    if (client != null || client != undefined) {
      this.form.controls.clientId.setValue(client.id);
      //this.form.controls.client.setValue(client.clientName);      
    }
    else {
      this.clientValidationMsg = 'Tower does not exist.';
      this.form.controls.clientId.setValue('');
    }
  }

  checkTRNDuplication() {
    this.duplicateTRN = '';
    let tRNNumber = this.form.controls.trn.value;
    if ((tRNNumber != '') || (tRNNumber != null))
      this.ownerService.checkTRNDuplication(1, tRNNumber, 0).subscribe(data => {
        if (data && data > 0) {
          this.duplicateTRN = 'TRN already exists.';
        }
      })
  }

  selectedClient() {
    if (this.clientId) {
      const client = this.filteredClients.find(x => x.id == this.clientId);
      if (this.form) {
        this.form.controls.client.setValue(client.clientName);
        this.form.controls.clientId.setValue(this.clientId);
      }
    }
  }
}

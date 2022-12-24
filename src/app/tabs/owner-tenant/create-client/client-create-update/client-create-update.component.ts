import { Component, Inject, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Address } from '../../../shared/models/address.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MetadataService } from '../../../shared/services/metadata.service';
import { MetadataCountry } from '../../../shared/models/metadata.country.model';
import { MetadataTitle } from '../../../shared/models/metadata.title.model';
import { MetadataUtilityType } from '../../../shared/models/metadata.utility-type.model';
import { MetadataDocumentType } from '../../../shared/models/metadata.document-type.model';
import { BankDetails } from '../../../shared/models/bank-details.model';
import { ListColumn } from '../../../../../@fury/shared/list/list-column.model';
import { Observable, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Documents } from '../../../shared/models/documents.model';
import { FormValidators } from '../../../shared/methods/form-validators';
import { Metadata } from "../../../shared/models/metadata.model";
import { MetadataAddressType } from '../../../shared/models/metadata.address-type.model';
import { ConstantsService } from '../../../shared/services/constants.service';
import { Client } from '../../../shared/models/client.model ';
import { FileService } from '../../../shared/services/file.service';
import { environment } from '../../../../../environments/environment';
import { MetadataStatus } from 'src/app/tabs/shared/models/metadata.status.model';
import { UserConfirmationPopupComponent } from '../../../shared/components/user-confirmation-popup/user-confirmation-popup.component';
import { MatOption } from '@angular/material/core';
import * as FileSaver from 'file-saver';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { ClientService } from 'src/app/tabs/shared/services/client.service';
import { MasterService } from 'src/app/tabs/shared/services/master.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TenantService } from 'src/app/tabs/shared/services/tenant.service';
import { OwnerService } from 'src/app/tabs/shared/services/owner.service';
import { importType } from '@angular/compiler/src/output/output_ast';
import { CancelConfirmationDialogComponent } from '../../../shared/components/cancel-confirmation-dialog/cancel-confirmation-dialog.component';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';
import { CreateUserMasterComponent } from '../../../shared/components/create-user-master/create-user-master.component';
import { EnvService } from 'src/app/env.service';


@Component({
  selector: 'client-create-update',
  templateUrl: './client-create-update.component.html',
  styleUrls: ['./client-create-update.component.scss']
})
export class ClientCreateUpdateComponent implements OnInit {

  @ViewChild('fileInput') fileInput: ElementRef
  @ViewChild('fileInputDocument') fileInputDocument: ElementRef
  @ViewChild('allSelected') private allSelected: MatOption;
  

  baseUrl = '';
  static id;

  form: FormGroup;
  mode: 'create' | 'update' = 'create';
  fileSize = 0;

  isValidDate: boolean = true;
  duplicateTRN: string = '';
  locationId: number;
  areaId: number;
  countryId: number;
  addressTypeId: number = 30;
  addressType: string;
  address: Address;
  bankDetails: BankDetails;
  selectedUtilities = [];
  selectedClientUtilities: any = [];
  isCancel: boolean = false;

  metadata: Metadata;
  metadataCountries: Master[];
  metadataDocumentTypes: Master[];
  metadataTitles: Master[];
  metadataAddressTypes: Master[];
  metadataStatus: Master[];
  metadataUtilityType: Master[];
  filteredCountries: Master[];
  filteredDocumentTypes: Master[];
  filteredTitles: Master[];
  filteredAddressTypes: Master[];
  filteredStatus: Master[];
  location: Master[];
  filteredLocations: Master[];
  area: Master[];
  filteredArea: Master[];
  lstClientNames: Master[];
  selectedClientName: string = '';

  image: any
  response: any
  fileName: any;
  documentResponse: any;

  documents: any = [];
  isDuplicate: boolean = false;
  validationMessage: string = '';
  uploadSuccess: boolean = true;

  picture: string[];
  locationName: string;
  areaName: string;

  isUploadSuccess: boolean = true;
  errorMessage: string = '';
  isDocumentUploadSuccess: boolean = true;

  selectedDocument: File;

  subject$: ReplaySubject<Documents[]> = new ReplaySubject<Documents[]>(1);
  data$: Observable<Documents[]> = this.subject$.asObservable();

  downloadVar: string = '';
  //isCompanySelected: boolean=true;

  @Input()
  columns: ListColumn[] = [
    //{ name: 'Checkbox', property: 'checkbox', visible: true },
    { name: 'Document Type', property: 'documentType', visible: true, isModelProperty: true },
    { name: 'Path', property: 'documentPath', visible: false },
    { name: 'File Name', property: 'document', visible: true },
    { name: 'Modify', property: 'actions', visible: true }
  ] as ListColumn[];
  pageSize = 10;
  dataSource: MatTableDataSource<Documents> | null;

  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort){
       this.dataSource.sort = this.sort;  
    }
  }

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: Client,
    private snackbar: MatSnackBar, private tenantService: TenantService,
    private dialogRef: MatDialogRef<ClientCreateUpdateComponent>,
    private fb: FormBuilder, private metadataService: MetadataService,
    private ownerService: OwnerService, private dialog: MatDialog,
    private fv: FormValidators, private constantsService: ConstantsService,
    private clientService: ClientService,
    private fileService: FileService, private masterService: MasterService,
    private envService: EnvService) {
    this. fileSize = Math.floor(envService.MaxBytes/1000000);
      this.  baseUrl = envService.backendForFiles;
      dialogRef.disableClose = true;
  }

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit() {
    if (this.defaults) {
      this.mode = 'update';      
      for (let i = 0; i < this.defaults.utilities.length; i++) {
        this.selectedUtilities[i] = this.defaults.utilities[i].utilityTypeId;
      }
      this.documents = this.defaults.documents;
    } else {
      this.defaults = new Client({});
    }

    this.address = this.defaults.addresses.filter(addresses => addresses.addressTypeId === this.addressTypeId)[0] || new Address({});
    this.bankDetails = this.defaults.bankDetails[0] || new BankDetails({});

    this.masterService.getSystemMasterdata(15, 0).subscribe((data: Master[]) => {
      this.metadataCountries = data;
      this.filteredCountries = data;
    });
    // this.masterService.getUserMasterdata(20, 0).subscribe((data: Master[]) => {
    //   this.metadataDocumentTypes = data;
    //   this.filteredDocumentTypes = data;
    // });
    this.getDocumentTypes();
    this.masterService.getSystemMasterdata(26, 0).subscribe((data: Master[]) => {
      this.metadataTitles = data;
      this.filteredTitles = data;
    });
    this.masterService.getSystemMasterdata(22, 0).subscribe((data: Master[]) => {
      if (data) {
        this.metadataAddressTypes = data;
        this.metadataAddressTypes = this.metadataAddressTypes.filter(item => item.description == 'PermanentAddress')
        this.filteredAddressTypes = this.metadataAddressTypes;
        this.addressType = this.metadataAddressTypes[0].description;
        this.addressTypeId = this.metadataAddressTypes[0].id;
        this.changeAddressType(null, 'PermanentAddress');
      }
    });

    this.masterService.getSystemMasterdata(42, 0).subscribe((data: Master[]) => {
      this.metadataStatus = data;
      this.filteredStatus = data;
    });
    // this.masterService.getSystemMasterdata(16, 0).subscribe((data: Master[]) => {
    //   this.metadataUtilityType = data;
    // });

    this.clientService.getUtilityTypes(this.defaults.id).subscribe((data : Master[]) => {
      this.metadataUtilityType = data;
    });

    //this.metadata = this.metadataService.getMetadata();
    // this.metadataCountries = this.metadata.countries;
    // this.filteredCountries = this.metadata.countries;

    // this.metadataDocumentTypes = this.metadata.documentTypes;
    // this.filteredDocumentTypes = this.metadata.documentTypes;

    // this.metadataTitles = this.metadata.titles;
    // this.filteredTitles = this.metadata.titles;

    // this.metadataAddressTypes = this.metadata.addressTypes;
    // this.filteredAddressTypes = this.metadata.addressTypes;

    this.tenantService.getClientNames().subscribe((data: Master[]) => {
      this.lstClientNames = data;
    });
    // this.metadataStatus = this.metadata.status;
    // this.filteredStatus = this.metadata.status;

    //this.metadataUtilityType = this.metadata.utilityTypes;

    if (this.metadataAddressTypes) {
      this.metadataAddressTypes.forEach(addressType => {
        if (addressType.id === this.addressTypeId) {
          this.addressType = addressType.description;
        }
      })
    }
    this.image = this.baseUrl + '/uploads/' + this.defaults.photo;
    if (this.defaults.photo == '') {
      this.image = 'assets/img/avatars/two.png';
    }
    this.response = this.defaults.photo;

    // if(this.defaults.businessEndDate != null && this.defaults.businessEndDate.toString() == '0001-01-01T00:00:00')
    // {
    //   this.defaults.businessEndDate = null;
    // }

    this.form = this.fb.group({
      id: [this.defaults.id || 0],
      title: [this.defaults.title || '', Validators.required],
      titleId: [this.defaults.titleId || '', Validators.required],
      //clientNumber: [this.defaults.clientNumber || '', Validators.required],
      firstName: [this.defaults.firstName || '', this.fv.nameValidators],
      lastName: [this.defaults.lastName || '', this.fv.nameValidators],
      accountNumber: [this.defaults.accountNumber || '', this.fv.requiredAlphanumericNoSpaces],
      phoneNo: [this.defaults.phoneNo || '', this.fv.mobileNumberValidators],
      email: [this.defaults.email || '', this.fv.emailValidators],
      clientName: [this.defaults.clientName || '', this.fv.nameValidators],
      photo: [this.defaults.photo || ''],
      businessStartDate: [this.defaults.businessStartDate && new Date(this.defaults.businessStartDate).toISOString().substr(0, 10) || '', Validators.required],
      businessEndDate: [this.defaults.businessEndDate && this.defaults.businessEndDate.toString() != '0001-01-01T00:00:00' ? new Date(this.defaults.businessEndDate).toISOString().substr(0, 10) : '' || '', Validators.required],
      trnNo: [this.defaults.trnNo || '', Validators.required],
      statusId: [this.defaults.statusId || 0, Validators.required],
      status: [this.defaults.status || '', Validators.required],
      utilities: [this.defaults.utilities],
      utilityList: [this.defaults.utilities, Validators.required],
      addressType: this.addressTypeId,
      address: this.fb.group({
        city: [this.address.city || ''],
        zipPostalCode: [this.address.zipPostalCode || ''],
        address1: [this.address.address1 || ''],
        address2: [this.address.address2 || ''],
        country: [this.address.country || ''],
        countryId: [this.address.countryId || 0],
        addressType: [this.address.addressType || ''],
        addressTypeId: [this.address.addressTypeId || ''],
        areaId: [this.address.areaId || 0],
        area: [this.address.area || ''],
        locationId: [this.address.locationId || 0],
        location: [this.address.location || ''],
        email: [this.address.email],
        phoneNumber: [this.address.phoneNumber]
      }),
      bank: this.fb.group({
        accountName: [this.bankDetails.accountName || ''],
        accountNo: [this.bankDetails.accountNo || ''],
        bankName: [this.bankDetails.bankName || ''],
        bankAddress: [this.bankDetails.bankAddress || ''],
        swiftCode: [this.bankDetails.swiftCode || ''],
        ibanNumber: [this.bankDetails.ibanNumber || '']
      }),

      documentType: '',
      documentTypeId: 0,
    });

    if (this.address) {
      this.selectCountry(null, this.address.countryId);
      this.selectLocation(null, this.address.locationId)
      this.locationName = this.address.location;
      this.areaName = this.address.area;            
      this.form.controls.address.get('countryId').setValue(this.address.countryId);
      this.form.controls.address.get('locationId').setValue(this.address.locationId);
      this.form.controls.address.get('areaId').setValue(this.address.areaId);      
    }

    this.enableAddressValidators();

    this.selectedClientName = this.defaults.clientName;

    this.documents = this.defaults.documents || [];
    this.documents.forEach((document) => {
      let index = document.documentPath.indexOf(',');
      if (index > 0) {
        document.document = document.documentPath.substr(index + 1, document.documentPath.length);
        document.documentPath = document.documentPath.substr(0, index);
      }
    })
    this.subject$.next(this.documents);

    this.dataSource = new MatTableDataSource();

    this.data$.pipe(
      filter(data => !!data)
    ).subscribe((documents) => {
      this.documents = documents;
      this.dataSource.data = documents;
    });

    this.form.controls.title.valueChanges.subscribe(newTitle => {
      this.filteredTitles = this.filterTitle(newTitle);
    });
    this.form.controls.status.valueChanges.subscribe(newStatus => {
      this.filteredStatus = this.filterStatus(newStatus);
    });
    this.form.controls.address.get('addressType').valueChanges.subscribe(newAddressType => {
      this.filteredAddressTypes = this.filterAddressType(newAddressType);
    });
    this.form.controls.address.get('country').valueChanges.subscribe(newCountry => {
      this.filteredCountries = this.filterCountries(newCountry);
    });
    this.form.controls.documentType.valueChanges.subscribe(newDocumentType => {
      this.filteredDocumentTypes = this.filterDocumentTypes(newDocumentType);
    });
    // console.log(this.addressTypeId);
    // console.log("this.duplicateTRN != '': " + this.duplicateTRN);
    // console.log('this.form.invalid: ' + this.form.invalid);
    // console.log('!this.form.controls.address.valid: ' + !this.form.controls.address.valid);
    // console.log('!form.controls.bank.valid: ' + !this.form.controls.bank.valid);
      
      const invalid = [];
        const controls = this.form.controls;
        for (const name in controls) {
            if (controls[name].invalid) {
                invalid.push(name);
            }
        }
        //console.log(invalid);
      if(this.form.invalid)  
        this.form.setErrors({required: true});
      //console.log(this.defaults)
      //console.log('form.errors' + this.form.errors);
      //console.log('disabled: ' + this.form.errors != null || !this.form.controls.address.valid || !this.form.controls.bank.valid);
  }

  getDocumentTypes()
  {
    this.masterService.getUserMasterdata(20, 0).subscribe((data: Master[]) => {
      this.metadataDocumentTypes = data;
      this.filteredDocumentTypes = data;
    });
  }

  getFilteredCountry() {
    let value = this.form.controls.address.get('country').value
    if (value == '') {
      this.countryId = 0;
      this.locationId = 0;
      this.areaId = 0;
      this.form.controls.address.get('locationId').setValue(0);
      this.form.controls.address.get('location').setValue('');
      this.form.controls.address.get('areaId').setValue(0);
      this.form.controls.address.get('area').setValue('');
      this.selectCountry(null,this.countryId);
    }
    this.filteredCountries = this.filterCountries(value);
  }

  getFilteredAddress() {
    let value = this.form.controls.address.get('addressType').value;
    this.filteredAddressTypes = this.filterAddressType(value);
  }

  filterTitle(name: string) {
    return this.metadataTitles.filter(title =>
      title.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  filterStatus(name: string) {
    return this.metadataStatus.filter(status =>
      status.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  filterAddressType(name: string) {
    if (this.metadataAddressTypes) {
      let address = this.metadataAddressTypes.filter(addressTypes =>
        addressTypes.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
      return address;
    }
  }

  filterCountries(name: string) {
    if ((name != null) || (name != undefined) || (name != '')) {
      return this.metadataCountries.filter(country =>
        country.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
    }
    else {
      return this.metadataCountries;
    }
  }

  filterDocumentTypes(name: string) {
    return this.metadataDocumentTypes.filter(documentType =>
      documentType.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  ngAfterViewInit() {
    if ((this.paginator != undefined) && (this.dataSource != undefined))
      this.dataSource.paginator = this.paginator;
    if ((this.sort != undefined) && (this.dataSource != undefined))
      this.dataSource.sort = this.sort;
  }

  save() {
    this.updateAddress();
    this.updateBankDetails();
    this.documents.forEach((document) => {
      document.documentPath = document.documentPath + ',' + document.document
    })
    this.defaults.documents = this.documents;
    if (this.mode === 'create') {
      this.createClient();
    } else if (this.mode === 'update') {
      this.updateClient();
    }
  }

  createClient() {
    Object.assign(this.defaults, this.form.value);
    for (let i = 0; i < this.selectedUtilities.length; i++) {
      if (this.selectedUtilities[i] != 0) {
        this.selectedClientUtilities.push({
          clientId: this.defaults.id,
          utilityTypeId: this.selectedUtilities[i]
        });
      }
    }
    this.defaults.trnNo = this.form.controls.trnNo.value.toString();
    this.defaults.utilities = this.selectedClientUtilities;
    this.defaults.photo = this.response;
    this.defaults.documents = this.documents;
    if (this.isCancel) {
      this.isCancel = false;
      const confirmMessage: ListItem = {
        label: "Are you sure you want to Cancel?",
        selected: false
      };
      this.dialog.open(CancelConfirmationDialogComponent, { data: confirmMessage }).afterClosed().subscribe((message: any) => {
        if (message) {
          this.dialogRef.close();
        }
      });
    }
    else if (this.form.valid) {
      this.dialogRef.close(new Client(this.defaults));
    }
  }

  updateClient() {
    Object.assign(this.defaults, this.form.value)
    // this.defaults.addresses[0].countryId = this.countryId;
    // this.defaults.addresses[0].locationId = this.locationId;
    // this.defaults.addresses[0].areaId = this.areaId;
    for (let i = 0; i < this.selectedUtilities.length; i++) {
      if (this.selectedUtilities[i] != 0) {
        this.selectedClientUtilities.push({
          clientId: this.defaults.id,
          utilityTypeId: this.selectedUtilities[i]
        });
      }
    }
    this.defaults.trnNo = this.form.controls.trnNo.value.toString();
    this.defaults.utilities = this.selectedClientUtilities;
    if (this.response !== undefined) {
      this.defaults.photo = this.response;
    }
    this.defaults.documents = this.documents;
    if (this.isCancel) {
      this.isCancel = false;
      const confirmMessage: ListItem = {
        label: "Are you sure you want to Cancel?",
        selected: false
      };
      this.dialog.open(CancelConfirmationDialogComponent, { data: confirmMessage }).afterClosed().subscribe((message: any) => {
        if (message) {
          this.dialogRef.close();
        }
      });
    }
    else //if (this.form.valid) 
    {
      this.dialogRef.close(this.defaults);
    }
  }

  isCreateMode() {
    return this.mode === 'create';
  }

  isUpdateMode() {
    return this.mode === 'update';
  }

  changeAddressType(event, type = '') {
    //this.updateAddress();
    if ((event == null) && (type != '')) {
      this.addressType = type;
    }
    else {
      this.addressType = event.option.value;
    }

    this.metadataAddressTypes.forEach(addressType => {
      if (this.addressType === addressType.description) {
        this.addressTypeId = addressType.id;
      }
    })
    this.address = this.defaults.addresses.filter(addresses => addresses.addressTypeId === this.addressTypeId)[0] || new Address({});
    if (this.address) {
      this.form.controls.address = this.fb.group({
        city: [this.address.city || ''],
        zipPostalCode: [this.address.zipPostalCode || ''],
        address1: [this.address.address1 || ''],
        address2: [this.address.address2 || ''],
        country: [this.address.country || ''],
        countryId: [this.address.countryId || 0],
        addressType: [this.address.addressType || this.addressType],
        addressTypeId: [this.address.addressTypeId || this.addressTypeId],
        areaId: [this.address.areaId || 0],
        area: [this.address.area || ''],
        locationId: [this.address.locationId || 0],
        location: [this.address.location || ''],
        email: [this.address.email],
        phoneNumber: [this.address.phoneNumber]
      })
      this.selectCountry(null, this.address.countryId);
      this.selectLocation(null, this.address.locationId)
    }
    this.enableAddressValidators();
  }

  updateAddress() {
    if ((this.form.controls.address.valid))// && (this.form.controls.address.get('city').value != ''))
    {
      let found = false;
      this.defaults.addresses.forEach(address => {
        if (address.addressTypeId === this.addressTypeId || this.addressTypeId == 0) {
          found = true;
          Object.assign(address, this.form.controls.address.value);
          address.addressType = this.addressType;
        }
      })
      if (!found) {
        //this.defaults.addresses = null;
        let newAddress = { addressTypeId: this.addressTypeId };
        Object.assign(newAddress, this.form.controls.address.value);
        Object.assign(newAddress, { addressType: this.addressType });
        this.defaults.addresses.push(new Address(newAddress));
      }
    }
  }

  updateBankDetails() {
    if (this.form.controls.bank.valid) {
      if (this.defaults.bankDetails[0]) {
        Object.assign(this.defaults.bankDetails[0], this.form.controls.bank.value);
      }
      else {
        this.defaults.bankDetails.push(new BankDetails(this.form.controls.bank.value));
      }
    }
  }


  uploadPhoto(fileInputEvent: any) {
    this.image = 'assets/img/avatars/two.png';
    this.errorMessage = '';

      this.fileService.upload(fileInputEvent.target.files[0],"image")
      .subscribe({next:(fileName) => {
        this.response = fileName;
        this.image = this.baseUrl + "/uploads/" + fileName;
        this.isUploadSuccess = true;
      },
      error: (err) => {
        this.isUploadSuccess = false;
        this.errorMessage = err["error"].message == undefined ? err["error"].Message : err["error"].message;
        if(this.errorMessage == 'Request body too large.')
        {
          this.errorMessage = "Max. allowed File size is " + this.fileSize + "MB. Please upload file with smaller size.";
        }
      }
      });
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: "top",
      horizontalPosition: "end",
      panelClass: [cssClass],
    });
  }

  selectDocument(fileInputEvent: any) {
    this.uploadSuccess = true;
    // this.selectedDocument = fileInputEvent.target.files[0];
    // this.fileService.upload(fileInputEvent.target.files[0])
    //   .subscribe({
    //     next: (fileName) => {
    //       this.documentResponse = fileName
    //       //this.fileName = this.baseUrl + 'uploads/' + fileName  
    //     },
    //     error: (err) => {
    //       this.uploadSuccess = false;
    //       this.notificationMessage('File upload failed.', 'red-snackbar');
    //     }
    //   });

    this.fileService.upload(fileInputEvent.target.files[0])
    .subscribe({next:(fileName) => {
      this.documentResponse = fileName;
      this.selectedDocument = fileInputEvent.target.files[0];
      this.isDocumentUploadSuccess = true;
    },
    error: (err) => {
      this.isDocumentUploadSuccess = false;
      this.uploadSuccess = false;
      this.errorMessage = err["error"].message == undefined ? err["error"].Message : err["error"].message;
      if(this.errorMessage == 'Request body too large.')
      {
        this.errorMessage = "Max. allowed File size is " + this.fileSize + "MB. Please upload file with smaller size.";
      }
    }
  });
  }


  uploadDocument() {
    if (this.form.controls.documentType.value && this.form.controls.documentType.value !== '' && this.selectedDocument && !this.isDuplicate && this.uploadSuccess) {
      this.documents.push({
        documentTypeId: this.form.controls.documentTypeId.value,
        documentType: this.form.controls.documentType.value,
        documentPath: this.documentResponse,
        document: this.selectedDocument['name']
      })
      this.subject$.next(this.documents);
      this.form.controls.documentType.setValue('');
      this.form.controls.documentTypeId.setValue(0);
      this.fileInputDocument.nativeElement.value = "";
      this.selectedDocument = null;
    }
  }

  downloadDocument(row) {
    let fileName = '';
    let index = row.documentPath.indexOf(',');
    if (index > 0) {
      fileName = row.documentPath.substr(0, index);
    }
    else {
      fileName = row.documentPath;
    }
    this.downloadVar = this.baseUrl + '/uploads/' + fileName;
    FileSaver.saveAs(this.downloadVar, fileName);
  }

  deleteDocument(existingDocument) {
    this.dialog.open(UserConfirmationPopupComponent).afterClosed().subscribe((message: any) => {
      if (message) {
        let index = this.documents.findIndex((element) => element.documentType === existingDocument.documentType);
        if (index >= 0) {
          this.documents.splice(index, 1);
          this.subject$.next(this.documents);
        }
      }
    });
  }



  enableAddressValidators() {
    let countryId;

    const address = this.form.controls.address;
    if (this.metadataCountries) {
      this.metadataCountries.forEach(country => {
        if (country.description == address.value.country) {
          countryId = country.id;
        }
      })
    }

    if (address.value.address1 != '' || address.value.address2 != '' || address.value.city != '' ||
      address.value.zipPostalCode != '' || address.value.country != '' || address.value.location != '' ||
      address.value.area != '' || address.value.email != '' || address.value.phoneNumber != '') {

      this.form.controls.address = this.fb.group({
        city: [address.value.city || '', this.fv.addressValidators],
        zipPostalCode: [address.value.zipPostalCode || '', this.fv.postalCodeValidators],
        address1: [address.value.address1 || '', this.fv.addressValidators],
        address2: [address.value.address2 || '', this.fv.optionsAddressValidators],
        country: [address.value.country || '', Validators.required],
        countryId: [address.value.countryId || 0],
        addressType: [address.value.addressType || '', Validators.required],
        addressTypeId: [address.value.addressTypeId || 0, Validators.required],
        areaId: [address.value.areaId || 0],
        area: [address.value.area || '', Validators.required],
        locationId: [address.value.locationId || 0],
        location: [address.value.location || '', Validators.required],
        phoneNumber: [address.value.phoneNumber || '', this.fv.mobileNumberValidators],
        email: [address.value.email || '', this.fv.emailValidators]
      });

      if(this.form.controls.address.get('city').value != '' && this.form.controls.address.get('city').invalid)  
      {
        this.form.controls.address.get('city').setErrors({'incorrect' : true});
        this.form.controls.address.get('city').markAsTouched();
      }
      if(this.form.controls.address.get('zipPostalCode').value != '' && this.form.controls.address.get('zipPostalCode').invalid)  
      {
        this.form.controls.address.get('zipPostalCode').setErrors({'incorrect' : true});
        this.form.controls.address.get('zipPostalCode').markAsTouched();
      }
      if(this.form.controls.address.get('address1').value != '' && this.form.controls.address.get('address1').invalid)  
      {
        this.form.controls.address.get('address1').setErrors({'incorrect' : true});
        this.form.controls.address.get('address1').markAsTouched();
      }
      if(this.form.controls.address.get('address2').value != '' && this.form.controls.address.get('address2').invalid)  
      {
        this.form.controls.address.get('address2').setErrors({'incorrect' : true});
        this.form.controls.address.get('address2').markAsTouched();
      }
      if(this.form.controls.address.get('email').value != '' && this.form.controls.address.get('email').invalid)  
      {
        this.form.controls.address.get('email').setErrors({'incorrect' : true});
        this.form.controls.address.get('email').markAsTouched();
      }
      if(this.form.controls.address.get('phoneNumber').value != '' && this.form.controls.address.get('phoneNumber').invalid)  
      {
        this.form.controls.address.get('phoneNumber').setErrors({'incorrect' : true});
        this.form.controls.address.get('phoneNumber').markAsTouched();
      }
    } else {

      this.form.controls.address = this.fb.group({
        city: [address.value.city || ''],
        zipPostalCode: [address.value.zipPostalCode || ''],
        address1: [address.value.address1 || ''],
        address2: [address.value.address2 || ''],
        country: [address.value.country || ''],
        countryId: [address.value.countryId || 0],
        addressType: [address.value.addressType || ''],
        addressTypeId: [address.value.addressTypeId || 0],
        areaId: [address.value.areaId || 0],
        area: [address.value.area || ''],
        locationId: [address.value.locationId || 0],
        location: [address.value.location || ''],
        email: [address.value.email || ''],
        phoneNumber: [address.value.phoneNumber || '']
      })
    }       
  }

  enabledBankValidators() {
    const bank = this.form.controls.bank;

    if (bank.value.accountName !== '' || bank.value.accountNo !== '' || bank.value.bankName !== '' ||
      bank.value.bankAddress !== '' || bank.value.swiftCode !== '' || bank.value.ibanNumber !== '') {

      this.form.controls.bank = this.fb.group({
        accountName: [bank.value.accountName || '', this.fv.nameValidators],
        accountNo: [bank.value.accountNo || '', this.fv.requiredAlphanumericNoSpaces],
        bankName: [bank.value.bankName || '', this.fv.nameValidators],
        bankAddress: [bank.value.bankAddress || '', this.fv.optionsAddressValidators],
        swiftCode: [bank.value.swiftCode || '', this.fv.requiredAlphanumericNoSpaces],
        ibanNumber: [bank.value.ibanNumber || '', this.fv.requiredAlphanumericNoSpaces]
      })
    } else {

      this.form.controls.bank = this.fb.group({
        accountName: [bank.value.accountName || ''],
        accountNo: [bank.value.accountNo || ''],
        bankName: [bank.value.bankName || ''],
        bankAddress: [bank.value.bankAddress || ''],
        swiftCode: [bank.value.swiftCode || ''],
        ibanNumber: [bank.value.ibanNumber || '']
      })

    }
  }

  selectTitle(event) {
    this.metadataTitles.forEach(title => {
      if (event.option.value == title.description) {
        this.form.controls.titleId.setValue(title.id);
      }
    });    
  }

  selectDocumentType(event) {
    this.fileInputDocument.nativeElement.value = "";
    this.checkForDuplication(event);
    if (!this.isDuplicate) {
      this.metadataDocumentTypes.forEach(documentType => {
        if (event.option.value == documentType.description) {
          this.form.controls.documentTypeId.setValue(documentType.id);
        }
      })
    }
  }

  checkForDuplication(event) {
    this.isDuplicate = false;
    this.documents.forEach((element) => {
      if (event.option.value == element.documentType) {
        this.isDuplicate = true;
        this.validationMessage = event.option.value + " already uploaded";
      }
    })
    return this.isDuplicate;
  }

  selectStatus(event) {
    this.metadataStatus.forEach(status => {
      if (event.option.value == status.description) {
        this.form.controls.statusId.setValue(status.id);
      }
    })
  }

  toggleAllSelection() {
    if (this.allSelected.selected) {
      this.form.controls.utilityList
        .patchValue([...this.metadataUtilityType.map(item => item.id), 0]);
    } else {
      this.form.controls.utilityList.patchValue([]);
    }
  }

  togglePerOne(all) {    
    if (this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }
    if (this.form.controls.utilityList.value.length == this.metadataUtilityType.length)
      this.allSelected.select();
  }

  selectCountry(event, id = 0) {
    this.location = [];
    this.area = [];
    this.locationId = 0;
    this.areaId = 0;
    //this.form.controls.address.get('countryId').setValue(0);
    //this.form.controls.address.get('country').setValue('');
    // this.form.controls.address.get('locationId').setValue(0);
    // this.form.controls.address.get('location').setValue('');
    // this.form.controls.address.get('areaId').setValue(0);
    // this.form.controls.address.get('area').setValue('');
    
    if (id) {
      this.masterService.getUserMasterdata(6, id).subscribe((data: Master[]) => {
        this.location = data;
      });
    } else {
      if (this.metadataCountries) {
        this.metadataCountries.forEach(item => {
          if ((event) && (event.option.value == item.description)) //text: event.source.triggerValue
          {
            this.form.controls.address.get('countryId').setValue(item.id);
            this.countryId = item.id;
            this.masterService.getUserMasterdata(6, item.id).subscribe((data: Master[]) => {
              this.location = data;
            });
          }
        })
      }
    }
    this.enableAddressValidators();
  }

  selectLocation(event, id = 0) {
    this.area = [];
    this.areaId = 0;
    // this.form.controls.address.get('locationId').setValue(0);
    // this.form.controls.address.get('areaId').setValue(0);
    
    if (id) {
      this.masterService.getUserMasterdata(7, id).subscribe((data: Master[]) => {
        this.area = data;
      });
    } else {
      if ((this.location != null) || (this.location != undefined)) {
        this.location.forEach(item => {
          if ((event) && (event.value == item.description)) //text: event.source.triggerValue
          {
            this.form.controls.address.get('locationId').setValue(item.id);
            this.locationId = item.id;
            this.masterService.getUserMasterdata(7, item.id).subscribe((data: Master[]) => {
              this.area = data;
            });
          }
        });
      }
    }
  }

  selectArea(event) {
    // this.form.controls.address.get('areaId').setValue(0);
    this.area.forEach(item => {
      if (event.value == item.description) {
        this.areaId = item.id;
        this.form.controls.address.get('areaId').setValue(item.id);
      }
    })
  }

  getAddressType(name: string) {
    if (name == '') {
      this.addressType = '';
      this.addressTypeId = 0;
    }
    this.filteredAddressTypes = this.filterAddressType(name);
  }

  addAddress() {
    const address: Address = {};
    Object.assign(address, this.form.controls.address.value)
    if (address.city != '' && address.zipPostalCode != '' && address.address1 != '' && address.address2 != '' && address.country != '' && address.addressType != '' && address.phoneNumber != '' && address.email != '') {
      if (this.defaults.addresses && this.defaults.addresses.length) {
        const itemIndex = this.defaults.addresses.findIndex(x => x.addressTypeId == address.addressTypeId);
        if (itemIndex > -1) {
          this.defaults.addresses.splice(itemIndex, 1);
        }
      }
      this.defaults.addresses.push(address);
    }
  }

  validatePattern(event) {
    var k;
    k = event.charCode;  //         k = event.keyCode;  (Both can be used)
    if (k == 32)
      return k != 32;
    else
      return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || (k >= 48 && k <= 57));
  }

  checkTRNDuplication() {
    this.duplicateTRN = '';
    let tRNNumber = this.form.controls.trnNo.value;
    if ((tRNNumber != '') || (tRNNumber != null))
      this.ownerService.checkTRNDuplication(2, tRNNumber, this.defaults.id).subscribe(data => {
        if (data && data > 0) {
          this.duplicateTRN = 'TRN already exists.';
        }
      })
  }

  close() {
    this.dialogRef.close();
  }

  closeDialog() {
    this.isCancel = true;
  }

  setBusinessEndDate()
  {
    let date = this.form.controls.businessStartDate.value;
    if(date && date != '')
    {
      var d = new Date(date);
      var year = d.getFullYear();
      var month = d.getMonth();
      var day = d.getDate();
      var c = new Date(year + 10, month, day);
      this.form.controls.businessEndDate.setValue(c);
    }
  }

  validateDates() {
    this.isValidDate = true;
    let startDate = this.form.controls.businessStartDate.value;
    let endDate = this.form.controls.businessEndDate.value;
    var startYear = new Date(startDate).getFullYear();
    var endYear = new Date(endDate).getFullYear();
    if ((startYear != 1970) && (endYear != 1970)) {
      if (startYear < endYear) {
        this.isValidDate = true;
      }
      else if (startYear > endYear) {
        this.isValidDate = false;
      }
      else if (startDate != null && endDate != null) {
        if ((endDate) < (startDate)) {
          this.isValidDate = false;
        }
      }
    }
  }

  createLocation() {
      let modes = [this.countryId,6];
      this.dialog.open(CreateUserMasterComponent, { data: modes }).afterClosed().subscribe((message: any) => {
        if (message && message == 'Success') {
          this.selectCountry(null,this.countryId);
        }
      });
  }

  createArea() {
      let modes = [this.locationId,7];
      this.dialog.open(CreateUserMasterComponent, { data: modes }).afterClosed().subscribe((message: any) => {
        if (message && message == 'Success') {
          this.selectLocation(null,this.locationId);
        }
      });
  }

  createDocumentType() {
    let modes = [0,20];
    this.dialog.open(CreateUserMasterComponent, { data: modes }).afterClosed().subscribe((message: any) => {
      if (message && message == 'Success') {
        this.getDocumentTypes();
      }
    });
  }
  
}

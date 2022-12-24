import { Component, Inject, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Owner } from './owner.model';
import { Address } from 'src/app/tabs/shared/models/address.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MetadataService } from 'src/app/tabs/shared/services/metadata.service';
import { MetadataCountry } from 'src/app/tabs/shared/models/metadata.country.model';
import { MetadataTitle } from 'src/app/tabs/shared/models/metadata.title.model';
import { MetadataDocumentType } from 'src/app/tabs/shared/models/metadata.document-type.model';
import { BankDetails } from 'src/app/tabs/shared/models/bank-details.model';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { Observable, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Documents } from 'src/app/tabs/shared/models/documents.model';
import { FormValidators } from '../../../shared/methods/form-validators';
import { MetadataAddressType } from 'src/app/tabs/shared/models/metadata.address-type.model';
import { ConstantsService } from '../../../shared/services/constants.service';
import { OwnerService } from '../../../shared/services/owner.service';
import { FileService } from '../../../shared/services/file.service';
import { environment } from '../../../../../environments/environment';
import { Metadata } from 'src/app/tabs/shared/models/metadata.model';
import { UserDetails } from 'src/app/tabs/shared/models/user-details';
import { Guid } from 'guid-typescript';
import { MetadataUnit } from 'src/app/tabs/shared/models/metadata.unit.model';
import { Ownership } from './ownership.model';
import { DatePipe, NumberFormatStyle } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UnitMaster } from 'src/app/tabs/settings/create-unit-master/unit-master-create-update/unit-master.model';
import * as FileSaver from 'file-saver';
import { parse } from 'path';
import { settings } from 'cluster';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { MasterService } from 'src/app/tabs/shared/services/master.service';
import { UserConfirmationPopupComponent } from '../../../shared/components/user-confirmation-popup/user-confirmation-popup.component';
import { CancelConfirmationDialogComponent } from 'src/app/tabs/shared/components/cancel-confirmation-dialog/cancel-confirmation-dialog.component';
import { CookieService } from 'ngx-cookie-service';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';
import { getClientDataFormat } from 'src/app/tabs/shared/utilities/utility';
import { CreateUserMasterComponent } from '../../../shared/components/create-user-master/create-user-master.component';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'owner-create-update',
  templateUrl: './owner-create-update.component.html',
  styleUrls: ['./owner-create-update.component.scss']
})
export class OwnerCreateUpdateComponent implements OnInit {

  @ViewChild('fileInput') fileInput: ElementRef

  baseUrl = '';
  static id = 100;
  form: FormGroup;
  fileSize = 0;

  today = new Date();
  mode: 'create' | 'update' = 'create';
  isCancel: boolean = false;
  dateFormat = '';
  addressTypeId: number = 24;
  addressType: string;
  address: Address;
  bankDetails: BankDetails;
  ownership: Ownership;
  ownerships: Ownership[];
  metadata: Metadata;
  metadataCountries: Master[];
  metadataDocumentTypes: Master[];
  metadataTitles: Master[];
  metadataAddressTypes: Master[];
  metadataUnits: MetadataUnit[];
  filteredTitles: Master[];
  filteredAddressTypes: Master[];
  filteredCountries: Master[];
  filteredDocumentTypes: Master[];
  filteredUnits: MetadataUnit[];
  length: number;
  image: any
  response: any;
  documentResponse: any;
  documents: any = [];
  duplicateTRN: string = '';
  parameterValue: boolean = true;
  emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{3,4}$";

  isUploadSuccess: boolean = true;
  errorMessage: string = '';
  isDocumentUploadSuccess: boolean = true;

  documentName: string = '';
  selectedDocument: File;

  subject$: ReplaySubject<Documents[]> = new ReplaySubject<Documents[]>(1);
  data$: Observable<Documents[]> = this.subject$.asObservable();

  ownershipsubject$: ReplaySubject<Ownership[]> = new ReplaySubject<Ownership[]>(1);
  ownershipdata$: Observable<Ownership[]> = this.ownershipsubject$.asObservable();

  isCompanySelected: boolean;
  isLoginEnabled: boolean;
  isOwner: boolean;
  clientId: number;
  regex: string = "^[a-zA-Z0-9]$"; //"^$|^[A-Za-z0-9]+$";// "^([A-Za-z0-9]{0,})$"; //"^$|^[A-Za-z0-9]+$"; //"/^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/"; //'(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[A-Za-z\d]';

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

  downloadVar: string = '';

  ownershipcolumns: ListColumn[] = [
    //{ name: 'Checkbox', property: 'checkbox', visible: true },
    { name: 'Unit', property: 'unit', visible: true, isModelProperty: true },
    { name: 'Start Date', property: 'startDateLocal', visible: true, isModelProperty: true },
    { name: 'Modify', property: 'actions', visible: true }
  ] as ListColumn[];

  ownershippageSize = 10;
  ownershipdataSource: MatTableDataSource<Ownership> | null;

  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: Owner,
    private ownerService: OwnerService, private date: DatePipe,
    private dialogRef: MatDialogRef<OwnerCreateUpdateComponent>,
    private fb: FormBuilder, private metadataService: MetadataService,
    private fv: FormValidators, private constantsService: ConstantsService,
    private fileService: FileService, private masterService: MasterService,
    private snackbar: MatSnackBar, private dialog: MatDialog,
    private cookieService: CookieService,
    private envService: EnvService) {
    dialogRef.disableClose = true;
    this.fileSize = Math.floor(envService.MaxBytes / 1000000);
    this.baseUrl = envService.backendForFiles;
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;
  }

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  get ownershipVisibleColumns() {
    return this.ownershipcolumns.filter(column => column.visible).map(column => column.property);
  }


  ngOnInit() {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    if (this.defaults) {
      this.mode = 'update';
      this.ownerships = this.defaults.ownerships;
    } else {
      this.defaults = new Owner({});
    }

    this.address = this.defaults.addresses.filter(addresses => addresses.addressTypeId === this.addressTypeId)[0] || new Address({});
    this.bankDetails = this.defaults.bankDetails[0] || new BankDetails({});
    this.ownership = new Ownership({}); //this.defaults.ownerships[0]

    // this.metadata = this.metadataService.getMetadata();
    // this.metadataCountries = this.metadata.countries;
    // this.filteredCountries = this.metadata.countries;
    // this.metadataDocumentTypes = this.metadata.documentTypes;
    // this.filteredDocumentTypes = this.metadata.documentTypes;
    // this.metadataTitles = this.metadata.titles;
    // this.filteredTitles = this.metadata.titles;
    // this.metadataAddressTypes = this.metadata.addressTypes;
    // this.filteredAddressTypes = this.metadata.addressTypes;

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
      this.metadataAddressTypes = data;
      this.filteredAddressTypes = data;
      this.updateAddressIcons();
    });

    //this.metadataUnits = this.metadata.units;
    //this.filteredUnits = this.metadata.units;
    this.ownerService.getUnits(this.clientId).subscribe((units: MetadataUnit[]) => {
      this.metadataUnits = units
      this.filteredUnits = units
    })
    this.masterService.getParameterValue('Owner').subscribe((parameterValue: boolean) => {
      if (!parameterValue) {
        this.parameterValue = parameterValue;
      }
    })

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
    if (this.defaults.entityType == 'Owner') {
      this.isOwner = true;
    }
    else {
      this.isOwner = false;
    }

    this.form = this.fb.group({
      id: [this.defaults.id || 0],
      clientId: [this.defaults.clientId],
      trn: [this.defaults.trn || ''],
      title: [this.defaults.title || '', Validators.required],
      // title: [this.defaults.title || ''],
      titleId: [this.defaults.titleId || '', Validators.required],
      // titleId: [this.defaults.titleId || ''],
      firstName: [this.defaults.firstName || '', Validators.required],
      // firstName: [this.defaults.firstName || '', this.fv.nameValidators],
      // lastName: [this.defaults.lastName || '', this.fv.nameValidators],
      lastName: [this.defaults.lastName || '', Validators.required],
      mobile: [this.defaults.mobile || '', this.fv.mobileNumberValidators],
      email: [this.defaults.email || '', this.fv.emailValidators],
      //startDate:[this.defaults.startDate && new Date(this.defaults.startDate).toISOString().substr(0,10) || '', Validators.required],
      //startDate: [this.defaults.startDate || '', Validators.required],
      dob: [this.defaults.dob && new Date(this.defaults.dob).toISOString().substr(0, 10) || ''],
      // dob: [this.defaults.dob && new Date(this.defaults.dob).toISOString().substr(0, 10) || '', Validators.required],
      //dob: [this.defaults.dob || '', Validators.required],
      accountNumber: [this.defaults.accountNumber || '', this.fv.requiredAlphanumericNoSpaces], //(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}
      // ownerName: [this.defaults.companyName || this.defaults.firstName + ' ' + this.defaults.lastName],
      photo: [this.defaults.photo || ''],
      isCompanySelected: [this.defaults.isCompany || false],
      ownerName: [this.defaults.ownerName || ''],
      entityType: [this.defaults.entityType],
      isLoginEnabled: [this.defaults.userDetails.isLoginEnabled],
      isOwner: [this.isOwner],
      //addressType: [this.defaults.addresses[0].addressTypeId],
      address: this.fb.group({
        city: [this.address.city || ''],
        zipPostalCode: [this.address.zipPostalCode || ''],
        address1: [this.address.address1 || ''],
        address2: [this.address.address2 || ''],
        country: [this.address.country || ''],
        countryId: [this.address.countryId || 0],
        addressType: [this.address.addressType || ''],
        addressTypeId: [this.address.addressTypeId || ''],
        email: [this.address.email || ''],
        phoneNumber: [this.address.phoneNumber || '']
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
      ownerships: this.fb.group({
        id: [this.ownership.id || 0],
        unitId: [this.ownership.unitId || 0],
        unit: [this.ownership.unit || ''],
        startDate: [this.ownership.startDate && new Date(this.ownership.startDate).toISOString().substr(0, 10) || ''],
      }),
    });
    if (this.defaults) {
      if (this.mode === 'update' && this.form.controls.accountNumber.value) {
        this.form.get('accountNumber').disable();
      }
    }

    this.enbaleAddressValidators();


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

    this.ownerships = this.defaults.ownerships || [];
    this.bindOwnershipDetails();

    // this.isCompanySelected = (this.defaults.companyName || '') !== '' ? true : false;
    this.isLoginEnabled = (this.defaults.userDetails.isLoginEnabled || '') !== '' ? true : false;

    this.isCompanySelected = this.defaults.isCompany;

    this.form.controls.title.valueChanges.subscribe(newTitle => {
      this.filteredTitles = this.filterTitle(newTitle);
    });
    this.form.controls.address.get('addressType').valueChanges.subscribe(newAddressType => {
      this.filteredAddressTypes = this.filterAddressType(newAddressType);
    });
    this.form.controls.address.get('country').valueChanges.subscribe(newCountry => {
      if (newCountry != '')
        this.filteredCountries = this.filterCountry(newCountry);
      else
        this.filteredCountries = this.metadataCountries;
    });
    this.form.controls.documentType.valueChanges.subscribe(newDocumentType => {
      this.filteredDocumentTypes = this.filterDocumentType(newDocumentType);
    });
    this.form.controls.ownerships.get('unit').valueChanges.subscribe(newUnit => {
      this.filteredUnits = this.filterUnits(newUnit);
    });
  }

  getDocumentTypes() {
    this.masterService.getUserMasterdata(20, 0).subscribe((data: Master[]) => {
      this.metadataDocumentTypes = data;
      this.filteredDocumentTypes = data;
    });
  }

  filterTitle(name: string) {
    return this.metadataTitles.filter(title =>
      title.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  filterAddressType(name: string) {
    return this.metadataAddressTypes.filter(addressType =>
      addressType.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  filterCountry(name: string) {
    if (name != '') {
      return this.metadataCountries.filter(country =>
        country.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
    }
    else {
      return this.metadataCountries;
    }
  }

  getFilteredCountry() {
    this.filteredCountries = this.filterCountry(this.form.controls.address.get('country').value);
  }

  filterDocumentType(name: string) {
    return this.metadataDocumentTypes.filter(documentType =>
      documentType.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  filterUnits(name: string) {
    return this.metadataUnits.filter(unit =>
      unit.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  getAddressType(name: string) {
    this.filteredAddressTypes = this.filterAddressType(name);
  }

  bindOwnershipDetails() {
    this.ownerships.forEach(x => { x.startDateLocal = this.date.transform(x.startDate.toString(), this.dateFormat.toString()); })
    this.ownershipsubject$.next(this.ownerships);
    this.ownershipdataSource = new MatTableDataSource(this.ownerships);
    this.ownershipdata$.pipe(
      filter(data => !!data)
    ).subscribe((ownerships) => {
      this.ownerships = ownerships;
      this.ownershipdataSource.data = ownerships;
    });
    length = this.ownerships.length;

  }

  save() {
    this.updateAddress();
    this.updateBankDetails();
    let valid = true;
    // if (this.isOwner) {
    //   valid = this.enabledOwnershipValidators();
    // };
    this.documents.forEach((document) => {
      document.documentPath = document.documentPath + ',' + document.document
    })
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
      return;
    }
    if (this.form.valid && valid) {
      if (this.mode === 'create') {
        this.createOwner();
      } else if (this.mode === 'update') {
        this.updateOwner();
      }
    } else {
      this.notificationMessage('Form validation failed', 'red-snackbar');
      return;
    }
  }

  createOwner() {
    Object.assign(this.defaults, this.form.value);

    this.defaults.trn = this.form.controls.trn.value.toString();
    this.defaults.isCompany = this.isCompanySelected;
    this.defaults.photo = this.response;
    if (this.isCompanySelected) {
      this.defaults.ownerName = this.form.controls.ownerName.value;
    }
    else {
      this.defaults.ownerName = this.defaults.firstName + ' ' + this.defaults.lastName;
    }
    this.defaults.ownerships = this.ownerships;
    if (this.defaults.userDetails.isLoginEnabled !== this.isLoginEnabled) {
      this.defaults.userDetails.isLoginActivated = true;
    }
    else {
      this.defaults.userDetails.isLoginActivated = false;
    }
    this.defaults.userDetails = this.createUserDetails();
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
      this.dialogRef.close(new Owner(this.defaults));
    }
  }

  createUserDetails() {
    const userDetails: UserDetails = {
      username: this.defaults.accountNumber,
      email: this.defaults.email,
      password: this.getRandomString(15),
      role: 'External',
      designation: 'External',
      image: this.defaults.photo,
      isLoginEnabled: this.isLoginEnabled,
      userClients: [{
        clientId: Number(parseInt(this.cookieService.get('globalClientId')))
      }]
    };
    return userDetails;
  }

  saveOwnership() {
    if (this.form.controls.ownerships.valid) {
      let unitId = this.form.controls.ownerships.get('unitId').value;
      if (this.ownerships.findIndex((existingOwnership) => existingOwnership.unitId === unitId)) {

        this.ownerships.push({
          id: 0,
          unitId: this.form.controls.ownerships.get('unitId').value,
          unit: this.form.controls.ownerships.get('unit').value,
          startDate: this.form.controls.ownerships.get('startDate').value
        })
        this.bindOwnershipDetails();
        this.form.controls.ownerships.reset();
      }
    }
  }

  deleteOwnership(existingOwnership) {
    this.ownerships.splice(this.ownerships.findIndex((element) => element.id === existingOwnership.id), 1);
    this.bindOwnershipDetails();
  }

  getRandomString(length) {
    if (this.defaults.userDetails.isLoginActivated == true) {
      var randomChars = 'P@Qr$#S' + Guid.create().toString();
      return randomChars.substring(0, length - 1);
    }
  }



  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: [cssClass],
    });
  }


  updateOwner() {
    Object.assign(this.defaults, this.form.value);

    this.defaults.trn = this.form.controls.trn.value.toString();
    this.defaults.isCompany = this.isCompanySelected;
    if (this.response !== undefined) {
      this.defaults.photo = this.response;
    }
    if (this.defaults.userDetails.isLoginEnabled !== this.isLoginEnabled) {
      this.defaults.userDetails.isLoginActivated = true;
    }
    else {
      this.defaults.userDetails.isLoginActivated = false;
    }
    this.defaults.userDetails = this.updateUserDetails();
    if (this.isCompanySelected) {
      this.defaults.ownerName = this.form.controls.ownerName.value;
    }
    else {
      this.defaults.ownerName = this.defaults.firstName + ' ' + this.defaults.lastName;
    }
    this.defaults.ownerships = this.ownerships;
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
      console.log(JSON.stringify(this.defaults))
      this.dialogRef.close(new Owner(this.defaults));
    }
  }

  updateUserDetails() {
    const userDetails: UserDetails = {
      id: this.defaults.userId,
      username: this.defaults.accountNumber,
      password: this.getRandomString(15),
      email: this.defaults.email,
      role: 'External',
      designation: 'External',
      image: this.defaults.photo,
      isLoginEnabled: this.isLoginEnabled,
      userClients: [{
        clientId: Number(parseInt(this.cookieService.get('globalClientId')))
      }]
    };
    return userDetails;
  }

  isCreateMode() {
    return this.mode === 'create';
  }

  isUpdateMode() {
    return this.mode === 'update';
  }

  changeAddressType(event) {
    // this.updateAddress();
    this.addressType = event.option.value;
    this.metadataAddressTypes.forEach(addressType => {
      if (this.addressType === addressType.description) {
        this.addressTypeId = addressType.id;
      }
    })
    this.address = this.defaults.addresses.filter(addresses => addresses.addressTypeId === this.addressTypeId)[0] || new Address({});
    this.form.controls.address = this.fb.group({
      city: [this.address.city || ''],
      zipPostalCode: [this.address.zipPostalCode || ''],
      address1: [this.address.address1 || ''],
      address2: [this.address.address2 || ''],
      country: [this.address.country || ''],
      countryId: [this.address.countryId || 0],
      addressType: [this.addressType || ''],
      addressTypeId: [this.address.addressTypeId || ''],
      email: [this.address.email || ''],
      phoneNumber: [this.address.phoneNumber || '']
    })
    this.enbaleAddressValidators();
  }

  updateAddress() {
    if (this.form.controls.address.valid) {
      let found = false;
      this.defaults.addresses.forEach(address => {
        if (address.addressTypeId === this.addressTypeId) {
          found = true;
          Object.assign(address, this.form.controls.address.value);
          address.addressType = this.addressType;
        }
      })

      if (!found) {
        let newAddress = { addressTypeId: this.addressTypeId };
        Object.assign(newAddress, this.form.controls.address.value);
        Object.assign(newAddress, { addresstype: this.addressType });
        this.defaults.addresses.push(new Address(newAddress));
      }
    }
  }



  updateBankDetails() {
    if (this.form.controls.bank.valid) {
      if (this.defaults.bankDetails[0]) {
        Object.assign(this.defaults.bankDetails[0], this.form.controls.bank.value);

      } else {
        this.defaults.bankDetails.push(new BankDetails(this.form.controls.bank.value));
      }
    }
  }


  uploadPhoto(fileInputEvent: any) {
    this.image = 'assets/img/avatars/two.png';
    this.errorMessage = '';

    this.fileService.upload(fileInputEvent.target.files[0], "image")
      .subscribe({
        next: (fileName) => {
          this.response = fileName;
          this.image = this.baseUrl + "/uploads/" + fileName;
          this.isUploadSuccess = true;
        },
        error: (err) => {
          this.isUploadSuccess = false;
          this.errorMessage = err["error"].message == undefined ? err["error"].Message : err["error"].message;
          if (this.errorMessage == 'Request body too large.') {
            this.errorMessage = "Max. allowed File size is " + this.fileSize + "MB. Please upload file with smaller size.";
          }
        }
      });
  }

  selectDocument(fileInputEvent: any) {
    this.selectedDocument = null;
    this.fileService.upload(fileInputEvent.target.files[0])
      .subscribe({
        next: (fileName) => {
          this.documentResponse = fileName;
          this.selectedDocument = fileInputEvent.target.files[0];
          this.isDocumentUploadSuccess = true;
        },
        error: (err) => {
          this.isDocumentUploadSuccess = false;
          this.errorMessage = err["error"].message; this.errorMessage = err["error"].message == undefined ? err["error"].Message : err["error"].message;
          if (this.errorMessage == 'Request body too large.') {
            this.errorMessage = "Max. allowed File size is " + this.fileSize + "MB. Please upload file with smaller size.";
          }
        }
      });

    // this.fileService
    //   .upload(fileInputEvent.target.files[0])
    //   .subscribe({
    //     next: (fileName) => {
    //       this.documentResponse = fileName;
    //       //this.fileName = this.baseUrl + "uploads/" + fileName;
    //       this.selectedDocument = fileInputEvent.target.files[0];
    //     },
    //     error: (err) => {
    //       this.notificationMessage('File upload failed.', 'red-snackbar');
    //     }
    //   });

    // this.selectedDocument = fileInputEvent.target.files[0];
    // this.fileService.upload(fileInputEvent.target.files[0])
    //   .subscribe(fileName => {
    //     this.documentResponse = fileName
    //     //this.fileName = this.baseUrl + 'uploads/' + fileName  
    //   });
  }

  uploadDocument() {
    if (this.form.controls.documentType.value && this.form.controls.documentType.value !== '' && this.selectedDocument && this.isDocumentUploadSuccess) {
      this.documents.push({
        documentTypeId: this.form.controls.documentTypeId.value,
        documentType: this.form.controls.documentType.value,
        document: this.selectedDocument['name'],
        documentPath: this.documentResponse
      })

      this.subject$.next(this.documents);
      this.form.controls.documentType.setValue('');
      this.form.controls.documentTypeId.setValue(0);
      this.fileInput.nativeElement.value = "";
      this.selectedDocument = undefined;
      // this.documentResponse = undefined;
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
        let index = this.documents.findIndex((element) => element.documentType === existingDocument['documentType']);
        if (index >= 0)
          this.documents.splice(index, 1);
        this.subject$.next(this.documents);
      }
    });
  }

  toggleOwner(event) {
    this.isOwner = event.checked || false;
    if (this.form.controls.isOwner.value === true) {
      this.form.controls.entityType.setValue('Owner');
    }
    else {
      this.form.controls.entityType.setValue('Tenant');
    }
  }

  toggleCompany(event) {
    this.isCompanySelected = event.checked || false;
    if (this.isCompanySelected === false) {
      this.form.controls.ownerName.setValue(this.defaults.firstName + ' ' + this.defaults.lastName);
      this.form.get('ownerName').clearValidators();
      this.form.get('ownerName').updateValueAndValidity();
    }
    else {

      this.form.get('ownerName').setValidators(Validators.required);
      this.form.get('ownerName').updateValueAndValidity();
      this.form.controls.ownerName.setValue(this.defaults.ownerName);
    }
  }

  toggleLoginEnabled(event) {
    this.isLoginEnabled = event.checked || false;
    if (this.isLoginEnabled && !this.form.controls.accountNumber.value) {
      this.form.get('accountNumber').setValidators(Validators.required);
      this.form.get('accountNumber').updateValueAndValidity();
    }
    else {
      this.form.get('accountNumber').clearValidators();
      this.form.get('accountNumber').updateValueAndValidity();
    }
  }

  setEmailValidator() {
    if (this.form.controls.address.get('email').value != '') {
      this.form.controls.address.get('email').setValidators(Validators.pattern(this.emailPattern));
      this.form.controls.address.get('email').updateValueAndValidity();
    }
    else {
      this.form.controls.address.get('email').clearValidators();
      this.form.controls.address.get('email').updateValueAndValidity();
    }
  }

  enbaleAddressValidators() {
    let countryId;

    const address = this.form.controls.address;
    if (this.metadataCountries) {
      this.metadataCountries.forEach(country => {
        if (country.description == address.value.country) {
          countryId = country.id;
        }
      })
    }

    if (address.value.address1 !== '' || address.value.address2 !== ''
      || address.value.city !== '' || address.value.zipPostalCode !== ''
      || address.value.country !== '' || address.value.email !== '' || address.value.phoneNumber) {

      this.form.controls.address = this.fb.group({
        city: [address.value.city || ''],
        zipPostalCode: [address.value.zipPostalCode || ''],
        address1: [address.value.address1 || ''],
        address2: [address.value.address2 || ''],
        country: [address.value.country || ''],
        countryId: [countryId || 0],
        addressType: [address.value.addressType || ''],
        addressTypeId: [this.addressTypeId || 0],
        email: [address.value.email || ''],
        phoneNumber: [address.value.phoneNumber || '']
      })
    } else {

      this.form.controls.address = this.fb.group({
        city: [address.value.city || ''],
        zipPostalCode: [address.value.zipPostalCode || ''],
        address1: [address.value.address1 || ''],
        address2: [address.value.address2 || ''],
        country: [address.value.country || ''],
        countryId: [countryId || 0],
        addressType: [address.value.addressType || ''],
        addressTypeId: [this.addressTypeId || 0],
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

  enabledOwnershipValidators() {
    // const ownership = this.form.controls.ownerships;

    // if (ownership.value.unit !== '' || ownership.value.startDate !== '') {

    //   this.form.controls.ownerships = this.fb.group({
    //     unitId: [ownership.value.unitId || 0],
    //     unit: [ownership.value.unit || ''],
    //     startDate: [ownership.value.startDate || '', Validators.required],


    //   })
    // } else {

    //   this.form.controls.ownerships = this.fb.group({
    //     unitId: [ownership.value.unitId || 0],
    //     unit: [ownership.value.unit || ''],
    //     startDate: [ownership.value.startDate || ''],

    //   })
    let valid = false;
    if (this.ownershipdataSource && this.ownershipdataSource.data.length) {
      valid = true;
    }
    return valid;
  }

  selectTitle(event) {
    this.metadataTitles.forEach(title => {
      if (event.option.value == title.description) {
        this.form.controls.titleId.setValue(title.id);
      }
    })
  }

  selectDocumentType(event) {
    //this.fileInput.nativeElement.value = ""
    //this.selectedDocument = undefined;
    this.documentName = '';
    this.documents.find(element => {
      if (element.documentType == event.option.value) {
        this.documentName = event.option.value + ' already uploaded';
        return;
      }
    })
    this.metadataDocumentTypes.forEach(documentType => {
      if (event.option.value == documentType.description) {
        this.form.controls.documentTypeId.setValue(documentType.id);

      }
    })
  }

  selectUnit(event) {
    this.metadataUnits.forEach(unit => {
      if (event.option.value == unit.description) {
        this.form.controls.ownerships.get('unitId').setValue(unit.id);
      }
    })
  }

  addAddress() {
    const address: Address = {};
    Object.assign(address, this.form.controls.address.value)
    if (this.defaults.addresses && this.defaults.addresses.length) {
      const itemIndex = this.defaults.addresses.findIndex(x => x.addressTypeId == address.addressTypeId);
      if (itemIndex > -1) {
        this.defaults.addresses.splice(itemIndex, 1);
      }
    }
    this.defaults.addresses.push(address);
    this.updateAddressIcons();
  }

  checkTRNDuplication() {
    this.duplicateTRN = '';
    let tRNNumber = this.form.controls.trn.value;
    if ((tRNNumber != '') || (tRNNumber != null))
      this.ownerService.checkTRNDuplication(1, tRNNumber, this.defaults.id).subscribe(data => {
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

  updateAddressIcons() {
    if (this.filteredAddressTypes && this.filteredAddressTypes.length) {
      this.filteredAddressTypes.forEach(addressType => {
        if (this.defaults.addresses && this.defaults.addresses.length) {
          const address = this.defaults.addresses.find(x => x.addressTypeId === addressType.id);
          if (address) {
            addressType.defaultValue = 'check';
          } else {
            addressType.defaultValue = 'library_add';
          }
        } else {
          addressType.defaultValue = 'library_add';
        }
      });
    }
  }

  createDocumentType() {
    let modes = [0, 20];
    this.dialog.open(CreateUserMasterComponent, { data: modes }).afterClosed().subscribe((message: any) => {
      if (message && message == 'Success') {
        this.getDocumentTypes();
      }
    });
  }

}

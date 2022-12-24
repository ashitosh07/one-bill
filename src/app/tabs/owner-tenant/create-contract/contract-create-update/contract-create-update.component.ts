import { Component, Inject, OnInit, ElementRef, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Contract } from './contract.model';
import { MetadataTenant } from 'src/app/tabs/shared/models/metada.tenant.model';
import { MetadataUnit } from 'src/app/tabs/shared/models/metadata.unit.model';
import { ContractService } from 'src/app/tabs/shared/services/contract.service';
import { Observable, ReplaySubject } from 'rxjs';
import { Metadata } from '../../../shared/models/metadata.model';
import { DatePipe } from '@angular/common';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { OwnerBillGroup } from '../../../shared/models/owner-bill-group';
import { MatTableDataSource } from '@angular/material/table';
import { MatOption } from '@angular/material/core';
import { filter } from 'rxjs/operators';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { MasterService } from 'src/app/tabs/shared/services/master.service';
import { DeviceList } from 'src/app/tabs/shared/models/device-list.model';
import { UserConfirmationPopupComponent } from '../../../shared/components/user-confirmation-popup/user-confirmation-popup.component';
import { CancelConfirmationDialogComponent } from 'src/app/tabs/shared/components/cancel-confirmation-dialog/cancel-confirmation-dialog.component';
import { CookieService } from 'ngx-cookie-service';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';
import { getClientDataFormat } from 'src/app/tabs/shared/utilities/utility';

@Component({
  selector: 'contract-create-update',
  templateUrl: './contract-create-update.component.html',
  styleUrls: ['./contract-create-update.component.scss']
})
export class ContractCreateUpdateComponent implements OnInit {

  static id = 100;
  securityDepositExist: boolean = false;
  clientId: number;
  selectedUtilities = [];
  selectedUserUtilities: any = [];
  selectedDBUtilities: OwnerBillGroup[] = [];
  selectedData: any = [];
  groupId: number = 1;
  isDuplicate: boolean = false;
  isCancel: boolean = false;
  isAssignToOwner: boolean = false;
  isUtilitiesMapped: boolean = false;
  type: string = 'End';
  //Error Display
  error: any = { isError: false, errorMessage: '' };
  isValidDate: any;
  startDate: string;
  endDate: string;
  form: FormGroup;
  mode: 'create' | 'update' | 'renew' | 'delete' = 'create';
  isDisabled: true | false = true;
  show: true | false = false;
  subject$: ReplaySubject<Contract[]> = new ReplaySubject<Contract[]>(1);
  data$: Observable<Contract[]> = this.subject$.asObservable();
  billGroupMsg: boolean = false;
  securityDeposit: number = 0;
  receivedAmount: number = 0;
  refundAmount: number = 0;
  currency = getClientDataFormat('Currency',0);
  roundFormat = getClientDataFormat('RoundOff');

  @ViewChild('allSelected') private allSelected: MatOption;
  @Input()
  displayedColumns: ListColumn[] = [
    { name: 'Bill Group', property: 'groupId', visible: true, isModelProperty: true },
    { name: 'Utility TypeId', property: 'utilityTypeId', visible: false, isModelProperty: true },
    { name: 'Utility Type', property: 'utilityType', visible: true, isModelProperty: true },
    { name: 'Differentiate Consumption', property: 'isDifferenciateConsumption', visible: true, isModelProperty: true },
    { name: 'Modify', property: 'actions', visible: true }
  ] as ListColumn[];

  dataSource: MatTableDataSource<OwnerBillGroup> | null;

  get visibleColumns() {
    return this.displayedColumns.filter(column => column.visible).map(column => column.property);
  }

  metadataTenant: MetadataTenant[];
  metadataUnit: MetadataUnit[];
  metadataUtilityTypes: DeviceList[];
  metadataContractType: Master[];
  //metadataBillFormat: MetadataBillFormat[];
  //metadataBillFormula: MetadataBillFormula[];
  metadata: Metadata;
  filteredTenants: MetadataTenant[];
  filteredUnits: MetadataUnit[];
  filteredContractTypes: Master[];
  filteredUtilityTypes: DeviceList[];
  billGroupId: number;
  billGroupSelected: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: Contract,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private contractService: ContractService,
    private masterService: MasterService,
    private dialogRef: MatDialogRef<ContractCreateUpdateComponent>,
    private cookieService: CookieService) {
    if (this.defaults && this.defaults.type) {
      this.type = this.defaults.type;
    }
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    if (this.defaults) {
      this.isDisabled = true;
      this.selectedUserUtilities = this.selectedDBUtilities = this.defaults.ownerBillGroups;
      // let groups = this.defaults.ownerBillGroups.reduce(function (obj, item) {
      //   obj[item.groupId] = obj[item.groupId] || [];
      //   obj[item.groupId].push(item.utilityType, item.isDifferenciateConsumption);
      //   return obj;
      // }, {});
      // var myArray = Object.keys(groups).map(function (key) {
      //   return { groupId: key, utilityType: groups[key],isDifferenciateConsumption };
      // });

      // this.selectedUserUtilities = myArray;
    }
    else {
      this.defaults = new Contract({});
      this.isDisabled = false;
    }

    this.securityDeposit = this.defaults.securityDeposit;
    this.receivedAmount = this.defaults.receivedAmount;
    this.refundAmount = this.defaults.refundAmount;
    this.clientId = parseInt(this.cookieService.get('globalClientId'));

    //this.metadata = this.metadataService.getMetadata();

    this.contractService.getTenants(this.clientId).subscribe((tenants: MetadataTenant[]) => {
      this.filteredTenants = this.metadataTenant = tenants.map(tenant => new MetadataTenant(tenant));
      //this.filteredTenants = tenants
    });

    if (this.defaults && this.defaults.unitId) {
      this.getUtilitiDetails(this.defaults.unitId);
    }

    this.contractService.getUnits(this.clientId).subscribe((units: MetadataUnit[]) => {
      this.metadataUnit = this.filteredUnits = units.map(unit => new MetadataUnit(unit));
      this.metadataUnit = this.filteredUnits;
    });

    this.masterService.getSystemMasterdata(4, 0).subscribe((data: Master[]) => {
      this.metadataContractType = this.filteredContractTypes = data;
    });

    // if(this.metadata)
    // {
    // this.metadataUnit = this.metadata.units;
    // this.filteredUnits = this.metadata.units;
    //this.metadataUtilityType = this.metadata.utilityTypes;
    //   this.metadataContractType = this.metadata.contractTypes;
    //   this.filteredContractTypes = this.metadata.contractTypes;
    // }
    //this.metadataBillFormat = this.metadata.billFormats;
    //this.metadataBillFormula = this.metadata.billFormulas;    

    this.form = this.fb.group({
      id: [this.defaults.id || ContractCreateUpdateComponent.id++],
      contractDate: [this.defaults.contractDate || '', Validators.required],  //&& new Date(this.defaults.contractDate).toISOString().substr(0, 10)
      tenantId: [this.defaults.tenantId || '', Validators.required],
      tenantName: [this.defaults.tenantName || '', Validators.required],
      unitId: [this.defaults.unitId || '', Validators.required],
      unitNumber: [this.defaults.unitNumber || '', Validators.required],
      //utilityTypeId: [this.defaults.utilityTypeId || '', Validators.required],
      utilityType: [''],
      contractTypeId: [this.defaults.contractTypeId || '', Validators.required],
      contractType: [this.defaults.contractType || '', Validators.required],
      //billFormatId: [this.defaults.billFormatId || '', Validators.required],
      //billFormat: [this.defaults.billFormat || '', Validators.required],
      //billFormulaId: [this.defaults.billFormulaId || '', Validators.required],
      //billFormula: [this.defaults.billFormula || '', Validators.required],
      contractEndDate: [(this.defaults.contractSuspendDate && this.defaults.type === 'Suspend' ? this.defaults.contractSuspendDate : this.defaults.contractEndDate) || '', Validators.required],  // && new Date(this.defaults.contractSuspendDate).toISOString().substr(0, 10)
      reasonForContractSuspend: [this.defaults.reasonForContractSuspend || ''],
      accountNumber: [this.defaults.accountNumber || ''],
      isSecurityDepositPaid: [this.defaults.isSecurityDepositPaid || false],
      securityDeposit: [this.defaults.securityDeposit || '',Validators.pattern(/^\d*.?\d{0,1}$/g)], //'/^(([1-9]|1[0-3])(\.\d\d?)?|14(\.00?)?)$/')],
      receivedAmount: [this.defaults.receivedAmount || 0],
      refundAmount: [this.defaults.refundAmount || 0],
      isAssignToOwner: [this.defaults.isAssignToOwner || false],
      isGroupBill: [this.defaults.isGroupBill || false],
      isDifferenciateConsumption: [null || false],
      ownerBillGroups: [this.defaults.ownerBillGroups],
      billGroup: ['']
    });
    //this.form.get('securityDeposit').disable();
    if (this.defaults && this.defaults.isSecurityDepositPaid) {
      this.securityDepositExist = this.defaults.isSecurityDepositPaid;
    }
    if (this.selectedData && this.selectedData.length == 0) {
      this.form.controls.isDifferenciateConsumption.disable();
    }

    this.validateSecurityDeposit(this.securityDepositExist);
    if (this.defaults) {
      this.billGroupSelected = this.form.controls.isGroupBill.value;
      if (this.defaults.mode === 'update') {
        this.form.get('contractDate').disable();
        this.form.get('contractEndDate').disable();
        this.form.get('receivedAmount').disable();
        this.form.get('refundAmount').disable();
        //this.form.get('securityDeposit').disable();            
        this.mode = 'update';
        this.securityDepositExist = this.defaults.isSecurityDepositPaid;
      }
      else if (this.defaults.mode === 'renew') {
        this.form.get('tenantName').disable();
        this.form.get('unitNumber').disable();
        //this.form.get('utilityType').disable();      
        this.form.get('contractType').disable();
        //this.form.get('billFormat').disable();      
        //this.form.get('billFormula').disable();              
        this.form.get('accountNumber').disable();
        this.form.get('receivedAmount').disable();
        this.form.get('refundAmount').disable();
        //this.form.get('securityDeposit').disable(); 
        this.securityDepositExist = this.defaults.isSecurityDepositPaid;
        this.mode = 'renew';
      }
      else if (this.defaults.mode === 'delete') {
        this.isAssignToOwner = this.defaults.isAssignToOwner;
        this.form.get('contractEndDate').setValue(new Date());
        this.form.get('contractEndDate').disable();
        this.form.get('contractDate').disable();
        this.form.get('tenantName').disable();
        this.form.get('unitNumber').disable();
        this.form.get('utilityType').disable();
        this.form.get('contractType').disable();
        //this.form.get('receivedAmount').disable();      
        //this.form.get('refundAmount').disable();
        this.form.get('receivedAmount').disable();
        this.form.get('refundAmount').disable();
        this.form.get('accountNumber').disable();
        this.form.get('isSecurityDepositPaid').disable();
        this.form.get('securityDeposit').disable();
        this.form.get('isGroupBill').disable();
        this.form.get('billGroup').disable();
        this.form.get('isDifferenciateConsumption').disable();
        this.securityDepositExist = this.defaults.isSecurityDepositPaid;
        this.mode = 'delete';
        this.fb.group({ reasonForContractSuspend: [this.defaults.reasonForContractSuspend || ''] });
      }
    }
    this.show = false;

    this.subject$.next(this.selectedUserUtilities);
    this.dataSource = new MatTableDataSource(this.selectedUserUtilities);

    this.data$.pipe(
      filter(data => !!data)
    ).subscribe((utilities) => {
      this.selectedUtilities = utilities;
      this.dataSource.data = utilities;
    });

    this.form.controls.tenantName.valueChanges.subscribe(newTenant => {
      this.filteredTenants = this.filterTenant(newTenant);
    });
    this.form.controls.unitNumber.valueChanges.subscribe(newUnit => {
      this.filteredUnits = this.filterUnit(newUnit);
    });
    this.form.controls.contractType.valueChanges.subscribe(newContractType => {
      this.filteredContractTypes = this.filterContractType(newContractType);
    });
  }

  getTenants() {
    this.filteredTenants = this.filterTenant('');
  }

  filterTenant(name: string) {
    if ((this.form.controls.tenantName.pristine) && (this.mode != 'create')) {
      return [];
    }
    else {
      return this.metadataTenant.filter(tenant =>
        tenant.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
    }
  }

  filterUnit(name: string) {
    return this.metadataUnit.filter(unit =>
      unit.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  filterContractType(name: string) {
    return this.metadataContractType.filter(contractType =>
      contractType.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  getUtilitiDetails(unitId) {
    this.contractService.getUtilityDetails(this.clientId, unitId).subscribe((utilities: DeviceList[]) => {
      // utilities.push({utilityType: 'BTU-101',id: 101});
      // utilities.push({utilityType: 'BTU-102',id: 102});
      // utilities.push({utilityType: 'Electricity-103',id: 103});
      // utilities.push({utilityType: 'Electricity-104',id: 104});

      this.metadataUtilityTypes = this.filteredUtilityTypes = utilities;
    });
  }

  amountInputChanged(value)
  {
    let amount = value.replace(",", "");
    return Number(amount);
  }

  save() {
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
    if (this.mode === 'create') {
      this.createContract();
    } else if (this.mode === 'update' || this.mode === 'renew' || this.mode === 'delete') {
      this.updateContract();
    }
  }

  createContract() {
    Object.assign(this.defaults, this.form.value);
    this.defaults.contractDate = this.datePipe.transform(this.defaults.contractDate, 'yyyy-MM-dd');
    this.defaults.contractEndDate = this.datePipe.transform(this.defaults.contractEndDate, 'yyyy-MM-dd');
    this.defaults.securityDeposit = this.securityDepositExist == true ? this.form.get('securityDeposit').value : 0;
    //this.defaults.isSecurityDepositPaid = this.securityDepositExist;
    this.defaults.ownerBillGroups = this.selectedDBUtilities;
    this.defaults.clientId = this.clientId;
    this.defaults.securityDeposit = parseFloat(this.form.controls.securityDeposit.value == '' ? '0' : this.form.controls.securityDeposit.value);
    this.defaults.receivedAmount = parseFloat(this.form.controls.receivedAmount.value == '' ? '0' : this.form.controls.receivedAmount.value);
    this.defaults.refundAmount = parseFloat(this.form.controls.refundAmount.value == '' ? '0' : this.form.controls.refundAmount.value);
    this.dialogRef.close(new Contract(this.defaults));
  }

  updateContract() {
    Object.assign(this.defaults, this.form.value);
    this.defaults.contractDate = this.datePipe.transform(this.defaults.contractDate, 'yyyy-MM-dd');
    if (this.defaults.contractSuspendDate) {
      this.defaults.contractSuspendDate = this.datePipe.transform(this.defaults.contractSuspendDate, 'yyyy-MM-dd');
    }
    if (this.defaults.contractEndDate) {
      this.defaults.contractDate = this.datePipe.transform(this.defaults.contractDate, 'yyyy-MM-dd');
    }
    this.defaults.mode = this.mode;
    this.defaults.securityDeposit = this.securityDepositExist == true ? parseFloat(this.form.get('securityDeposit').value.replace(',','')) : 0;
    //this.defaults.isSecurityDepositPaid = this.securityDepositExist;
    this.defaults.ownerBillGroups = this.selectedDBUtilities;
    this.defaults.clientId = this.clientId;
    this.defaults.securityDeposit = parseFloat(this.form.controls.securityDeposit.value == '' ? '0' : this.form.controls.securityDeposit.value);
    this.defaults.receivedAmount = parseFloat(this.form.controls.receivedAmount.value == '' ? '0' : this.form.controls.receivedAmount.value);
    this.defaults.refundAmount = parseFloat(this.form.controls.refundAmount.value == '' ? '0' : this.form.controls.refundAmount.value);
    this.dialogRef.close(this.defaults);
  }

  isCreateMode() {
    return this.mode === 'create';
  }

  isUpdateMode() {
    return this.mode === 'update';
  }

  isRenewMode() {
    return this.mode === 'renew';
  }

  isDeleteMode() {
    return this.mode === 'delete';
  }

  selectTenant(event) {
    this.metadataTenant.forEach(tenant => {
      if (event.option.value == tenant.description) {
        this.form.controls.tenantId.setValue(tenant.id);
      }
    })
  }

  selectUnit(event) {
    this.metadataUnit.forEach(unit => {
      if (event.option.value == unit.description) {
        this.form.controls.unitId.setValue(unit.id);
        this.onUnitSelect(unit.id);
      }
    })
  }

  selectUtilityType(event) {
    this.metadataUtilityTypes.forEach(utilityType => {
      if (event.option.value == utilityType.utilityType) {
        this.form.controls.utilityTypeId.setValue(utilityType.id);
      }
    })
  }

  selectContractType(event) {
    this.metadataContractType.forEach(contractType => {
      if (event.option.value == contractType.description) {
        this.form.controls.contractTypeId.setValue(contractType.id);
      }
    })
  }

  // selectBillFormat (event) 
  // {
  //   this.metadataBillFormat.forEach(billFormat => {
  //     if(event.option.value == billFormat.description) 
  //     {
  //       this.form.controls.billFormatId.setValue(billFormat.id);
  //     }
  //   })
  // }

  // selectBillFormula (event) 
  // {
  //   this.metadataBillFormula.forEach(billFormula => {
  //     if(event.option.value == billFormula.description) 
  //     {
  //       this.form.controls.billFormulaId.setValue(billFormula.id);
  //     }
  //   })
  // }

  onUnitSelect(unitId) {
    this.contractService.getSecurityDeposit(unitId).subscribe((amount: number) => {
      if (amount != 0)
        this.form.controls.securityDeposit.setValue(amount);
      if (this.form.controls.isSecurityDepositPaid.value == false) {
        this.form.get('securityDeposit').disable();
      }
    });
    this.getUtilitiDetails(unitId);
  }

  toggleSecurityDeposit(value) {
    this.securityDepositExist = !value;
    this.validateSecurityDeposit(this.securityDepositExist);
  }

  validateSecurityDeposit(value) {
    if (value) {
      this.form.get('securityDeposit').enable();
      this.form.get('securityDeposit').setValidators([Validators.required]);
      this.form.get('securityDeposit').updateValueAndValidity();
    }
    else {
      this.form.get('securityDeposit').setValue('');
      this.form.get('securityDeposit').clearValidators();
      this.form.get('securityDeposit').updateValueAndValidity();
      this.form.get('securityDeposit').disable();
    }
  }

  validateDates() {
    this.startDate = this.datePipe.transform(this.form.get('contractDate').value, "MM-dd-yyyy");
    this.endDate = this.datePipe.transform(this.form.get('contractEndDate').value, "MM-dd-yyyy");

    this.isValidDate = true;
    var startYear = new Date(this.startDate).getFullYear();
    var endYear = new Date(this.endDate).getFullYear();
    if ((startYear != 1970) && (endYear != 1970)) {
      if (startYear < endYear) {
        return this.isValidDate;
      }
      else if (startYear > endYear) {
        this.isValidDate = false;
        return this.isValidDate;
      }
      else if (((this.startDate != null) || (this.startDate != '')) && ((this.endDate != null) || (this.endDate != ''))) {
        if ((this.endDate) <= (this.startDate)) {
          this.isValidDate = false;
        }
        return this.isValidDate;
      }
    }
    else {
      return this.isValidDate;
    }
  }

  deleteOwnerBillGroup(existingBillGroup) {
    this.dialog.open(UserConfirmationPopupComponent).afterClosed().subscribe((message: any) => {
      if (message) {
        if(existingBillGroup.isDifferenciateConsumption == true)
        {
          let index = this.selectedUserUtilities.findIndex((element) => element.isDifferenciateConsumption === existingBillGroup.isDifferenciateConsumption && element.groupId == existingBillGroup.groupId);
          if(index > -1)
            this.selectedUserUtilities.splice(index, 2);
        }
        else {
          if (this.mode == 'create') {
              this.selectedUserUtilities.splice(this.selectedUserUtilities.findIndex((element) => element.meterId === existingBillGroup.meterId), 1);
            
            // for (let i = 0; i < existingBillGroup.meterId.length; i++) {
            //   let index = this.selectedDBUtilities.findIndex((element) => element.meterId === existingBillGroup.meterId[i]);
            //   if (index >= 0)
            //     this.selectedDBUtilities.splice(index, 1);
            // }
          }
          else {          
              this.selectedUserUtilities.splice(this.selectedUserUtilities.findIndex((element) => element.utilityType === existingBillGroup.utilityType), 1);          
            
            // for (let i = 0; i < existingBillGroup.utilityType.length; i++) {
            //   let value;
            //   value = existingBillGroup.utilityType[i];
            //   let index = this.selectedDBUtilities.findIndex((element) => element.utilityType === value); //utilityType.indexOf(existingBillGroup.utilityType[i]);
            //   //if(index >= 0)
            //   this.selectedDBUtilities.splice(index, 1);
            // }
          }
        }
        this.isDuplicate = false;

        this.subject$.next(this.selectedUserUtilities);  
        this.enableorDisableBillGroup();
        this.checkUtilityMapping();
      }
    })
  }

  enableorDisableBillGroup()
  {
    if(this.selectedUserUtilities)
    {
      this.selectedUserUtilities.forEach(row => {
        let item = this.selectedUserUtilities.filter(element => element.groupId != row.groupId);
        if(item && item.length > 0)
        {
          this.form.controls.isGroupBill.disable();
        }
        else {
          this.form.controls.isGroupBill.enable();
        }
      });
    }
  }

  toggleAllSelection() {
    if (this.allSelected.selected) {
      this.form.controls.utilityType
        .patchValue([...this.metadataUtilityTypes.map(item => item.id), 0]);
    } else {
      this.form.controls.utilityType.patchValue([]);
    }
  }

  togglePerOne() {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
      //return false;
    }
    let utilityType = this.selectedData.text.replace(/\s/g, "").split(",");
    if (utilityType[0] == "Select All") {
      utilityType = utilityType.splice(1);
    }

    this.form.controls.isDifferenciateConsumption.enable();
    if (utilityType && utilityType.length == 1) {
      this.form.controls.isDifferenciateConsumption.setValue(false);
      this.form.controls.isDifferenciateConsumption.disable();
    }
    else if (utilityType && utilityType.length > 2) {
      this.form.controls.isDifferenciateConsumption.setValue(false);
      this.form.controls.isDifferenciateConsumption.disable();
    }
    else if (utilityType && utilityType.length == 2) {
      let item = utilityType.filter(item => item.substring(0, item.indexOf("-")) != utilityType[0].substring(0, utilityType[0].indexOf("-")));
      //let groupItem = this.selectedUserUtilities.filter(item => item.isDifferenciateConsumption == true && this.billGroupId == item.billGroupId);
      if (item && item.length > 0) //|| (groupItem && groupItem.length > 0))
      {
        this.form.controls.isDifferenciateConsumption.setValue(false);
        this.form.controls.isDifferenciateConsumption.disable();
      }
    }

    if (this.form.controls.utilityType.value.length == this.metadataUtilityTypes.length)
      this.allSelected.select();
  }
  
  validateDifferenciateConsumption()
  {
    this.validateBillGroup();
    let utilityType = this.selectedData.text.replace(/\s/g, "").split(",");  
    if(utilityType[0] == "Select All")  
    {
      utilityType = utilityType.splice(1);
    }
    let item = utilityType.filter(item => item.substring(0,item.indexOf("-")) == utilityType[0].substring(0,utilityType[0].indexOf("-")));  
    let groupItem = this.selectedUserUtilities.filter(item => item.isDifferenciateConsumption == true && this.billGroupId == item.groupId);
    if(groupItem && groupItem.length > 0)
    {
      this.form.controls.isDifferenciateConsumption.setValue(false);
      this.form.controls.isDifferenciateConsumption.disable();
    }
    else if((item.length == 2) && (utilityType.length == 2)) {
      this.form.controls.isDifferenciateConsumption.setValue(false);
      this.form.controls.isDifferenciateConsumption.enable();
    }
  }  

  selectedValue(event: any) {
    let selectedData = {
      value: event.value,
      text: event.source.triggerValue
    };
    this.selectedData = selectedData;
  }

  checkDuplication() {
    this.isDuplicate = false;
    for (let k = 0; k < this.selectedDBUtilities.length; k++) {
      let a = this.selectedDBUtilities[k].meterId;
      //let isDifferenciateConsumption = this.selectedDBUtilities[k].isDifferenciateConsumption;
      const index = this.selectedUtilities.indexOf(a);
      //const value = this.form.controls.isDifferenciateConsumption.value == true ? true : false;
      if (index >= 0) // && (value === isDifferenciateConsumption)) 
      {
        this.isDuplicate = true;
        return this.isDuplicate;
      }
    }
    return this.isDuplicate;
  }

  addBillGroup() {
    if ((this.selectedUtilities.length > 0) && (this.billGroupId > 0 && this.billGroupId != undefined && this.billGroupId != null)) {
      if (!this.checkDuplication()) {
        let utility = this.selectedData?.text.split(",");
        //let groupId = 0;
        // if (this.selectedDBUtilities && this.selectedDBUtilities.length) {
        //   groupId = Math.max.apply(Math, this.selectedDBUtilities.map(function (o) { return o.groupId; }));
        // }
        for (let i = 0; i < this.selectedUtilities.length; ++i) {
          if (this.selectedUtilities[i] != 0)
            this.selectedDBUtilities.push({
              meterId: this.selectedUtilities[i],
              utilityTypeId: this.filteredUtilityTypes?.find(x => x.id === this.selectedUtilities[i])?.utilityTypeId,
              utilityType: this.filteredUtilityTypes?.find(x => x.id === this.selectedUtilities[i])?.utilityType,
              ownerId: this.form.controls.tenantId.value,
              groupId: this.billGroupId,                //groupId + 1,
              isDifferenciateConsumption: this.form.controls.isDifferenciateConsumption.value == true ? true : false
            });
        }

        let utilityTypeIds = this.form.controls.utilityType.value;
        let index = utilityTypeIds.findIndex((x) => x === 0);
        if (index >= 0)
          utilityTypeIds.splice(index, 1);
        let utilities = '';
        let select = this.selectedData.text.indexOf('Select All');
        if (select >= 0) {
          this.metadataUtilityTypes.forEach(x => {
            utilities += x.utilityType + ',';
          })
          utilities = utilities.substr(0, utilities.length - 1);
        }
        else {
          utilities = this.selectedData.text;
        }

        this.selectedUserUtilities = this.selectedDBUtilities;
        // let userGroupId = 0;
        // if (this.selectedUserUtilities && this.selectedUtilities.length) {
        //   groupId = Math.max.apply(Math, this.selectedUserUtilities.map(function (o) { return o.groupId; }));
        // }
        // this.selectedUserUtilities = [];
        // for (let i = 0; i < utilityTypeIds.length; ++i) {
        //   this.selectedUserUtilities.push({
        //     meterId: utilityTypeIds[i],
        //     utilityTypeId: this.filteredUtilityTypes.find(x => x.id === utilityTypeIds[i])?.utilityTypeId,
        //     utilityType: utilities,
        //     ownerId: this.form.controls.tenantId.value,
        //     groupId: userGroupId + 1,
        //     isDifferenciateConsumption: this.form.controls.isDifferenciateConsumption.value
        //   });
        // }

        this.enableorDisableBillGroup();

        this.subject$.next(this.selectedUserUtilities);
        this.form.controls.utilityType.reset();
        this.form.controls.billGroup.reset();
        this.form.controls.isDifferenciateConsumption.reset();
        this.selectedUtilities = null;  
        this.checkUtilityMapping();       
      }
    }
  }

  checkUtilityMapping()
  {
    if(this.selectedUserUtilities?.length > 0 && this.selectedUserUtilities?.length != this.metadataUtilityTypes?.length)
    {
      this.isUtilitiesMapped = true;
    }      
    else {
      this.isUtilitiesMapped = false;
    }  
  }

  enableAssignToOwnerCheckChanged(event) {
    this.isAssignToOwner = event.checked;
  }

  validateBillGroup()
  {
    if((this.billGroupSelected == true) && (this.selectedUserUtilities) && (this.billGroupId != null))
    {
      let row = this.selectedUserUtilities.filter(row => row.groupId != this.billGroupId);
      if(row && row.length > 0)
      {
        this.billGroupMsg = true;   
      }        
    }
    else {
      this.billGroupMsg = false;
    }
  }



  checkValue() {
    this.billGroupSelected = this.form.controls.isGroupBill.value;
    this.validateBillGroup();
  }

  close() {
    this.dialogRef.close();
  }

  closeDialog() {
    this.isCancel = true;
  }

  searchContractType(query: string) {
    let result = this.selectFilteredContractType(query.toLowerCase())
    this.filteredContractTypes = result;
  }

  selectFilteredContractType(query: string): Master[] {
    let result: any[] = [];
    if(query)
    {
      for (let a of this.metadataContractType) {
        if (a.description.toLowerCase().indexOf(query) > -1) {
          result.push(a)
        }
      }
    }
    else {
      return this.metadataContractType;
    }
    return result;
  }

}


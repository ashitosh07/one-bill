import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Metadata } from '../../../shared/models/metadata.model';
import { Billhead } from './billhead.model';
import { BillheadService } from '../../../shared/services/bill-head.service';
import { TariffMaster } from '../../../shared/models/tariff-master.model';
import { MasterService } from 'src/app/tabs/shared/services/master.service';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { CancelConfirmationDialogComponent } from 'src/app/tabs/shared/components/cancel-confirmation-dialog/cancel-confirmation-dialog.component';
import { CookieService } from 'ngx-cookie-service';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';
import { CreateUserMasterComponent } from '../../../shared/components/create-user-master/create-user-master.component';
import { getClientDataFormat } from 'src/app/tabs/shared/utilities/utility';

@Component({
  selector: 'fury-billhead-create-update',
  templateUrl: './billhead-create-update.component.html',
  styleUrls: ['./billhead-create-update.component.scss']
})
export class BillheadCreateUpdateComponent implements OnInit {
  accountHead: string = '';
  headType: string = '';
  tariffName: string = '';
  formulaApplied: string = '';
  static id = 100;
  isValid: any;
  form: FormGroup;
  mode: 'create' | 'update' = 'create';
  selectedAccountNumber: number;
  VATExist: boolean = false;
  isDiscount: boolean = false;
  isCancel: boolean = false;
  isCustomDays: boolean = false;

  metadataBillHeadTypes: Master[];
  metadata: Metadata;
  metadataUtilityTypes: Master[];
  metadataBillFormulas: Master[];
  metadataOperators: Master[];
  metadatatariffs: TariffMaster[];
  metadataBillingLedger: Master[];
  metedataBillLines: Billhead[];
  metadataContractTypes: Master[];
  metadataDiscountTypes: ListItem[] = [{ label: 'Fixed', value: 1 }, { label: 'Percentage', value: 2 }];
  filteredUtilityTypes: Master[];
  filteredBillFormulas: Master[];
  filteredFormula: Master[];
  filteredOperators: Master[];
  filteredTariffs: TariffMaster[];
  filteredBillHeadTypes: Master[];
  filteredContractTypes: Master[];
  isConsumptionCharge: boolean = false;
  calculationType: string;
  isTariff: boolean = false;
  isFormula: boolean = false;
  utilityType: string = '';
  clientId: number;
  duplicatePosition: string = '';
  isMeasuringUnitTH: boolean = false;
  isBillSettingClientMapped: boolean = false;
  fixedAmount: number = 0;
  discountAmount: number = 0;
  currency = getClientDataFormat('Currency');
  roundFormat = getClientDataFormat('RoundOff');

  @ViewChild('automcomplete') autocomplete;

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: Billhead,
    private dialogRef: MatDialogRef<BillheadCreateUpdateComponent>,
    private fb: FormBuilder, private masterService: MasterService,
    private billHeadService: BillheadService, private dialog: MatDialog,
    private cookieService: CookieService) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    if (this.defaults) {
      this.mode = 'update';
      this.selectedAccountNumber = this.defaults.accountNumber;
      this.isMeasuringUnitTH = this.defaults.measuringUnitId == 2 ? true : false;
      this.utilityType = this.defaults.utilityType;
      this.accountHead = this.defaults.accountNumberName;
      this.headType = this.defaults.headType;
      this.fixedAmount = this.defaults.fixedAmount;
      this.discountAmount = this.defaults.discountAmount;
    } else {      
      this.defaults = new Billhead({});
    }
    
    this.clientId = parseInt(this.cookieService.get('globalClientId'));

    this.masterService.getSystemMasterdata(25, 0).subscribe((data: Master[]) => {
      data = data.filter(x => x.description != 'Security Deposit');
      this.metadataBillHeadTypes = data;
      this.filteredBillHeadTypes = data;
    });
    this.masterService.getSystemMasterdata(16, 0).subscribe((data: Master[]) => {
      this.metadataUtilityTypes = data;
      this.filteredUtilityTypes = data;
    });
    this.masterService.getSystemMasterdata(53, 0).subscribe((data: Master[]) => {
      this.metadataBillFormulas = data;
      this.filteredBillFormulas = data;
      this.filteredFormula = data;
      this.getBillFormula();
    });
    this.masterService.getSystemMasterdata(54, 0).subscribe((data: Master[]) => {
      this.metadataOperators = data;
      this.filteredOperators = data;
    });
    // this.masterService.getUserMasterdata(56, 149).subscribe((data: Master[]) => {
    //   this.metadataBillingLedger = data;
    // });
    this.getBillingLedgers();
    this.masterService.getSystemMasterdata(4, 0).subscribe((data: Master[]) => {      
      this.metadataContractTypes = this.filteredContractTypes = data;
    });
    // this.metadataService.invokeMetadata();
    // this.metadata = this.metadataService.getMetadata();
    // this.metadataBillHeadTypes = this.metadata.billHeadTypes;
    // this.filteredBillHeadTypes = this.metadata.billHeadTypes;

    // this.metadataUtilityTypes = this.metadata.utilityTypes;
    // this.filteredUtilityTypes = this.metadata.utilityTypes;

    // this.metadataBillFormulas = this.metadata.billFormulas;
    // this.filteredBillFormulas = this.metadata.billFormulas;

    // this.metadataOperators = this.metadata.operators;
    // this.filteredOperators = this.metadata.operators;
    //this.metadataBillingLedger = this.metadata.billingLedgers;

    this.form = this.fb.group({
      id: [this.defaults.id || 0],
      accountHeadName: [this.defaults.accountHeadName || '', Validators.required],
      accountHeadType: [this.defaults.accountHeadType || '', Validators.required],
      headType: [this.defaults.headType || '', Validators.required],
      fixedAmount: [this.defaults.fixedAmount || '', Validators.required],
      accountNumber: [this.defaults.accountNumber || '', Validators.required],
      utilityTypeId: [this.defaults.utilityTypeId || ''],
      utilityType: [this.defaults.utilityType || ''],
      contractType: [this.defaults.contractType || '', Validators.required],
      contractTypeId: [this.defaults.contractTypeId || '0', Validators.required],
      formulaField: [this.defaults.formulaField || ''],
      formulaFieldName: [this.defaults.formulaFieldName || ''],
      operator: [this.defaults.operator || ''],
      operatorName: [this.defaults.operatorName || ''],
      tariffId: [this.defaults.tariffId || ''],
      tariff: [this.defaults.tariff || ''],
      noOfDays: [this.defaults.noOfDays || 0],
      position: [this.defaults.position || '', Validators.required],
      MeasuringUnitId: [this.defaults.measuringUnitId == 2 ? true : false || false],
      isVAT: [this.defaults.isVAT || false],
      isDiscount: [this.defaults.isDiscount || false],
      isProportional: [this.defaults.isProportional || false],
      discountAmount: [this.defaults.discountAmount || ''],
      discountType: [this.defaults.discountType || ''],
      isTariff: [this.defaults.tariffId > 0 ? true : false],
      isFormula: [this.defaults.formulaFieldName != '' ? true : false],
      isEnableFormula: [(this.defaults.formulaFieldName != '' && this.defaults.headType != 'Consumption Charge' && this.defaults.headType != 'Variable' && this.defaults.headType != '') ? true : false || false]
    });

    if(this.mode == 'create')
    {
      this.getNextPosition();
    }
    //this.form.controls.position.disable();

    this.billHeadService.getBillSettingClientMapping(this.clientId).subscribe((data: boolean) => {
      this.isBillSettingClientMapped = data
      if (this.isBillSettingClientMapped == false) {
        this.form.controls.isVAT.disable();
      }
      else {
        this.form.controls.isVAT.enable();
      }
    });

    if ((this.defaults) && (this.defaults.tariffId > 0)) {
      this.isTariff = true;
    }
    if ((this.defaults) && (this.defaults.formulaFieldName != '')) {
      this.isFormula = true;
      this.formulaApplied = this.defaults.formulaFieldName;
    }
    //this.form.get('isVAT').disable();
    if (this.defaults && this.defaults.isVAT) {
      this.VATExist = this.defaults.isVAT;
    }
    if (this.defaults && this.defaults.isDiscount) {
      this.isDiscount = this.defaults.isDiscount;
    }

    this.selectBillFormula(null, this.defaults.formulaFieldName);
    if ((this.mode === 'update') && (this.defaults.headType === 'Consumption Charge')) {
      this.isConsumptionCharge = true;
      this.getTariffs(this.defaults.utilityTypeId, this.clientId);
      //this.selectTariff(null,this.defaults.tariff);
      this.form.controls.tariffId.setValue(this.defaults.tariffId);
      this.tariffName = this.defaults.tariff;
    }
    this.selectBillHeadType(null, this.defaults.headType);
    this.utilityType = this.defaults.utilityType;

    //this.selectUtilityType(null, this.defaults.utilityType);
    // if((this.defaults) && (this.defaults.formulaFieldName == "Custom Days"))
    // {
    //   this.isCustomDays = true;        
    // }

    //this.selectTariff(null,this.defaults.tariff);

    // this.form.controls.headType.valueChanges.subscribe(newHeadType => {
    //   this.filteredBillHeadTypes = this.filterBillHeadTypes(newHeadType);
    // });
    // this.form.controls.utilityType.valueChanges.subscribe(newUtilityType => {
    //   this.filteredUtilityTypes = this.filterUtilityTypes(newUtilityType);
    // });
    this.form.controls.formulaFieldName.valueChanges.subscribe(newFormula => {
      this.filteredBillFormulas = this.filterBillFormula(newFormula);
    });
    this.form.controls.operatorName.valueChanges.subscribe(newOperator => {
      this.filteredOperators = this.filterOperator(newOperator);
    });
    this.form.controls.tariff.valueChanges.subscribe(newTariff => {
      this.filteredTariffs = this.filterTariff(newTariff);
    });
    this.getEnableFormControls();
    this.getBillHeads();    
  }

  getBillingLedgers() {
    this.masterService.getUserMasterdata(56, 149).subscribe((data: Master[]) => {
      this.metadataBillingLedger = data;
    });
  }

  getBillFormula() {
    if (this.metadataBillFormulas) {

      if (this.headType != '' && this.headType == "Late Fee") {
        if ((this.formulaApplied != "Bill Due Days") && (this.formulaApplied != "Penalty Date") && (this.formulaApplied != "Custom Days")) {
          this.formulaApplied = '';
        }
        this.filteredBillFormulas = this.filteredFormula = this.metadataBillFormulas.filter(item => item.description == 'Bill Due Days' || item.description == 'Penalty Date' || item.description == 'Custom Days');
      }
      else if (this.headType == "Security Deposit") {
        if (this.formulaApplied != "Security Deposit") {
          this.formulaApplied = '';
        }
        this.filteredBillFormulas = this.filteredFormula = this.metadataBillFormulas.filter(item => item.description == 'Security Deposit');
      }
      else if(this.headType == 'Bill Charge' || this.headType == 'Late Fee') {
        if(this.formulaApplied != 'GrandTotal')
        {
          this.formulaApplied = '';
        }
        this.filteredBillFormulas = this.filteredFormula = this.metadataBillFormulas.filter(item => item.description == 'GrandTotal');
      }
      // else {
      //   this.filteredBillFormulas = this.filteredFormula = this.metadataBillFormulas;
      // }
    }
  }

  getFilteredBillHeadType() {
    //this.filteredBillHeadTypes = this.filterBillHeadTypes(this.form.controls.headType.value)
  }

  getFilteredUtilityTypes() {
    this.filteredUtilityTypes = this.filterUtilityTypes(this.form.controls.utilityType.value);
  }

  filterBillHeadTypes(name: string) {
    if (name == '') {
      this.selectBillHeadType(null, '');
      return this.metadataBillHeadTypes;
    }
    return this.metadataBillHeadTypes.filter(billHeadTypes =>
      billHeadTypes.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  filterUtilityTypes(name: string) {
    if (name == '') {
      this.selectUtilityType(null, '');
    }
    if (this.metadataUtilityTypes) {
      return this.metadataUtilityTypes.filter(utilityTypes =>
        utilityTypes.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
    }
  }

  filterBillFormula(name: string) {
    if (name == '') {

      //this.selectBillFormula(null, '');
    }
    if (this.filteredFormula) {
      return this.filteredFormula.filter(billFormula =>
        billFormula.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
    }
  }

  getFilteredFormula() {
    this.filteredBillFormulas = this.filterBillFormula(this.form.get('formulaFieldName').value);
  }

  filterOperator(name: string) {
    if (name == '') {
      return this.metadataOperators;
    }
    if (this.metadataOperators) {
      return this.metadataOperators.filter(operator =>
        operator.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
    }
  }

  filterTariff(name: string) {
    if (name == '') {
      this.form.controls.tariffId.setValue(0);
    }
    if (this.metadatatariffs) {
      return this.metadatatariffs.filter(tariff =>
        tariff.tariffName.toLowerCase().indexOf(name.toLowerCase()) === 0);
    }
  }

  filterContractType(name: string) {
    if (name == '') {
      return this.metadataContractTypes;
    }
    if (this.metadataContractTypes) {
      return this.metadataContractTypes.filter(contractType =>
        contractType.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
    }
  }

  getEnableFormControls() {
    const checked: boolean = this.form.get('isEnableFormula').value;
    this.enableDisableControls(checked);
  }

  getHeadTypes() {
    this.filteredBillHeadTypes = this.metadataBillHeadTypes;
    //return this.filteredBillHeadTypes;
  }

  getBillHeads() {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.billHeadService.getBillHeads(this.clientId).subscribe({
      next: (billHeads: Billhead[]) => {
        this.metedataBillLines = billHeads.map(billHead => new Billhead(billHead));
      },
      error: (err) => {
      }
    });
  }

  clear(control: string): void {
    this.form.get(control).setValue('');
    // call autoComplete `openPanel` to show up options
    setTimeout(() => { this.autocomplete.openPanel() })
  }

  save() {
    if (this.isCancel) {
      this.isCancel = false;
      let isFormStateChanged = false;
      if (this.form.touched) {
        isFormStateChanged = true;
      }
      const confirmMessage: ListItem = {
        label: (isFormStateChanged ? "Unsaved data will be lost, Are you sure you want to Cancel?" : "Are you sure you want to Cancel?"),
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
      this.createBillHead();
    }
    else if (this.mode === 'update') {
      this.updateBillHead();
    }
  }

  createBillHead() {
    Object.assign(this.defaults, this.form.value);
    this.defaults.position = parseInt(this.form.controls.position.value ?? 0);    
    if (this.form.controls.contractType.value === 'All') {
      this.defaults.contractTypeId = 0;
    }
    if (this.form.controls.utilityType.value == '')
      this.defaults.utilityTypeId = 0;
    if (this.form.controls.formulaFieldName.value == '')
      this.defaults.formulaField = 0;
    if (this.form.controls.operatorName.value == '')
      this.defaults.operator = 0;
    //if((this.form.controls.tariff.value == '') || (!this.isConsumptionCharge))
    if (!this.isTariff) {
      this.defaults.tariffId = 0;
    }
    if ((!this.isFormula) && (this.isConsumptionCharge)) {
      this.defaults.formulaField = 0;
      this.defaults.operator = 0;
      this.defaults.fixedAmount = 0;
    }
    if (this.formulaApplied == 'Security Deposit') {
      this.defaults.operator = 0;
      this.defaults.fixedAmount = 0;
    }
    if ((this.headType == 'Consumption Charge') && (this.utilityType == 'BTU')) {
      if (this.isMeasuringUnitTH == true) {
        this.defaults.measuringUnitId = 2;
      }
      else {
        this.defaults.measuringUnitId = 1;
      }
    }
    else {
      this.defaults.measuringUnitId = 0;
    }
    // if (((this.formulaApplied != 'Custom Days') && (this.formulaApplied != 'Bill Due Days') && (this.formulaApplied != 'Penalty Date')) && (this.headType != "Late Fee")) {
    //   this.defaults.noOfDays = 0;
    // }
    if (this.form.controls.noOfDays.value == '') {
      this.defaults.noOfDays = 0;
    }
    else {
      this.defaults.noOfDays = this.form.controls.noOfDays.value;
    }
    this.defaults.discountAmount = parseFloat(this.defaults.discountAmount.toString());    //this.form.controls.discountAmount?.value == '' ? '0' : this.form.controls.discountAmount?.value);
    this.defaults.fixedAmount = parseFloat(this.defaults.fixedAmount.toString());    //this.form.controls.fixedAmount?.value == '' ? '0' : this.form.controls.fixedAmount?.value);
    this.defaults.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.defaults.accountNumber = this.selectedAccountNumber;
    if (this.isCancel) {
      this.dialogRef.close();
    }
    else {
      this.dialogRef.close(new Billhead(this.defaults));
    }
  }

  updateBillHead() {
    Object.assign(this.defaults, this.form.value);
    if (this.form.controls.contractType.value === 'All') {
      this.defaults.contractTypeId = 0;
    }
    if (this.form.controls.utilityType.value == '')
      this.defaults.utilityTypeId = 0;
    else
      this.metadataUtilityTypes.find(item => {
        if (this.utilityType == item.description) {
          this.defaults.utilityTypeId = item.id;
        }
      })
    if (this.form.controls.formulaFieldName.value == '')
      this.defaults.formulaField = 0;
    if (this.form.controls.operatorName.value == '')
      this.defaults.operator = 0
    //if((this.form.controls.tariff.value == '') || (!this.isConsumptionCharge))
    if (!this.isTariff) {
      this.defaults.tariffId = 0;
    }
    if (this.formulaApplied == 'Security Deposit') {
      this.defaults.operator = 0;
      this.defaults.fixedAmount = 0;
    }
    if ((!this.isFormula) && (this.isConsumptionCharge)) {
      this.defaults.formulaField = 0;
      this.defaults.operator = 0;
      this.defaults.fixedAmount = 0;
    }
    // if ((this.formulaApplied != 'Custom Days') && (this.formulaApplied != 'Bill Due Days') && (this.formulaApplied != 'Penalty Date') && (this.headType != "Late Fee")) {
    //   this.defaults.noOfDays = 0;
    // }
    if (this.form.controls.noOfDays.value == '') {
      this.defaults.noOfDays = 0;
    }
    else {
      this.defaults.noOfDays = this.form.controls.noOfDays.value;
    }

    if ((this.headType == 'Consumption Charge') && (this.utilityType == 'BTU')) {
      if (this.isMeasuringUnitTH == true) {
        this.defaults.measuringUnitId = 2;
      }
      else {
        this.defaults.measuringUnitId = 1;
      }
    }
    else {
      this.defaults.measuringUnitId = 0;
    }
    this.defaults.discountAmount = parseFloat(this.defaults.discountAmount.toString());    //this.form.controls.discountAmount?.value == '' ? '0' : this.form.controls.discountAmount?.value);
    this.defaults.fixedAmount = parseFloat(this.defaults.fixedAmount.toString());        //this.form.controls.fixedAmount?.value == '' ? '0' : this.form.controls.fixedAmount?.value);
    this.defaults.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.defaults.accountNumber = this.selectedAccountNumber;
    if (this.isCancel) {
      this.dialogRef.close();
    }
    else {
      this.dialogRef.close(new Billhead(this.defaults));
    }
  }

  isCreateMode() {
    return this.mode === 'create';
  }

  isUpdateMode() {
    return this.mode === 'update';
  }

  selectBillHeadType(event, value = '') {
    if (value == '') {
      this.form.controls.accountHeadType.setValue('');
    }

    //this.isCustomDays = false;
    this.isConsumptionCharge = false;


    this.headType = '';

    if (event) {
      this.headType = event.value;
    }
    else {
      this.headType = value;
    }

    if (this.headType != "Consumption Charge") {
      this.form.controls.utilityType?.setValue('');
      this.form.controls.utilityTypeId?.setValue(0);
      this.form.controls.utilityType?.clearValidators();
    }

    if (this.metadataBillHeadTypes) {
      let billHeadType = this.metadataBillHeadTypes.filter(headType => this.headType == headType.description);
      if ((billHeadType) && (billHeadType.length > 0)) {
        this.form.controls.accountHeadType.setValue(billHeadType[0].id);
      }
    }
    // this.metadataBillHeadTypes.find(headType => {
    //   if(event.option.value == headType.description) {
    //     this.form.controls.accountHeadType.setValue(headType.id);
    //     this.headType = event.option.value;
    //   }
    // })


    if (this.headType == "Consumption Charge") {
      this.isConsumptionCharge = true;
      this.form.controls.utilityType?.setValidators(Validators.required);
      this.form.controls.utilityType?.setErrors({ required: true });


      if ((this.isTariff == false) && (this.isFormula == false)) {
        this.isTariff = true;
        this.isFormula = false;
      }
      if (this.isTariff) {
        this.getConsumptionCalculation('Tariff');
      }
      else if (this.isFormula) {
        this.getConsumptionCalculation('Formula');
      }
    }
    else if ((this.headType == "Formula") || (this.headType == "Bill Charge") || (this.headType == "Final Bill Fee") || (this.headType == "Late Fee") || (this.headType == "Security Deposit")) {
      if (this.headType == "Late Fee") {
        this.form.get('isEnableFormula').setValue(true);
        this.enableFormulaCheckChanged(null);
      }
      this.getConsumptionCalculation('Formula');
    }
    else {      
      this.isConsumptionCharge = false;
      this.getConsumptionCalculation('');
    }
    if (this.headType != "Consumption Charge") {
      this.selectUtilityType(null);
    }
    this.filteredBillFormulas = this.filteredFormula = this.metadataBillFormulas;
    this.getBillFormula();
    if (this.isFormula == true) {
      let formulaName = this.form.controls.formulaFieldName.value;
      this.selectBillFormula(null, formulaName);
      //this.form.controls.noOfDays.setValue(this.defaults.noOfDays);
    }
    this.getLateFeeValidation();
    this.getEnableFormControls();
    if(this.headType == 'Variable')
    {
      this.form.controls["fixedAmount"].setValidators([Validators.required]);
      //this.form.controls["fixedAmount"].setErrors({required: true});
      this.form.controls["fixedAmount"].updateValueAndValidity();
    }
    this.form.controls.utilityType?.updateValueAndValidity();
  }

  getLateFeeValidation() {
    if ((this.headType == "Late Fee") || (this.formulaApplied == 'Custom Days')) {
      this.form.controls["noOfDays"].setValidators([Validators.required]);
    }
    else {
      this.form.controls["noOfDays"].clearValidators();
      this.form.controls["noOfDays"].markAsUntouched();
    }
    this.form.controls["noOfDays"].updateValueAndValidity();
  }

  selectUtilityType(event, value = '') {
    this.metadatatariffs = [];
    this.filteredTariffs = [];
    this.form.controls.tariffId.setValue(0);
    this.form.controls.tariff.setValue('');
    this.form.controls.utilityTypeId.setValue(0);
    this.form.controls.utilityType.setValue('');

    if (event) {
      this.utilityType = event.value == 0 ? '' : event.value;
    }
    else {
      this.utilityType = value;
    }

    if (this.headType == "Consumption Charge") {
      this.form.controls.utilityType?.setValidators(Validators.required);
      this.form.controls.utilityType?.setErrors({ required: true });
    }
    else {
      this.form.controls.utilityType?.clearValidators();
    }
    //this.form.controls.utilityType?.updateValueAndValidity();

    // if(this.metadataUtilityTypes)
    // {
    //   let utility = this.metadataUtilityTypes.filter(utilityType => this.utilityType == utilityType.description);
    //   if ((utility) && (utility.length > 0)) {
    //     this.form.controls.utilityTypeId.setValue(utility[0].id);
    //     this.getTariffs(utility[0].id);
    //   }
    // }
    if (this.metadataUtilityTypes) {
      this.metadataUtilityTypes.forEach(utilityType => {
        if (this.utilityType == utilityType.description) {
          this.form.controls.utilityTypeId.setValue(utilityType.id);
          this.form.controls.utilityType.setValue(utilityType.description);
          this.getTariffs(utilityType.id, this.clientId);
        }
      })
    }
  }

  selectTariff(event, value = '') {
    if (event != null) {
      value = event.option.value;
    }

    if (this.metadatatariffs) {
      this.metadatatariffs.forEach(tariff => {
        if (value == tariff.tariffName) {
          this.form.controls.tariffId.setValue(tariff.id);
        }
      })
    }
  }

  selectBillFormula(event, value = '') {
    if (event) {
      value = event.option.value;
    }
    if ((value == 'Bill Due Days') || (value == 'Penalty Date')) {
      this.billHeadService.getGracePeriod(this.clientId, value).subscribe(data => {
        this.form.controls.noOfDays.setValue(data);
      })
      this.form.controls.noOfDays.disable();
    }
    else {
      this.form.controls.noOfDays.enable();
    }
    if (this.metadataBillFormulas) {
      this.metadataBillFormulas.forEach(billFormula => {
        if (value == billFormula.description) {
          this.form.controls.formulaField.setValue(billFormula.id);
        }
      })
    }
    this.getLateFeeValidation();
    this.setValidatorsForFormulaFields();
    const checked: boolean = this.form.get('isEnableFormula').value;
    if ((checked) && (this.formulaApplied == 'Security Deposit')) {
      this.changeFormControlProperties('operatorName', 'operator', true);
      this.changeFormControlProperties('fixedAmount', 'fixedAmount', true);
    }
    else if ((checked) && (this.formulaApplied != 'Security Deposit') && (this.isFormula)) {
      this.changeFormControlProperties('formulaFieldName', null, false);
      this.changeFormControlProperties('operatorName', null, false);
      this.changeFormControlProperties('fixedAmount', null, false);
    }
  }

  setValidatorsForFormulaFields() {
    const checked: boolean = this.form.get('isEnableFormula').value;
    if (checked || this.isFormula == true) {
      this.form.controls["formulaFieldName"].setValidators([Validators.required]);
    }
    else {
      this.form.controls["formulaFieldName"].clearValidators();
    }
    if (((checked == true) && (this.formulaApplied != 'Security Deposit')) || (this.isFormula == true)) {
      this.form.controls["operatorName"].setValidators([Validators.required]);
      this.form.controls["fixedAmount"].setValidators([Validators.required]);
    }
    else {
      this.form.controls["operatorName"].clearValidators();
      this.form.controls["fixedAmount"].setValidators([Validators.required]);
    }
    this.form.controls["formulaFieldName"].updateValueAndValidity();
    this.form.controls["operatorName"].updateValueAndValidity();
    this.form.controls["fixedAmount"].updateValueAndValidity();
  }

  selectOperator(event) {
    if (this.metadataOperators) {
      this.metadataOperators.forEach(operator => {
        if (event.option.value == operator.description) {
          this.form.controls.operator.setValue(operator.id);
        }
      })
    }
  }

  getTariffs(utilityTypeId, clientId) {
    this.billHeadService.getTariffs(utilityTypeId, clientId).subscribe((tariffs: TariffMaster[]) => {
      this.metadatatariffs = tariffs;
      this.filteredTariffs = tariffs;
    })
  }

  validateFixedAmount() {
    this.isValid = true;
    if (this.form.get('fixedAmount').value != '') {
      var fixedAmount = this.form.get('fixedAmount').value;
      if (fixedAmount <= 0) {
        this.isValid = false;
      }
    }
    return this.isValid;
  }

  onChangeAccountNumber(value) {
    this.selectedAccountNumber = value;
    this.accountHead = '';
    if (this.metadataBillingLedger) {
      let item = this.metadataBillingLedger.find(item => item.id == value);
      if (item) {
        this.accountHead = item.description;
      }
    }
  }

  toggleVAT(value) {
    if (this.mode == 'create') {
      this.VATExist = !value;
    }
  }

  toggleDiscount(value: any) {
    if (!value.checked) {
      this.form.controls.discountType.clearValidators();
      this.form.controls.discountAmount.clearValidators();
      this.form.controls.discountType.setValue('');
      this.form.controls.discountAmount.setValue(0);
    } else {
      this.form.controls.discountType.setValidators([Validators.required]);
      this.form.controls.discountAmount.setValidators([Validators.required]);
    }
    if (this.mode == 'create') {
      this.isDiscount = value.checked;
    }
  }

  closeDialog() {
    this.isCancel = true;
  }

  getConsumptionCalculation(value) {
    this.calculationType = value;

    if (value == 'Tariff') {
      this.isTariff = true;
      this.isFormula = false;
      if ((this.mode == 'update') && (this.defaults.tariffId != 0)) {
        this.changeFormControlProperties('tariff', null, false);
      }
      else {
        this.changeFormControlProperties('tariff', 'tariffId', false);
      }
      this.changeFormControlProperties('formulaFieldName', 'formulaField', true);
      this.changeFormControlProperties('operatorName', 'operator', true);
      this.changeFormControlProperties('fixedAmount', 'fixedAmount', true);
      this.form.controls["tariff"].setValidators([Validators.required]);

      // this.form.controls["formulaFieldName"].setValue('');
      // this.form.controls["formulaField"].setValue(0);
      // this.form.controls["formulaFieldName"].clearValidators();
      // this.form.controls["formulaFieldName"].markAsUntouched();
      // this.form.controls["operatorName"].setValue('');
      // this.form.controls["operator"].setValue(0);
      // this.form.controls["operatorName"].clearValidators();
      // this.form.controls["operatorName"].markAsUntouched();
      // this.form.controls["fixedAmount"].setValue('');
      // this.form.controls["fixedAmount"].clearValidators();
      // this.form.controls["fixedAmount"].markAsUntouched();
    }
    else if (value == 'Formula') {
      this.isTariff = false;
      this.isFormula = true;

      this.changeFormControlProperties('tariff', 'tariffId', true);
      if ((this.mode == 'update') && (this.defaults.formulaField != 0)) {
        this.changeFormControlProperties('formulaFieldName', null, false);
        this.changeFormControlProperties('operatorName', null, false);
      }
      else {
        this.changeFormControlProperties('formulaFieldName', 'formulaField', false);
        this.changeFormControlProperties('operatorName', 'operator', false);
      }

      if ((this.mode == 'update') && (this.defaults.fixedAmount != 0)) {
        this.changeFormControlProperties('fixedAmount', null, false);
      }
      else {
        this.changeFormControlProperties('fixedAmount', 'fixedAmount', false);
      }

      // this.form.controls.tariffId.setValue(0);
      // this.form.controls.tariff.setValue('');
      // this.form.controls["tariff"].clearValidators();
      // this.form.controls["tariff"].markAsUntouched();

      this.form.controls["formulaFieldName"].setValidators([Validators.required]);
      this.setValidatorsForFormulaFields();
    }
    else if (value == '') {
      this.isTariff = false;
      this.isFormula = false;
      this.changeFormControlProperties('tariff', 'tariffId', false);
      this.changeFormControlProperties('formulaFieldName', 'formulaField', false);
      this.changeFormControlProperties('operatorName', 'operator', false);
      this.changeFormControlProperties('fixedAmount', 'fixedAmount', false);

      // this.form.controls.tariffId.setValue(0);
      // this.form.controls.tariff.setValue('');
      // this.form.controls["formulaFieldName"].setValue('');
      // this.form.controls["formulaField"].setValue(0);
      // this.form.controls["operatorName"].setValue('');
      // this.form.controls["operator"].setValue(0);
      // this.form.controls["fixedAmount"].setValue('');

      // this.form.controls["tariff"].clearValidators();
      // this.form.controls["tariff"].markAsUntouched();
      // this.form.controls["formulaFieldName"].clearValidators();
      // this.form.controls["formulaFieldName"].markAsUntouched();
      // this.form.controls["operatorName"].clearValidators();
      // this.form.controls["operatorName"].markAsUntouched();
      // this.form.controls["fixedAmount"].clearValidators();
      // this.form.controls["fixedAmount"].markAsUntouched();
    }
    this.form.controls["tariff"].updateValueAndValidity();
    this.form.controls["formulaFieldName"].updateValueAndValidity();
    this.form.controls["operatorName"].updateValueAndValidity();
    this.form.controls["fixedAmount"].updateValueAndValidity();
  }

  enableFormulaCheckChanged(event: any) {
    let checked = true;
    if (event != null) {
      checked = event.checked;
    }
    this.enableDisableControls(checked);
    this.setValidatorsForFormulaFields();
  }

  changeFormControlProperties(controlName: string, controlValue: string, disable: boolean) {
    if (disable) {
      this.form.controls[controlName].disable();
    }
    else {
      this.form.controls[controlName].enable();
    }
    if (controlValue) {
      this.form.controls[controlName].setValue('');
      this.form.controls[controlValue].setValue('');
      this.form.controls[controlName].clearValidators();
      this.form.controls[controlName].markAsUntouched();
    }
  }

  enableDisableControls(checked: boolean) {
    if (!checked && this.headType != 'Consumption Charge') {
      this.changeFormControlProperties('formulaFieldName', 'formulaField', true);
      this.changeFormControlProperties('operatorName', 'operator', true);
      this.changeFormControlProperties('fixedAmount', null, false);
    }
    else if (this.headType == 'Consumption Charge' && this.isTariff == true) {
      this.changeFormControlProperties('formulaFieldName', 'formulaField', true);
      this.changeFormControlProperties('operatorName', 'operator', true);
      this.changeFormControlProperties('fixedAmount', 'fixedAmount', true);
    }
    else if ((checked) && (this.formulaApplied == 'Security Deposit')) {
      this.changeFormControlProperties('operatorName', 'operator', true);
      this.changeFormControlProperties('fixedAmount', 'fixedAmount', true);
    }
    else if ((checked) && (this.formulaApplied != 'Security Deposit') && (this.isFormula)) {
      this.changeFormControlProperties('formulaFieldName', null, false);
      this.changeFormControlProperties('operatorName', null, false);
      this.changeFormControlProperties('fixedAmount', null, false);
    }    
    else {
      this.changeFormControlProperties('formulaFieldName', null, false);
      this.changeFormControlProperties('operatorName', null, false);
    }

    // else
    // {
    //   this.changeFormControlProperties('operatorName','operator',false);
    //   this.changeFormControlProperties('fixedAmount','fixedAmount',false);
    // }
  }

  checkDuplicatePosition() {
    this.duplicatePosition = "";
    let position = this.form.controls.position.value;
    if (position != 0) {
      if ((position != '') && (position != null)) {
        this.billHeadService.checkForDuplicatePosition(position, this.defaults.id, this.clientId).subscribe(data => {
          if (data && data > 0) {
            this.duplicatePosition = "Position already exists.";
          }
        });
      }
    }
    else {
      this.duplicatePosition = "Position cannot be zero.";
    }
  }

  getNextPosition() {
    this.billHeadService.getNextPosition(this.clientId).subscribe(data => {
      if (data && data > 0) {
        this.form.controls.position.setValue(data);        
      }
    });
  }

  enableMeasuringUnitCheckChanged(event) {
    this.isMeasuringUnitTH = event.checked;
  }

  close() {
    this.dialogRef.close();
  }

  selectContractType(event) {
    this.metadataContractTypes.forEach(contractType => {
      if (event.option.value == contractType.description) {
        this.form.controls.contractTypeId.setValue(contractType.id);
      }
    })
  }

  createBillingLedger() {
    let modes = [55, 56, 149];
    this.dialog.open(CreateUserMasterComponent, { data: modes }).afterClosed().subscribe((message: any) => {
      if (message && message == 'Success') {
        this.getBillingLedgers();
      }
    });
  }
  
}

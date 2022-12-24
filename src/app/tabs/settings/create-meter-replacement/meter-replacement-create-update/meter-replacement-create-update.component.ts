import { Component, Inject, OnInit, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { FormValidators } from '../../../shared/methods/form-validators';
import { Metadata } from 'src/app/tabs/shared/models/metadata.model';
import { MetadataService } from 'src/app/tabs/shared/services/metadata.service';
import { MeterReplacement } from './meter-replacement.model';
import { defaults } from 'chart.js';
import { DatePipe } from '@angular/common';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';
import { MetadataUtilityType } from '../../../shared/models/metadata.utility-type.model';
import { MetadataUnit } from '../../../shared/models/metadata.unit.model';
import { MetadataMeter } from '../../../shared/models/metadata.meter.model';
import { MetadataDeviceStatus } from '../../../shared/models/metadata.device-status.model';
import { MeterReplacementService } from '../../../shared/services/meterreplacement.service';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { MasterService } from 'src/app/tabs/shared/services/master.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'fury-meter-replacement-create-update',
  templateUrl: './meter-replacement-create-update.component.html',
  styleUrls: ['./meter-replacement-create-update.component.scss']
})
export class MeterReplacementCreateUpdateComponent implements OnInit {

  static id = 100;
  form: FormGroup;
  metadata: Metadata;
  metadataUtilityTypes: MetadataUtilityType[];
  metadataUnits: MetadataUnit[];
  metadataMeters: MetadataMeter[];
  metadataDeviceStatus: Master[];
  filteredUtilityTypes: MetadataUtilityType[];
  filteredUnits: MetadataUnit[];
  filteredMeters: MetadataMeter[];
  filteredDeviceStatus: Master[];
  clientId: number;

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: MeterReplacement,
    private dialogRef: MatDialogRef<MeterReplacementCreateUpdateComponent>,
    private fb: FormBuilder, private metadataService: MetadataService,
    private meterReplacementService: MeterReplacementService,
    private datePipe: DatePipe, private masterService: MasterService,
    private fv: FormValidators, private cookieService: CookieService) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    if (!this.defaults) {
      this.defaults = new MeterReplacement({});
    }
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.meterReplacementService.GetUtilityTypes(this.clientId).subscribe((utilityTypes: MetadataUtilityType[]) => {
      this.metadataUtilityTypes = utilityTypes.map(utilityType => new MetadataUtilityType(utilityType));
      this.filteredUtilityTypes = utilityTypes;
    });

    // this.metadata = this.metadataService.getMetadata();
    // this.metadataDeviceStatus = this.metadata.deviceStatus;
    // this.filteredDeviceStatus = this.metadata.deviceStatus;

    this.masterService.getSystemMasterdata(42, 0).subscribe((data: Master[]) => {
      this.metadataDeviceStatus = data;
      this.filteredDeviceStatus = data;
    });

    // this.metadataUtilityTypes = this.metadata.utilityTypes;
    // this.filteredUtilityTypes = this.metadata.utilityTypes;
    // this.onUtilityTypeSelect(this.defaults.utilityTypeId);
    // this.metadataUnits = this.metadata.units;
    // this.filteredUnits = this.metadata.units;
    // this.metadataMeters = this.metadata.availableDevices;
    // this.filteredMeters = this.metadata.availableDevices;        

    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2); ​  // adjust 0 before single digit date.
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2); // current month.
    let year = date_ob.getFullYear(); ​ // current year.
    let today = month + '/' + date + '/' + year; // get date in MM-DD-YYYY format.

    today = new Date(today).toISOString().substr(0, 10);

    this.form = this.fb.group({
      replacementDate: [this.defaults.replacementDate || today, Validators.required],
      utilityTypeId: [this.defaults.utilityTypeId || '', Validators.required],
      utilityType: [this.defaults.utilityType || '', Validators.required],
      unitId: [this.defaults.unitId || '', Validators.required],
      unitNumber: [this.defaults.unitNumber || '', Validators.required],
      id: [this.defaults.id || '', Validators.required],
      deviceName: [this.defaults.deviceName || '', Validators.required],
      reading: [this.defaults.reading || '', Validators.required],
      deviceStatus: [this.defaults.deviceStatus || '', Validators.required],
      remarks: [this.defaults.remarks || '', Validators.required]
    });
    this.form.controls.utilityType.valueChanges.subscribe(newutilityType => {
      this.filteredUtilityTypes = this.filterUtilityType(newutilityType);
    });
    this.form.controls.unitNumber.valueChanges.subscribe(newUnitNumber => {
      this.filteredUnits = this.filterUnit(newUnitNumber);
    });
    this.form.controls.deviceName.valueChanges.subscribe(newDeviceName => {
      this.filteredMeters = this.filterMeters(newDeviceName);
    });

  }

  filterUtilityType(name: string) {
    if (name != null) {
      return this.metadataUtilityTypes.filter(utilityType =>
        utilityType.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
    }
    else {
      return this.metadataUtilityTypes;
    }
  }

  filterUnit(name: string) {
    if (name != null) {
      return this.metadataUnits.filter(unit =>
        unit.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
    }
    else {
      return this.metadataUnits;
    }
  }

  filterMeters(name: string) {
    if (name != null) {
      return this.metadataMeters.filter(meter =>
        meter.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
    }
    else {
      return this.metadataMeters;
    }
  }

  save() {
    this.createMeterReplacement();
  }

  createMeterReplacement() {
    Object.assign(this.defaults, this.form.value);
    this.defaults.clientId = this.clientId;
    this.dialogRef.close(new MeterReplacement(this.defaults));
  }

  selectUtilityType(event) {
    this.metadataUtilityTypes.forEach(utilityType => {
      if (event.option.value == utilityType.description) {
        this.form.controls.utilityTypeId.setValue(utilityType.id);
        this.defaults.utilityTypeId = utilityType.id;
        this.onUtilityTypeSelect(utilityType.id);
      }
    })
  }

  selectUnit(event) {
    this.metadataUnits.forEach(unitNumber => {
      if (event.option.value == unitNumber.description) {
        this.form.controls.unitId.setValue(unitNumber.id);
      }
    })
  }

  selectMeter(event) {
    this.metadataMeters.forEach(meter => {
      if (event.option.value == meter.description) {
        this.form.controls.id.setValue(meter.id);
      }
    })
  }

  onUtilityTypeSelect(utilityTypeId) {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.meterReplacementService.getAllUnits(this.clientId, utilityTypeId).subscribe((units: MetadataUnit[]) => {
      this.metadataUnits = units.map(unit => new MetadataUnit(unit));
      this.filteredUnits = units;
    });

    this.meterReplacementService.GetActiveDevices(this.clientId, utilityTypeId).subscribe((meters: MetadataMeter[]) => {
      this.metadataMeters = meters.map(meter => new MetadataMeter(meter));
      this.filteredMeters = meters;
    });
  }

  close() {
    this.dialogRef.close();
  }

}

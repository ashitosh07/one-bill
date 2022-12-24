import { Component, Inject, OnInit, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { FormValidators } from '../../../shared/methods/form-validators';
import { Metadata } from 'src/app/tabs/shared/models/metadata.model';
import { MetadataService } from 'src/app/tabs/shared/services/metadata.service';
import { ServiceDisconnection } from './service-disconnection.model';
import { defaults } from 'chart.js';
import { DatePipe } from '@angular/common';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';
import { MetadataUtilityType } from '../../../shared/models/metadata.utility-type.model';
import { MetadataUnit } from '../../../shared/models/metadata.unit.model';
import { MetadataMeter } from '../../../shared/models/metadata.meter.model';
import { ServiceDisconnectionService } from '../../../shared/services/service.disconnection.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'fury-service-disconnection-create-update',
  templateUrl: './service-disconnection-create-update.component.html',
  styleUrls: ['./service-disconnection-create-update.component.scss']
})

export class ServiceDisconnectionCreateUpdateComponent implements OnInit {
  static id = 100;
  form: FormGroup;
  meterId = 0;
  clientId: number;
  serviceDisconnections: ServiceDisconnection[];
  metadata: Metadata;
  metadataUtilityTypes: MetadataUtilityType[];
  metadataUnits: MetadataUnit[];
  metadataMeters: MetadataMeter[];
  filteredUtilityTypes: MetadataUtilityType[];
  filteredUnits: MetadataUnit[];
  filteredMeters: MetadataMeter[];

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: ServiceDisconnection,
    private serviceDisconnectionService: ServiceDisconnectionService,
    private dialogRef: MatDialogRef<ServiceDisconnectionCreateUpdateComponent>,
    private fb: FormBuilder, private metadataService: MetadataService,
    private datePipe: DatePipe,
    private fv: FormValidators,
    private cookieService: CookieService) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    if (!this.defaults) {
      this.defaults = new ServiceDisconnection({});
    }
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.serviceDisconnectionService.getUtilities(this.clientId).subscribe((utilities: MetadataUtilityType[]) => {
      this.metadataUtilityTypes = utilities.map(utility => new MetadataUtilityType(utility));
      this.filteredUtilityTypes = utilities
    });

    // this.metadata = this.metadataService.getMetadata();    
    // this.metadataUtilityTypes = this.metadata.utilityTypes;
    this.filteredUtilityTypes = this.metadataUtilityTypes;

    this.onUtilityTypeSelect(this.defaults.utilityTypeId);
    this.onUnitSelect(this.defaults.utilityTypeId, this.defaults.unitId);

    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2); ​  // adjust 0 before single digit date.
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2); // current month.
    let year = date_ob.getFullYear(); ​ // current year.
    let today = month + '/' + date + '/' + year; // get date in MM-DD-YYYY format.

    today = new Date(today).toISOString().substr(0, 10);
    this.form = this.fb.group({
      date: [this.defaults.date || today, Validators.required],
      utilityTypeId: [this.defaults.utilityTypeId || '', Validators.required],
      utilityType: [this.defaults.utilityType || '', Validators.required],
      unitId: [this.defaults.unitId || '', Validators.required],
      unitNumber: [this.defaults.unitNumber || '', Validators.required],
      meterId: [this.defaults.meterId || '', Validators.required],
      meterName: [this.defaults.meterName || '', Validators.required],
      isConnected: [this.defaults.isConnected || ''],
      remarks: [this.defaults.remarks || '', Validators.required]
    });

    this.form.controls.utilityType.valueChanges.subscribe(newUtilityType => {
      this.filteredUtilityTypes = this.filterUtilityTypes(newUtilityType);
    });
    this.form.controls.unitNumber.valueChanges.subscribe(newUnit => {
      this.filteredUnits = this.filterUnit(newUnit);
    });
    this.form.controls.meterName.valueChanges.subscribe(newMeter => {
      this.filteredMeters = this.filterMeter(newMeter);
    });
  }

  filterUtilityTypes(name: string) {
    return this.metadataUtilityTypes.filter(utilityType =>
      utilityType.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  filterUnit(name: string) {
    return this.metadataUnits.filter(unit =>
      unit.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  filterMeter(name: string) {
    return this.metadataMeters.filter(meter =>
      meter.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  save() {
    this.createServiceDisconnection();
  }

  createServiceDisconnection() {
    Object.assign(this.defaults, this.form.value);
    this.dialogRef.close(new ServiceDisconnection(this.defaults));
  }

  selectUtilityType(event) {
    this.metadataUtilityTypes.forEach(utilityType => {
      if (event.option.value == utilityType.description) {
        this.form.controls.utilityTypeId.setValue(utilityType.id);
        this.defaults.utilityTypeId = utilityType.id;
        this.onUtilityTypeSelect(utilityType.id)
      }
    })
  }

  selectUnit(event) {
    this.metadataUnits.forEach(unitNumber => {
      if (event.option.value == unitNumber.description) {
        this.form.controls.unitId.setValue(unitNumber.id);
        this.onUnitSelect(this.defaults.utilityTypeId, unitNumber.id);
      }
    })
  }

  selectMeter(event) {
    this.metadataMeters.forEach(meter => {
      if (event.option.value == meter.description) {
        this.form.controls.meterId.setValue(meter.id);
      }
    })
  }

  onUtilityTypeSelect(utilityTypeId) {
    this.serviceDisconnectionService.getAllUnits(utilityTypeId).subscribe((units: MetadataUnit[]) => {
      this.metadataUnits = units.map(unit => new MetadataUnit(unit));
      this.filteredUnits = units;
    });
  }

  onUnitSelect(utilityTypeId, unitId) {
    this.serviceDisconnectionService.getMeter(utilityTypeId, unitId).subscribe((meters: MetadataMeter[]) => {
      this.metadataMeters = meters.map(meter => new MetadataMeter(meter));
      this.filteredMeters = meters;
      this.form.controls.meterId.setValue(this.metadataMeters[0].id);
      this.form.controls.meterName.setValue(this.metadataMeters[0].description);

      this.serviceDisconnectionService.getConnectionStatus(utilityTypeId, unitId, this.metadataMeters[0].id)
        .subscribe((serviceDisconnections: ServiceDisconnection[]) => {
          this.serviceDisconnections = serviceDisconnections.map(serviceDisconnection =>
            new ServiceDisconnection(serviceDisconnection))
          this.form.controls.isConnected.setValue(this.serviceDisconnections[0].isConnected);
        });

      this.meterId = this.metadataMeters[0].id;
    });


    if (this.serviceDisconnections != null) {
      this.defaults.isConnected = this.serviceDisconnections[0].isConnected;
      this.form.controls.isConnected.setValue(this.defaults.isConnected);
    }
  }

  close() {
    this.dialogRef.close();
  }
}








import { Component, Inject, OnInit, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { FormValidators } from '../../../shared/methods/form-validators';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { MasterService } from 'src/app/tabs/shared/services/master.service';
import { BenchmarkSetting } from './benchmark-settings.model';
import { defaults } from 'chart.js';
import { DatePipe } from '@angular/common';
import { BenchmarkSettingService } from 'src/app/tabs/shared/services/benchmark-settings.service';
import { MatOption } from '@angular/material/core';
import { EstidamaChartService } from 'src/app/tabs/estidama-chart/estidama-chart.service';
import { MeterReplacementService } from 'src/app/tabs/shared/services/meterreplacement.service';
import { ParameterChartService } from 'src/app/tabs/shared/services/parameter-chart.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'fury-benchmark-settings-create-update',
  templateUrl: './benchmark-settings-create-update.component.html',
  styleUrls: ['./benchmark-settings-create-update.component.scss']
})
export class BenchmarkSettingsCreateUpdateComponent implements OnInit {

  static id = 100;
  form: FormGroup;
  clientId: number=0;
  client: number;
  alarmTypes: Master[] = [];
  meters: Master[] = [];
  clients: Master[] = [];
  parameters: Master[] = [];
  filteredMeters: any[] = [];
  meterType: string = '';
  parameterId: number;
  meterId: number;
  alarmTypeId: number;
  selectedMeters = [];
  meterTypes: any = [];
  meterTypeId: number;
  meterTypeName: string = '';
  meterGroupList: any = [];
  lstMeterGroup: any = [];
  meterGroup: number = null;

  @ViewChild('allMetersSelected') private allMetersSelected: MatOption;
  constructor(@Inject(MAT_DIALOG_DATA)
  public defaults: BenchmarkSetting,
    private dialogRef: MatDialogRef<BenchmarkSettingsCreateUpdateComponent>,
    private fb: FormBuilder, private masterService: MasterService,
    private datePipe: DatePipe,
    private benchmarkSettingService: BenchmarkSettingService,
    private estidamaChartService: EstidamaChartService,
    private meterReplacementService: MeterReplacementService,
    private parameterChartService: ParameterChartService,
    private fv: FormValidators,
    private cookieService: CookieService) {
    dialogRef.disableClose = true;
  }


  ngOnInit(): void {

    this.defaults = new BenchmarkSetting({});

    //this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.masterService.getSystemMasterdata(66, 0).subscribe((data: Master[]) => {
      this.alarmTypes = data;
    });

    this.getMeterTypes();    

    this.form = this.fb.group({
      rowid: [this.defaults.rowid || BenchmarkSettingsCreateUpdateComponent.id++],
      clientId: ['', Validators.required],
      meterTypeId: ['', Validators.required],
      meter: ['', Validators.required],
      parameterId: ['', Validators.required],
      type: ['', Validators.required],
      target: ['', Validators.required]
    });

    this.getClients();
  }

  getMeterTypes() {
    this.meterTypes = [];
    this.meterGroupList = [];
    this.lstMeterGroup = [];
    this.parameters = [];

    this.estidamaChartService.getMeterTypes().subscribe((response: any) => {

      if (response) {
        const meterTypes = response['meterTypeList'];
        if (meterTypes) {
          meterTypes.forEach(element => {
            this.meterTypes.push({ id: element.meterTypeID, description: element.meterTypeName });
          });
        }
        this.meterTypeId = this.meterTypes[0].id;
        this.meterTypeName = this.meterTypes[0].description;
        //this.meterGroupList = response['meterGroupList'];
        this.onMeterTypeChange();
      }
    })
  }

  onMeterTypeChange(event = null) {
    if (event) {
      this.meterTypeName = event.value;
    }
    this.meterTypes.find((meter) => {
      if (meter.description == this.meterTypeName)
        this.meterTypeId = meter.id
    })
    this.getMeters();
    this.getParameters();
    // this.meterGroupList.forEach(group => {
    //   if (group.meterTypeID == this.meterTypeId) {
    //     if (!this.lstMeterGroup.some(meterGroup => meterGroup.groupID == group.groupID)) {
    //       this.lstMeterGroup.push({ groupID: group.groupID, groupName: group.groupName })
    //     }
    //   }
    // })

    // if (this.lstMeterGroup.length > 0)
    //   this.meterGroup = this.lstMeterGroup[0].groupID; //Initialise group list
    // this.onMeterGroupChange();
  }

  onMeterGroupChange() {
    this.meters = [];
    this.meterGroupList.forEach(group => {
      if (group.meterTypeID == this.meterTypeId && group.groupID == this.meterGroup) {
        if (!this.meters.some(meterName => meterName.id == group.meterID)) {
          this.meters.push({ id: group.meterID, description: group.meterName })
        }
      }
    })
    //Initialise meter list
    this.getParameters();
  }

  // getMeters() {
  //   this.benchmarkSettingService.getMeterList(this.clientId, this.meterTypeId).subscribe((data: Master[]) => {
  //     this.meters = data
  //     this.filteredMeters = data
  //   })
  // }

  getMeters() {
    this.meters = [];
    this.selectedMeters = [];
    if(this.clientId != 0)
    {
      this.meterReplacementService.getV1DeviceGroupMeterList(this.meterTypeId ?? 0, 0, this.clientId.toString()).subscribe((response: any) => {
        if (response) {
          this.meters = this.filteredMeters = response;
        }
      });
    }    
  }

  getClients() {
    this.clients = [];
    this.meterReplacementService.getClients().subscribe((clients: Master[]) => {
      if (clients) {
        this.clients = clients;
      }
    });
  }

  onChangeClient(event)
  {
    this.getMeters();
  }

  getParameters() {
    this.parameters = [];
    this.parameterChartService.getParameters(this.meterTypeName).subscribe((response: any) => {
      if (response) {
        this.parameters = response;
      }
    });
  }

  // getParameters() {
  //   this.benchmarkSettingService.getParametersList(this.meterTypeId).subscribe((data: Master[]) => {
  //     this.parameters = data
  //   })
  // }

  save() {
    this.createBenchmark();
  }

  createBenchmark() {
    Object.assign(this.defaults, this.form.value);
    let index = this.selectedMeters.findIndex((item) => item == 0);
    if (index >= 0)
      this.selectedMeters.splice(index, 1);
    this.defaults.meter = this.selectedMeters.join(",");
    this.defaults.meterTypeId = this.meterTypeId;
    this.defaults.clientId = this.clientId;
    this.dialogRef.close(new BenchmarkSetting(this.defaults));
  }

  toggleMeterTypesAllSelection() {
    if (this.allMetersSelected.selected) {
      this.form.controls.meter
        .patchValue([...this.meters.map(item => item.id), 0]);
    } else {
      this.form.controls.meter.patchValue([]);
    }
  }

  toggleMetersPerOne(all) {
    if (this.allMetersSelected.selected) {
      this.allMetersSelected.deselect();
      return false;
    }
    if (this.form.controls.meter.value.length == this.meters.length)
      this.allMetersSelected.select();
  }

  searchMeter(query: string) {
    let result = this.selectMeterType(query)
    this.meters = result;
  }

  selectMeterType(query: string) {
    let result = [];
    for (let a of this.filteredMeters) {
      if (a.deviceName && a.deviceName.toLowerCase().indexOf(query) > -1) {
        result.push(a)
      }
    }
    return result
  }

  // onMeterTypeChange(event) {
  //   this.meterTypeId = event.value;
  //   this.getMeters();
  //   this.getParameters();
  // }

  onChangeMeter(event) {
    this.meterId = this.selectedMeters[0];
  }

  onChangeParameter(event) {
    this.parameters.filter((item) => {
      if (item.id == event.value)
        this.parameterId = item.id
    })
  }

  onChangeAlarmType(event) {
    this.alarmTypes.filter((item) => {
      if (item.description == event.value)
        this.alarmTypeId = item.id
    })
  }

  close() {
    this.dialogRef.close();
  }

}

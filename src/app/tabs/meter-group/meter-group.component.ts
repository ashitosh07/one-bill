import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { EstidamaChartService } from '../estidama-chart/estidama-chart.service';
import { ListItem } from '../shared/models/list-item.model';
import { Master } from '../shared/models/master.model';
import { AlertSettingsEMSService } from '../shared/services/alert-settings-ems.service';
import { MasterService } from '../shared/services/master.service';
import { DeviceGroup } from '../shared/models/device-group.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CookieService } from 'ngx-cookie-service';
import { MeterReplacementService } from '../shared/services/meterreplacement.service';

@Component({
  selector: 'fury-meter-group',
  templateUrl: './meter-group.component.html',
  styleUrls: ['./meter-group.component.scss']
})
export class MeterGroupComponent implements OnInit {

  lstMeterType: Master[];
  lstMeterGroup: Master[];
  meterTypeId: number;
  meterTypeName: string;
  meterGroupId: number;
  lstMetersGrouped: Master[];
  clientId: string='0';
  lstMeters: ListItem[] = [];
  selectedlstMeters: ListItem[] = [];
  deviceGroups: DeviceGroup[] = [];
  clients: Master[] = [];
  client: number=0;

  constructor(private masterService: MasterService,
    private alertSettingsEmsService: AlertSettingsEMSService,
    private estidamaChartService: EstidamaChartService,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private meterReplacementService: MeterReplacementService,
    private cookieService: CookieService) { }

  ngOnInit(): void {

    // const filterData = this.cookieService.get('filterData');
    // if (filterData) {
    //   let dataArray = JSON.parse(filterData);
    //   if (dataArray['strClientId'] == '') {
    //     this.clientId = '0'; //this.cookieService.get('globalClientId');    
    //   }
    //   else {
    //     this.clientId = dataArray['strClientId'];
    //   }
    // }
    this.getClients();
    //this.clientId = this.cookieService.get('globalClientId');
    this.getMeterTypes();
    //this.getDeviceGroups();
    //this.getMeterList();
  }

  getMeterTypes() {
    this.lstMeterType = [];
    this.estidamaChartService.getMeterTypes().subscribe((response: any) => {
      if (response) {
        const meterTypes = response['meterTypeList'];
        if (meterTypes) {
          meterTypes.forEach(element => {
            this.lstMeterType.push({ id: element.meterTypeID, description: element.meterTypeName });
          });
        }
        //this.lstMeterType = response['meterTypeList'];
      
        if((this.lstMeterType) && (this.lstMeterType.length > 0))
        {
          this.meterTypeId = this.lstMeterType[0].id;
          this.meterTypeName = this.lstMeterType[0].description;          
          this.getDeviceGroups();
        }
        this.getMeterList();
      }
    })    
  }

  getDeviceGroups() {
    this.meterGroupId = 0;
    this.lstMeterGroup = [];
    this.meterReplacementService.getV1MeterGroupList(this.meterTypeId).subscribe((data: Master[]) => {
      this.lstMeterGroup = data;
    });
    // this.masterService.getUserMasterdata(71, 0).subscribe((data: Master[]) => {
    //   this.lstMeterGroup = data;
    // });
  }

  getMeterList() {
    this.lstMeters = [];
    this.selectedlstMeters = [];
    if(this.clientId != '0')
    {
      this.alertSettingsEmsService.getv1MeterList(this.clientId, this.meterTypeId, this.meterGroupId == undefined ? 0 : this.meterGroupId).subscribe((data: Master[]) => {
        data.forEach(x => {
          if (x.defaultValue && x.defaultValue === '1') {
            this.selectedlstMeters.push({ label: x.description, value: x.id, selected: false });
          } else {
            this.lstMeters.push({ label: x.description, value: x.id, selected: false });
          }
        });
        this.lstMeters.sort((a, b) => a.label.localeCompare(b.label));
        this.selectedlstMeters.sort((a, b) => a.label.localeCompare(b.label));
      })
    }    
  }

  onMeterTypeChange() {
    this.lstMeterType.find((meterType) => {
      if(meterType.description == this.meterTypeName)
        this.meterTypeId = meterType.id
        this.getDeviceGroups();
    })
    this.getMeterList();
  }

  onMeterGroupChange() {
    this.getMeterList();
  }

  getClients() {
    this.clients = [];
    this.meterReplacementService.getClients().subscribe((clients: Master[]) => {
      if (clients) {
        this.clients = clients;
      }
    });
  }

  onChangeClient($event)
  {
    this.getMeterList();
  }

  public toggleSelection(item, list) {
    item.selected = !item.selected;
  }

  public moveSelected(direction) {
    if (direction === 'left') {
      this.selectedlstMeters.forEach(item => {
        if (item.selected) {
          this.lstMeters.push(item);
        }
      });
      this.selectedlstMeters = this.selectedlstMeters.filter(i => !i.selected);
      this.lstMeters.sort((a, b) => a.label.localeCompare(b.label));
    } else {
      this.lstMeters.forEach(item => {
        if (item.selected) {
          this.selectedlstMeters.push(item);
        }
      });
      this.lstMeters = this.lstMeters.filter(i => !i.selected);
      this.selectedlstMeters.sort((a, b) => a.label.localeCompare(b.label));
    }
  }

  public moveAll(direction) {
    if (direction === 'left') {
      this.lstMeters = [...this.lstMeters, ...this.selectedlstMeters];
      this.lstMeters.sort((a, b) => a.label.localeCompare(b.label));
      this.selectedlstMeters = [];
    } else {
      this.selectedlstMeters = [...this.selectedlstMeters, ...this.lstMeters];
      this.selectedlstMeters.sort((a, b) => a.label.localeCompare(b.label));
      this.lstMeters = [];
    }
  }

  onSave() {
    this.deviceGroups = [];
    let result = true;
    if((this.meterTypeId && this.meterTypeId > 0) &&(this.meterGroupId && this.meterGroupId > 0))
    {
      this.alertSettingsEmsService.deleteMeterGroup(this.meterTypeId,this.meterGroupId).subscribe(response => {
        if (response) {
          result = true;
        } else {
          result = false;
        }
      });
    }
    else {
      this.notificationMessage("Please select Meter Type and Meter Group.","red-snackbar");
      return;
    }
    if (this.meterTypeId && this.meterGroupId && this.selectedlstMeters && this.selectedlstMeters.length) 
    {
      this.selectedlstMeters.forEach(x => {
        const deviceGroup: DeviceGroup = {
          meterTypeId: Number(this.meterTypeId),
          groupId: Number(this.meterGroupId),
          meterId: Number(x.value)
        }
        this.deviceGroups.push(deviceGroup);
      });
    }
    if (this.deviceGroups != null && this.deviceGroups.length) {
      this.alertSettingsEmsService.saveCreateMeterGroup(this.deviceGroups).subscribe(
        response => {
          if (response) {
            result = true;
            //this.notificationMessage('Meter group saved successfully', 'green-snackbar');
          } else {
            result = false;
            //this.notificationMessage('Meter group save failed', 'red-snackbar');
          }
        });
    }
    if (result == true) {
      this.notificationMessage('Meter group saved successfully', 'green-snackbar');
    } else {
      this.notificationMessage('Meter group save failed', 'red-snackbar');
    }
    //else {
    //   this.notificationMessage('Please select meters', 'red-snackbar');
    // }
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }
}

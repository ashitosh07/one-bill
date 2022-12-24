import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { DeviceGroup } from '../models/device-group.model';
import { EnvService } from 'src/app/env.service';

@Injectable({
  providedIn: 'root'
})
export class AlertSettingsEMSService {
  baseUrl = '';

  constructor(private http: HttpClient,
    private envService: EnvService) {
    this.baseUrl = envService.backend;
  }

  createAlertSettingsEMS(alertSettingsEms) {
    return this.http.post(this.baseUrl + '/alarmsettings', alertSettingsEms);
  }

  getMeterList(clientId: number, meterTypeId: number = 0, groupId: number = 0,) {
    let params: HttpParams = new HttpParams();
    params = params.append('groupId', `${groupId}`);
    params = params.append('meterTypeId', `${meterTypeId}`);
    params = params.append('clientId', `${clientId}`);
    return this.http.get(this.baseUrl + '/alarmsettings/meterList', { params });
  }

  getv1MeterList(clientId: string, meterTypeId: number = 0, groupId: number = 0,) {
    let params: HttpParams = new HttpParams();
    params = params.append('groupId', `${groupId}`);
    params = params.append('meterTypeId', `${meterTypeId}`);
    params = params.append('clientId', `${clientId}`);
    return this.http.get(this.baseUrl + '/alarmsettings/V1/meterList', { params });
  }

  getParametersList() {
    return this.http.get(this.baseUrl + '/alarmsettings/parameters');
  }

  getAlertSettings(clientId) {
    return this.http.get(this.baseUrl + '/alarmsettings/GetAllAlarmSettings/' + clientId);
  }

  getv1AlertSettings(clientId) {
    let params: HttpParams = new HttpParams();
    params = params.append('clientId', `${clientId}`);
    return this.http.get(this.baseUrl + '/alarmsettings/GetAllV1AlarmSettings', { params });
  }

  deleteAlertSettings(id) {
    return this.http.delete(this.baseUrl + '/alarmsettings/' + id);
  }

  getAlarmDetails(alarmEms) {
    return this.http.post(this.baseUrl + '/alarmsettings/alarmDetails', alarmEms);
  }

  saveCreateMeterGroup(deviceGroups: DeviceGroup[]) {
    return this.http.post<boolean>(this.baseUrl + '/alarmsettings/metertype/group/meter', deviceGroups);
  }

  deleteMeterGroup(meterTypeId: number = 0, meterGroupId: number = 0) {
    let params: HttpParams = new HttpParams();
    params = params.append('meterTypeId', `${meterTypeId}`);
    params = params.append('meterGroupId', `${meterGroupId}`);
    return this.http.delete(this.baseUrl + '/alarmsettings/metertypeGroup/meter', { params });
  }
}

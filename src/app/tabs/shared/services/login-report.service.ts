import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpBackend } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { LoginReport } from '../models/login-report.model';
import { Subject } from 'rxjs';
import { EnvService } from 'src/app/env.service';
import { UserFileAcceptanceLog } from '../models/user-file-acceptance-log.model';


@Injectable({
  providedIn: 'root'
})
export class LoginReportService {

  baseUrl = '';
  http: HttpClient;
  private isProfileUpdatedUser = new Subject<string>();
  isProfileUserHandler = this.isProfileUpdatedUser.asObservable();
  constructor(
    private handler: HttpBackend,
    private envService: EnvService) {
    this.http = new HttpClient(handler);
    this.baseUrl = envService.backend;
  }

  setIsProfiledUser(value: string) {
    this.isProfileUpdatedUser.next(value);
  }

  createLoginDetails(loginReport) {
    return this.http.post(this.baseUrl + '/loginReports', loginReport);
  }

  updateLogoutTime(id, loginReport) {
    return this.http.put(this.baseUrl + '/loginReports/' + id, loginReport);
  }

  getLoginUserDetails(userId: string) {
    return this.http.get<any>(this.baseUrl + '/loginReports/GetLoginUserReports/' + userId);
  }

  getAllUserAcceptanceLogDetails(clientId: number) {
    let params: HttpParams = new HttpParams();
    params = params.append('clientId', `${clientId}`);
    return this.http.get<UserFileAcceptanceLog[]>(this.baseUrl + '/loginReports/user/acceptance/details', { params });
  }

  getIPAddress() {
    return this.http.get("http://api.ipify.org/?format=json")
  }

  getIPAddressToLoginReport() {
    this.getIPAddress();

  }
}

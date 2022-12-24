import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { EnvService } from 'src/app/env.service';
import { environment } from '../../../../environments/environment';
import { UserActions } from '../models/user-actions.model';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  baseUrl ='';

  constructor(private http: HttpClient,
    private envService:EnvService) { 
      this.baseUrl = envService.backend;
    }

  getDocuments() {
    return this.http.get(this.baseUrl + '/register');
  }

  getUnits(clientId) {
    return this.http.get(this.baseUrl + '/register/getUnits/clientId/' + clientId);
  }

  getClients() {
    return this.http.get(this.baseUrl + '/register/getClients');
  }

  getUserEnabledActions(userId: string) {
    let params: HttpParams = new HttpParams();
    if (userId) {
      params = params.append('userId', userId);
    }
    return this.http.get<UserActions[]>(this.baseUrl + '/register/user/enabled/actions', { params });
  }

  getCompanyLogo()
  {
    return this.http.get<string>(this.baseUrl +'/register/logo');    
  }

}

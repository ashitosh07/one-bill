import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from 'src/app/env.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TelephonecallService {

  baseUrl = '';

  constructor(private httpClient: HttpClient,
    private envService: EnvService) {
    this.baseUrl = envService.backend;
  }


  // getCallTypes(){
  //   return this.httpClient.get(this.url + '/metadata');
  // }

  updateTelephonecallById(telephone) {
    return this.httpClient.post(this.baseUrl + '/telephoneCalls/', telephone);
  }

  getCalls(ownerId) {
    return this.httpClient.get<any>(this.baseUrl + '/telephoneCalls/' + ownerId);
  }


}

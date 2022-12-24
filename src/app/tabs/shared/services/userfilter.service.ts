import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { EnvService } from 'src/app/env.service';

@Injectable({
  providedIn: 'root'
})
export class UserfilterService {
  baseUrl = '';
  constructor(private envService: EnvService, private http: HttpClient) {
    this.baseUrl = envService.backend;
  }

  getUserfilter(id) {
    return this.http.get(this.baseUrl + '/UserFilter/' + id);
  }

  getClientProjects(id) {
    return this.http.get(this.baseUrl + '/UserFilter/GetClientProjects/' + id);
  }

}

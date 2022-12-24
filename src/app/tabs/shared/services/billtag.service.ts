import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { EnvService } from 'src/app/env.service';

@Injectable({
  providedIn: 'root'
})
export class BilltagService {
  baseUrl = '';

  constructor(private http: HttpClient,
    private envService: EnvService) {
    this.baseUrl = envService.backend;
  }

  createBilltag(billtag) {
    return this.http.post(this.baseUrl + '/billTags', billtag);
  }


}

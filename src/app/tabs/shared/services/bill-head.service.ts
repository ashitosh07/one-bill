import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CopyContent } from '../models/copy-content.model';
import { environment } from '../../../../environments/environment';
import { EnvService } from 'src/app/env.service';

@Injectable({
  providedIn: 'root'
})

export class BillheadService {
  baseUrl = '';

  constructor(private http: HttpClient,
    private envService:EnvService) {
      this.baseUrl = envService.backend;
     }

  getBillHeads(clientId) {
    return this.http.get(this.baseUrl + '/accountheads/clientId/' + clientId);
  }

  createBillHead(billHead) {
    return this.http.post(this.baseUrl + '/accountheads', billHead);
  }

  updateBillHeadById(id, billHead) {
    return this.http.put(this.baseUrl + '/accountheads/' + id, billHead)
  }

  deleteBillHeadById(id) {
    return this.http.delete(this.baseUrl + '/accountheads/' + id);
  }

  getTariffs(utilityTypeId: number, clientId: number) {
    return this.http.get(this.baseUrl + '/accountheads/getTariffs/' + utilityTypeId + '/' + clientId);
  }

  copyBillHead(copyContents: CopyContent[]) {
    return this.http.post<boolean>(this.baseUrl + '/accountheads/copy/contents', copyContents);
  }

  checkForDuplicatePosition(position: number, id: number, clientId: number) {
    let params: HttpParams = new HttpParams();
    params = params.append('position', `${position}`);
    params = params.append('id', `${id}`);
    params = params.append('clientId', `${clientId}`);
    return this.http.get(this.baseUrl + '/accountheads/position', { params })
  }

  getNextPosition(clientId: number) {
    let params: HttpParams = new HttpParams();
    params = params.append('clientId', `${clientId}`);
    return this.http.get(this.baseUrl + '/accountheads/nextposition', { params })
  }

  getGracePeriod(clientId: number, formula: string) {
    let params: HttpParams = new HttpParams();
    params = params.append('clientId', `${clientId}`);
    params = params.append('formula', `${formula}`);
    return this.http.get(this.baseUrl + '/accountheads/gracePeriod', { params })
  }

  getBillSettingClientMapping(clientId: number) {
    let params: HttpParams = new HttpParams();
    params = params.append('clientId', `${clientId}`);
    return this.http.get(this.baseUrl + '/accountheads/billSettingClientMapping', { params })
  }
}
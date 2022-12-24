import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http'
import { Client } from './client-create-update/client.model'
import { environment } from '../../../../src/environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { error } from '@angular/compiler/src/util';
import { EnvService } from 'src/app/env.service';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  baseUrl = '';

  constructor(private http: HttpClient, private envService: EnvService) {
    this.baseUrl = envService.fakeUrl;
  }

  getClientData(): Observable<Client[]> {
    return this.http.get<Client[]>(this.baseUrl + 'client')
  }

  updateClientData(client): void {

    this.http.post(this.baseUrl + 'client', client);

  }

  addClient(client: Client): Observable<any> {
    const headers = { 'content-type': 'application/json' }
    return this.http.post<Client>(this.baseUrl + 'client', client, {
      'headers': new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  modifyClient(client: Client): Observable<void> {
    const headers = { 'content-type': 'application/json' }
    return this.http.put<void>(`${this.baseUrl}client/3`, client, {
      'headers': new HttpHeaders({
        'Content-Type': 'application/json'
      })
    })
  }


}

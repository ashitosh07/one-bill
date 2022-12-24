import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { EnvService } from 'src/app/env.service';

@Injectable({
  providedIn: 'root'
})
export class BillHeadTransactionService {
  baseUrl = '';
  
  constructor(private http:HttpClient,
    private envService:EnvService) { 
      this.baseUrl = envService.backend;
    }

  getBillHeadTransactions(){
    return this.http.get(this.baseUrl +'/accountheadtransactions');
  }

  createBillHeadTransaction(billHeadTransaction){
    return this.http.post(this.baseUrl +'/accountheadtransactions',billHeadTransaction);
  }

  updateBillHeadTransactionById(id,billHeadTransaction){
    return this.http.put(this.baseUrl +'/accountheadtransactions/'+ id,billHeadTransaction);
  }

  deleteBillHeadTransactionById(id){
    return this.http.delete(this.baseUrl +'/accountheadtransactions/'+id);
  }

  getBillSettings() {
    return this.http.get<any>(this.baseUrl + '/accountheadtransactions/billSettings');
  }    
}

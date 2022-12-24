import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { EnvService } from 'src/app/env.service';


@Injectable({
  providedIn: 'root'
})
export class TenantService {
  baseUrl = '';

  constructor(private http:HttpClient,
    private envService:EnvService) { 
      this.baseUrl = envService.backend;
    }

  getClients(){
    return this.http.get(this.baseUrl +'/clients');
  }

  createClient(client){
    return this.http.post(this.baseUrl +'/clients', client);
  }

  updateClientbyId(id,client){
    
    return this.http.put(this.baseUrl +'/clients/'  +id, client);
  }

  deleteClientbyId(id){
    return this.http.delete(this.baseUrl +'/clients/' + id);
  }

  getClientNames()
  {
    return this.http.get(this.baseUrl +'/clients/clientNames');
  }
}

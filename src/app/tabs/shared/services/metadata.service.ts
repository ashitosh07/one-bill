import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";

import { Metadata } from '../models/metadata.model';
import { environment } from '../../../../environments/environment';
import { EnvService } from 'src/app/env.service';

@Injectable({
    providedIn: 'root'
})
export class MetadataService {
    metadata: Metadata;
    baseUrl = '';

    constructor(private http: HttpClient,
        private envService:EnvService){
            this.baseUrl = envService.backend;
        }
    
    invokeMetadata() {
        if(!this.metadata) {
            this.http.get(this.baseUrl + '/metadata').subscribe(data => {
                this.metadata = new Metadata(data);
            })
        }
    }

    getMetadata() {
        return this.metadata;
    }
}
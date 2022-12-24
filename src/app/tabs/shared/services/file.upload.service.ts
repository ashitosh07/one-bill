import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { environment } from '../../../../environments/environment';
import { Master } from '../models/master.model';
import { Observable } from 'rxjs';
import { EnvService } from '../../../env.service';

@Injectable({
    providedIn: 'root'
})

export class FileUploadService {

    baseUrl = '';

    constructor(private http: HttpClient, private envService: EnvService) {
        this.baseUrl = envService.jsonServerUrl;
    }

    postFile(fileToUpload: File): Observable<boolean> {
        const endpoint = 'your-destination-url';
        const formData: FormData = new FormData();
        formData.append('fileKey', fileToUpload, fileToUpload.name);
        return this.http.post<boolean>(endpoint, formData);
    }
}
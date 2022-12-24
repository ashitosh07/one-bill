import { HttpBackend, HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { map } from 'rxjs/operators';
import { EnvService } from 'src/app/env.service';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class FileService {
    baseUrl = '';
    http: HttpClient


    constructor(private handler: HttpBackend,
        private envService:EnvService) {
        this.http = new HttpClient(handler)
        this.baseUrl = envService.backend;
    }

    upload(file,fileType: string = "file") {
        var formData = new FormData();
        formData.append('file', file);
        return this.http.post(this.baseUrl + '/fileupload/' + fileType, formData)
            .pipe(map((res: { 'fileName'; '' }) => { return res.fileName }));
    }
}
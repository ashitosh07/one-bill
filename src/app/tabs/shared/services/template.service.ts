import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { environment } from '../../../../environments/environment';
import { ResponseDetails } from '../models/response-details.model';
import { Payment } from '../models/payment.model';
import { TemplateContent } from '../models/template-content.model';
import { EnvService } from 'src/app/env.service';

@Injectable({
    providedIn: 'root'
})
export class TemplateService {

    baseUrl = '';

    constructor(private http: HttpClient,
        private envService:EnvService) { 
            this.baseUrl = envService.backend;
        }

    emailInvoiceTemplate(templateContent: TemplateContent) {
        return this.http.post<boolean>(`${this.baseUrl}/template/invoice`, templateContent.billMasterDetails);
    }

    emailReceiptTemplate(billMasterDetails: Payment[]) {
        return this.http.post<boolean>(`${this.baseUrl}/template/receipt`, billMasterDetails);
    }

    emailCustomTemplate(templateContent: TemplateContent) {
        return this.http.post<ResponseDetails>(`${this.baseUrl}/template/customized`, templateContent);
    }

}
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { EnvService } from 'src/app/env.service';
import { environment } from '../../../../environments/environment';
import { WorkflowRule } from '../models/workflow-rule.model';

@Injectable({
    providedIn: 'root'
})
export class WorkflowRuleService {

    baseUrl = '';
    constructor(private http: HttpClient, private envService: EnvService) {
        this.baseUrl = envService.backend;
    }

    getWorkflowRules(clientId: number) {
        let params: HttpParams = new HttpParams();
        params = params.append('clientId', `${clientId}`);
        return this.http.get<WorkflowRule[]>(this.baseUrl + '/workflowrule/items', { params });
    }

    updateWorkflowRules(workflowRules: WorkflowRule[]) {
        return this.http.put<boolean>(this.baseUrl + '/workflowrule/items', workflowRules);
    }
}
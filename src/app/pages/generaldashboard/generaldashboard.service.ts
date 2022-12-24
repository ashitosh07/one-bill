import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ManageParams } from 'src/app/tabs/shared/models/manage-params.model';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { DashboardParameters } from 'src/app/tabs/shared/models/dashboard-parameters.model';
import { EnvService } from 'src/app/env.service';

@Injectable({
  providedIn: 'root'
})
export class GeneraldashboardService {

  baseUrl = '';

  constructor(private http: HttpClient,
    private envService: EnvService) {
    this.baseUrl = envService.backend
  }

  getDatas() {
    return this.http.get(this.baseUrl + '/invoiceData');
  }

  getMeterData(dashboardParameters: DashboardParameters) {
    //let params: HttpParams = new HttpParams();  
    //params = params.append('clientId', `${manageParams.strClientId}`);
    //params = params.append('utilityTypeId', `${parseInt(manageParams.utilityTypeId)}`);
    //  params = params.append('countryId', `${manageParams.countryId}`);
    //  params = params.append('locationId', `${manageParams.locationId}`);
    //  params = params.append('areaId', `${manageParams.areaId}`);
    //  params = params.append('fromDate', `${manageParams.fromDate}`);
    //  params = params.append('toDate', `${manageParams.toDate}`);
    //return this.http.get(this.url + '/dashboard/'+clientId +'/'+ utilityTypeId + '/MeterData');
    //return this.http.get(this.url + '/dashboard/meterData',{params});

    return this.http.post(this.baseUrl + '/dashboard/meterData', dashboardParameters);
  }

  getUnitData(dashboardParameters: DashboardParameters) {
    //let params: HttpParams = new HttpParams();  
    //params = params.append('clientId', `${manageParams.strClientId}`);
    //params = params.append('utilityTypeId', `${parseInt(manageParams.utilityTypeId)}`);
    // params = params.append('countryId', `${manageParams.countryId}`);
    // params = params.append('locationId', `${manageParams.locationId}`);
    // params = params.append('areaId', `${manageParams.areaId}`);
    // params = params.append('fromDate', `${manageParams.fromDate}`);
    // params = params.append('toDate', `${manageParams.toDate}`);
    //return this.http.get(this.url + '/dashboard/'+clientId +'/'+ utilityTypeId + '/UnitData');

    return this.http.post(this.baseUrl + '/dashboard/unitData', dashboardParameters);
  }

  getInvoiceData(dashboardParameters: DashboardParameters) {
    // let params: HttpParams = new HttpParams();  
    // params = params.append('clientId', `${manageParams.strClientId}`);
    //params = params.append('utilityTypeId', `${parseInt(manageParams.utilityTypeId)}`);
    // params = params.append('countryId', `${manageParams.countryId}`);
    // params = params.append('locationId', `${manageParams.locationId}`);
    // params = params.append('areaId', `${manageParams.areaId}`);
    // params = params.append('fromDate', `${manageParams.fromDate}`);
    // params = params.append('toDate', `${manageParams.toDate}`);
    //return this.http.get(this.url + '/dashboard/'+clientId +'/'+ utilityTypeId + '/InvoiceData');

    return this.http.post(this.baseUrl + '/dashboard/invoiceData', dashboardParameters);
  }

  getRevenueData(dashboardParameters: DashboardParameters) {
    // let params: HttpParams = new HttpParams();  
    // params = params.append('clientId', `${manageParams.strClientId}`);
    //params = params.append('utilityTypeId', `${parseInt(manageParams.utilityTypeId)}`);
    // params = params.append('countryId', `${manageParams.countryId}`);
    // params = params.append('locationId', `${manageParams.locationId}`);
    // params = params.append('areaId', `${manageParams.areaId}`);
    // params = params.append('fromDate', `${manageParams.fromDate}`);
    // params = params.append('toDate', `${manageParams.toDate}`);

    return this.http.post(this.baseUrl + '/dashboard/revenueData', dashboardParameters);
  }

  getRevenueOfCurrentMonth(dashboardParameters: DashboardParameters) {
    // let params: HttpParams = new HttpParams();  
    // params = params.append('clientId', `${manageParams.strClientId}`);
    //params = params.append('utilityTypeId', `${parseInt(manageParams.utilityTypeId)}`);
    // params = params.append('countryId', `${manageParams.countryId}`);
    // params = params.append('locationId', `${manageParams.locationId}`);
    // params = params.append('areaId', `${manageParams.areaId}`);
    // params = params.append('fromDate', `${manageParams.fromDate}`);
    // params = params.append('toDate', `${manageParams.toDate}`);
    //return this.http.get(this.url + '/dashboard/'+clientId +'/'+ utilityTypeId + '/CurrentMonthRevenueData');

    return this.http.post(this.baseUrl + '/dashboard/currentMonthRevenueData', dashboardParameters);
  }

  getUtilities(clientId) {
    return this.http.get(this.baseUrl + '/dashboard/' + clientId + '/Utilities');
  }

  // getMetadata() {
  //   return this.http.get(this.url + '/metadata');
  // }

  getBarChartData(dashboardParameters: DashboardParameters) {
    // let params: HttpParams = new HttpParams();  
    // params = params.append('clientId', `${manageParams.strClientId}`);
    //params = params.append('utilityTypeId', `${parseInt(manageParams.utilityTypeId)}`);
    // params = params.append('countryId', `${manageParams.countryId}`);
    // params = params.append('locationId', `${manageParams.locationId}`);
    // params = params.append('areaId', `${manageParams.areaId}`);
    // params = params.append('fromDate', `${manageParams.fromDate}`);
    // params = params.append('toDate', `${manageParams.toDate}`);

    return this.http.post(this.baseUrl + '/dashboard/barChartData', dashboardParameters);
  }

  getCountOfContractsAboutToExpire(dashboardParameters: DashboardParameters) {
    // let params: HttpParams = new HttpParams();  
    // params = params.append('clientId', `${manageParams.strClientId}`);
    // params = params.append('countryId', `${manageParams.countryId}`);
    // params = params.append('locationId', `${manageParams.locationId}`);
    // params = params.append('areaId', `${manageParams.areaId}`);
    // params = params.append('fromDate', `${manageParams.fromDate}`);
    // params = params.append('toDate', `${manageParams.toDate}`);

    return this.http.post(this.baseUrl + '/dashboard/contractReminder', dashboardParameters);
  }

  getNumberOfOpenTickets(dashboardParameters: DashboardParameters) {
    // let params: HttpParams = new HttpParams();  
    // params = params.append('clientId', `${manageParams.strClientId}`);
    // params = params.append('countryId', `${manageParams.countryId}`);
    // params = params.append('locationId', `${manageParams.locationId}`);
    // params = params.append('areaId', `${manageParams.areaId}`);
    // params = params.append('fromDate', `${manageParams.fromDate}`);
    // params = params.append('toDate', `${manageParams.toDate}`);

    return this.http.post(this.baseUrl + '/dashboard/openTickets', dashboardParameters);
  }

  getClients(countryId, locationId, areaId) {
    let params: HttpParams = new HttpParams();
    params = params.append('countryId', `${countryId}`);
    params = params.append('locationId', `${locationId}`);
    params = params.append('areaId', `${areaId}`);
    return this.http.get<Master[]>(this.baseUrl + '/dashboard/getAllClientsByAddress', { params });
  }

  getDailyRevenueData(dashboardParameters: DashboardParameters) {
    return this.http.post(this.baseUrl + '/dashboard/revenueDataDailyWise', dashboardParameters);
  }

  getAllQuarterRevenueData(dashboardParameters: DashboardParameters) {
    return this.http.post(this.baseUrl + '/dashboard/invoiceDataQuarterWise', dashboardParameters);
  }

  getQuarterRevenueData(dashboardParameters: DashboardParameters) {
    return this.http.post(this.baseUrl + '/dashboard/invoiceDataSelectedQuarterWise', dashboardParameters);
  }

}

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { environment } from '../../../../environments/environment';
import { Voucher } from '../../accounts/create-voucher-update/voucher.model';
import { VoucherEntry } from '../../accounts/create-voucher-entry/voucher-entry.model';
import { EnvService } from 'src/app/env.service';

@Injectable({
    providedIn: 'root'
})
export class VoucherEntryService {

    baseUrl = '';


    constructor(private http: HttpClient,
        private envService:EnvService) {
            this.baseUrl = envService.backend;
         }

    getVoucherEntries() {
        return this.http.get(this.baseUrl + '/voucherEntries');
    }

    createVoucherEntry(vouchers: Voucher[]) {
        return this.http.post<boolean>(this.baseUrl + '/voucherEntries', vouchers);
    }

    getFilteredVoucherEntries(voucherType: number, voucherName: string, fromDate: string, toDate: string) {
        let params: HttpParams = new HttpParams();
        params = params.append('voucherType', `${voucherType}`);
        params = params.append('voucherName', `${voucherName}`);
        params = params.append('fromDate', `${fromDate}`);
        params = params.append('toDate', `${toDate}`);
        return this.http.get(this.baseUrl + '/voucherEntries/filteredVoucherEntries', { params });
    }

    getVouchersToExport(voucherType: number, voucherName: string, fromDate: string, toDate: string, clientId: number) {
        let params: HttpParams = new HttpParams();
        params = params.append('voucherType', `${voucherType}`);
        params = params.append('voucherName', `${voucherName}`);
        params = params.append('fromDate', `${fromDate}`);
        params = params.append('toDate', `${toDate}`);
        params = params.append('clientId', `${clientId}`);
        return this.http.get(this.baseUrl + '/voucherEntries/vouchers/export', { params });
    }

    updateVoucherEntryToXML(voucherEntry :VoucherEntry) {
        return this.http.post(this.baseUrl + '/voucherEntries/voucherentry/xml',voucherEntry);
    }

}
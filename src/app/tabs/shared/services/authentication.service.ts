import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { environment } from '../../../../environments/environment';
import { UserDetails } from '../models/user-details';
import { EmailConfirmation } from '../models/email-confirmation.model';
import { ResetPassword } from '../models/reset-password.model';
import { Owner } from '../../owner-tenant/create-owner/owner-create-update/owner.model';
import { EnvService } from 'src/app/env.service';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    baseUrl = '';

    constructor(private http: HttpClient,
        private envService:EnvService) { 
            this.baseUrl = envService.backend;
        }

    login(credentials) {
        return this.http.post<any>(this.baseUrl + '/authentication/login', credentials)
    }

    register(userDetails: UserDetails, clientId = 0) {
        return this.http.post<any>(`${this.baseUrl}/authentication/${clientId}/register`, userDetails)
    }

    getUsers() {
        return this.http.get(this.baseUrl + '/authentication/GetAllUsers')
    }

    updateUserDetailbyId(id, userDetails) {
        return this.http.put(this.baseUrl + '/authentication/' + id, userDetails);
    }

    deleteUserDetailbyId(id) {
        return this.http.delete(this.baseUrl + '/authentication/' + id);
    }

    updateUserDetail(userDetails, clientId: number) {
        return this.http.put<any>(`${this.baseUrl}/authentication/update/user/${clientId}/details`, userDetails);
    }

    confirmEmail(emailConfirmation: EmailConfirmation) {
        return this.http.post<any>(this.baseUrl + '/authentication/confirm-email', emailConfirmation)
    }

    forgetPassword(resetPassword: ResetPassword) {
        return this.http.post<any>(this.baseUrl + '/authentication/forget-password', resetPassword)
    }

    resetPassword(resetPassword: ResetPassword) {
        return this.http.post<any>(this.baseUrl + '/authentication/reset-password', resetPassword)
    }

    getExternalUserDetails(userId: string) {
        let params: HttpParams = new HttpParams();
        if (userId) {
            params = params.append('userId', userId);
        }
        return this.http.get<Owner>(this.baseUrl + '/loginuser/external/user/details', { params });
    }

    getUserDetailsById(userId: string) {
        return this.http.get<any>(this.baseUrl + '/authentication/' + userId);
    }

    updateUserPassword(userDetails) {
        return this.http.put(this.baseUrl + '/authentication/update/user/password', userDetails);
    }

    updateUserDetailInformation(userDetails) {
        return this.http.put(this.baseUrl + '/authentication/update/user/information', userDetails);
    }

    getRoles() {
        return this.http.get<any>(this.baseUrl + '/authentication/roles');
    }
}
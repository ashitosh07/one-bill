import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { environment } from '../../../../environments/environment';
import { RolePermission } from '../models/role-permission.model';
import { Subject } from 'rxjs';
import { DefaultRoutePages } from '../models/default-route-pages.model';
import { UserAcceptanceFiles } from '../models/user-acceptance-files.model';
import { UserFileAcceptanceLog } from '../models/user-file-acceptance-log.model';
import { EnvService } from 'src/app/env.service';

@Injectable({
    providedIn: 'root'
})
export class MenuItemService {

    baseUrl = '';

    private isExteranlUser = new Subject<number>();
    private isAuthenticatedUser = new Subject<boolean>();
    private isClientChanged = new Subject<boolean>();
    private isUnauthorized = new Subject<boolean>();

    isExteranlUserHandler = this.isExteranlUser.asObservable();
    isAuthenticatedUserHandler = this.isAuthenticatedUser.asObservable();
    isClientChangedHandler = this.isClientChanged.asObservable();
    isUnauthorizedHandler = this.isUnauthorized.asObservable();

    setIsExteranlUser(value: number) {
        this.isExteranlUser.next(value);
    }

    setIsAuthenticatedUser(value: boolean) {
        this.isAuthenticatedUser.next(value);
    }

    setIsClientChange(value: boolean) {
        this.isClientChanged.next(value);
    }

    setIsUnauthorized(value: boolean) {
        this.isUnauthorized.next(value);
    }

    constructor(private http: HttpClient,private envService:EnvService) {
        this.baseUrl = envService.backend;
     }

    getMenuItems() {
        return this.http.get<any[]>(this.baseUrl + '/menuitem/items');
    }

    getRoleMenuItems(role: string) {
        let params: HttpParams = new HttpParams();
        if (role) {
            params = params.append('role', role);
        }
        return this.http.get<RolePermission[]>(this.baseUrl + '/menuitem/role/items', { params });
    }

    addUserPagePermissions(roles: RolePermission[]) {
        return this.http.post<any[]>(this.baseUrl + '/menuitem/page/permission', roles);
    }

    getExternalRoleMenuItems(roleId: number) {
        let params: HttpParams = new HttpParams();
        if (roleId) {
            params = params.append('roleId', `${roleId}`);
        }
        return this.http.get<RolePermission[]>(this.baseUrl + '/menuitem/external/role/items', { params });
    }

    getDefaultRouterDetails() {
        return this.http.get<DefaultRoutePages[]>(this.baseUrl + '/menuitem/role/defaultpages');
    }

    getUserAcceptanceFiles(roleId: number) {
        let params: HttpParams = new HttpParams();
        if (roleId) {
            params = params.append('roleId', `${roleId}`);
        }
        return this.http.get<UserAcceptanceFiles[]>(this.baseUrl + '/menuitem/user/acceptance/files', { params });
    }

    getUserFileAcceptanceLog(userId: string) {
        let params: HttpParams = new HttpParams();
        if (userId) {
            params = params.append('userId', `${userId}`);
        }
        return this.http.get<UserFileAcceptanceLog[]>(this.baseUrl + '/menuitem/user/acceptance/details', { params });
    }

    createUserAcceptanceLog(userFileAcceptanceLog: UserFileAcceptanceLog) {
        return this.http.post<boolean>(this.baseUrl + '/menuitem/user/acceptance/update', userFileAcceptanceLog);
    }
}
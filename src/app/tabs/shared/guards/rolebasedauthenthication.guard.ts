import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { MenuItemService } from '../services/menu-item.service';
import { DefaultRoutePages } from '../models/default-route-pages.model';
import { AuthenticationService } from '../services/authentication.service';
import { Owner } from '../../owner-tenant/create-owner/owner-create-update/owner.model';
import { CookieService } from 'ngx-cookie-service';
import { EnvService } from 'src/app/env.service';

@Injectable()
export class RoleBasedAuthenticationGuard implements CanActivate {

    constructor(
        public router: Router,
        private jwtHelperService: JwtHelperService,
        private menuItemService: MenuItemService,
        private authenticationService: AuthenticationService,
        private cookieService: CookieService,
        private envService: EnvService) { }

    canActivate(): boolean {
        const access_token = this.cookieService.get('access_token');

        if (access_token && access_token != '') {
            const decodedToken = this.jwtHelperService.decodeToken(access_token);
            if (decodedToken) {
                const role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
                if (role !== 'External') {
                    return true;
                } else {
                    this.getDefaultRoutePages(decodedToken);
                }
            }
            return false;
        } else {
            this.router.navigate(['/login'])
            return false;
        }
    }

    getDefaultRoutePages(decodedToken: string) {
        this.menuItemService.getDefaultRouterDetails().subscribe({
            next: (data: DefaultRoutePages[]) => {
                this.getExternalUserDetails(decodedToken, data);
            },
            error: (err) => {
                this.router.navigate(['/login'])
                return false;
            }
        });
    }
    getExternalUserDetails(decodeToken: string, defaultPageRoutes: DefaultRoutePages[]) {
        const userId = decodeToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid'];
        this.authenticationService.getExternalUserDetails(userId).subscribe({
            next: (data: Owner) => {
                if (data) {
                    let roleId = 0;
                    if (data.entityType === 'Owner') {
                        roleId = this.envService.externalRoles.ownerExternal;
                    } else {
                        roleId = this.envService.externalRoles.tenantExternal;
                    }
                    if (defaultPageRoutes && defaultPageRoutes.length) {
                        const page = defaultPageRoutes.find(x => x.roleId === roleId && x.isInternalUser === false);
                        if (page) {
                            this.router.navigate([page.route]);
                        }
                    }
                }
            }
        });
    }
}

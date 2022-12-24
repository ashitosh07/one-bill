import { Injectable } from '@angular/core';
import {CanActivateChild, Router} from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import { of, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChildAuthenticationGuard implements CanActivateChild {
    constructor(public router: Router,
        private cookieService: CookieService,
        private jwtHelperService: JwtHelperService) { }
    canActivateChild(): Observable<boolean> {
        try {
            const access_token = this.cookieService.get('access_token');
            const decoded_token = this.jwtHelperService.decodeToken(access_token);
            const isTokenExpired = this.jwtHelperService.isTokenExpired(access_token);
            if (access_token && access_token != '' && decoded_token && decoded_token != '' && !isTokenExpired) {
                return of(true);
            } else {
                this.router.navigate(['/login']);
                return of(false);
            }
            
        } catch {
            this.router.navigate(['/login']);
            return of(false);
        }
    }
}
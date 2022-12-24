import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class AuthenticationGuard implements CanActivate {

  constructor(public router: Router,
    private cookieService: CookieService,
    private jwtHelperService: JwtHelperService) { }

  canActivate(): boolean {
    try {
      const access_token = this.cookieService.get('access_token');
      const decoded_token = this.jwtHelperService.decodeToken(access_token);
      const isTokenExpired = this.jwtHelperService.isTokenExpired(access_token);
      if (access_token && access_token != '' && decoded_token && decoded_token != '' && !isTokenExpired) {
        return true;
      } else {
        this.router.navigate(['/login']);
        return false;
      }
    } catch {
      this.router.navigate(['/login']);
      return false;
    }
  }
}

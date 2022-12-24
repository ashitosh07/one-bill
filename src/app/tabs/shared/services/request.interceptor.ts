import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  constructor(private cookieService: CookieService) { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${this.cookieService.get('access_token') || ''}`,
        'Content-Type': 'application/json',
      }
    });
    return next.handle(request);
  }
}
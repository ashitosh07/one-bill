import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Injectable } from "@angular/core";
import { retry, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MenuItemService } from './menu-item.service';

@Injectable({
  providedIn: 'root'
})
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private snackbar: MatSnackBar,
    private router: Router,
    private menuItemService: MenuItemService) { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        // retry(1),
        catchError((error: HttpErrorResponse) => {
          let errorMessage = '';
          let snackbarColor = 'red-snackbar';
          if (error.error instanceof ErrorEvent) {
            // client-side error
            errorMessage = error.error.message == undefined ? `Error: ${error.error['Message']}` : `Error: ${error.error.message}`;
          } else {
            // server-side error
            // errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
            if (error.status === 401) {
              this.menuItemService.setIsUnauthorized(true);
              errorMessage = 'Invalid Username and Password';
              // this.router.navigate(['/login'])
              // return;
            }
            // if(error?.error?.message != undefined)
            // {
            //   errorMessage = `${error.error.message}`;
            // }
            // else if(error?.error['Message'] != undefined)
            // {
            //   errorMessage = `${error.error['Message']}`;
            // }
            errorMessage = error?.error?.message ? `${error.error.message}` : `${error.error['Message']}`;

            if (error.status === 404) {
              snackbarColor = 'yellow-snackbar';
            }
            if (error.status === 500) {
              errorMessage = error?.error?.message ? `${error.error.message}` : `${error.error['Message']}`;
              //errorMessage = 'Oops , Something went wrong'
            }
            // if(error.status === 400) {
            // errorMessage = 'Bad Request'
            //}
          }

          this.snackbar.open(errorMessage, null, {
            duration: 2000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: [snackbarColor],
          });
          // window.alert(errorMessage);
          return throwError(errorMessage);
        })
      )
  }
}

import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Needed for Touch functionality of Material Components
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutModule } from './layout/layout.module';
import { AgmCoreModule } from '@agm/core';
import { environment } from '../environments/environment';
import { PendingInterceptorModule } from '../@fury/shared/loading-indicator/pending-interceptor.module';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions, MatFormFieldModule } from '@angular/material/form-field';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarConfig } from '@angular/material/snack-bar';
import { HttpErrorInterceptor } from './tabs/shared/services/error.interceptor';
import { RequestInterceptor } from './tabs/shared/services/request.interceptor';
import { AuthenticationGuard } from './tabs/shared/guards/authentication.guard';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ConstantsService } from "./tabs/shared/services/constants.service";
import { JwtHelperService } from '@auth0/angular-jwt';
import { RoleBasedAuthenticationGuard } from './tabs/shared/guards/rolebasedauthenthication.guard';
import { ActivityMonitorService } from './tabs/shared/services/activity-monitor.service';
import { CookieService } from 'ngx-cookie-service';
import { EnvServiceProvider } from './env.service.provider';
import { ChildAuthenticationGuard } from './tabs/shared/guards/child-authentication.guard';

@NgModule({
  imports: [
    // Angular Core Module // Don't remove!
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    // Fury Core Modules
    AppRoutingModule,

    // Layout Module (Sidenav, Toolbar, Quickpanel, Content)
    LayoutModule,
    HammerModule,
    MatPaginatorModule,

    // Google Maps Module
    AgmCoreModule.forRoot({
      apiKey: environment.googleMapsApiKey
    }),

    // Displays Loading Bar when a Route Request or HTTP Request is pending
    PendingInterceptorModule,

    // Register a Service Worker (optional)
    // ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  declarations: [
    AppComponent,
  ],
  bootstrap: [AppComponent],
  providers: [
    { provide: JwtHelperService, useValue: new JwtHelperService() },
    AuthenticationGuard,
    ChildAuthenticationGuard,
    RoleBasedAuthenticationGuard,
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: 'fill'
      } as MatFormFieldDefaultOptions
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom'
      } as MatSnackBarConfig
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true
    },
    DatePipe,
    CurrencyPipe,
    ConstantsService,
    ActivityMonitorService,
    CookieService,
    EnvServiceProvider
  ]
})
export class AppModule {
}

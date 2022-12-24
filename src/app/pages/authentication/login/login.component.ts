import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MetadataService } from 'src/app/tabs/shared/services/metadata.service';
import { fadeInUpAnimation } from '../../../../@fury/animations/fade-in-up.animation';
import { FormValidators } from '../../../tabs/shared/methods/form-validators';
import { AuthenticationService } from '../../../tabs/shared/services/authentication.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { MenuItemService } from 'src/app/tabs/shared/services/menu-item.service';
import { MasterService } from 'src/app/tabs/shared/services/master.service';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { Owner } from 'src/app/tabs/owner-tenant/create-owner/owner-create-update/owner.model';
import { environment } from 'src/environments/environment';
import { DefaultRoutePages } from 'src/app/tabs/shared/models/default-route-pages.model';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { LoginCredentialsComponent } from 'src/app/tabs/login-credentials/login-credentials.component';
import { LoginReportService } from 'src/app/tabs/shared/services/login-report.service';
import { LoginReport } from "src/app/tabs/shared/models/login-report.model";
import { UserAcceptanceFiles } from "src/app/tabs/shared/models/user-acceptance-files.model";
import { UserFileAcceptanceLog } from 'src/app/tabs/shared/models/user-file-acceptance-log.model';
import { Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { deleteCookies } from 'src/app/tabs/shared/utilities/utility';
import { ClientFormats } from 'src/app/tabs/shared/models/client-formats.model';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [fadeInUpAnimation]
})
export class LoginComponent implements OnInit {

  unauthorizedSubcription: Subscription;
  form: FormGroup;
  public defaults: LoginReport;
  menuItems: any[] = [];
  inputType = 'password';
  visible = false;
  appUserDetails: any;
  appUserFirstClientId: any;
  defaultPageRoutes: DefaultRoutePages[];
  userAcceptanceFiles: UserAcceptanceFiles[] = [];
  userAcceptanceLog: UserFileAcceptanceLog[] = [];
  loginButtonClicked: boolean = false;
  parameterValue: boolean = true;
  parameterValueForgotPassword: boolean = true;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private snackbar: MatSnackBar,
    private fv: FormValidators,
    private authenticationService: AuthenticationService,
    private jwtHelperService: JwtHelperService,
    private menuItemService: MenuItemService,
    private masterService: MasterService,
    private dialog: MatDialog,
    private loginReportService: LoginReportService,
    private cookieService: CookieService,
    private envService: EnvService
  ) {
  }

  ngOnInit() {

    this.unauthorizedSubcription = this.menuItemService.isUnauthorizedHandler.subscribe(authorized => {
      this.loginButtonClicked = false;
    });

    this.masterService.getParameterValue('Register').subscribe((value: boolean) => {
      if (!value) {
        this.parameterValue = value;
      }
    })
    this.masterService.getParameterValue('ForgotPassword').subscribe((value: boolean) => {
      if (!value) {
        this.parameterValueForgotPassword = value;
      }
    })

    this.getDefaultRoutePages();
    this.form = this.fb.group({
      username: ['', this.fv.requiredAlphanumericNoSpaces],
      password: ['', this.fv.passwordValidators]
    });
    this.defaults = new LoginReport({});
  }

  removeSessionStorageItems() {
    deleteCookies(this.cookieService, this.envService);
  }

  send() {
    this.loginButtonClicked = true;
    this.authenticationService.login({
      userName: this.form.value.username || '',
      password: this.form.value.password || ''
    }).subscribe({
      next: (data: any) => {
        if (data) {
          if (data.status == 'Failed') {
            this.notificationMessage('Please confirm your email to continue login', 'red-snackbar');
            this.loginButtonClicked = false;
          } else if (data.token) {
            //this.getDataFormats();
            this.cookieService.set('access_token', data.token);
            localStorage.setItem('logged_in', 'true');
            this.loginUserDetails(data.token);
            this.defaults.userId = this.cookieService.get("userId");
            this.defaults.accountNumber = this.form.value.username;
            this.loginReportService
              .getIPAddress()
              .subscribe((response: any) => {
                if (response) {
                  this.defaults.ipAddress = response.ip;
                  this.captureWhoLoggedInDetails(this.defaults);
                }
              },
                () => {
                  console.log('No response fron ipify')
                  this.loginButtonClicked = false;
                }
              );
          } else {
            this.notificationMessage('login failed due to no access token', 'red-snackbar');
            this.loginButtonClicked = false;
          }
        } else {
          this.notificationMessage('login failed due to no access token', 'red-snackbar');
          this.loginButtonClicked = false;
        }
      },
      error: () => {
        this.notificationMessage('Invalid Username and Password', 'red-snackbar');
        this.loginButtonClicked = false;
      }
    });
  }

  captureWhoLoggedInDetails(loginReport: LoginReport) {
    this.loginReportService
      .createLoginDetails(loginReport)
      .subscribe((res: any) => {
        if (res) {
          this.cookieService.set('userLoginId', res);
          this.loginButtonClicked = false;
        }
        else {
          this.cookieService.set('userLoginId', '');
          this.loginButtonClicked = false;
        }

      });
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }


  showCredentials(roleId: number = 0) {
    this.userAcceptanceFiles = [];
    this.menuItemService.getUserAcceptanceFiles(roleId).subscribe({
      next: (data: UserAcceptanceFiles[]) => {
        this.userAcceptanceFiles = data;
        if (this.userAcceptanceFiles && this.userAcceptanceFiles.length) {
          this.userAcceptanceFiles.forEach(userAcceptanceFile => {
            if (this.userAcceptanceLog && this.userAcceptanceLog.length) {
              const fileAccepted = this.userAcceptanceLog.find(x => x.userAcceptanceFileId === userAcceptanceFile.id);
              if (!fileAccepted || (fileAccepted && !fileAccepted.isAccepted)) {
                this.dialog.open(LoginCredentialsComponent, {
                  autoFocus: true,
                  height: "610px", data: userAcceptanceFile
                }).afterClosed().subscribe();
              }
            } else {
              this.dialog.open(LoginCredentialsComponent, {
                autoFocus: true,
                height: "610px", data: userAcceptanceFile
              }).afterClosed().subscribe();
            }
          });
        }
      },
      error: () => {
        this.userAcceptanceFiles = [];
      }
    });
  }

  userFileAcceptance(userId: string, roleId: number = 0) {
    this.userAcceptanceLog = [];
    this.menuItemService.getUserFileAcceptanceLog(userId).subscribe({
      next: (data: UserFileAcceptanceLog[]) => {
        if (data && data.length) {
          this.userAcceptanceLog = data;
          this.showCredentials(roleId);
        } else {
          this.userAcceptanceLog = [];
          this.showCredentials(roleId);
        }
      },
      error: () => {
        this.userAcceptanceLog = [];
        this.showCredentials(roleId);
      }
    });
  }


  loginUserDetails(token: any) {
    const decodedToken = this.jwtHelperService.decodeToken(token);
    if (decodedToken) {
      const role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      if (role === 'External') {
        const userId = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid'];
        this.cookieService.set('userId', userId);
        this.authenticationService.getExternalUserDetails(userId).subscribe({
          next: (data: Owner) => {
            if (data) {
              let roleId = 0;
              if (data.entityType === 'Owner') {
                roleId = this.envService.externalRoles.ownerExternal;
              } else {
                roleId = this.envService.externalRoles.tenantExternal;
              }

              this.setInitialSessionStorageForUser(data.userDetails, data.photo);
              let clientId = this.cookieService.get('globalClientId');
              if (roleId == 0) {
                this.getClientDataFormats(0);
              }
              else {
                this.getClientDataFormats(clientId);
              }
              this.menuItemService.setIsExteranlUser(roleId);
              this.cookieService.set('ownerId', data.id.toString());
              this.cookieService.set('external_role', roleId.toString());
              if (this.defaultPageRoutes && this.defaultPageRoutes.length) {
                const page = this.defaultPageRoutes.find(x => x.roleId === roleId && x.isInternalUser === false);
                if (page) {
                  this.router.navigate([page.route]);
                  this.userFileAcceptance(userId, roleId);
                  this.loginButtonClicked = false;
                } else {
                  this.notificationMessage(`Default page is missing for ${role} role. Please contact administrator.`, 'red-snackbar');
                  this.loginButtonClicked = false;
                  return;
                }
              } else {
                this.notificationMessage(`Default page is missing for ${role} role. Please contact administrator.`, 'red-snackbar');
                this.loginButtonClicked = false;
                return;
              }
            }
          },
          error: () => {
            this.notificationMessage('Invalid user details', 'red-snackbar');
            this.loginButtonClicked = false;
          }
        });
      } else {
        //to be refactored post implementation of owner,tenant,admin,service roles
        this.menuItemService.setIsAuthenticatedUser(true);
        const userId = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid'];
        this.cookieService.set('userId', userId);
        this.authenticationService.getUserDetailsById(userId).subscribe({
          next: (userDetails: any) => {
            if (userDetails) {
              const image = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/userdata'];
              this.setInitialSessionStorageForUser(userDetails, image);
              //this.metadataService.invokeMetadata();
              if (this.defaultPageRoutes && this.defaultPageRoutes.length) {
                const page = this.defaultPageRoutes.find(x => x.role === role && x.isInternalUser === true);
                if (page) {
                  this.router.navigate([page.route]);
                  this.userFileAcceptance(userId);
                  this.loginButtonClicked = false;
                }
                else {
                  this.notificationMessage(`Default page is missing for ${role} role. Please contact administrator.`, 'red-snackbar');
                  this.loginButtonClicked = false;
                  return;
                }
              } else {
                this.notificationMessage(`Default page is missing for ${role} role. Please contact administrator.`, 'red-snackbar');
                this.loginButtonClicked = false;
                return;
              }
            }
          },
          error: () => {
            this.notificationMessage('Invalid user details', 'red-snackbar');
            this.loginButtonClicked = false;
          }
        });
      }
    }
  }

  setInitialSessionStorageForUser(userDetails, image) {
    if (userDetails.userClients.length > 0) {
      this.appUserFirstClientId = userDetails.userClients[0].clientId;
    }
    else {
      //to be removed post refactoring on line 120
      this.appUserFirstClientId = 0;
    }
    this.cookieService.set('access_profile', image);
    this.cookieService.set('globalClientId', this.appUserFirstClientId);
    localStorage.setItem('userClients', JSON.stringify(userDetails.userClients));
  }

  getClientDataFormats(clientId) {
    if (clientId) {
      this.masterService.getClientDataFormats(parseInt(clientId)).subscribe((dataFormat: ClientFormats[]) => {
        if (dataFormat) {
          localStorage.setItem('data_formats', JSON.stringify(dataFormat));
        }
      });
    }
    else {
      this.masterService.getDefaultDataFormats().subscribe((dataFormat: ClientFormats[]) => {
        if (dataFormat) {
          localStorage.setItem('data_formats', JSON.stringify(dataFormat));
        }
      });
    }
  }


  getDefaultRoutePages() {
    this.menuItemService.getDefaultRouterDetails().subscribe({
      next: (data: DefaultRoutePages[]) => {
        this.defaultPageRoutes = data;
      },
      error: () => {
        this.defaultPageRoutes = [];
      }
    });
  }

  toggleVisibility() {
    if (this.visible) {
      this.inputType = 'password';
      this.visible = false;
      this.cd.markForCheck();
    } else {
      this.inputType = 'text';
      this.visible = true;
      this.cd.markForCheck();
    }
  }

  goRegister(value: number) {
    const url = this.router.serializeUrl(this.router.createUrlTree(['/register'], { queryParams: { clientId: value } }));
    window.open(url, '_blank');
    //this.router.navigate(['/register'], { queryParams: { role: 'Owner' } });
  }


}



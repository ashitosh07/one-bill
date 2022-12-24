import { Component, OnInit } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import { LoginReport } from 'src/app/tabs/shared/models/login-report.model';
import { LoginReportService } from 'src/app/tabs/shared/services/login-report.service';
import { environment } from '../../../../../src/environments/environment';
import { deleteCookies } from 'src/app/tabs/shared/utilities/utility';
import { Subscription } from 'rxjs';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-toolbar-user',
  templateUrl: './toolbar-user.component.html',
  styleUrls: ['./toolbar-user.component.scss']
})
export class ToolbarUserComponent implements OnInit {

  public defaults: LoginReport;
  isOpen: boolean;
  name: string = '';
  profileImage: any;
  baseUrl: string = '';
  profileUserSubcription: Subscription;

  constructor(private jwtHelperService: JwtHelperService,
    private loginReportService: LoginReportService,
    private cookieService: CookieService,
    private envService: EnvService) {
    this.baseUrl = envService.backendForFiles;
  }

  ngOnInit() {
    const access_token = this.cookieService.get('access_token');
    if (access_token && access_token != '') {
      const decodedToken = this.jwtHelperService.decodeToken(access_token);
      if (decodedToken) {
        this.name = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
      }
    };
    const access_profile = this.cookieService.get('access_profile');
    if (access_profile) {
      this.profileImage = this.baseUrl + '/uploads/' + access_profile;
    }
    this.profileUserSubcription = this.loginReportService.isProfileUserHandler.subscribe(image => {
      if (image) {
        this.profileImage = this.baseUrl + '/uploads/' + image;
      }
    });
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  onClickOutside() {
    this.isOpen = false;
  }

  clearAllClientSideSavedObjects() {
    this.defaults = new LoginReport({});
    this.defaults.id = Number(this.cookieService.get("userLoginId"));
    this.loginReportService.updateLogoutTime(this.defaults.id, this.defaults).subscribe();
    deleteCookies(this.cookieService,this.envService);
  }

}

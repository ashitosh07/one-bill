import { Component, OnInit } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../../../src/environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { deleteCookies } from '../../../../../src/app/tabs/shared/utilities/utility';
import { MatDialog } from '@angular/material/dialog';
import { EnvService } from '../../../env.service';
import { env } from 'process';

@Component({
  selector: 'fury-toolbar-user',
  templateUrl: './toolbar-user.component.html',
  styleUrls: ['./toolbar-user.component.scss']
})
export class ToolbarUserComponent implements OnInit {

  isOpen: boolean;
  name: string = '';
  profileImage: any;
  baseUrl = '';
  constructor(private jwtHelperService: JwtHelperService,
    private cookieService: CookieService,
    public router: Router,
    private dialog: MatDialog,
    private envService: EnvService) {
    this.baseUrl = envService.fakeUrl;
  }

  ngOnInit() {
    const access_token = this.cookieService.get('access_token');
    if (access_token && access_token != '') {
      const decodedToken = this.jwtHelperService.decodeToken(access_token);
      if (decodedToken) {
        this.name = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/name'];
      }
    };
    const access_profile = this.cookieService.get('access_profile');
    if (access_profile) {
      this.profileImage = this.baseUrl + 'uploads/' + access_profile;
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  onClickOutside() {
    this.isOpen = false;
  }

  clearAllClientSideSavedObjects() {
    deleteCookies(this.cookieService,this.envService);
    this.dialog.closeAll();
    this.router.navigate(['/login'])
  }

}

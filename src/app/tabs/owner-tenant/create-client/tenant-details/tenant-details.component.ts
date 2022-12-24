import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { environment } from 'src/environments/environment';
import { MenuItemService } from 'src/app/tabs/shared/services/menu-item.service';
import { CookieService } from 'ngx-cookie-service';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-tenant-details',
  templateUrl: './tenant-details.component.html',
  styleUrls: ['./tenant-details.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation]
})
export class TenantDetailsComponent implements OnInit {

  menuItems: any[] = [];
  tenantId: string;
  constructor(
    private route: ActivatedRoute,
    private menuItemService: MenuItemService,
    private cookieService: CookieService,
    private envService: EnvService) { }

  ngOnInit(): void {
    if (this.route) {
      this.route.paramMap.subscribe(params => {
        if (params) {
          this.menuItemService.setIsExteranlUser(this.envService.externalRoles.tenantExternal);
          this.tenantId = params.get('tenantId');
          this.cookieService.set('external_role', this.envService.externalRoles.tenantExternal.toString());
        }
      });
    }
  }
}

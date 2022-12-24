import { Component, OnInit } from '@angular/core';
import { MenuItemService } from 'src/app/tabs/shared/services/menu-item.service';
import { ActivatedRoute, Router } from '@angular/router';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { environment } from 'src/environments/environment';
import { DefaultRoutePages } from 'src/app/tabs/shared/models/default-route-pages.model';
import { CookieService } from 'ngx-cookie-service';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-owner-details',
  templateUrl: './owner-details.component.html',
  styleUrls: ['./owner-details.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation]
})
export class OwnerDetailsComponent implements OnInit {

  menuItems: any[] = [];
  ownerId: string;
  defaultPageRoutes: DefaultRoutePages[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private menuItemService: MenuItemService,
    private cookieService: CookieService,
    private envService: EnvService) { }

  ngOnInit(): void {
    this.getDefaultRoutePages();
    if (this.route) {
      this.route.paramMap.subscribe(params => {
        if (params) {
          this.menuItemService.setIsExteranlUser(this.envService.externalRoles.ownerExternal);
          this.ownerId = params.get('ownerId');
          this.cookieService.set('external_role', this.envService.externalRoles.ownerExternal.toString());
          if (this.defaultPageRoutes && this.defaultPageRoutes.length) {
            const page = this.defaultPageRoutes.find(x => x.roleId === this.envService.externalRoles.ownerExternal && x.isInternalUser === true);
            if (page) {
              this.router.navigate([page.route]);
            }
          }
        }
      });
    }
  }


  getDefaultRoutePages() {
    this.menuItemService.getDefaultRouterDetails().subscribe({
      next: (data: DefaultRoutePages[]) => {
        this.defaultPageRoutes = data;
      },
      error: (err) => {
        this.defaultPageRoutes = [];
      }
    });
  }
}

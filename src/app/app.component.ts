import { DOCUMENT } from '@angular/common'
import {
  Component,
  Inject,
  Renderer2,
  OnInit,
  HostListener,
} from '@angular/core'
import { MatIconRegistry } from '@angular/material/icon'
import { SidenavService } from './layout/sidenav/sidenav.service'
import { ThemeService } from '../@fury/services/theme.service'
import { ActivatedRoute, Router } from '@angular/router'
import { filter } from 'rxjs/operators'
import { Platform } from '@angular/cdk/platform'
import { SplashScreenService } from '../@fury/services/splash-screen.service'
import { MetadataService } from './tabs/shared/services/metadata.service'
import { JwtHelperService } from '@auth0/angular-jwt'
import { MenuItemService } from './tabs/shared/services/menu-item.service'
import { SidenavItem } from './layout/sidenav/sidenav-item/sidenav-item.interface'
import { RolePermission } from './tabs/shared/models/role-permission.model'
import { Subscription } from 'rxjs'
import { ActivityMonitorService } from './tabs/shared/services/activity-monitor.service'
import { CookieService } from 'ngx-cookie-service'
import { deleteCookies, KEY_CODE } from 'src/app/tabs/shared/utilities/utility'
import { environment } from 'src/environments/environment'
import { MatDialog } from '@angular/material/dialog'
import { CancelConfirmationDialogComponent } from './tabs/shared/components/cancel-confirmation-dialog/cancel-confirmation-dialog.component'
import { ListItem } from './tabs/shared/models/list-item.model'
import { LoginReport } from './tabs/shared/models/login-report.model'
import { LoginReportService } from './tabs/shared/services/login-report.service'
import { EnvService } from './env.service'

@Component({
  selector: 'fury-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  public defaults: LoginReport
  menuItems: any[] = []
  exteranlUserSubcription: Subscription
  authenticatedUserSubcription: Subscription
  sessionExpired: boolean = false

  constructor(
    private loginReportService: LoginReportService,
    private sidenavService: SidenavService,
    private iconRegistry: MatIconRegistry,
    private renderer: Renderer2,
    private themeService: ThemeService,
    @Inject(DOCUMENT) private document: Document,
    private platform: Platform,
    private route: ActivatedRoute,
    private splashScreenService: SplashScreenService,
    private metadataService: MetadataService,
    private jwtHelperService: JwtHelperService,
    private menuItemService: MenuItemService,
    private activityMonitor: ActivityMonitorService,
    private router: Router,
    private cookieService: CookieService,
    private dialog: MatDialog,
    private envService: EnvService
  ) {
    this.activityMonitor.startWatching()

    // Start watching when user idle is starting.
    this.activityMonitor.onTimerStart().subscribe()

    // Start watch when time is up.
    this.activityMonitor.onTimeout().subscribe(() => {
      const logged_in = localStorage.getItem('logged_in')
      if (logged_in && logged_in == 'true') {
        this.sessionExpired = true
        const confirmMessage: ListItem = {
          label:
            'Your Session is about to Expire,Do you want to be logged out?',
          selected: true,
        }
        this.dialog
          .open(CancelConfirmationDialogComponent, {
            autoFocus: true,
            data: confirmMessage,
          })
          .afterClosed()
          .subscribe((confirmation: boolean) => {
            if (confirmation) {
              this.defaults = new LoginReport({})
              this.defaults.id = Number(this.cookieService.get('userLoginId'))
              this.loginReportService
                .updateLogoutTime(this.defaults.id, this.defaults)
                .subscribe()
              deleteCookies(this.cookieService, this.envService)
              this.activityMonitor.resetTimer()
              this.activityMonitor.stopWatching()
              this.dialog.closeAll()
              this.sessionExpired = false
              this.router.navigate(['/login'])
            } else {
              this.activityMonitor.resetTimer()
              this.sessionExpired = false
            }
          })
      } else {
        this.reset()
      }
    })

    this.route.queryParamMap
      .pipe(filter((queryParamMap) => queryParamMap.has('style')))
      .subscribe((queryParamMap) =>
        this.themeService.setStyle(queryParamMap.get('style'))
      )

    this.iconRegistry.setDefaultFontSetClass('material-icons-outlined')
    this.themeService.theme$.subscribe((theme) => {
      if (theme[0]) {
        this.renderer.removeClass(this.document.body, theme[0])
      }

      this.renderer.addClass(this.document.body, theme[1])
    })

    if (this.platform.BLINK) {
      this.renderer.addClass(this.document.body, 'is-blink')
    }

    window.addEventListener('storage', function (event) {
      if (event.key == 'logged_in' && event.newValue == null) {
        window.location.href = '/login'
      }
    })
  }

  ngOnInit() {
    this.authenticatedUserSubcription =
      this.menuItemService.isAuthenticatedUserHandler.subscribe((login) => {
        this.roleBasedMenuItem()
      })
    this.exteranlUserSubcription =
      this.menuItemService.isExteranlUserHandler.subscribe((roleId) => {
        this.externalRoleBasedMenuItem(roleId)
      })
    const ownerId = parseInt(this.cookieService.get('ownerId'))
    const external_roleId = parseInt(this.cookieService.get('external_role'))
    if (
      !isNaN(ownerId) &&
      ownerId &&
      !isNaN(external_roleId) &&
      external_roleId
    ) {
      this.externalRoleBasedMenuItem(external_roleId)
    } else {
      if (!isNaN(external_roleId) && external_roleId) {
        this.cookieService.delete(
          'external_role',
          '/',
          this.envService.cookieDomain
        )
      }
      this.roleBasedMenuItem()
    }
  }

  @HostListener('mouseup', ['$event']) onClick($event) {
    // for window mouse click
    if (!this.sessionExpired) {
      this.reset()
      // localStorage.clear()
    }
  }

  @HostListener('document:mousewheel', ['$event'])
  onDocumentMousewheelEvent(event) {
    if (!this.sessionExpired) {
      this.reset()
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (
      (!this.sessionExpired && event.key && event.key == KEY_CODE.DOWN_ARROW) ||
      event.key == KEY_CODE.UP_ARROW ||
      event.key == KEY_CODE.LEFT_ARROW ||
      event.key == KEY_CODE.RIGHT_ARROW ||
      event.key == KEY_CODE.Enter ||
      event.key == KEY_CODE.Tab
    ) {
      this.reset()
      // localStorage.clear()
    }
  }

  reset() {
    this.activityMonitor.stopWatching()
    this.activityMonitor.resetTimer()
    this.activityMonitor.startWatching()
  }

  roleBasedMenuItem() {
    const access_token = this.cookieService.get('access_token')
    if (access_token && access_token != '') {
      const decodedToken = this.jwtHelperService.decodeToken(access_token)
      if (decodedToken) {
        const role =
          decodedToken[
            'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
          ]
        this.getMenuItems(0, role)
      }
    }
    // localStorage.clear()
  }

  externalRoleBasedMenuItem(roleId: number) {
    this.getMenuItems(roleId)
  }

  getMenuItems(roleId: number, role: string = '') {
    this.menuItems = []
    this.menuItemService.getMenuItems().subscribe((menuItems: any[]) => {
      if (menuItems) {
        this.menuItems = menuItems
        if (menuItems && menuItems.length) {
          if (roleId != 0) {
            this.getExternalRoleMenuItems(roleId)
          }
          if (role) {
            this.getRoleMenuItems(role)
          }
        }
      }
    })
  }

  getRoleMenuItems(role: string) {
    this.sidenavService.items = []
    const roleBasedItem: any[] = []
    this.menuItemService
      .getRoleMenuItems(role)
      .subscribe((data: RolePermission[]) => {
        if (data) {
          if (this.menuItems) {
            data.forEach((x) => {
              const item = this.menuItems.find(
                (menuItem) => menuItem.id === x.menuItemId
              )
              if (item && !item.parentId) {
                roleBasedItem.push(item)
              }
              if (item && item.parentId) {
                const parentItem = this.menuItems.find(
                  (menuItem) => menuItem.id === item.parentId
                )
                const existingItem = roleBasedItem.find(
                  (x) => x.id === parentItem.id
                )
                if (!existingItem) {
                  if (parentItem) {
                    parentItem.subItems = []
                    parentItem.subItems.push(item)
                  }
                  roleBasedItem.push(parentItem)
                } else {
                  existingItem.subItems.push(item)
                }
              }
            })
          }
          const items: SidenavItem[] = roleBasedItem as SidenavItem[]
          items.sort((a, b) => a.position - b.position)
          this.sidenavService.addItems(items)
        }
      })
  }

  getExternalRoleMenuItems(roleId: number) {
    this.sidenavService.items = []
    const roleBasedItem: any[] = []
    const access_token = this.cookieService.get('access_token')
    let role = ''
    if (access_token && access_token != '') {
      const decodedToken = this.jwtHelperService.decodeToken(access_token)
      if (decodedToken) {
        role =
          decodedToken[
            'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
          ]
      }
    }
    this.menuItemService
      .getExternalRoleMenuItems(roleId)
      .subscribe((data: RolePermission[]) => {
        if (data) {
          if (this.menuItems) {
            if (role !== 'External') {
              data = data.filter((x) => x.isInternalUser === true)
            } else {
              data = data.filter((x) => x.isInternalUser !== true)
            }
            data.forEach((x) => {
              const item = this.menuItems.find(
                (menuItem) => menuItem.id === x.menuItemId
              )
              if (item && !item.parentId) {
                roleBasedItem.push(item)
              }
              if (item && item.parentId) {
                const parentItem = this.menuItems.find(
                  (menuItem) => menuItem.id === item.parentId
                )
                const existingItem = roleBasedItem.find(
                  (x) => x.id === parentItem.id
                )
                if (!existingItem) {
                  if (parentItem) {
                    parentItem.subItems = []
                    parentItem.subItems.push(item)
                  }
                  roleBasedItem.push(parentItem)
                } else {
                  existingItem.subItems.push(item)
                }
              }
            })
          }
          const items: SidenavItem[] = roleBasedItem as SidenavItem[]
          items.sort((a, b) => a.position - b.position)
          this.sidenavService.addItems(items)
        }
      })
  }
}

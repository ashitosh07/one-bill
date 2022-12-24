import { ChangeDetectorRef, Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { map } from 'rxjs/operators';
import { ThemeService } from '../../../@fury/services/theme.service';
import { FilterDropDownClient } from 'src/app/tabs/shared/models/filterdropdown.clients.model';
import { FilterDropDownProject } from 'src/app/tabs/shared/models/filterdropdown.project.model';
import { ConstantsService } from 'src/app/tabs/shared/services/constants.service';
import { Router } from '@angular/router';
import { MenuItemService } from 'src/app/tabs/shared/services/menu-item.service';
import { ClientSelectionService } from 'src/app/tabs/shared/services/client-selection.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
import { MasterService } from 'src/app/tabs/shared/services/master.service';
import { ClientFormats } from '../../tabs/shared/models/client-formats.model';
import { Subscription } from 'rxjs';

@Component({
  //changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'fury-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  hideClientsSubcription: Subscription;

  filterDropDownClients: FilterDropDownClient[];
  filterDropDownProjects: FilterDropDownProject[];


  userId: number = 1;
  userFilter: any;
  userClients: any[] = [];
  recData: any;
  role: string;
  hideQuickFilter: boolean = false;

  @Input()
  @HostBinding('class.no-box-shadow')
  hasNavigation: boolean;
  public selected: any;
  visible: boolean = false;
  clientId: number;
  ownerId: number;

  @Output() openSidenav = new EventEmitter();
  @Output() openQuickPanel = new EventEmitter();


  constructor(private themeService: ThemeService,
    private constantsService: ConstantsService,
    private jwtHelperService: JwtHelperService,
    private router: Router,
    private ref: ChangeDetectorRef,
    private masterService: MasterService,
    private menuItemService: MenuItemService,
    private clientSelectionService: ClientSelectionService,
    private cookieService: CookieService) {      
  }
  topNavigation$ = this.themeService.config$.pipe(map(config => config.navigation === 'top'));

  ngAfterContentChecked() {
    this.ref.detectChanges();
    let currentUrl = this.router.url;

    if(!this.role)
    {
      let token = this.cookieService.get('access_token');
      const decodedToken = this.jwtHelperService.decodeToken(token);
      if (decodedToken) {
        this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      }
    }
    
    if(currentUrl && this.role)
    {
      if(!currentUrl.includes('generaldashboard') && (this.role.toLowerCase() == 'admin' || this.role.toLowerCase() == 'support'))
      {
        this.hideQuickFilter = true;
      }
      else {
        this.hideQuickFilter = false;
      }	
    }
  }

  ngOnInit() {    
      
    this.hideClientsSubcription = this.clientSelectionService.isClientVisibleHandler.subscribe(visible => {
      this.visible = visible;      
      this.clientId = parseInt(this.cookieService.get('globalClientId'));
      this.ownerId = parseInt(this.cookieService.get('ownerId'));
      this.setClientDataFormats(this.clientId);
      //this.menuItemService.setIsClientChange(true);
      this.ref.detectChanges();
    });
    
    // this.userfilterService.getUserfilter(this.userId).subscribe( data => {
    // this.userFilter = new UserFilter(data);
    // this.filterDropDownClients=  this.userFilter.clients;
    this.userClients = JSON.parse(localStorage.getItem('userClients'));
    this.userClients?.sort((a, b) => a.clientName.localeCompare(b.clientName));
    this.selected = this.userClients?.[0].clientId;    

    // if (this.cookieService.get('globalClientId') == null || this.cookieService.get('globalClientId') != this.selected) {
    //   this.cookieService.set('globalClientId', String(this.userClients?.[0].clientId));
    // }
    // let client = '0';
    // if((this.cookieService.get('globalClientId') != null) && (this.cookieService.get('globalClientId') != undefined))
    // {
    //   client = this.cookieService.get('globalClientId');
    // }
    //this.setClientDataFormats(client);
    if (this.cookieService.get('globalClientId') == null) {
      this.cookieService.set('globalClientId', String(this.userClients?.[0].clientId));
    }
    else {
      this.selected = Number(this.cookieService.get('globalClientId'));
    }
    //this.setClientDataFormats(this.selected);
    let token = this.cookieService.get('access_token');
    const decodedToken = this.jwtHelperService.decodeToken(token);
    if (decodedToken) {
      this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    }
  }

  setClientDataFormats(clientId)
  {
    this.masterService.getClientDataFormats(parseInt(clientId)).subscribe((dataFormat: ClientFormats[]) => {
      if (dataFormat) {
        localStorage.setItem('data_formats', JSON.stringify(dataFormat));
      }
    });
  }

  onClientSelect(value: any) {

    this.constantsService.ClientId = value;
    this.cookieService.set('globalClientId', value);    

    let token = this.cookieService.get('access_token');
    const decodedToken = this.jwtHelperService.decodeToken(token);
    if (decodedToken) {
      this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    }

    //this.userfilterService.getClientProjects(value).subscribe((filterDropDownProjects: FilterDropDownProject[]) => {
    // filterDropDownProjects = filterDropDownProjects.map(filterDropDownProject => new FilterDropDownProject(filterDropDownProject));
    //this.openQuickPanel.emit(filterDropDownProjects);
    
    const filterData = this.cookieService.get('filterData');
    if (filterData) {
      const data = JSON.parse(filterData);
      if (data) {
        data.clientId = value;
        this.cookieService.set('filterData', JSON.stringify(data));
      }
    }
    this.menuItemService.setIsClientChange(true);

    this.masterService.getClientDataFormats(parseInt(value)).subscribe({next: (dataFormat: ClientFormats[]) => {
      if (dataFormat) {
        localStorage.setItem('data_formats', JSON.stringify(dataFormat));
        this.reloadCurrentPage();
      }
    },
    error: (err) =>  {
      this.reloadCurrentPage();
    }
    });
    
    //});
  }
  

  reloadCurrentPage()
  {
    let currentUrl = this.router.url;
    if (currentUrl.indexOf('?') > 0) {
      currentUrl = currentUrl.substring(0, currentUrl.indexOf('?'));
    }
    const currentRoute = currentUrl;
    
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentRoute]); // navigate to same route
      
    });
  }

}
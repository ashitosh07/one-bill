import { Component, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { UserfilterService } from 'src/app/tabs/shared/services/userfilter.service';
import { FilterDropDownBlock } from 'src/app/tabs/shared/models/filterdropdown.block.model';
import { FilterDropDownProject } from 'src/app/tabs/shared/models/filterdropdown.project.model';
import { FilterDropDownBuilding } from 'src/app/tabs/shared/models/filterdropdown.building.model';
import { FilterDropDownFloor } from 'src/app/tabs/shared/models/filterdropdown.floor.model';
import { FilterDropDownUnit } from 'src/app/tabs/shared/models/filterdropdown.unit.model';
import { UserFilter } from 'src/app/tabs/shared/models/userFilter.model';
import { MasterService } from 'src/app/tabs/shared/services/master.service';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ManageParams } from 'src/app/tabs/shared/models/manage-params.model';
import { MenuItemService } from 'src/app/tabs/shared/services/menu-item.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GeneraldashboardService } from 'src/app/pages/generaldashboard/generaldashboard.service';
import { MatOption } from '@angular/material/core';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { MatDialog } from '@angular/material/dialog';
import { ClientFormats } from 'src/app/tabs/shared/models/client-formats.model';

@Component({
  selector: 'fury-quickpanel',
  templateUrl: './quickpanel.component.html',
  styleUrls: ['./quickpanel.component.scss']
})
export class QuickpanelComponent implements OnInit {

  // filterDropDownProjects:FilterDropDownProject[];
  // filterDropDownBlock:FilterDropDownBlock[];
  // filterDropDownBuilding:FilterDropDownBuilding[];
  // filterDropDownFloor:FilterDropDownFloor[];
  // filterDropDownUnit:FilterDropDownUnit[];

  @ViewChild('allSelected') private allSelected: MatOption;

  isFormValid: boolean = false;
  filterCountry: Master[];
  filterLocation: Master[];
  filterArea: Master[];
  filterClients: Master[];
  //  = [
  //   {id: 154, description: 'Almas Tower'},
  //   {id: 176, description: 'One By Omniyat'},
  //   {id: 177, description: 'PEARLS COAST'},    
  //   {id: 178, description: 'Rolex'}    
  // ];
  selectedClients = [];
  // filterDropDownFloor:Master[];
  // filterDropDownUnit:Master[];

  role: string;
  userFilters: UserFilter;
  userId: number = 1;
  todayDay: string;
  todayDate: string;
  todayDateSuffix: string;
  todayMonth: string;
  form: FormGroup;
  fromDate: string = '';
  toDate: string = '';
  countryId: number = 0;
  locationId: number = 0;
  areaId: number = 0;
  options: any[] = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
  ];

  manageParams: ManageParams = {};

  constructor(
    private masterService: MasterService, private fb: FormBuilder,
    private menuItemService: MenuItemService,
    private generalDashBoardService: GeneraldashboardService,
    private router: Router, private snackbar: MatSnackBar,
    private date: DatePipe,private jwtHelperService: JwtHelperService,
    private cookieService: CookieService) { }

  ngOnInit() {
    this.getCountries();
    this.form = this.fb.group({
      clients: ['', Validators.required]
    });

    let token = this.cookieService.get('access_token');
    const decodedToken = this.jwtHelperService.decodeToken(token);
    if (decodedToken) {
      this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    }

    const filterData = this.cookieService.get('filterData');
    if (filterData) {
      this.manageParams = JSON.parse(filterData);
      this.selectCountry(null, this.manageParams.countryId);
      this.selectLocation(null, this.manageParams.locationId);

      this.selectedClients = this.manageParams.strClientId.split(",");
      this.fromDate = this.date.transform(this.manageParams.fromDate, 'yyyy-MM-dd');
      this.toDate = this.date.transform(this.manageParams.toDate, 'yyyy-MM-dd');
    } else {
      if (this.selectedClients) {
        let index = this.selectedClients.findIndex(item => item == 0);
        if (index >= 0) {
          this.selectedClients.splice(index, 1);
        }
      }
      const startDate = moment();
      this.fromDate = this.date.transform(startDate.add('month', -1), 'yyyy-MM-dd');
      this.toDate = this.date.transform(moment(), 'yyyy-MM-dd');

      const manageParams: ManageParams = {
        countryId: this.countryId,
        locationId: this.locationId,
        areaId: this.areaId,
        fromDate: this.fromDate,
        toDate: this.toDate,
        clientId: 0,
        strClientId: this.selectedClients.join(",")
      };
      this.cookieService.set('filterData', JSON.stringify(manageParams));
    }
    if (this.form.valid) {
      this.isFormValid = true
    }
    else {
      this.isFormValid = false;
    }
    this.getClients();
  }

  getClients() {
    this.selectedClients = [];
    this.generalDashBoardService.getClients(this.countryId, this.locationId, this.areaId).subscribe((data: Master[]) => {
      this.filterClients = data
    })
  }

  getCountries() {
    this.masterService.getSystemMasterdata(15, 0).subscribe((data: Master[]) => {
      this.filterCountry = data
    });
  }

  selectCountry(event, id = 0) {
    this.filterLocation = [];
    this.locationId = 0;
    this.areaId = 0;
    if (id) {
      this.masterService.getUserMasterdata(6, id).subscribe((data: Master[]) => {
        this.filterLocation = data;
        this.countryId = this.manageParams.countryId;
        this.locationId = this.manageParams.locationId;
        this.filterArea = [];
      });
    } else {
      if (this.filterCountry && this.filterCountry.length) {
        this.filterCountry.forEach(item => {
          if (event.value == item.id) //text: event.source.triggerValue
          {
            this.countryId = item.id;
            this.masterService.getUserMasterdata(6, item.id).subscribe((data: Master[]) => {
              this.filterLocation = data;
              this.filterArea = [];
            });
          }
        });
      }
    }
    this.getClients();
  }

  selectLocation(event, id = 0) {
    this.filterArea = [];
    this.areaId = 0;
    if (id) {
      this.masterService.getUserMasterdata(7, id).subscribe((data: Master[]) => {
        this.filterArea = data;
        this.areaId = this.manageParams.areaId;
      });
    } else {
      this.filterLocation.forEach(item => {
        if (event.value == item.id) //text: event.source.triggerValue
        {
          this.locationId = item.id;
          this.masterService.getUserMasterdata(7, item.id).subscribe((data: Master[]) => {
            this.filterArea = data;
          });
        }
      });
    }
    this.getClients();
  }

  selectArea(event) {
    this.filterArea.forEach(item => {
      if (event.value == item.id) {
        this.areaId = item.id;
        // this.form.controls.address.get('areaId').setValue(item.id);
      }
    })
    this.getClients();
  }

  showDashBoard() {
    let index = this.selectedClients.findIndex(item => item == 0);
    if (index >= 0) {
      this.selectedClients.splice(index, 1);
    }
    //this.selectedClients = ['177'];
    const manageParams: ManageParams = {
      countryId: this.countryId,
      locationId: this.locationId,
      areaId: this.areaId,
      fromDate: this.fromDate,
      toDate: this.toDate,
      clientId: 0,
      strClientId: this.selectedClients.join(",")
    };
    this.cookieService.set('filterData', JSON.stringify(manageParams));
    const currentRoute = this.router.url;
    this.menuItemService.setIsClientChange(false);
    if(this.selectedClients && this.selectedClients.length > 1)
    {
      this.getDefaultDataFormats();
    }
    else {
      this.getClientDataFormats(Number(this.selectedClients));
    }
    
    // if(this.role && this.role.toLowerCase() == 'ems')
    // {
    //   this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
    //     this.router.navigate([currentRoute]); // navigate to same route
    //   });
    // }
    // else {
      
    //   if (currentRoute.includes('/generaldashboard')) {
    //     this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
    //       this.router.navigate([currentRoute]); // navigate to same route
    //     });
    //   }
    //   else {
    //     this.router.navigate(['/generaldashboard', { relativeTo: this.router }]);
    //   }
    // }
    
    this.notificationMessage("Global filter applied successfully.", "green-snackbar");
  }

  getDefaultDataFormats()
  {
    const currentRoute = this.router.url;
    this.masterService.getDefaultDataFormats().subscribe((dataFormat: ClientFormats[]) => {
      if (dataFormat) {
        localStorage.setItem('data_formats', JSON.stringify(dataFormat));        
      }
    });
    if(this.role && this.role.toLowerCase() == 'external')
    {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([currentRoute]); // navigate to same route
      });
    }
    else {
      
      if (currentRoute.includes('/generaldashboard')) {
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentRoute]); // navigate to same route
        });
      }
      else {
        this.router.navigate(['/generaldashboard', { relativeTo: this.router }]);
      }
    }
  }

  getClientDataFormats(clientId)
  {
    const currentRoute = this.router.url;
    this.masterService.getClientDataFormats(clientId).subscribe((dataFormat: ClientFormats[]) => {
      if (dataFormat) {
        localStorage.setItem('data_formats', JSON.stringify(dataFormat));        
      }
    });

    if(this.role && this.role.toLowerCase() == 'external')
    {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([currentRoute]); // navigate to same route
      });
    }
    else {      
      if (currentRoute.includes('/generaldashboard')) {
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentRoute]); // navigate to same route
        });
      }
      else {
        this.router.navigate(['/generaldashboard', { relativeTo: this.router }]);
      }
    }
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  toggleAllSelection() {
    if (this.allSelected.selected) {
      this.form.controls.clients
        .patchValue([...this.filterClients.map(item => item.id), 0]);
    } else {
      this.form.controls.clients.patchValue([]);
    }
    if (this.form.valid) {
      this.isFormValid = true
    }
    else {
      this.isFormValid = false;
    }
  }

  togglePerOne(all) {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }
    if (this.form.controls.clients.value.length == this.filterClients.length) {
      this.allSelected.select();
    }
    if (this.form.valid) {
      this.isFormValid = true
    }
    else {
      this.isFormValid = false;
    }
  }

  reset()
  {
    this.countryId = 0;
    this.locationId = 0;
    this.areaId = 0;
    this.isFormValid = false;
    this.selectedClients = ['0'];
    this.showDashBoard();
    this.form.reset();
    this.getClients();
    this.getCountries();
    this.selectCountry(null, this.countryId);
    this.selectLocation(null, this.locationId);    
  }

}

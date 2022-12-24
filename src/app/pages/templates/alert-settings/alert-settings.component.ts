import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { TemplatesService } from '../templates.service';
import { ClientService } from '../../../tabs/shared/services/client.service';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';
import { Client } from 'src/app/tabs/shared/models/client.model ';
import { MasterService } from 'src/app/tabs/shared/services/master.service';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { AlertSetting } from 'src/app/tabs/shared/models/alert-setting.model';
import { AlertSettingsToolbarComponent } from './alert-settings-toolbar/alert-settings-toolbar.component';
import { TemplateService } from 'src/app/tabs/shared/services/template.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CookieService } from 'ngx-cookie-service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { Observable, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { CopyNotificationTemplateComponent } from '../copy-notification-template/copy-notification-template.component';
import { ClientSelectionService } from 'src/app/tabs/shared/services/client-selection.service';

@Component({
  selector: 'fury-alert-settings',
  templateUrl: './alert-settings.component.html',
  styleUrls: ['./alert-settings.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation]
})
export class AlertSettingsComponent implements OnInit {

  lstTemplateType: ListItem[] = []; //[{ label: '--Select--', value: 0 }];
  clients: ListItem[] = [];
  notificationModes: ListItem[] = [];
  selectedNotificationModes: any[];
  notificationCategories: ListItem[] = [];
  alertSettings: AlertSetting[] = [];
  fliteredAlertSettings: AlertSetting[] = [];
  templateTypeId: number;
  //columns: any[] = [];
  clientId: number = 0;
  notificationCategorId: number = 0;

  private _gap = 16;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`;

  // notificationCategoryTypeCoulmnName = 'Category Type';
  // notificationTypeCoulmnName = 'Notification Template Type';
  // notificationModeCoulmnName = 'Notification Mode';
  // clientColumnName = 'Client';
  // daysColumnName = 'Days';
  // statusColumnName = 'Status';
  // actionsColumnName = 'Actions';


  @ViewChild(AlertSettingsToolbarComponent, { static: true }) alertSettingsToolbarComponent: AlertSettingsToolbarComponent;

  @Input()
  columns: ListColumn[] = [    
    { name: 'Category Type', property: 'notificationCategory', visible: true, isModelProperty: true },
    { name: 'Notification Template Type', property: 'notificationType', visible: true, isModelProperty: true },
    { name: 'Notification Mode', property: 'notificationMode', visible: true, isModelProperty: true },
    { name: 'Client', property: 'clientName', visible: true, isModelProperty: true },    
    { name: 'Status', property: 'isEnableAutoSend', visible: true, isModelProperty: false },
    { name: 'Actions', property: 'actions', visible: true, isModelProperty: false }  
  ] as ListColumn[];

  pageSize = 8;
  dataSource: MatTableDataSource<AlertSetting> | null;
  subject$: ReplaySubject<AlertSetting[]> = new ReplaySubject<AlertSetting[]>(1);
  data$: Observable<AlertSetting[]> = this.subject$.asObservable();

  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort && this.dataSource){
       this.dataSource.sort = this.sort;  
    }
  }

  constructor(
    private templateService: TemplatesService,
    private ClientService: ClientService,
    private masterService: MasterService,
    private snackbar: MatSnackBar,
    private cookieService: CookieService,
    private clientSelectionService: ClientSelectionService,
    private dialog: MatDialog
  ) { }

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit(): void {
    this.clientSelectionService.setIsClientVisible(true);
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.getAlertSettings();
    //this.getTemplateTypes();
    //this.getClients();
    this.getNotificationModes();
    //this.createGridColumns();
  }

  ngAfterViewInit() {
    if(this.dataSource)
    {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }    
  }

  // getTemplateTypes() {
  //   this.lstTemplateType = [{ label: 'Select', value: 0 }];
  //   this.templateService.getNotificationTemplates(this.alertSettingsToolbarComponent.notificationCategory).subscribe((data: any) => {
  //     if (data) {
  //       this.lstTemplateType = data;
  //     } else {
  //       this.lstTemplateType = [];
  //     }
  //   })
  // }

  getClients() {
    this.clients = [];
    this.ClientService.getClients().subscribe((clients: Client[]) => {
      if (clients) {
        clients.forEach(client => {
          this.clients.push({ label: client.clientName, value: client.id } as ListItem);
        });
      }
    });
  }

  getNotificationModes() {
    this.notificationModes = [];    
    //this.masterService.getSystemMasterdata(11,0).subscribe((notificationModes: any[]) => {
    this.templateService.getNotificationModes(this.clientId).subscribe((notificationModes:Master[]) => {
      if (notificationModes) {
        notificationModes.forEach(notificationMode => {
          this.notificationModes.push({ label: notificationMode.description, value: notificationMode.id } as ListItem);
        });
      }
    });
  }

  // createGridColumns(): any {
  //   this.columns = [
  //     { name: 'Checkbox', property: 'checkbox', visible: true },
  //     { name: this.notificationCategoryTypeCoulmnName, property: 'notificationCategory', visible: true, isModelProperty: true },
  //     { name: this.notificationTypeCoulmnName, property: 'notificationType', visible: true, isModelProperty: true },
  //     { name: this.notificationModeCoulmnName, property: 'notificationMode', visible: true, isModelProperty: true },
  //     { name: this.clientColumnName, property: 'clientName', visible: true, isModelProperty: true },
  //     { name: this.daysColumnName, property: 'days', visible: true, isModelProperty: true },
  //     { name: this.daysColumnName, property: 'isEnableAutoSend', visible: true, isModelProperty: true },
  //     { name: this.daysColumnName, visible: true, isModelProperty: true }
  //   ] as ListColumn[];
  // }


  getAlertSettings() {
    this.alertSettings = this.fliteredAlertSettings = [];
    let notificationModes = '';
    if(this.selectedNotificationModes && this.selectedNotificationModes.length > 0)
    {
      notificationModes = this.selectedNotificationModes.join(","); 
    }    
    this.templateService.getAlertSettings(this.clientId,this.notificationCategorId,this.templateTypeId,notificationModes).subscribe({
      next: (response: AlertSetting[]) => {
        if (response) {
          this.fliteredAlertSettings = this.alertSettings = response;          
          this.bindTable();
        }
      },
      error: (err) => {
        this.notificationMessage('Alert settings fetching failed', 'red-snackbar');
      }
    });
  }

  bindTable()
  {
    this.subject$.next(this.fliteredAlertSettings);
    this.dataSource = new MatTableDataSource();

    this.data$.pipe(
      filter(data => !!data)
    ).subscribe((alertSettings) => {
      this.dataSource.data = this.fliteredAlertSettings;
    });
    this.ngAfterViewInit();
  }

  onSave(objAlertSetting: AlertSetting) {
    // const lstAlertSettings: AlertSettings[] = [];
    // const selectedClients = this.alertSettingsToolbarComponent.selectedClients.filter(x => x != 0);
    // const selectedModes = this.alertSettingsToolbarComponent.selectedModes.filter(x => x != 0);
    // const isImmediate = this.alertSettingsToolbarComponent.isImmediate;
    // const notificationTypeId = this.alertSettingsToolbarComponent.notificationTypeId;
    // const days = this.alertSettingsToolbarComponent.days;

    // if (selectedModes && selectedClients) {
    //   selectedModes.forEach(mode => {
    //     selectedClients.forEach(client => {
    //       const alertSettings: AlertSettings = {
    //         notificationTypeId: notificationTypeId,
    //         notificationModeId: mode,
    //         clientId: client,
    //         days: isImmediate ? 0 : Number(days)
    //       }
    //       lstAlertSettings.push(alertSettings);
    //     });
    //   });
    // }

    const alertSettings: AlertSetting = {
              notificationTemplateId: objAlertSetting.id,
              notificationCategoryId: objAlertSetting.notificationCategoryId,
              notificationTypeId: objAlertSetting.notificationTypeId,
              notificationModeId: objAlertSetting.notificationModeId,
              isEnableAutoSend: objAlertSetting.isEnableAutoSend,
              conditionId: objAlertSetting.conditionId,
              days: objAlertSetting.days,
              clientId: objAlertSetting.clientId              
            }
    objAlertSetting.isEnable = objAlertSetting.isEnable == true ? true : false;
    this.templateService.createAlertSettings(alertSettings,objAlertSetting.isEnable).subscribe({
      next: (response: boolean) => {
        if (response) {
          this.getAlertSettings();
          if(objAlertSetting.isEnable == true) {
            this.notificationMessage('Alert settings disabled successfully', 'green-snackbar');
          }
          else {
            this.notificationMessage('Alert settings enabled successfully', 'green-snackbar');
          }
        } else {
            this.notificationMessage('Alert settings enable/disable failed', 'red-snackbar');
        }
      },
      error: (err) => {
        this.notificationMessage('Alert settings enable/disable failed', 'red-snackbar');
      }
    });
  }

  onSelectedRows(rows) {

  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  filterOnNotificationTypeChange(value: number) {
    if (value != 0) {
      this.fliteredAlertSettings = this.alertSettings.filter(x => x.notificationTypeId === value);
    }
    else {
      this.fliteredAlertSettings = this.alertSettings;
    }
  }

  onNotificationTypeChange(value: number) {
    this.templateTypeId = value;
    this.getAlertSettings();
  }  

  onNotificationCategoryChange(value: number)
  {
    this.lstTemplateType = [];
    this.templateTypeId = 0;
    this.notificationCategorId = value;
    this.getAlertSettings();
  }

  filterOnNotificationModesChange(lstNotificationModes: any[]) {
    let lstAlertSettings: AlertSetting[] = [];
    if(lstNotificationModes && lstNotificationModes.length > 0)
    {
      lstNotificationModes.forEach((notificationMode) => {
        this.fliteredAlertSettings.forEach((item) => {
          if(item.notificationModeId == notificationMode)
          {
            lstAlertSettings.push(item);
          }
        })
      });   
      this.fliteredAlertSettings = lstAlertSettings;
    }
  }

  onNotificationModesChanged(lstNotificationModes: any[])
  {
    this.selectedNotificationModes = lstNotificationModes;
    // this.filterOnNotificationModesChange(lstNotificationModes);
    // this.bindTable();
    this.getAlertSettings();
  }

  onFilterChange(value) {
    if (!this.fliteredAlertSettings) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

  copyNotificationTemplates()
  {
    this.dialog.open(CopyNotificationTemplateComponent).afterClosed().subscribe();
  }
}

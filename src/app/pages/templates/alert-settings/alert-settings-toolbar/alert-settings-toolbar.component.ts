import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { MasterService } from 'src/app/tabs/shared/services/master.service';
import { TemplatesService } from '../../templates.service';

@Component({
  selector: 'fury-alert-settings-toolbar',
  templateUrl: './alert-settings-toolbar.component.html',
  styleUrls: ['./alert-settings-toolbar.component.scss']
})
export class AlertSettingsToolbarComponent implements OnInit {

  notificationTypeId: number = 0;
  selectedClients: any[] = [];
  isImmediate: boolean = false;
  selectedModes: any[] = [];
  notificationCategory: number;
  days: string = '';
  fliterClients: ListItem[] = [];
  lstNotificationCategory: Master[];

  @Input() lstTemplateType: any[] = [];
  @Input() clients: ListItem[] = [];
  @Input() notificationModes: ListItem[] = [];
  @Input() notificationCategories: ListItem[] = [];

  @Output() notificationTypeChanged = new EventEmitter<number>();
  @Output() notificationCategoryChanged = new EventEmitter<number>();
  @Output() notificationModesChanged = new EventEmitter<any[]>();

  @ViewChild('notificationSelect') private notificationSelect: MatSelect;
  @ViewChild('notificationModeAllSelectOption') private notificationModeAllSelectOption: MatOption;
  @ViewChild('clientSelect') private clientSelect: MatSelect;
  @ViewChild('clientAllSelectOption') private clientAllSelectOption: MatOption;

  constructor(private masterService: MasterService,
              private templateService: TemplatesService) { }

  ngOnInit(): void {
    this.fliterClients = this.clients;
    this.masterService.getSystemMasterdata(72, 0).subscribe((data: Master[]) => {
      this.lstNotificationCategory = data;
    });
  }

  getTemplateTypes() {
    this.notificationTypeId = 0;
    this.lstTemplateType = []; //[{ label: '--Select--', value: 0 }];    
    this.templateService.getNotificationTemplates(this.notificationCategory).subscribe((data: any) => {
      if (data) {
        this.lstTemplateType = data;        
      } 
      else {
        this.lstTemplateType = [];
      }
    })
  }

  onNotificationTypeChange(value: any) {
    this.notificationTypeId = value;
    this.notificationTypeChanged.emit(this.notificationTypeId);
  }

  onNotificationCategoryChange() {
    this.getTemplateTypes();
    this.notificationCategoryChanged.emit(this.notificationCategory);
  }

  onChangeImmediate(event) {
    this.isImmediate = event.value
  }

  toggleAllModeSelection() {
    if (this.notificationModeAllSelectOption.selected) {
      this.notificationSelect.options.forEach((item: MatOption) => item.select());
    } else {
      this.notificationSelect.options.forEach((item: MatOption) => item.deselect());
    }
    this.selectedModes = this.notificationSelect.value;
    this.notificationSelect.close();
  }


  toggleAllClientSelection() {
    if (this.clientAllSelectOption.selected) {
      this.clientSelect.options.forEach((item: MatOption) => item.select());
    } else {
      this.clientSelect.options.forEach((item: MatOption) => item.deselect());
    }
    this.selectedModes = this.clientSelect.value;
    this.clientSelect.close();
  }

  togglePerOne(all) {
    if (this.notificationModeAllSelectOption.selected) {
      this.notificationModeAllSelectOption.deselect();
      return false;
    }
    if (this.selectedModes.length == this.notificationModes.length)
      this.notificationModeAllSelectOption.select();
  }

  onChangeNotificationMode(value) {
    this.selectedModes = value;   
    this.notificationModesChanged.emit(this.selectedModes);    
  }

  onChangeClients(value) {
    this.selectedClients = value;
  }


  search(query: string) {
    let result = this.select(query)
    this.clients = result;
  }

  select(query: string): ListItem[] {
    let result: ListItem[] = [];
    for (let a of this.fliterClients) {
      if (a.label.toLowerCase().indexOf(query) > -1) {
        result.push(a)
      }
    }
    return result
  }
}

import { Component, OnInit, ChangeDetectorRef, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { scaleInAnimation } from 'src/@fury/animations/scale-in.animation';
import { SeasonPeakSettings } from 'src/app/tabs/shared/models/season-peak-settings.model';
import { TableStructureComponent } from 'src/app/tabs/shared/components/table-structure/table-structure.component';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';
import * as moment from 'moment';
import { TariffMaster } from 'src/app/tabs/shared/models/tariff-master.model';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { MatDialog } from '@angular/material/dialog';
import { AddTariffItemsComponent } from '../../add-tariff-items/add-tariff-items.component';
import { TariffItem } from "../../../shared/models/tariff-item.model";
import { TariffSettings } from 'src/app/tabs/shared/models/tariff-settings.model';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { CancelConfirmationDialogComponent } from 'src/app/tabs/shared/components/cancel-confirmation-dialog/cancel-confirmation-dialog.component';

@Component({
  selector: 'app-create-peak-settings',
  templateUrl: './create-peak-settings.component.html',
  styleUrls: ['./create-peak-settings.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation, scaleInAnimation]
})
export class CreatePeakSettingsComponent implements OnInit {

  peak_settings: FormGroup;

  private _gap = 16;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`;
  col4 = `1 1 calc(5% - ${this._gap / 1}px)`;

  dataSource: SeasonPeakSettings[] = [];
  deletedDataSource: SeasonPeakSettings[] = [];
  sortDataSource: SeasonPeakSettings[] = [];
  columns: any[] = [];

  tariffMaster: TariffMaster = {};

  @Input() months: Master[] = [];
  @Input() peakTypes: ListItem[] = [];
  @Input() days: Master[] = [];
  @Input() seasons: ListItem[] = [];
  @Input() weekTypes: ListItem[] = [];
  @Input() tariffSettings: TariffSettings[] = [];

  @Input() set data(data: TariffMaster) {
    if (data) {
      this.tariffMaster = data;
      if (data.seasonPeakSettings && data.seasonPeakSettings.length) {
        for (let i = 0; i < data.seasonPeakSettings.length; i++) {
          this.tariffMaster.seasonPeakSettings[i].rowNumber = i + 1;
        }
        this.dataSource = this.sortDataSource = data.seasonPeakSettings;
      }
    }
  };

  @Output() isDisable = new EventEmitter<boolean>();
  @Output() tariffSettingsChanged = new EventEmitter<TariffSettings>();

  season: string = '';
  seasonId: number;
  peakType: string = '';
  peakTypeId: number;
  weekType: string = '';
  weekTypeId: number;
  fromHour: string = '00:00:00';
  strfromHour: string;
  strToHour: string;
  toHour: string = '23:59:59';
  rate: number;

  rowNumberColumnName = '#';
  seasonColumnName = 'Season';
  weekTypeColumnName = 'Week Type';
  peakTypeColumnName = 'Peak Type';
  fromHourColumnName = 'From';
  toHourColumnName = 'To';
  rateColumnName = 'Rate';

  isContentChange = false;

  @ViewChild(TableStructureComponent, { static: true }) tableStructureComponent: TableStructureComponent;

  constructor(private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private dialog: MatDialog) {
    this.peak_settings = fb.group({
      'season': [null, Validators.required],
      'peakType': [null, Validators.required],
      'weekType': [null, Validators.required],
      'fromHour': ['', Validators.required],
      'toHour': ['', Validators.required],
      'rate': [null, Validators.required]
    });
  }

  ngOnInit() {
    this.createGridColumns();
  }

  createGridColumns(): any {
    this.columns = [
      { name: this.rowNumberColumnName, property: 'rowNumber', visible: true, isModelProperty: true },
      { name: this.seasonColumnName, property: 'season', visible: true, isModelProperty: true },
      { name: this.weekTypeColumnName, property: 'weekType', visible: true, isModelProperty: true },
      { name: this.peakTypeColumnName, property: 'peakType', visible: true, isModelProperty: true },
      { name: this.fromHourColumnName, property: 'hourStart', visible: true, isModelProperty: true },
      { name: this.toHourColumnName, property: 'hourEnd', visible: true, isModelProperty: true },
      { name: this.rateColumnName, property: 'rate', visible: true, isModelProperty: true },
      { name: 'Actions', property: 'actions', visible: true, isModelProperty: false }
    ] as ListColumn[];
  }

  addNewItem() {
    if (this.peak_settings.valid) {
      this.addItemToDataSource();
      this.peak_settings.reset();
      this.fromHour = '00:00:00';
      this.toHour = '23:59:59';
      this.peak_settings.controls.fromHour.setValue(this.fromHour);
      this.peak_settings.controls.toHour.setValue(this.toHour);
      this.isDisable.emit(false);
    } else {
      this.validateAllFormFields(this.peak_settings);
    }
  }

  addItemToDataSource() {
    let strfromHour = moment();
    let strToHour = moment();
    if (this.seasons && this.seasons.length && this.weekTypes && this.weekTypes.length) {
      const index = this.sortDataSource.findIndex(x => x.seasonId === this.seasonId && x.weekTypeId === this.weekTypeId && x.hourEnd === this.toHour);
      if (index > -1) {
        this.notificationMessage('Time already exist', 'red-snackbar');
        return;
      }
    } else {
      this.notificationMessage('Months Or Days not configured', 'red-snackbar');
      return;
    }
    const item = this.sortDataSource.sort((a, b) => { return b.hourEnd.localeCompare(a.hourEnd) }).find(x => x.monthId === this.seasonId && x.dayId === this.weekTypeId);
    if (!item) {
      strfromHour = moment(this.fromHour, 'HH:mm:ss');
      strToHour = moment(this.toHour, 'HH:mm:ss');
      this.strfromHour = `${strfromHour.format("HH:mm:ss")}`;
      this.strToHour = `${strToHour.format("HH:mm:ss")}`;
    } else {
      strfromHour = moment(this.fromHour, 'HH:mm:ss');
      strToHour = moment(this.toHour, 'HH:mm:ss');
      this.strfromHour = `${strfromHour.format("HH:mm:ss")}`;
      this.strToHour = `${strToHour.format("HH:mm:ss")}`;
      if (strfromHour > strToHour) {
        this.notificationMessage('To-hour should be greater than From-hour', 'red-snackbar');
        return;
      }
    }

    const seasonalPeakSettings: SeasonPeakSettings = {
      season: this.season, seasonId: this.seasonId,
      weekType: this.weekType, weekTypeId: this.weekTypeId,
      peakType: this.peakType, peakTypeId: this.peakTypeId,
      hourStart: `${this.strfromHour}`, hourEnd: `${this.strToHour}`,
      rate: Number(this.rate),
      rowNumber: this.dataSource && this.dataSource.length ? this.dataSource.length + 1 : 1
    };
    if (seasonalPeakSettings) {
      this.isContentChange = true;
      this.dataSource.push(seasonalPeakSettings);
    }
    this.tableStructureComponent.tableData = this.sortDataSource = this.dataSource;
    if (this.strToHour !== '23:59:59') {
      this.fromHour = `${this.strToHour.slice(0, -1)}1`;
      this.toHour = '23:59:59';
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


  onChangeWeekTypes(value) {
    this.weekTypeId = value;
    this.weekType = this.weekTypes.find(x => x.value === this.weekTypeId).label;
    if (this.seasonId && this.weekTypeId) {
      const item = this.sortDataSource.sort((a, b) => { return b.hourEnd.localeCompare(a.hourEnd) }).find(x => x.monthId === this.seasonId && x.dayId === this.weekTypeId);
      if (item) {
        this.fromHour = item.hourStart;
        this.toHour = '23:59:59';
      } else {
        this.fromHour = '00:00:00';
        this.toHour = '23:59:59';
      }
    }
  }

  onChangeType(value) {
    this.peakTypeId = value;
    this.peakType = this.peakTypes.find(x => x.value === this.peakTypeId).label;
    if (this.seasonId && this.weekTypeId) {
      const item = this.sortDataSource.sort((a, b) => { return b.hourEnd.localeCompare(a.hourEnd) }).find(x => x.monthId === this.seasonId && x.dayId === this.weekTypeId);
      if (item) {
        this.fromHour = item.hourStart;
        this.toHour = '23:59:59';
      } else {
        this.fromHour = '00:00:00';
        this.toHour = '23:59:59';
      }
    }
  }

  onChangeSeasons(value) {
    this.seasonId = value;
    this.season = this.seasons.find(x => x.value === this.seasonId).label;
    if (this.seasonId && this.weekTypeId) {
      const item = this.sortDataSource.sort((a, b) => { return b.hourEnd.localeCompare(a.hourEnd) }).find(x => x.monthId === this.seasonId && x.dayId === this.weekTypeId);
      if (item) {
        this.fromHour = item.hourStart;
        this.toHour = '23:59:59';
      } else {
        this.fromHour = '00:00:00';
        this.toHour = '23:59:59';
      }
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }


  onDeleteRow(row: SeasonPeakSettings) {
    const confirmMessage: ListItem = {
      label: "Are you sure you want to Delete?",
      selected: false
    };
    this.dialog.open(CancelConfirmationDialogComponent, { data: confirmMessage }).afterClosed().subscribe((message: any) => {
      if (message) {
        //const existingItemIndex = this.dataSource.findIndex(x => x.monthId == row.monthId && x.peakTypeId === row.peakTypeId && x.dayId === row.dayId);
        const existingItemIndex = this.dataSource.findIndex(x => x.seasonId == row.seasonId && x.peakTypeId === row.peakTypeId && x.weekTypeId === row.weekTypeId);
        if (existingItemIndex > -1) {
          this.deletedDataSource.push(this.dataSource[existingItemIndex]);
          this.dataSource.splice(existingItemIndex, 1);
        }
        this.tableStructureComponent.tableData = this.dataSource;
        if (this.dataSource && this.dataSource.length > 0) {
          this.isDisable.emit(false);
        }
        else {
          this.isDisable.emit(true);
        }
      }
    });
  }

  addItem(type: string) {
    let tariffSettings: TariffSettings[] = [];
    if (type === 'Season') {
      tariffSettings = this.tariffSettings.filter(x => x.type == 1);
    } else {
      tariffSettings = this.tariffSettings.filter(x => x.type == 2);
    }
    const tariffItem: TariffItem = { type: type, subItems: type == 'Season' ? this.months : this.days, tariffSettings: tariffSettings };
    this.dialog.open(AddTariffItemsComponent, { data: tariffItem }
    ).afterClosed().subscribe((tariffSettings: TariffSettings) => {
      if (tariffSettings) {
        this.tariffSettingsChanged.emit(tariffSettings);
      }
    });
  }
}

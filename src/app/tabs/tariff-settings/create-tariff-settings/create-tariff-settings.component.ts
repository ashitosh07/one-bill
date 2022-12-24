import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { scaleInAnimation } from 'src/@fury/animations/scale-in.animation';
import { MasterService } from '../../shared/services/master.service';
import { Master } from '../../shared/models/master.model';
import { ListItem } from '../../shared/models/list-item.model';
import { TariffMaster } from '../../shared/models/tariff-master.model';
import { CreateSeasonalTariffSettingsComponent } from './create-seasonal-tariff-settings/create-seasonal-tariff-settings.component';
import { CreatePeakSettingsComponent } from './create-peak-settings/create-peak-settings.component';
import { CreateSlabRateSettingsComponent } from './create-slab-rate/create-slab-rate-settings.component';
import { Client } from '../../shared/models/client.model ';
import { TariffClient } from '../../shared/models/tariff-client.model';
import { AnnouncementService } from '../../shared/services/announcement.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SeasonPeakSettings } from '../../shared/models/season-peak-settings.model';
import * as moment from 'moment';
import { TariffMasterService } from '../../shared/services/tariff-master.service';
import { TariffSettings } from '../../shared/models/tariff-settings.model';
import { CancelConfirmationDialogComponent } from '../../shared/components/cancel-confirmation-dialog/cancel-confirmation-dialog.component';

@Component({
  selector: 'app-create-tariff-settings',
  templateUrl: './create-tariff-settings.component.html',
  styleUrls: ['./create-tariff-settings.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation, scaleInAnimation]
})
export class CreateTariffSettingsComponent implements OnInit {

  seasonSettingsFormGroup: FormGroup;
  peakSettingsFormGroup: FormGroup;
  slabSettingsFormGroup: FormGroup;

  private _gap = 16;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`;

  utilityTypes: ListItem[] = [];
  parameters: ListItem[] = [];
  seasons: ListItem[] = [];
  weekTypes: ListItem[] = [];
  days: Master[] = [];
  peakTypes: ListItem[] = [];
  months: Master[] = [];
  slabs: ListItem[] = [];
  clients: Client[] = [];
  tariffSettings: TariffSettings[] = [];

  utilityTypeId: number = 0;
  parameterId: number = 0;
  passwordInputType = 'password';
  tariffName: string = '';
  rate: number = 0;
  peakTypeId: number = 0;
  weekTypeId: number = 0;
  from: number = 0;
  to: number = 0;
  tariffDate: Date = new Date();
  isDisable = true;
  tariffMaster: TariffMaster = {};

  peakSettingsHide = true;
  slabSettingsHide = true;
  buttonName: string = 'CREATE TARIFF';

  @ViewChild(CreateSeasonalTariffSettingsComponent, { static: true }) createSeasonalTariffSettingsComponent: CreateSeasonalTariffSettingsComponent;
  @ViewChild(CreatePeakSettingsComponent, { static: true }) createPeakSettingsComponent: CreatePeakSettingsComponent;
  @ViewChild(CreateSlabRateSettingsComponent, { static: true }) createSlabRateSettingsComponent: CreateSlabRateSettingsComponent;


  constructor(
    private snackbar: MatSnackBar,
    private masterService: MasterService,
    private announcementService: AnnouncementService,
    private dialogRef: MatDialogRef<CreateTariffSettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public defaults: TariffMaster,
    private tariffMasterService: TariffMasterService,
    private dialog: MatDialog) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    //if (this.tariffMaster) {
    if (this.defaults) {
      this.peakSettingsHide = false;
      //this.slabSettingsHide = false;
      this.buttonName = 'UPDATE TARIFF';
    }
    this.seasonSettingsFormGroup = this.createSeasonalTariffSettingsComponent.season_tariff;
    this.peakSettingsFormGroup = this.createPeakSettingsComponent.peak_settings;
    //this.slabSettingsFormGroup = this.createSlabRateSettingsComponent.slab_rate;
    this.getMonths();
    this.getDays();
    this.getTariffSettings();
    this.getUtilityTypes();
    this.getParameters();
    this.getClients();
    this.getSeasons();
    this.getWeekTypes();
    this.getPeakTypes();
    this.getSlabs();
  }

  getClients() {
    this.clients = [];
    this.announcementService.getClients().subscribe((clients: Client[]) => {
      if (clients) {
        this.clients = clients;
      }
    });
  }

  submit() {
    const valid: boolean = this.updateValues();
    if (valid) {
      this.dialogRef.close(this.tariffMaster);
    }
  }

  updateValues() {
    let tariffClients: TariffClient[] = [];
    const selectedClients = this.createSeasonalTariffSettingsComponent.selectedClients;
    if (selectedClients) {
      selectedClients.forEach(x => {
        tariffClients.push({ clientId: Number(x) });
      });
    }
    let tariffId = 0;
    if (this.defaults) {
      tariffId = this.defaults.id;
    }

    let seasonPeakSettings: SeasonPeakSettings[] = [];
    const addedSeasonPeakSettings = this.createPeakSettingsComponent.dataSource;
    if (addedSeasonPeakSettings && addedSeasonPeakSettings.length) {
      if (this.seasons && this.seasons.length) {
        addedSeasonPeakSettings.forEach(seasonPeakSetting => {
          const selectSeason = this.seasons.find(x => x.value === seasonPeakSetting.seasonId);
          if (selectSeason && selectSeason.subListItems && selectSeason.subListItems.length) {
            if (this.weekTypes && this.weekTypes.length) {
              const selectWeekType = this.weekTypes.find(x => x.value === seasonPeakSetting.weekTypeId);
              selectSeason.subListItems.forEach(season => {
                selectWeekType.subListItems.forEach(weekType => {
                  const seasonalPeakSettings: SeasonPeakSettings = {
                    season: selectSeason.label, seasonId: selectSeason.value,
                    weekType: selectWeekType.label, weekTypeId: selectWeekType.value,
                    month: season.description, monthId: season.id,
                    day: weekType.description, dayId: weekType.id,
                    peakType: seasonPeakSetting.peakType, peakTypeId: seasonPeakSetting.peakTypeId,
                    hourStart: seasonPeakSetting.hourStart, hourEnd: seasonPeakSetting.hourEnd,
                    rate: seasonPeakSetting.rate, rowNumber: seasonPeakSettings && seasonPeakSettings.length ? seasonPeakSettings.length + 1 : 1
                  };
                  seasonPeakSettings.push(seasonalPeakSettings);
                })
              });
            }
          }
        });
      }
    }

    const valid = this.validateSeasonPeakSettings(seasonPeakSettings);

    if (!valid) {
      this.notificationMessage('Season peak settings not fully complete', 'red-snackbar');
      return valid;
    }

    const tariffMaster: TariffMaster = {
      id: tariffId,
      tariffName: this.createSeasonalTariffSettingsComponent.tariffName,
      utility: this.createSeasonalTariffSettingsComponent.utilityType,
      utilityTypeId: this.createSeasonalTariffSettingsComponent.utilityTypeId,
      parameter: this.createSeasonalTariffSettingsComponent.parameter ? this.createSeasonalTariffSettingsComponent.parameter : '',
      parameterId: this.createSeasonalTariffSettingsComponent.parameterId ? this.createSeasonalTariffSettingsComponent.parameterId : 0,
      wefDate: this.createSeasonalTariffSettingsComponent.wefDate ? new Date(this.createSeasonalTariffSettingsComponent.wefDate) : null,
      tariffClients: tariffClients,
      seasonPeakSettings: seasonPeakSettings
      //tariffConsumptionSettings: this.createSlabRateSettingsComponent.dataSource
    };
    this.tariffMaster = tariffMaster;
    return valid;
  }


  validateSeasonPeakSettings(seasonPeakSettings: SeasonPeakSettings[]) {
    let valid = true;
    let totalHour: number = 0;
    const firstMonth = seasonPeakSettings.find(x => x.monthId);
    seasonPeakSettings.filter(x => x.monthId === firstMonth.monthId).sort(function (a, b) {
      return a.dayId - b.dayId || a.hourStart.localeCompare(b.hourStart);
    }).forEach(seasonPeakSetting => {
      var time_start = new Date();
      var time_end = new Date();
      let endHour = seasonPeakSetting.hourEnd;
      if (seasonPeakSetting.hourEnd === '23:59:59') {
        endHour = '24:00:00';
      };
      var value_start = seasonPeakSetting.hourStart.split(':');
      var value_end = endHour.split(':');
      time_start.setHours(Number(value_start[0]), Number(value_start[1]), Number(value_start[2]), 0);
      time_end.setHours(Number(value_end[0]), Number(value_end[1]), Number(value_end[2]), 0);
      const timeDifference = moment(time_end).diff(moment(time_start), 'hours');
      totalHour += timeDifference;
    });

    if (totalHour != 168) {
      valid = false;
    }
    return valid;
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }


  getUtilityTypes() {
    this.utilityTypes = [];
    let listUtilityTypes = [];
    this.masterService.getSystemMasterdata(16, 0).subscribe((utilityTypes: Master[]) => {
      if (utilityTypes) {
        utilityTypes.forEach(utilityType => {
          listUtilityTypes.push({ label: utilityType.description, value: utilityType.id } as ListItem);
        });
        this.utilityTypes = listUtilityTypes;
      }
    });
  }

  getParameters() {
    this.parameters = [];
    let listParameters = [];
    this.masterService.getSystemMasterdata(33, 0).subscribe((parameters: Master[]) => {
      if (parameters) {
        parameters.forEach(parameter => {
          listParameters.push({ label: parameter.description, value: parameter.id } as ListItem);
        });
        this.parameters = listParameters;
      }
    });
  }

  getSeasons() {
    this.seasons = [];
    this.masterService.getUserMasterParentData(1).subscribe((seasons: Master[]) => {
      if (seasons) {
        seasons.forEach(season => {
          this.seasons.push({ label: season.description, value: season.id, subListItems: season.masters } as ListItem);
        });
      }
    });
  }

  getWeekTypes() {
    this.weekTypes = [];
    this.masterService.getUserMasterParentData(2).subscribe((weekTypes: Master[]) => {
      if (weekTypes) {
        weekTypes.forEach(weekType => {
          this.weekTypes.push({ label: weekType.description, value: weekType.id, subListItems: weekType.masters } as ListItem);
        });
      }
    });
  }

  getDays() {
    this.days = [];
    this.masterService.getSystemMasterdata(32, 0).subscribe((days: Master[]) => {
      if (days) {
        this.days = days;
      }
    });
  }

  getPeakTypes() {
    this.peakTypes = [];
    this.masterService.getSystemMasterdata(13, 0).subscribe((peakTypes: Master[]) => {
      if (peakTypes) {
        peakTypes.forEach(peakType => {
          this.peakTypes.push({ label: peakType.description, value: peakType.id } as ListItem);
        });
      }
    });
  }

  getMonths() {
    this.months = [];
    this.masterService.getSystemMasterdata(65, 0).subscribe((months: Master[]) => {
      if (months) {
        this.months = months;
      }
    });
  }

  getSlabs() {
    this.slabs = [];
    this.masterService.getUserMasterdata(38, 0).subscribe((slabs: Master[]) => {
      if (slabs) {
        slabs.forEach(slab => {
          this.slabs.push({ label: slab.description, value: slab.id } as ListItem);
        });
      }
    });
  }

  isSlabSettingsAdded(event: boolean) {
    this.slabSettingsHide = event;
  }

  isPeakSettingsAdded(event: boolean) {
    this.peakSettingsHide = event;
  }

  close() {
    if ((this.createPeakSettingsComponent.deletedDataSource && this.createPeakSettingsComponent.deletedDataSource.length) || this.createPeakSettingsComponent.isContentChange) {
      const confirmMessage: ListItem = {
        label: "By Closing the Page added data will be lost . Do you want to Exit?",
        selected: false
      };
      this.dialog.open(CancelConfirmationDialogComponent, { data: confirmMessage }).afterClosed().subscribe((message: any) => {
        if (message) {
          if (this.createPeakSettingsComponent.deletedDataSource && this.createPeakSettingsComponent.deletedDataSource.length) {
            this.createPeakSettingsComponent.deletedDataSource.forEach(x =>
              this.createPeakSettingsComponent.dataSource.push(x)
            );
            this.createPeakSettingsComponent.deletedDataSource = [];
          } else {
            this.createPeakSettingsComponent.isContentChange = false;
          }
          this.dialogRef.close();
        }
      });
    } else {
      this.dialogRef.close();
    }
  }

  getTariffSettings() {
    this.tariffSettings = [];
    this.tariffMasterService.getTariffSettings().subscribe((tariffSettings: TariffSettings[]) => {
      if (tariffSettings) {
        this.tariffSettings = tariffSettings;
      }
    });
  }

  saveTariffSettings(tariffSettings: TariffSettings) {
    this.tariffMasterService.saveTariffSettings(tariffSettings).subscribe({
      next: response => {
        if (response) {
          this.notificationMessage('Tariff settings saved successfully', 'green-snackbar');
        } else {
          this.notificationMessage('Tariff settings save failed', 'red-snackbar');
        }
        this.getTariffSettings();
        this.getSeasons();
        this.getWeekTypes();
      },
      error: (err) => {
        this.notificationMessage('Tariff settings save failed', 'red-snackbar');
      }
    });
  }
}

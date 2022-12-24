import { Component, OnInit, ChangeDetectorRef, ViewChild, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { scaleInAnimation } from 'src/@fury/animations/scale-in.animation';
import { MasterService } from '../../shared/services/master.service';
import { Master } from '../../shared/models/master.model';
import { ListItem } from '../../shared/models/list-item.model';
import { TariffMaster } from '../../shared/models/tariff-master.model';
import { TariffMasterService } from '../../shared/services/tariff-master.service';
import { CreateSeasonalTariffSettingsComponent } from '../create-tariff-settings/create-seasonal-tariff-settings/create-seasonal-tariff-settings.component';
import { CreatePeakSettingsComponent } from '../create-tariff-settings/create-peak-settings/create-peak-settings.component';
import { CreateSlabRateSettingsComponent } from '../create-tariff-settings/create-slab-rate/create-slab-rate-settings.component';
import { Client } from '../../shared/models/client.model ';
import { ClientService } from '../../shared/services/client.service';
import { TariffClient } from '../../shared/models/tariff-client.model';
import { AnnouncementService } from '../../shared/services/announcement.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CancelConfirmationDialogComponent } from '../../shared/components/cancel-confirmation-dialog/cancel-confirmation-dialog.component';
import { ClientSelectionService } from '../../shared/services/client-selection.service';

@Component({
  selector: 'app-create-slab-tariff-settings',
  templateUrl: './create-slab-tariff-settings.component.html',
  styleUrls: ['./create-slab-tariff-settings.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation, scaleInAnimation]
})
export class CreateSlabTariffSettingsComponent implements OnInit {

  seasonSettingsFormGroup: FormGroup;
  peakSettingsFormGroup: FormGroup;
  slabSettingsFormGroup: FormGroup;

  private _gap = 16;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`;

  utilityTypes: ListItem[] = [];
  parameters: ListItem[] = [];
  days: ListItem[] = [];
  peakTypes: ListItem[] = [];
  months: ListItem[] = [];
  slabs: ListItem[] = [];
  clients: Client[] = [];

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
  isSlabTariffSettings: boolean = false;
  isSeasonalTariffSettings: boolean = false;

  peakSettingsHide = true;
  slabSettingsHide = true;
  buttonName: string = 'CREATE SLAB TARIFF'

  @ViewChild(CreateSeasonalTariffSettingsComponent, { static: true }) createSeasonalTariffSettingsComponent: CreateSeasonalTariffSettingsComponent;
  @ViewChild(CreatePeakSettingsComponent, { static: true }) createPeakSettingsComponent: CreatePeakSettingsComponent;
  @ViewChild(CreateSlabRateSettingsComponent, { static: true }) createSlabRateSettingsComponent: CreateSlabRateSettingsComponent;


  constructor(private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private snackbar: MatSnackBar,
    private masterService: MasterService,
    private announcementService: AnnouncementService,
    private tariffMasterService: TariffMasterService,
    private clientService: ClientService,
    private clientSelectionService: ClientSelectionService,
    private dialogRef: MatDialogRef<CreateSlabTariffSettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public defaults: TariffMaster,
    private dialog: MatDialog) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.clientSelectionService.setIsClientVisible(false);
    //if (this.tariffMaster) {
    if (this.defaults) {
      //this.peakSettingsHide = false;
      this.slabSettingsHide = false;
      this.buttonName = 'UPDATE SLAB TARIFF';
    }
    this.seasonSettingsFormGroup = this.createSeasonalTariffSettingsComponent.season_tariff;
    //this.peakSettingsFormGroup = this.createPeakSettingsComponent.peak_settings;
    this.slabSettingsFormGroup = this.createSlabRateSettingsComponent.slab_rate;

    this.getUtilityTypes();
    this.getParameters();
    this.getClients();
    this.getDays();
    this.getPeakTypes();
    this.getMonths();
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
    this.updateValues();
    this.dialogRef.close(this.tariffMaster);
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
    const tariffMaster: TariffMaster = {
      id: tariffId,
      tariffName: this.createSeasonalTariffSettingsComponent.tariffName,
      utility: this.createSeasonalTariffSettingsComponent.utilityType,
      utilityTypeId: this.createSeasonalTariffSettingsComponent.utilityTypeId,
      parameter: this.createSeasonalTariffSettingsComponent.parameter,
      parameterId: this.createSeasonalTariffSettingsComponent.parameterId,
      wefDate: new Date(this.createSeasonalTariffSettingsComponent.wefDate),
      tariffClients: tariffClients,
      //seasonPeakSettings: this.createPeakSettingsComponent.dataSource,
      tariffConsumptionSettings: this.createSlabRateSettingsComponent.dataSource
    };
    this.tariffMaster = tariffMaster;
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

  getDays() {
    this.days = [];
    this.masterService.getSystemMasterdata(32, 0).subscribe((days: Master[]) => {
      if (days) {
        days.forEach(day => {
          this.days.push({ label: day.description, value: day.id } as ListItem);
        });
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
        months.forEach(month => {
          this.months.push({ label: month.description, value: month.id } as ListItem);
        });
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
    if ((this.createSlabRateSettingsComponent.deletedDataSource && this.createSlabRateSettingsComponent.deletedDataSource.length) || this.createSlabRateSettingsComponent.isContentChange) {
      const confirmMessage: ListItem = {
        label: "By Closing the Page added data will be lost . Do you want to Exit?",
        selected: false
      };
      this.dialog.open(CancelConfirmationDialogComponent, { data: confirmMessage }).afterClosed().subscribe((message: any) => {
        if (message) {
          if (this.createSlabRateSettingsComponent.dataSource.length) {
            this.createSlabRateSettingsComponent.deletedDataSource.forEach(x =>
              this.createSlabRateSettingsComponent.dataSource.push(x)
            );
            this.createSlabRateSettingsComponent.dataSource.sort((a, b) => a.consumptionMin - b.consumptionMin || a.consumptionMax - b.consumptionMax);
            this.createSlabRateSettingsComponent.deletedDataSource = [];
          } else {
            this.createSlabRateSettingsComponent.isContentChange = false;
          }
          this.dialogRef.close();
        }
      });
    } else {
      this.dialogRef.close();
    }
  }
}

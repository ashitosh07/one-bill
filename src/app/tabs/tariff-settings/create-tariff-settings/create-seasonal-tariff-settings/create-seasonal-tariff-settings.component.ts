import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { scaleInAnimation } from 'src/@fury/animations/scale-in.animation';
import { MatOption } from '@angular/material/core';
import { Client } from 'src/app/tabs/shared/models/client.model ';
import { TariffClient } from 'src/app/tabs/shared/models/tariff-client.model';
import { TariffMaster } from 'src/app/tabs/shared/models/tariff-master.model';

@Component({
  selector: 'app-create-seasonal-tariff-settings',
  templateUrl: './create-seasonal-tariff-settings.component.html',
  styleUrls: ['./create-seasonal-tariff-settings.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation, scaleInAnimation]
})
export class CreateSeasonalTariffSettingsComponent implements OnInit {

  season_tariff: FormGroup;
  listParameters: any[] = [{ label: 'Select', value: 0 }];
  listUtilityTypes: any[] = [{ label: 'Select', value: 0 }];
  listClients: Client[] = [];

  @Input() get utilityTypes(): any[] { return this.listUtilityTypes }
  set utilityTypes(value: any[]) {
    if (value && value.length) {
      this.listUtilityTypes = value;
      if (this.tariffMaster) {
        this.utilityType = this.tariffMaster.parameter;
        this.utilityTypeId = this.tariffMaster.utilityTypeId;
        this.season_tariff.controls.utility_type.setValue(this.utilityTypeId);
      }
    } else {
      this.listUtilityTypes = [{ label: 'Select', value: 0 }];
    }
  }
  @Input() get parameters(): any[] { return this.listParameters }
  set parameters(value: any[]) {
    if (value && value.length) {
      this.listParameters = value;
      if (this.tariffMaster) {
        //this.parameter = this.tariffMaster.parameter;
        //this.parameterId = this.tariffMaster.parameterId;
        //this.season_tariff.controls.parameter_type.setValue(this.parameterId);
      }
    } else {
      this.listParameters = [{ label: 'Select', value: 0 }];
    }
  }

  @Input() get clients(): Client[] { return this.listClients }
  set clients(value: Client[]) {
    if (value && value.length) {
      this.listClients = value;
      if (this.tariffMaster && this.tariffMaster.tariffClients && this.tariffMaster.tariffClients.length) {
        for (let i = 0; i < this.tariffMaster.tariffClients.length; i++) {
          if (this.tariffMaster.tariffClients[i].clientId && this.tariffMaster.tariffClients[i].clientId > 0) {
            this.selectedClients[i] = this.tariffMaster.tariffClients[i].clientId;
          }
        }
        this.season_tariff.controls.client_select
          .patchValue([...this.tariffMaster.tariffClients.filter(x => x.clientId > 0).map(item => item.clientId)]);
      }
    }
  }

  @Input() set data(data: TariffMaster) {
    if (data) {
      this.tariffMaster = data;
    }
  };


  @ViewChild('allSelected') private allSelected: MatOption;

  utilityType: string = '';
  utilityTypeId: number;
  parameter: string = '';
  parameterId: number;
  tariffName: string = '';
  wefDate: string = '';

  selectedClients: any[] = [];
  tariffMaster: TariffMaster = {};

  constructor(private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private snackbar: MatSnackBar) {
    this.season_tariff = fb.group({
      'tariff_name': ['', Validators.required],
      'utility_type': [null, Validators.required],
      // 'parameter_type': [null, Validators.required],
      // 'wef_date': ['', Validators.required],
      'client_select': [null, Validators.required]
    });
  }

  ngOnInit() {
    if (this.tariffMaster) {
      this.tariffName = this.tariffMaster.tariffName;
      //this.wefDate = this.tariffMaster.wefDate.toString();
    }
  }

  onChangeUtilityType(value) {
    this.utilityTypeId = value;
    this.utilityType = this.utilityTypes.find(x => x.value === this.utilityTypeId).label;
  }

  onChangeParameter(value) {
    this.parameterId = value;
    this.parameter = this.parameters.find(x => x.value === this.parameterId).label;
  }

  tosslePerOne(all) {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }
    if (this.season_tariff.controls.client_select.value.length == this.clients.length)
      this.allSelected.select();
  }

  toggleAllSelection() {
    if (this.allSelected.selected) {
      this.season_tariff.controls.client_select
        .patchValue([...this.clients.map(item => item.id), 0]);
    } else {
      this.season_tariff.controls.client_select.patchValue([]);
    }
  }
}

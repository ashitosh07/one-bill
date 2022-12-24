import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { environment } from 'src/environments/environment';
import { CancelConfirmationDialogComponent } from '../../shared/components/cancel-confirmation-dialog/cancel-confirmation-dialog.component';
import { getClientDataFormat } from '../../shared/utilities/utility';
import { ListItem } from '../../shared/models/list-item.model';
import { TariffMaster } from '../../shared/models/tariff-master.model';
import { TariffMasterService } from '../../shared/services/tariff-master.service';
import { CreateSlabTariffSettingsComponent } from '../create-slab-tariff-settings/create-slab-tariff-settings.component';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-edit-slab-tariff-settings',
  templateUrl: './edit-slab-tariff-settings.component.html',
  styleUrls: ['./edit-slab-tariff-settings.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation]
})
export class EditSlabTariffSettingsComponent implements OnInit {

  private _gap = 16;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`;

  tariffMasters: TariffMaster[] = [];

  dateFormat = '';

  constructor(
    private tariffMasterService: TariffMasterService,
    private date: DatePipe,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private envService: EnvService) {
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;;
  }

  ngOnInit(): void {
    this.getTariffMasters();
  }

  getTariffMasters() {
    this.tariffMasterService.getTariffMasters().subscribe(
      response => {
        if (response) {
          response.forEach(x => {
            x.wefDateLocal = this.date.transform(x.wefDate, this.dateFormat);
          });
          this.tariffMasters = response.filter(x => x.tariffConsumptionSettings.length > 0);
        }
      });
  }

  onUpdateRow(tariffMaster: TariffMaster) {
    this.dialog.open(CreateSlabTariffSettingsComponent, {
      data: tariffMaster
      // width: '80vw',
      // height: '40vw',
      // maxWidth: '80vw',
    }).afterClosed().subscribe((response: TariffMaster) => {
      if (response) {
        this.tariffMasterService.updateTariffMaster(response).subscribe({
          next: response => {
            if (response) {
              this.notificationMessage('Tariff master updated successfully', 'green-snackbar');
            } else {
              this.notificationMessage('Tariff master update failed', 'red-snackbar');
            }
            this.getTariffMasters();
          },
          error: (err) => {
            this.notificationMessage('Tariff master update failed', 'red-snackbar');
          }
        });
      } else {
        this.getTariffMasters();
      }
    });
  }

  onAddItem() {
    this.dialog.open(CreateSlabTariffSettingsComponent
      // ,{
      // width: '70vw',
      // height: '35vw',
      // maxWidth: '70vw'}
    ).afterClosed().subscribe((response: TariffMaster) => {
      if (response) {
        this.tariffMasterService.saveTariffMaster(response).subscribe({
          next: response => {
            if (response) {
              this.notificationMessage('Tariff master saved successfully', 'green-snackbar');
            } else {
              this.notificationMessage('Tariff master save failed', 'red-snackbar');
            }
            this.getTariffMasters();
          },
          error: (err) => {
            this.notificationMessage('Tariff master save failed', 'red-snackbar');
          }
        });
      }
    });

  }


  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  onDeleteRow(tariffMaster: TariffMaster) {
    if (tariffMaster.isTariffUsed) {
      this.notificationMessage('Cannot delete as tariff is in use', 'red-snackbar');
      return;
    }
    const confirmMessage: ListItem = {
      label: "Are you sure you want to Delete?",
      selected: false
    };
    this.dialog.open(CancelConfirmationDialogComponent, { data: confirmMessage }).afterClosed().subscribe((message: any) => {
      if (message) {
        this.tariffMasterService.deleteTariffMaster(tariffMaster).subscribe({
          next: response => {
            if (response) {
              this.notificationMessage('Tariff master deleted successfully', 'green-snackbar');
            } else {
              this.notificationMessage('Tariff master delete failed', 'red-snackbar');
            }
            this.getTariffMasters();
          },
          error: (err) => {
            this.notificationMessage('Tariff master delete failed', 'red-snackbar');
          }
        });
      }
    });
  }
}

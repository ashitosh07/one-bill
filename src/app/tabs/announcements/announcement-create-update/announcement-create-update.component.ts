import { Component, Inject, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MetadataService } from 'src/app/tabs/shared/services/metadata.service';
import { Metadata } from '../../shared/models/metadata.model';
import { MetadataTenant } from 'src/app/tabs/shared/models/metada.tenant.model';
import { MetadataBillPeriod } from '../../shared/models/metadata.bill-period.model';
import { MetadataUnit } from 'src/app/tabs/shared/models/metadata.unit.model';
import { MetadataAccountHead } from '../../shared/models/metadata.account-head.model';
import { MetadataBillType } from '../../shared/models/metadata.bill-type.model';
import { Announcement } from './announcement.model';
import { AnnouncementService } from '../../shared/services/announcement.service';
import { ClientService } from '../../shared/services/client.service';
import { Observable, ReplaySubject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { Client } from '../../shared/models/client.model ';
import { ListItem } from '../../shared/models/list-item.model';
import { MatOption } from '@angular/material/core';
import { CancelConfirmationDialogComponent } from 'src/app/tabs/shared/components/cancel-confirmation-dialog/cancel-confirmation-dialog.component';


@Component({
  selector: 'fury-announcement-create-update',
  templateUrl: './announcement-create-update.component.html',
  styleUrls: ['./announcement-create-update.component.scss']
})
export class AnnouncementCreateUpdateComponent implements OnInit {

  @ViewChild('allSelected') private allSelected: MatOption;

  static id = 100;
  mode: 'create' | 'update' = 'create';
  form: FormGroup;
  selectedClients = [];
  clients: ListItem[] = [];
  selectedAnnouncementClients: any = [];
  isValidDate: boolean = false;
  validTill: string;
  userId: number;
  isCancel: boolean = false;
  minDate: Date;

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: Announcement,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private metadataService: MetadataService,
    private clientService: ClientService,
    private announcementService: AnnouncementService,
    private dialogRef: MatDialogRef<AnnouncementCreateUpdateComponent>) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2); // adjust 0 before single digit date.
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2); // current month.
    let year = date_ob.getFullYear(); // current year.
    let today = month + "/" + date + "/" + year; // get date in MM-DD-YYYY format.
    this.minDate = new Date(today);
    if (this.defaults) {
      this.mode = 'update';
      for (let i = 0; i < this.defaults.clients.length; i++) {
        this.selectedClients[i] = this.defaults.clients[i].clientId;
      }
    }
    else {
      this.defaults = new Announcement({});
    }
    this.getClients();

    this.form = this.fb.group({
      id: [this.defaults.id || AnnouncementCreateUpdateComponent.id++],
      title: [this.defaults.title || '', Validators.required],
      content: [this.defaults.content || '', Validators.required],
      validTill: [this.defaults.validTill || '', Validators.required],
      //validTill:[this.defaults.validTill && new Date(this.defaults.validTill).toISOString().substr(0,10) || '', Validators.required],
      clientSelect: ['', Validators.required],
      clients: [this.defaults.clients]
    });

  }

  save() {
    if (this.isCancel) {
      this.isCancel = false;
      const confirmMessage: ListItem = {
        label: "Are you sure you want to Cancel?",
        selected: false
      };
      this.dialog.open(CancelConfirmationDialogComponent, { data: confirmMessage }).afterClosed().subscribe((message: any) => {
        if (message) {
          this.dialogRef.close();
        }
      });
      return;
    }
    if (this.validateDates()) {
      if (this.mode === 'create') {
        this.createAnnouncement();
      }
      else if (this.mode === 'update') {
        this.updateAnnouncement();
      }
    }
  }

  isCreateMode() {
    return this.mode === 'create';
  }

  isUpdateMode() {
    return this.mode === 'update';
  }

  createAnnouncement() {
    Object.assign(this.defaults, this.form.value);
    this.defaults.validTill = this.datePipe.transform(this.defaults.validTill, 'yyyy-MM-dd');
    for (let i = 0; i < this.selectedClients.length; i++) {
      if (this.selectedClients[i] != 0) {
        this.selectedAnnouncementClients.push({
          announcementId: this.defaults.id,
          clientId: this.selectedClients[i]
        });
      }
    }
    this.defaults.clients = this.selectedAnnouncementClients;
    this.dialogRef.close(new Announcement(this.defaults));
  }

  updateAnnouncement() {
    Object.assign(this.defaults, this.form.value);
    this.defaults.validTill = this.datePipe.transform(this.defaults.validTill, 'yyyy-MM-dd');
    for (let i = 0; i < this.selectedClients.length; i++) {
      if (this.selectedClients[i] != 0) {
        this.selectedAnnouncementClients.push({
          announcementId: this.defaults.id,
          clientId: this.selectedClients[i]
        });
      }
    }
    this.defaults.clients = this.selectedAnnouncementClients;
    this.dialogRef.close(new Announcement(this.defaults));
  }

  getClients() {
    this.clients = [];
    this.announcementService.getClients().subscribe((clients: Client[]) => {
      if (clients) {
        clients.forEach(client => {
          this.clients.push({ label: client.clientName, value: client.id } as ListItem);
        });
      }
    });
  }

  onChangeClients(value) {
    if (this.selectedClients.indexOf(value[0]) < 0)
      this.selectedClients.push(value[0]);
  }

  toggleAllSelection() {
    if (this.allSelected.selected) {
      this.form.controls.clientSelect
        .patchValue([...this.clients.map(item => item.value), 0]);
    } else {
      this.form.controls.clientSelect.patchValue([]);
    }
  }

  togglePerOne(all) {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }
    if (this.form.controls.clientSelect.value.length == this.clients.length)
      this.allSelected.select();
  }

  validateDates() {
    this.validTill = this.datePipe.transform(this.form.get('validTill').value, "MM-dd-yyyy");

    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2); ​  // adjust 0 before single digit date.
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2); // current month.
    let year = date_ob.getFullYear(); ​ // current year.
    let today = month + '-' + date + '-' + year; // get date in MM-DD-YYYY format.

    this.isValidDate = true;
    let startYear = new Date(this.validTill).getFullYear();
    var endYear = new Date(today).getFullYear();
    if ((startYear != 1970) && (endYear != 1970)) {
      if (startYear < endYear) {
        return this.isValidDate = false;
      }
      // else if(startYear > endYear)
      // {
      //   this.isValidDate = false;
      //   return this.isValidDate;
      // }
      else if ((this.validTill != null) || (this.validTill != '')) {
        if ((this.validTill) < (today)) {
          this.isValidDate = false;
        }
        return this.isValidDate;
      }
    }
    else {
      return this.isValidDate;
    }
  }

  close() {
    this.dialogRef.close();
  }

  closeDialog() {
    this.isCancel = true;
  }

}

import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Client } from './client.model';
import { ClientService} from '../client.service';

@Component({
  selector: 'fury-client-create-update',
  templateUrl: './client-create-update.component.html',

  styleUrls: ['./client-create-update.component.scss']
})
export class ClientCreateUpdateComponent implements OnInit {

  static clientId = 100;

  form: FormGroup;
  mode: 'create' | 'update' = 'create';

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: any,
              private dialogRef: MatDialogRef<ClientCreateUpdateComponent>,
              private fb: FormBuilder,
              private clientService: ClientService) {
  }

  ngOnInit() {
    if (this.defaults) {
      this.mode = 'update';
    } else {
      this.defaults = {} as Client;
    }

    this.form = this.fb.group({
      clientId: [ClientCreateUpdateComponent.clientId++],
      clientName: [this.defaults.clientName || '',],
      mobile: [this.defaults.mobile || ''],
    });
  }

  save() {
    if (this.mode === 'create') {
      this.createclient();
    } else if (this.mode === 'update') {
      this.updateclient();
    }
  }

  createclient() {
    const client = this.form.value;
    this.dialogRef.close(client);
  }

  updateclient() {
    const client = this.form.value;
    client.id = this.defaults.id;

    this.dialogRef.close(client);
  }

  isCreateMode() {
    return this.mode === 'create';
  }

  isUpdateMode() {
    return this.mode === 'update';
  }
}

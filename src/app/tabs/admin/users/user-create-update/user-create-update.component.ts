import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Tenant } from './user.model';

@Component({
  selector: 'user-create-update',
  templateUrl: './user-create-update.component.html',
  styleUrls: ['./user-create-update.component.scss']
})
export class UserCreateUpdateComponent implements OnInit {

  static id = 100;

  form: FormGroup;
  mode: 'create' | 'update' = 'create';

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: any,
              private dialogRef: MatDialogRef<UserCreateUpdateComponent>,
              private fb: FormBuilder) {
  }

  ngOnInit() {
    if (this.defaults) {
      this.mode = 'update';
    } else {
      this.defaults = {} as Tenant;
    }

    this.form = this.fb.group({
      id: [UserCreateUpdateComponent.id++],
      firstName: [this.defaults.firstName || '',],
      lastName: [this.defaults.lastName || ''],
      street: this.defaults.street || '',
      city: this.defaults.city || '',
      zipcode: this.defaults.zipcode || '',
      phoneNumber: this.defaults.phoneNumber || '',
    });
  }

  save() {
    if (this.mode === 'create') {
      this.createTenant();
    } else if (this.mode === 'update') {
      this.updateTenant();
    }
  }

  createTenant() {
    const tenant = this.form.value;
    this.dialogRef.close(tenant);
  }

  updateTenant() {
    const tenant = this.form.value;
    tenant.id = this.defaults.id;

    this.dialogRef.close(tenant);
  }

  isCreateMode() {
    return this.mode === 'create';
  }

  isUpdateMode() {
    return this.mode === 'update';
  }
}

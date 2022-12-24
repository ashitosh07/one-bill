import { Component, Inject, OnInit, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Observable, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { FormValidators } from '../../../shared/methods/form-validators';
import { Metadata } from 'src/app/tabs/shared/models/metadata.model';
import { MetadataBillSettings } from '../../../shared/models/metadata.bill-settings.model'
import { MetadataService } from 'src/app/tabs/shared/services/metadata.service';
import { MasterDetails } from './masterdetails.model';
import { defaults } from 'chart.js';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';
import { MetadataMode } from 'src/app/tabs/shared/models/metadata.mode.model';
import { MetadataParentModes } from '../../../shared/models/metadata.parent-modes.model';
import { MasterDetailsService } from '../../../shared/services/masterdetails.service';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { CancelConfirmationDialogComponent } from 'src/app/tabs/shared/components/cancel-confirmation-dialog/cancel-confirmation-dialog.component';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';

@Component({
  selector: 'fury-masterdetails-create-update',
  templateUrl: './masterdetails-create-update.component.html',
  styleUrls: ['./masterdetails-create-update.component.scss']
})
export class MasterdetailsCreateUpdateComponent implements OnInit {
  static id = 100;

  form: FormGroup;

  mode: 'create' | 'update' = 'create';
  isCancel: boolean = false;
  metadata: Metadata;
  metadataMode: Master[];
  metadataParentModes: MetadataParentModes[];
  filteredMode: Master[];
  filteredParentModes: MetadataParentModes[];

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: MasterDetails,
    private dialogRef: MatDialogRef<MasterdetailsCreateUpdateComponent>,
    private fb: FormBuilder, private metadataService: MetadataService,
    private masterDetailsService: MasterDetailsService,
    private fv: FormValidators, private dialog: MatDialog) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    if (this.defaults) {
      this.mode = 'update';
    }
    else {
      this.defaults = new MasterDetails({});
    }

    // this.metadata = this.metadataService.getMetadata();
    // this.metadataMode = this.metadata.modes;
    // this.filteredMode = this.metadata.modes;

    this.masterDetailsService.getModes().subscribe((modes: Master[]) => {
      this.filteredMode = modes;
      this.metadataMode = modes;
    });

    // if(this.metadataParentModes && this.metadataParentModes.length > 0)
    // {
    //   this.form = this.fb.group({
    //     id: [this.defaults.id || MasterdetailsCreateUpdateComponent.id++],      
    //     mode: [this.defaults.mode || '', Validators.required],
    //     modeName: [this.defaults.modeName || '', Validators.required],
    //     sequence: [this.defaults.sequence || ''],
    //     parentId: [this.defaults.parentId || '', Validators.required],
    //     parentName: [this.defaults.parentName || '', Validators.required],
    //     description: [this.defaults.description || '', Validators.required]
    //   });
    // }
    // else
    // {
    this.form = this.fb.group({
      id: [this.defaults.id || MasterdetailsCreateUpdateComponent.id++],
      mode: [this.defaults.mode || '', Validators.required],
      modeName: [this.defaults.modeName || '', Validators.required],
      sequence: [this.defaults.sequence || ''],
      parentId: [this.defaults.parentId || ''],
      parentName: [this.defaults.parentName || ''],
      description: [this.defaults.description || '', Validators.required]
    });
    //}

    if (this.mode === 'update' && this.defaults.parentId == 0) {
      this.form.controls.parentName.disable();
    } else if (this.mode === 'update' && this.defaults.parentId) {
      this.onModeSelect(this.defaults.mode);
    }

    // if(this.mode == 'update')
    //     this.form.controls.parentId.setValue(this.defaults.parentId);
    // if(this.metadataParentModes)
    // {
    //   this.defaults.parentName = this.metadataParentModes[0].description;

    //   if(this.mode == 'update')
    //   {
    //     this.form.controls.parentId.setValue(this.metadataParentModes[0].id);
    //   }
    // }    
    this.form.controls.modeName.valueChanges.subscribe(newMode => {
      this.filteredMode = this.filterMode(newMode);
    });

    this.form.controls.parentName.valueChanges.subscribe(newParentMode => {
      this.filteredParentModes = this.filterParentMode(newParentMode);
    });
  }

  filterMode(name: string) {
    return this.metadataMode.filter(mode =>
      mode.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  filterParentMode(name: string) {
    return this.metadataParentModes.filter(parentMode =>
      parentMode.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
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
    if (this.mode === 'create') {
      this.createMasterDetails();
    } else if (this.mode === 'update') {
      this.updateMasterDetails();
    }
  }

  createMasterDetails() {
    Object.assign(this.defaults, this.form.value);
    this.dialogRef.close(new MasterDetails(this.defaults));
  }

  updateMasterDetails() {
    Object.assign(this.defaults, this.form.value);
    this.dialogRef.close(new MasterDetails(this.defaults));
  }

  isCreateMode() {
    return this.mode === 'create';
  }

  isUpdateMode() {
    return this.mode === 'update';
  }

  selectMode(event) {
    this.form.controls.parentName.setValue('');
    this.form.controls.parentId.setValue('')
    this.metadataMode.forEach(mode => {
      if (event.option.value == mode.description) {
        this.form.controls.mode.setValue(mode.id);
        this.onModeSelect(mode.id);
      }
    })
  }

  selectParentMode(event) {
    this.metadataParentModes.forEach(parent => {
      if (event.option.value == parent.description) {
        this.form.controls.parentName.setValue(parent.description);
        this.form.controls.parentId.setValue(parent.id)
      }
    })
  }

  onModeSelect(mode) {
    this.masterDetailsService.getParentModes(mode).subscribe((parentModes: MetadataParentModes[]) => {
      this.filteredParentModes = parentModes;
      this.metadataParentModes = parentModes;
    });
  }

  close() {
    this.dialogRef.close();
  }

  closeDialog() {
    this.isCancel = true;
  }

}

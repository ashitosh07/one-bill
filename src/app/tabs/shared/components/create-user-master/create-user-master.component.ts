import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MasterDetails } from 'src/app/tabs/master/create-masterdetails/masterdetails-create-update/masterdetails.model';
import { MetadataParentModes } from '../../models/metadata.parent-modes.model';
import { MasterDetailsService } from '../../services/masterdetails.service';
import { CancelConfirmationDialogComponent } from 'src/app/tabs/shared/components/cancel-confirmation-dialog/cancel-confirmation-dialog.component';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';


@Component({
  selector: 'fury-create-user-master',
  templateUrl: './create-user-master.component.html',
  styleUrls: ['./create-user-master.component.scss']
})
export class CreateUserMasterComponent implements OnInit {

  form: FormGroup;
  metadataParentModes: MetadataParentModes[];
  filteredParentModes: MetadataParentModes[];
  defaults: MasterDetails;
  isCancel: boolean = false;
  parentExists: boolean = false;
  modeId: number = 0;
  parentId: number = 0;
  parentName: string = '';
  parentIdFilter: number = 0;
  
  constructor(private dialogRef: MatDialogRef<CreateUserMasterComponent>,
              private masterDetailsService: MasterDetailsService,
              private snackbar: MatSnackBar,private dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) private modes: number[],
              private fb: FormBuilder) { 
    dialogRef.disableClose = true;
  }  

  ngOnInit(): void {

    this.parentId = this.modes[0];
    this.modeId = this.modes[1];
    this.parentIdFilter = this.modes[2] == undefined ? 0 : this.modes[2];
    
    this.defaults = new MasterDetails({});       

    this.form = this.fb.group({
      parentId: [this.defaults.parentId || ''],
      parentName: [this.defaults.parentName || ''],
      description: [this.defaults.description || '', Validators.required]
    });

    if(this.modeId)
    {      
      this.parentExists = false;
      this.form.controls["parentName"].clearValidators();
      this.form.controls["parentName"].markAsUntouched();
      this.masterDetailsService.getParentModes(this.modeId).subscribe((parentModes: MetadataParentModes[]) => {
        if(parentModes) 
        {
          if(this.parentIdFilter > 0)      
          {
            parentModes = parentModes.filter(item => item.id == this.parentIdFilter);
          }
          this.filteredParentModes = parentModes;
          this.metadataParentModes = parentModes;
          let item = parentModes.filter(item => item.id == this.parentId);
          if(item && item.length > 0)
          {
            this.parentName = item[0].description;
            this.form.controls.parentId.setValue(item[0].id);
          }
          if(parentModes && parentModes.length > 0)
          {
            this.parentExists = true;
            this.form.controls["parentName"].setValidators([Validators.required]);
          }
        }                  
      });
      this.form.controls["parentName"].updateValueAndValidity();
    } 

    this.form.controls.parentName.valueChanges.subscribe(newParentMode => {
      this.filteredParentModes = this.filterParentMode(newParentMode);
    });
  }

  filterParentMode(name: string) {
    
    return this.metadataParentModes.filter(parentMode =>
      parentMode.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  save()
  {
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

    Object.assign(this.defaults, this.form.value);
    this.defaults.mode = this.modeId;
    if(this.form.controls.parentId.value == '')
    {
      this.defaults.parentId = 0;
    }


    this.masterDetailsService.createMasterDetails(this.defaults).subscribe((masterDetailsObj: MasterDetails) => {
      if(masterDetailsObj)
      {
        this.notificationMessage('Master Details Created Successfully.', 'green-snackbar');
        this.dialogRef.close('Success');
      }
      else {
        this.notificationMessage('Master Details Creation Failed.', 'red-snackbar');
      }     
      // ,error: (err: HttpErrorResponse) => {
      //   this.notificationMessage('Master Details Creation Failed.', 'red-snackbar');
      // }
  });
  }

  notificationMessage(message: string, cssClass: string) 
  {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  selectParentMode(event) {
    this.metadataParentModes.forEach(parent => {
      if (event.option.value == parent.description) {
        this.form.controls.parentName.setValue(parent.description);
        this.form.controls.parentId.setValue(parent.id)
      }
    })
  }

  close() {
    this.dialogRef.close();
  }

  closeDialog() {
    this.isCancel = true;
  }
  
}

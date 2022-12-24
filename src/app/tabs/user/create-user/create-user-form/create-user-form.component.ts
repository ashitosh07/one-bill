import { Component, OnInit, Input, EventEmitter, Output, ChangeDetectorRef, ElementRef, ViewChild, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, ReplaySubject } from 'rxjs';
import { scaleInAnimation } from 'src/@fury/animations/scale-in.animation';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { FileService } from 'src/app/tabs/shared/services/file.service';
import { environment } from 'src/environments/environment';
import { UserDetails } from 'src/app/tabs/shared/models/user-details';
import { ClientService } from '../../../shared/services/client.service';
import { CreateUserComponent } from '../create-user.component';
import { Role } from 'src/app/tabs/shared/models/role.model';
import { Client } from 'src/app/pages/client/client-create-update/client.model';
import { UserClients } from 'src/app/tabs/shared/models/user-clients.model';
import { Metadata } from 'src/app/tabs/shared/models/metadata.model';
import { MetadataService } from 'src/app/tabs/shared/services/metadata.service';
import forEach from 'lodash-es/forEach';
import { FormValidators } from 'src/app/tabs/shared/methods/form-validators';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { MatOption } from '@angular/material/core';
import { MasterService } from 'src/app/tabs/shared/services/master.service';
import { UserActions } from 'src/app/tabs/shared/models/user-actions.model';
import { AuthenticationService } from 'src/app/tabs/shared/services/authentication.service';
import { CreateUserMasterComponent } from '../../../shared/components/create-user-master/create-user-master.component';
import { CancelConfirmationDialogComponent } from 'src/app/tabs/shared/components/cancel-confirmation-dialog/cancel-confirmation-dialog.component';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'app-create-user-form',
  templateUrl: './create-user-form.component.html',
  styleUrls: ['./create-user-form.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation, scaleInAnimation]
})
export class CreateUserFormComponent implements OnInit {

  @ViewChild('fileInput') fileInput: ElementRef
  @ViewChild('allSelected') private allSelected: MatOption;
  @ViewChild('allActionsSelected') private allActionsSelected: MatOption;
  static id: '1';
  user_create: FormGroup;
  selectedUserClients: any = [];
  selectedUserActions: any = [];
  fileSize = 0;

  mode: 'create' | 'update' = 'create';

  private _gap = 16;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`;
  col4 = `1 1 calc(5% - ${this._gap / 1}px)`;

  inputType = 'password';
  visible = false;
  metadata: Metadata;
  roles: Master[];
  clients: ListItem[] = [];
  actions: ListItem[] = [];
  designations: Master[];
  filteredRoles: Master[];
  filteredDesignations: Master[];
  isCancel: boolean = false;

  @Output() isDisable = new EventEmitter<boolean>();

  userClients: UserClients;
  userActions: UserActions;
  client_select = new FormControl();
  roleId: number;
  selectedClients = [];
  selectedActions = [];
  image: any
  response: any
  baseUrl = '';

  isUploadSuccess: boolean = true;
  errorMessage: string = '';

  subject$: ReplaySubject<UserDetails[]> = new ReplaySubject<UserDetails[]>(1);
  data$: Observable<UserDetails[]> = this.subject$.asObservable();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: UserDetails,
    private dialogRef: MatDialogRef<CreateUserFormComponent>,
    private dialog: MatDialog,
    private fb: FormBuilder, private ClientService: ClientService,
    private cd: ChangeDetectorRef, private metadataService: MetadataService,
    private snackbar: MatSnackBar, private fv: FormValidators,
    private fileService: FileService, private masterService: MasterService,
    private authenticationService: AuthenticationService,
    private envService: EnvService) {
    dialogRef.disableClose = true;
    this.fileSize = Math.floor(envService.MaxBytes / 1000000);
    this.baseUrl = envService.backendForFiles;
  }

  ngOnInit() {
    if (this.defaults) {
      this.mode = 'update';
      this.image = this.baseUrl + '/uploads/' + this.defaults.image;
      this.response = this.defaults.image;
      for (let i = 0; i < this.defaults.userClients.length; i++) {
        this.selectedClients[i] = this.defaults.userClients[i].clientId;
      }
      for (let i = 0; i < this.defaults.userActions.length; i++) {
        this.selectedActions[i] = this.defaults.userActions[i].actionId;
      }
    }
    else {
      this.defaults = new UserDetails({});
    }
    this.userClients = this.defaults.userClients[0] || new UserClients({});
    this.userActions = this.defaults.userActions[0] || new UserActions({});

    // this.metadataService.invokeMetadata();
    // this.roles = this.metadataService.getMetadata().roles;
    // this.designations = this.metadataService.getMetadata().designations;
    // this.filteredDesignations = this.metadataService.getMetadata().designations;

    this.authenticationService.getRoles().subscribe((data: Master[]) => {
      this.roles = data
      if ((this.roles != null) || (this.roles != undefined)) {
        let index = this.roles.findIndex((role) => role.description === 'External');
        if (index >= 0)
          this.roles.splice(index, 1);
        //this.filteredRoles = this.roles;
      }
    })

    this.getDesignations();
    this.getClients();
    this.getActions();
    //Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*#?&].{8,}')
    ///^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/
    this.user_create = this.fb.group({
      id: [this.defaults.id || CreateUserFormComponent.id],
      username: [this.defaults.username || '', this.fv.requiredAlphanumericNoSpaces],
      password: [this.defaults.password, Validators.compose([
        Validators.pattern("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&].{8,}")
      ])
      ],
      email: [this.defaults.email || '', this.fv.emailValidators],
      client_select: [''],
      role: [this.defaults.role || '', Validators.required],
      roleId: [this.defaults.roleId || '', Validators.required],
      designation: [this.defaults.designation || '', Validators.required],
      image: [this.baseUrl + '/uploads/' + this.defaults.image || ''],
      userClients: [this.defaults.userClients],
      userActions: [this.defaults.userActions],
      action_select: ['']
    });
    if (this.defaults.image == '') {
      this.image = 'assets/img/avatars/two.png';
    }
    if (this.mode == 'update') {
      this.user_create.controls.password.disable();
      this.user_create.controls.username.disable();
      this.user_create.controls.email.disable();

    }
    this.user_create.controls.role.valueChanges.subscribe(newRole => {
      this.filteredRoles = this.filterRoles(newRole);
    });
    this.user_create.controls.designation.valueChanges.subscribe(newDesignation => {
      this.filteredDesignations = this.filterDesignations(newDesignation);
    });
  }

  getDesignations() {
    this.masterService.getUserMasterdata(12, 0).subscribe((data: Master[]) => {
      this.designations = data;
      this.filteredDesignations = data;
    });
  }

  getRoles() {
    this.filteredRoles = this.filterRoles('');
  }

  getFilteredDesignations() {
    this.filteredDesignations = this.filterDesignations('');
  }

  filterRoles(name: string) {
    if ((this.user_create.controls.role.pristine) && (this.mode != 'create')) {
      return [];
    }
    else {
      return this.roles.filter(role =>
        role.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
    }
  }

  filterDesignations(name: string) {
    if ((this.user_create.controls.designation.pristine) && (this.mode != 'create')) {
      return [];
    }
    else {
      return this.designations.filter(designation =>
        designation.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
    }
  }

  removeExternalRole(element, index, array) {
    return (element != 'External');
  }

  save() {
    if (this.mode === 'create') {
      this.createUserDetails();
    }
    else if (this.mode === 'update') {
      this.updateUserDetails();
    }
  }

  isCreateMode() {
    return this.mode === 'create';
  }

  isUpdateMode() {
    return this.mode === 'update';
  }

  createUserDetails() {
    Object.assign(this.defaults, this.user_create.value);

    for (let i = 0; i < this.selectedClients.length; i++) {
      if (this.selectedClients[i] != 0) {
        this.selectedUserClients.push({
          userId: this.defaults.id,
          clientId: this.selectedClients[i]
        });
      }
    }
    this.defaults.userClients = this.selectedUserClients;
    for (let i = 0; i < this.selectedActions.length; i++) {
      if (this.selectedActions[i] != 0) {
        this.selectedUserActions.push({
          userId: this.defaults.id,
          actionId: this.selectedActions[i]
        });
      }
    }
    this.defaults.userActions = this.selectedUserActions;
    //correction for image url,  replaced this.image to this.response
    this.defaults.image = this.response;
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
    }
    else if (this.user_create.valid) {
      this.dialogRef.close(new UserDetails(this.defaults));
    }
  }

  updateUserDetails() {
    Object.assign(this.defaults, this.user_create.value);
    for (let i = 0; i < this.selectedClients.length; i++) {
      if (this.selectedClients[i] != 0) {
        this.selectedUserClients.push({
          userId: this.defaults.id,
          clientId: this.selectedClients[i]
        });
      }
    }
    this.defaults.userClients = this.selectedUserClients;
    for (let i = 0; i < this.selectedActions.length; i++) {
      if (this.selectedActions[i] != 0) {
        this.selectedUserActions.push({
          userId: this.defaults.id,
          actionId: this.selectedActions[i]
        });
      }
    }
    this.defaults.userActions = this.selectedUserActions;
    //correction for image url, replaced this.image to this.response
    this.defaults.image = this.response;
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
    }
    else if (this.user_create.valid) {
      this.dialogRef.close(new UserDetails(this.defaults));
    }
  }

  onChangeRoles(event) {
    this.roles.forEach(role => {
      if (event.option.value == role.description) {
        this.user_create.controls.roleId.setValue(role.id);
      }
    })
  }

  onChangeDesignation(event) {
    this.designations.forEach(designation => {
      if (event.option.value == designation.description) {
        this.user_create.controls.designation.setValue(designation.description);
      }
    })
  }


  getClients() {
    this.clients = [];
    this.ClientService.getClients().subscribe((clients: Client[]) => {
      if (clients) {
        clients.forEach(client => {
          this.clients.push({ label: client.clientName, value: client.id } as ListItem);
        });
      }
    });
  }

  getActions() {
    this.actions = [];
    this.masterService.getSystemMasterdata(63, 0).subscribe((actions: any[]) => {
      if (actions) {
        actions.forEach(action => {
          this.actions.push({ label: action.description, value: action.id } as ListItem);
        });
      }
    });
  }

  resetPassword() {
    this.user_create.controls.password.enabled;
  }

  onChangeClients(value) {
    if (this.selectedClients.indexOf(value[0]) < 0)
      this.selectedClients.push(value[0]);
  }

  uploadPhoto(fileInputEvent: any) {
    this.image = 'assets/img/avatars/two.png';
    this.errorMessage = '';

    this.fileService.upload(fileInputEvent.target.files[0], "image")
      .subscribe({
        next: (fileName) => {
          this.response = fileName;
          this.image = this.baseUrl + "/uploads/" + fileName;
          this.isUploadSuccess = true;
        },
        error: (err) => {
          this.isUploadSuccess = false;
          this.errorMessage = err["error"].message == undefined ? err["error"].Message : err["error"].message;
          if (this.errorMessage == 'Request body too large.') {
            this.errorMessage = "Max. allowed File size is " + this.fileSize + "MB. Please upload file with smaller size.";
          }
        }
      });
  }

  toggleAllSelection() {
    if (this.allSelected.selected) {
      this.user_create.controls.client_select
        .patchValue([...this.clients.map(item => item.value), 0]);
    } else {
      this.user_create.controls.client_select.patchValue([]);
    }
  }

  toggleAllActionSelection() {
    if (this.allActionsSelected.selected) {
      this.user_create.controls.action_select
        .patchValue([...this.actions.map(item => item.value), 0]);
    } else {
      this.user_create.controls.action_select.patchValue([]);
    }
  }

  tosslePerOne(all) {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }
    if (this.user_create.controls.client_select.value.length == this.clients.length)
      this.allSelected.select();
  }

  tossleActionsPerOne(all) {
    if (this.allActionsSelected.selected) {
      this.allActionsSelected.deselect();
      return false;
    }
    if (this.user_create.controls.action_select.value.length == this.actions.length)
      this.allActionsSelected.select();
  }

  toggleVisibility() {
    if (this.visible) {
      this.inputType = 'password';
      this.visible = false;
      this.cd.markForCheck();
    } else {
      this.inputType = 'text';
      this.visible = true;
      this.cd.markForCheck();
    }
  }

  close() {
    this.dialogRef.close();
  }

  closeDialog() {
    this.isCancel = true;
  }

  createDesignation() {
    let modes = [0, 12];
    this.dialog.open(CreateUserMasterComponent, { data: modes }).afterClosed().subscribe((message: any) => {
      if (message && message == 'Success') {
        this.getDesignations();
      }
    });
  }
}

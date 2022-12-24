import { Component, Inject, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Observable, ReplaySubject } from 'rxjs';
import { MetadataService } from 'src/app/tabs/shared/services/metadata.service';
import { defaults } from 'chart.js';
import { DatePipe } from '@angular/common';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';
import { UnitMaster } from '../unit-master-create-update/unit-master.model';
import { MetadataProjects } from '../../../shared/models/metadata.projects.model';
import { MetadataBuildings } from '../../../shared/models/metadata.buildings.model';
import { MetadataFloors } from '../../../shared/models/metadata.floors.model';
import { MetadataBlocks } from '../../../shared/models/metadata.blocks.model';
import { MetadataUnitTypes } from '../../../shared/models/metadata.unit-type.model';
import { MetadataUtilityType } from '../../../shared/models/metadata.utility-type.model';
import { MetadataMeter } from '../../../shared/models/metadata.meter.model';
import { UnitMasterService } from '../../../shared/services/unit-master.service';
import { UnitUtility } from '../../../shared/models/utilities.model';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormValidators } from '../../../shared/methods/form-validators';
import { filter } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Metadata } from '../../../shared/models/metadata.model';
import { CurrencyPipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { MasterService } from 'src/app/tabs/shared/services/master.service';
import { UserConfirmationPopupComponent } from '../../../shared/components/user-confirmation-popup/user-confirmation-popup.component';
import { CancelConfirmationDialogComponent } from 'src/app/tabs/shared/components/cancel-confirmation-dialog/cancel-confirmation-dialog.component';
import { CookieService } from 'ngx-cookie-service';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';
import { getClientDataFormat } from 'src/app/tabs/shared/utilities/utility';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-unit-master-create-update',
  templateUrl: './unit-master-create-update.component.html',
  styleUrls: ['./unit-master-create-update.component.scss']
})
export class UnitMasterCreateUpdateComponent implements OnInit {
  static id = 0;
  clientId: number;
  currencyFormat = '';
  roundOffFormat = '';

  utilities: UnitUtility[];
  utility: UnitUtility;
  metadata: any[];
  subject$: ReplaySubject<UnitUtility[]> = new ReplaySubject<UnitUtility[]>(1);
  data$: Observable<UnitUtility[]> = this.subject$.asObservable();

  form: FormGroup;
  mode: 'create' | 'update' = 'create';

  isCancel: boolean = false;
  metadatas: Metadata;
  metadataProjects: MetadataProjects[];
  metadataBuildings: MetadataBuildings[];
  metadataFloors: MetadataFloors[];
  metadataBlocks: MetadataBlocks[];
  metadataUnitTypes: Master[];
  metadataUtilityTypes: MetadataUtilityType[];
  metadataMeterTypes: MetadataMeter[];
  filteredProjects: MetadataProjects[];
  filteredBuildings: MetadataBuildings[];
  filteredFloors: MetadataFloors[];
  filteredBlocks: MetadataBlocks[];
  filteredUnitTypes: Master[];
  filteredUtilityTypes: MetadataUtilityType[];
  filteredMeterTypes: MetadataMeter[];

  @Input()
  displayedColumns: ListColumn[] = [
    { name: 'Utility Type Id', property: 'id', visible: false, isModelProperty: true },
    { name: 'Utility Type', property: 'utilityType', visible: true, isModelProperty: true },
    { name: 'Meter Id', property: 'meterId', visible: false, isModelProperty: true },
    { name: 'Meter Name', property: 'meterType', visible: true, isModelProperty: true },
    //{ name: 'Meter Reading', property: 'meterReading', visible: true, isModelProperty: true },
    //{ name: 'Security Deposit', property: 'securityDepositLocal', visible: true, isModelProperty: true },
    { name: 'Modify', property: 'actions', visible: true }
  ] as ListColumn[];

  pageSize = 8;
  dataSource: MatTableDataSource<UnitUtility> | null;

  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: UnitMaster,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private fv: FormValidators,
    private dialog: MatDialog,
    private masterService: MasterService,
    private currency: CurrencyPipe,
    private metadataService: MetadataService,
    private unitMasterService: UnitMasterService,
    private dialogRef: MatDialogRef<UnitMasterCreateUpdateComponent>,
    private cookieService: CookieService,
    private envService: EnvService) {
    dialogRef.disableClose = true;
    this.currencyFormat = getClientDataFormat('Currency') ?? envService.currencyFormat;
    this.roundOffFormat = getClientDataFormat('RoundOff') ?? envService.roundOffFormat;
  }


  get visibleColumns() {
    return this.displayedColumns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit() {
    if (this.defaults) {
      this.mode = 'update';
      this.utilities = this.defaults.unitUtilityList;
    }
    else {
      this.defaults = new UnitMaster({});
    }

    this.clientId = parseInt(this.cookieService.get('globalClientId'));

    this.utilities = (this.defaults.unitUtilityList || []).map(utility => new UnitUtility(utility));
    this.utility = this.defaults.unitUtilityList[0] || new UnitUtility({});

    // this.unitMasterService.getClientProjects(this.clientId).subscribe((projects: MetadataProjects[]) => {
    //   this.metadataProjects = projects.map(project => new MetadataProjects(project));
    //   this.filteredProjects = projects;
    // });

    // if(this.defaults.projectId != 0)
    // {
    //   this.onProjectSelect(this.defaults.projectId);
    // }

    // if(this.defaults.blockId != 0)
    // {
    //   this.onBlockSelect(this.defaults.blockId);
    // }

    // if(this.defaults.buildingId != 0)
    // {
    //   this.onBuildingSelect(this.defaults.buildingId);
    // }

    // this.metadatas = this.metadataService.getMetadata();    
    // this.metadataUnitTypes = this.metadatas.unitTypes;   
    // this.filteredUnitTypes = this.metadatas.unitTypes;

    this.masterService.getUserMasterdata(10, 0).subscribe((data: Master[]) => {
      this.metadataUnitTypes = data;
      this.filteredUnitTypes = data;
    });

    this.unitMasterService.getUtilities(this.clientId).subscribe((utilities: MetadataUtilityType[]) => {
      this.metadataUtilityTypes = utilities.map(utility => new MetadataUtilityType(utility));
      this.filteredUtilityTypes = utilities
    });
    this.filteredUtilityTypes = this.metadataUtilityTypes;

    // this.metadataUtilityTypes =  this.metadatas.utilityTypes;
    // this.filteredUtilityTypes = this.metadatas.utilityTypes;
    //this.metadataMeterTypes = this.metadatas.availableDevices;    

    this.form = this.fb.group({
      id: [this.defaults.id || UnitMasterCreateUpdateComponent.id++],
      aliasName: [this.defaults.aliasName || '', Validators.required],
      // projectId: [this.defaults.projectId || '', Validators.required],
      // projectName: [this.defaults.projectName || '', Validators.required],
      // blockId: [this.defaults.blockId || '', Validators.required],
      // blockName: [this.defaults.blockName || '',Validators.required],
      // buildingId: [this.defaults.buildingId || '', Validators.required],
      // buildingName: [this.defaults.buildingName || '', Validators.required],
      // floorId: [this.defaults.floorId || '', Validators.required],
      // floorNumber: [this.defaults.floorNumber || '', Validators.required],
      unitTypeId: [this.defaults.unitTypeId || '', Validators.required],
      unitType: [this.defaults.unitType || '', Validators.required],
      areaSqFt: [this.defaults.areaSqFt || '', Validators.required],
      capacityTon: [this.defaults.capacityTon || '', Validators.required],
      accountNumber: [this.defaults.accountNumber || ''],
      unitUtilityList: this.fb.group({
        id: [this.utility && this.utility.id || 0],
        utilityTypeId: [this.utility && this.utility.utilityTypeId || 0],
        utilityType: [this.utility && this.utility.utilityType || ''],
        meterId: [this.utility && this.utility.meterId || 0],
        meterType: [this.utility && this.utility.meterType || ''],
        meterReading: [this.utility && this.utility.meterReading || ''],
        securityDeposit: [this.utility && this.utility.securityDeposit || '']
      })
    });

    if (this.mode == 'update') {
      this.form.controls.unitUtilityList.reset();
      this.form.controls.aliasName.disable();
    }

    this.bindUtilities();

    // this.form.controls.projectName.valueChanges.subscribe(newProject => {
    //   this.filteredProjects = this.filterProject(newProject);
    // });
    // this.form.controls.blockName.valueChanges.subscribe(newBlock => {
    //   this.filteredBlocks = this.filterBlock(newBlock);
    // });
    // this.form.controls.buildingName.valueChanges.subscribe(newBuilding => {
    //   this.filteredBuildings = this.filterBuilding(newBuilding);
    // });
    // this.form.controls.floorNumber.valueChanges.subscribe(newFloor => {
    //   this.filteredFloors = this.filterFloor(newFloor);
    // });
    this.form.controls.unitType.valueChanges.subscribe(newUnitType => {
      this.filteredUnitTypes = this.filterUnitTypes(newUnitType);
    });
    this.form.controls.unitUtilityList.get('utilityType').valueChanges.subscribe(newUtilityType => {
      this.filteredUtilityTypes = this.filterUtilityTypes(newUtilityType);
    });
    this.form.controls.unitUtilityList.get('meterType').valueChanges.subscribe(newMeterType => {
      this.filteredMeterTypes = this.filterMeterType(newMeterType);
    });

  }

  // filterProject(name: string) {
  //   return this.metadataProjects.filter(project =>
  //     project.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  // }

  // filterBlock(name: string) {
  //   return this.metadataBlocks.filter(block =>
  //     block.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  // }

  // filterBuilding(name: string) {
  //   return this.metadataBuildings.filter(building =>
  //     building.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  // }

  // filterFloor(name: string) {
  //   return this.metadataFloors.filter(floor =>
  //     floor.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  // }

  filterUnitTypes(name: string) {
    return this.metadataUnitTypes.filter(unitTypes =>
      unitTypes.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  filterUtilityTypes(name: string) {
    return this.metadataUtilityTypes.filter(utilityTypes =>
      utilityTypes.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  filterMeterType(name: string) {
    return this.metadataMeterTypes.filter(meterTypes =>
      meterTypes.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  save() {
    this.defaults.unitUtilityList = this.utilities;
    if (this.isCancel) {
      const confirmMessage: ListItem = {
        label: "Are you sure you want to Cancel?",
        selected: false
      };
      this.dialog.open(CancelConfirmationDialogComponent, { data: confirmMessage }).afterClosed().subscribe((message: any) => {
        if (message) {
          this.isCancel = false;
          this.dialogRef.close();
        }
      });
      return;
    }
    if (this.form.valid) {
      if (this.mode === 'create') {
        this.createUnit();
      }
      else if (this.mode === 'update') {
        this.updateUnit();
      }
    }
  }

  createUnit() {
    Object.assign(this.defaults, this.form.value);
    this.defaults.unitNumber = this.form.controls.aliasName.value;
    this.defaults.clientId = this.clientId;
    this.defaults.unitUtilityList = this.utilities;
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
    else if (this.form.valid) {
      this.dialogRef.close(new UnitMaster(this.defaults));
    }
  }

  updateUnit() {
    Object.assign(this.defaults, this.form.value);
    this.defaults.unitNumber = this.form.controls.aliasName.value;
    this.defaults.clientId = this.clientId;
    this.defaults.unitUtilityList = this.utilities;
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
    else if (this.form.valid) {
      this.dialogRef.close(new UnitMaster(this.defaults));
    }
  }

  isCreateMode() {
    return this.mode === 'create';
  }

  isUpdateMode() {
    return this.mode === 'update';
  }

  saveUtility() {
    if (this.form.controls.unitUtilityList.valid) {
      var utilityTypeId = this.form.controls.unitUtilityList.get('utilityTypeId').value;
      if (this.utilities.findIndex((existingUtility) => existingUtility.id === utilityTypeId)) {
        this.utilities.push({
          id: 0,
          unitId: this.defaults.id,
          utilityTypeId: this.form.controls.unitUtilityList.get('utilityTypeId').value,
          utilityType: this.form.controls.unitUtilityList.get('utilityType').value,
          meterId: this.form.controls.unitUtilityList.get('meterId').value,
          meterType: this.form.controls.unitUtilityList.get('meterType').value,
          meterReading: this.form.controls.unitUtilityList.get('meterReading').value,
          securityDeposit: this.form.controls.unitUtilityList.get('securityDeposit').value === '' ?
            0 : this.form.controls.unitUtilityList.get('securityDeposit').value,
          securityDepositLocal: this.form.controls.unitUtilityList.get('securityDeposit').value === '' ?
            0 : this.form.controls.unitUtilityList.get('securityDeposit').value
        })

        this.bindUtilities();
        this.form.controls.unitUtilityList.reset();
      }
    }
  }

  deleteUtility(existingUtility) {
    this.dialog.open(UserConfirmationPopupComponent).afterClosed().subscribe((message: any) => {
      if (message) {
        this.utilities.splice(this.utilities.findIndex((element) => element.id === existingUtility.id), 1);
        this.bindUtilities();
      }
    })
  }

  // selectProject (event) 
  // {
  //   this.metadataProjects.forEach(project => {
  //     if(event.option.value == project.description) 
  //     {
  //       this.form.controls.projectId.setValue(project.id);
  //       this.onProjectSelect(project.id);
  //     }
  //   })
  // }

  // selectBlock (event) 
  // {
  //   this.metadataBlocks.forEach(block => {
  //     if(event.option.value == block.description) 
  //     {
  //       this.form.controls.blockId.setValue(block.id);
  //       this.onBlockSelect(block.id);
  //     }
  //   })
  // }

  // selectBuilding (event) 
  // {
  //   this.metadataBuildings.forEach(building => {
  //     if(event.option.value == building.description) 
  //     {
  //       this.form.controls.buildingId.setValue(building.id);
  //       this.onBuildingSelect(building.id);
  //     }
  //   })
  // }

  // selectFloor (event) 
  // {
  //   this.metadataFloors.forEach(floor => {
  //     if(event.option.value == floor.description) 
  //     {
  //       this.form.controls.floorId.setValue(floor.id);        
  //     }
  //   })
  // }

  selectUnitType(event) {
    this.metadataUnitTypes.forEach(unitType => {
      if (event.option.value == unitType.description) {
        this.form.controls.unitTypeId.setValue(unitType.id);
      }
    })
  }

  selectUtilityType(event) {
    this.metadataUtilityTypes.forEach(utilityType => {
      if (event.option.value == utilityType.description) {
        this.form.controls.unitUtilityList.get('utilityTypeId').setValue(utilityType.id);
        this.onUtilitySelect(utilityType.id);
      }
    })
  }

  selectMeterType(event) {
    this.metadataMeterTypes.forEach(meterType => {
      if (event.option.value == meterType.description) {
        this.form.controls.unitUtilityList.get('meterId').setValue(meterType.id);
      }
    })
  }

  onFilterChange(value) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

  // onProjectSelect(id)
  // {    
  //   this.unitMasterService.getProjectBlocks(id).subscribe((blocks: MetadataBlocks[]) => {
  //     this.metadataBlocks = blocks.map(block => new MetadataBlocks(block));
  //     this.filteredBlocks = blocks;
  //   });
  // }

  // onBlockSelect(id)
  // {
  //   this.unitMasterService.getBlockBuildings(id).subscribe((buildings: MetadataBuildings[]) => {
  //     this.metadataBuildings = buildings.map(building => new MetadataBuildings(building));
  //     this.filteredBuildings = buildings;
  //   });
  // }

  // onBuildingSelect(id)
  // {
  //   this.unitMasterService.getBuildingFloors(id).subscribe((floors: MetadataFloors[]) => {
  //     this.metadataFloors = floors.map(floor => new MetadataFloors(floor));
  //     this.filteredFloors = floors;
  //   });
  // }

  onUtilitySelect(id) {
    this.unitMasterService.getAvailableDevices(id, this.clientId).subscribe((meters: MetadataMeter[]) => {
      //meters.push({ id: 1, description: 'Meter1' });
      this.metadataMeterTypes = meters.map(meter => new MetadataMeter(meter));
      this.filteredMeterTypes = meters;
    });
  }

  bindUtilities() {
    this.utilities.forEach(x => { x.securityDepositLocal = this.currency.transform(x.securityDeposit, this.currencyFormat.toString(), true, this.roundOffFormat); })
    this.subject$.next(this.utilities);
    this.dataSource = new MatTableDataSource(this.utilities);

    this.data$.pipe(
      filter(data => !!data)
    ).subscribe((utilities) => {
      this.utilities = utilities;
      this.dataSource.data = utilities;
    });
  }

  close() {
    this.dialogRef.close();
  }

  closeDialog() {
    this.isCancel = true;
  }
}



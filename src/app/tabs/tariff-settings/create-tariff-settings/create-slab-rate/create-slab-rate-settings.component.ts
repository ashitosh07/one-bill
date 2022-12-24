import { Component, OnInit, ChangeDetectorRef, Input, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { scaleInAnimation } from 'src/@fury/animations/scale-in.animation';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { TariffConsumptionSettings } from 'src/app/tabs/shared/models/tariff-consumption-settings.model';
import { TableStructureComponent } from 'src/app/tabs/shared/components/table-structure/table-structure.component';
import { TariffMaster } from 'src/app/tabs/shared/models/tariff-master.model';
import { CancelConfirmationDialogComponent } from 'src/app/tabs/shared/components/cancel-confirmation-dialog/cancel-confirmation-dialog.component';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-create-slab-rate-settings',
  templateUrl: './create-slab-rate-settings.component.html',
  styleUrls: ['./create-slab-rate-settings.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation, scaleInAnimation]
})
export class CreateSlabRateSettingsComponent implements OnInit {


  slab_rate: FormGroup;

  private _gap = 16;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`;
  col4 = `1 1 calc(5% - ${this._gap / 1}px)`;


  dataSource: TariffConsumptionSettings[] = [];
  deletedDataSource: TariffConsumptionSettings[] = [];
  columns: ListColumn[] = [];
  tariffMaster: TariffMaster = {};

  @Output() isDisable = new EventEmitter<boolean>();

  @Input() slabs: any[] = [];

  @Input() set data(data: TariffMaster) {
    if (data) {
      this.tariffMaster = data;
      if (data.tariffConsumptionSettings && data.tariffConsumptionSettings.length) {
        this.dataSource = data.tariffConsumptionSettings;
      }
    }
  };

  // slab: string = '';
  // slabId: number = 0;
  slabName: string = '';
  maximumConsumption: number;
  minimumConsumption: number;
  rate: number;

  slabNameColumnName = 'Slab Name';
  minColumnName = 'Min';
  maxColumnName = 'Max';
  rateColumnName = 'Rate';

  isContentChange = false;

  @ViewChild(TableStructureComponent, { static: true }) tableStructureComponent: TableStructureComponent;

  constructor(private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private snackbar: MatSnackBar,
    private dialog: MatDialog) {
    this.slab_rate = fb.group({
      'slab': ['', Validators.required],
      'minimumConsumption': ['', Validators.required],
      'maximumConsumption': ['', Validators.required],
      'rate': ['', Validators.required]
    });
  }

  ngOnInit() {
    this.createGridColumns();
  }

  createGridColumns(): any {
    this.columns = [
      { name: this.slabNameColumnName, property: 'slab', visible: true, isModelProperty: true },
      { name: this.minColumnName, property: 'consumptionMin', visible: true, isModelProperty: true },
      { name: this.maxColumnName, property: 'consumptionMax', visible: true, isModelProperty: true },
      { name: this.rateColumnName, property: 'tariffRate', visible: true, isModelProperty: true },
      { name: 'Actions', property: 'actions', visible: true, isModelProperty: false }
    ] as ListColumn[];
  }

  addNewItem() {
    if (this.slab_rate.valid) {
      this.addItemToDataSource();
      this.isDisable.emit(false);
      this.slab_rate.reset();
    } else {
      this.validateAllFormFields(this.slab_rate);
    }
  }

  addItemToDataSource() {
    if (this.dataSource && this.dataSource.length) {
      const index = this.dataSource.findIndex(x => x.slab === this.slabName && x.consumptionMin === this.minimumConsumption && x.consumptionMax === this.maximumConsumption);
      if (index > -1) {
        this.notificationMessage('Slab already exist', 'red-snackbar');
        return;
      }
    }
    const tariffConsumptionSettings: TariffConsumptionSettings = {
      //slabId: this.slabId,
      slab: this.slabName,
      tariffRate: Number(this.rate),
      consumptionMin: Number(this.minimumConsumption),
      consumptionMax: Number(this.maximumConsumption)
    };
    if (tariffConsumptionSettings) {
      this.isContentChange = true;
      this.dataSource.push(tariffConsumptionSettings);
      this.tableStructureComponent.tableData = this.dataSource.sort((a, b) => a.consumptionMin - b.consumptionMin || a.consumptionMax - b.consumptionMax);
    }
  }

  // onChangeSlabs(value) {
  //   this.slabId = value;
  //   this.slab = this.slabs.find(x => x.value === this.slabId).label;
  // }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  onDeleteRow(row: TariffConsumptionSettings) {
    const confirmMessage: ListItem = {
      label: "Are you sure you want to Delete?",
      selected: false
    };
    this.dialog.open(CancelConfirmationDialogComponent, { data: confirmMessage }).afterClosed().subscribe((message: any) => {
      if (message) {
        const existingItemIndex = this.dataSource.findIndex(x => x.slab == row.slab && x.consumptionMin === row.consumptionMin && x.consumptionMax === row.consumptionMax);
        if (existingItemIndex > -1) {
          this.deletedDataSource.push(this.dataSource[existingItemIndex]);
          this.dataSource.splice(existingItemIndex, 1);
        }
        this.tableStructureComponent.tableData = this.dataSource;
        if (this.dataSource && this.dataSource.length > 0) {
          this.isDisable.emit(false);
        }
        else {
          this.isDisable.emit(true);
        }
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
}

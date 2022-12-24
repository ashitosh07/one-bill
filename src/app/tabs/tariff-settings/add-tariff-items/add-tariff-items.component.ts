import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { TableStructureComponent } from '../../shared/components/table-structure/table-structure.component';
import { ListItem } from '../../shared/models/list-item.model';
import { Master } from '../../shared/models/master.model';
import { TariffItem } from "../../shared/models/tariff-item.model";
import { TariffSettings } from "../../shared/models/tariff-settings.model";
import { TariffMasterService } from '../../shared/services/tariff-master.service';

@Component({
  selector: 'fury-add-tariff-items',
  templateUrl: './add-tariff-items.component.html',
  styleUrls: ['./add-tariff-items.component.scss']
})
export class AddTariffItemsComponent implements OnInit {

  type: string = '';
  tariff_items_create: FormGroup;
  subItems: Master[] = [];
  selectedSubItems: any[] = [];
  dataSource: TariffSettings[] = [];
  columns: any[] = [];
  tariffSettings: TariffSettings = null;

  typeNameColumnName = 'Type Name';
  subItemColumnName = 'Sub Item';

  buttonName: string = 'CREATE ITEM';

  @ViewChild('allSelected') private allSelected: MatOption;
  @ViewChild(TableStructureComponent, { static: true }) tableStructureComponent: TableStructureComponent;


  constructor(private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public tariffItem: TariffItem,
    private dialogRef: MatDialogRef<AddTariffItemsComponent>,
    private tariffMasterService: TariffMasterService,
    private snackbar: MatSnackBar) {
    if (tariffItem) {
      this.type = tariffItem.type;
      this.subItems = tariffItem.subItems;
      this.dataSource = tariffItem.tariffSettings;
    }
  }

  ngOnInit(): void {
    this.createGridColumns();
    this.tariff_items_create = this.fb.group({
      itemName: [null || '', Validators.required],
      subItem_select: [null, Validators.required],
    });
  }


  createGridColumns(): any {
    this.columns = [
      { name: this.typeNameColumnName, property: 'typeName', visible: true, isModelProperty: true },
      { name: this.subItemColumnName, property: 'subItemNames', visible: true, isModelProperty: true },
      { name: 'Actions', property: 'actions', visible: true, isModelProperty: false }
    ] as ListColumn[];
  }


  close() {
    this.dialogRef.close();
  }


  closeDialog() {

  }

  save() {
    const typeName = this.tariff_items_create.controls.itemName.value;

    if (this.tariffSettings && typeName !== this.tariffSettings.typeName) {
      const itemIndex = this.dataSource.findIndex(x => x.typeName === typeName);
      if (itemIndex > -1) {
        this.notificationMessage(`${this.type} name already exist`, 'red-snackbar');
        return;
      }
    }
    else if (!this.tariffSettings) {
      const itemIndex = this.dataSource.findIndex(x => x.typeName === typeName);
      if (itemIndex > -1) {
        this.notificationMessage(`${this.type} name already exist`, 'red-snackbar');
        return;
      }
    }

    let typeId = 0;
    if (this.dataSource && this.dataSource.length) {
      typeId = Math.max.apply(Math, this.dataSource.map(function (o) { return o.typeId; })) ?? 0;
    }
    let selectedSubItems: number[] = this.tariff_items_create.controls.subItem_select.value;
    let subItems: Master[] = [];
    const type = this.type === 'Season' ? 1 : 2;
    let alreadyExistingItem: string = '';
    if (selectedSubItems && selectedSubItems.length) {
      selectedSubItems.filter(x => x != 0).forEach(x => {
        if (this.tariffSettings) {
          this.tariffItem.tariffSettings.filter(x => x.typeId !== this.tariffSettings.typeId).forEach(y => {
            const existItem = y.subItems.find(z => z.id === x);
            if (existItem) {
              alreadyExistingItem += existItem.description + ',';
            }
          });
        } else {
          this.dataSource.forEach(y => {
            const existItem = y.subItems.find(z => z.id === x);
            if (existItem) {
              alreadyExistingItem += existItem.description + ',';
            }
          })
        };
      });

      if (alreadyExistingItem && alreadyExistingItem.length) {
        this.notificationMessage(`Already ${alreadyExistingItem.slice(0, -1)} assigned to another ${this.type}`, 'red-snackbar');
        return;
      }
      selectedSubItems.filter(x => x != 0).forEach(y => { subItems.push({ id: y }) });
    }
    let tariffSettings: TariffSettings = {};
    if (this.tariffSettings) {
      tariffSettings = {
        typeName: typeName,
        typeId: this.tariffSettings.typeId,
        type: this.tariffSettings.type,
        subItems: subItems
      };
    } else {
      tariffSettings = {
        typeName: typeName,
        typeId: typeId + 1,
        type: type,
        subItems: subItems
      };
    }
    this.dialogRef.close(tariffSettings);
  }

  onDeleteRow(row: TariffSettings) {
    if (row) {
      this.deleteTariffSettings(row);
    }
  }

  onUpdateRow(row: TariffSettings) {
    this.tariffSettings = {};
    if (row) {
      this.tariff_items_create.controls.itemName.setValue(row.typeName);
      if (row.subItems && row.subItems.length) {
        for (let i = 0; i < row.subItems.length; i++) {
          this.selectedSubItems[i] = row.subItems[i].id;
        }
        this.tariff_items_create.controls.subItem_select
          .patchValue([...row.subItems.map(item => item.id)]);
      }
      this.tariffSettings = row;
      this.buttonName = 'UPDATE ITEM';
    }
  }

  tosslePerOne(all) {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }
    if (this.tariff_items_create.controls.subItem_select.value.length == this.subItems.length) {
      this.allSelected.select();
    }
  }

  toggleAllSelection() {
    if (this.allSelected.selected) {
      this.tariff_items_create.controls.subItem_select
        .patchValue([...this.subItems.map(item => item.id), 0]);
    } else {
      this.tariff_items_create.controls.subItem_select.patchValue([]);
    }
  }

  deleteTariffSettings(tariffSettings: TariffSettings) {
    this.tariffMasterService.deleteTariffSettings(tariffSettings).subscribe({
      next: response => {
        if (response) {
          if (this.tariffItem.tariffSettings && this.tariffItem.tariffSettings.length) {
            const index = this.tariffItem.tariffSettings.findIndex(x => x.typeName === tariffSettings.typeName && x.typeId === tariffSettings.typeId && x.type === tariffSettings.type);
            if (index > -1) {
              this.dataSource = [];
              this.tariffItem.tariffSettings.splice(index, 1);
              this.dataSource = this.tariffItem.tariffSettings;
              this.tableStructureComponent.tableData = this.dataSource;
            }
          } else {
            this.dataSource = [];
            this.dataSource = this.tariffItem.tariffSettings;
            this.tableStructureComponent.tableData = this.dataSource;
          }
          this.notificationMessage('Tariff settings deleted successfully', 'green-snackbar');
        } else {
          this.notificationMessage('Tariff settings delete failed', 'red-snackbar');
        }
      },
      error: (err) => {
        this.notificationMessage('Tariff settings delete failed', 'red-snackbar');
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

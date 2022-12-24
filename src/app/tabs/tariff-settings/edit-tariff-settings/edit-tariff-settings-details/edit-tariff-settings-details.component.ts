import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { TariffMaster } from 'src/app/tabs/shared/models/tariff-master.model';
import { ClientSelectionService } from 'src/app/tabs/shared/services/client-selection.service';

@Component({
  selector: 'fury-edit-tariff-settings-details',
  templateUrl: './edit-tariff-settings-details.component.html',
  styleUrls: ['./edit-tariff-settings-details.component.scss']
})
export class EditTariffSettingsDetailsComponent implements OnInit {



  columns: any[] = [];
  innerColumns: any[] = [];
  columnNames: ListColumn[] = [];

  tariffMasters: TariffMaster[] = [];
  selectedRows: TariffMaster[] = [];


  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  @Input()
  set dataSource(value: TariffMaster[]) {
    if (value && value.length) {
      this.tariffMasters = value;

    }
  }

  @Output() rowsSelected = new EventEmitter<TariffMaster[]>();
  @Output() updateRow = new EventEmitter<TariffMaster>();
  @Output() deleteRow = new EventEmitter<TariffMaster>();
  @Output() addItemClicked = new EventEmitter();

  @Input() hideHeader: boolean = true;

  tariffColumnName = 'Tariff Name';
  utilityTypeColumnName = 'Utility Type';
  parameterColumnName = 'Parameter';
  wefDateColumnName = 'WEF Date';
  formName: string = 'Create Tariff';

  constructor(private router: Router,
    private clientSelectionService: ClientSelectionService) { }

  ngOnInit(): void {
    this.clientSelectionService.setIsClientVisible(false);
    if (this.router.url.includes('slab-tariff-settings')) {
      this.formName = "Create Slab Tariff";
    }
    else {
      this.formName = "Create Tariff";
    }
    this.createGridColumns();
  }

  createGridColumns(): any {
    this.columns = [
      { name: this.tariffColumnName, property: 'tariffName', visible: true, isModelProperty: true },
      { name: this.utilityTypeColumnName, property: 'utility', visible: true, isModelProperty: true },
      //{ name: this.parameterColumnName, property: 'parameter', visible: true, isModelProperty: true },
      //{ name: this.wefDateColumnName, property: 'wefDateLocal', visible: true, isModelProperty: true },
      { name: 'Actions', property: 'actions', visible: true, isModelProperty: false }] as ListColumn[];
  }


  onSelectedRows(selectedRows: TariffMaster[]) {
    this.selectedRows = [];
    this.selectedRows = selectedRows;
    this.rowsSelected.emit(this.selectedRows);
  }

  onUpdateRow(row: TariffMaster) {
    this.updateRow.emit(row);
  }

  onAddItem() {
    this.addItemClicked.emit();
  }

  onDeleteRow(row: TariffMaster) {
    this.deleteRow.emit(row);
  }

}

import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { getClientDataFormat } from 'src/app/tabs/shared/utilities/utility';
import { Bill } from 'src/app/tabs/shared/models/bill.model';
import { environment } from 'src/environments/environment';
import { EnvService } from 'src/app/env.service';
import { ConsumptionAlert } from 'src/app/tabs/shared/models/consumption-alert.model';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';

@Component({
  selector: 'fury-bill-consumption-details',
  templateUrl: './bill-consumption-details.component.html',
  styleUrls: ['./bill-consumption-details.component.scss']
})
export class BillConsumptionDetailsComponent implements OnInit {



  columns: any[] = [];
  innerColumns: any[] = [];
  columnNames: ListColumn[] = [];

  failedBills: Bill[] = [];
  selectedRows: Bill[] = [];

  innerTableName: string = 'bills';

  @Input() banks: any[] = [];
  @Input() paymentModes: any[] = [];
  @Input() isHide = true;

  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort && this.dataSource) {
      this.dataSource.sort = this.sort;
    }
  }

  format = '';
  currency = '';
  roundFormat = '';

  @Input()
  set dataSource(value: Bill[]) {
    if (value && value.length) {
      this.failedBills = value;
    }
  }

  @Input() hideHeader: boolean = true;

  @Output() saveClicked = new EventEmitter<boolean>();
  @Output() rowsSelected = new EventEmitter<Bill[]>();

  slNumberColumnName = 'Sl No.'
  unitNumberCoulmnName = 'Unit Number';
  deviceNameCoulmnName = 'Device Name';
  consumptionCoulmnName = 'First Consumption';
  unitAverageColumnName = 'Average Consumption';
  differenceColumnName = 'Difference';
  differencePercenatgeColumnName = 'Difference [%]';

  constructor(private envService: EnvService) {

    this.format = getClientDataFormat('DateFormat') ?? envService.dateFormat;;
    this.currency = getClientDataFormat('Currency') ?? envService.currencyFormat;
    this.roundFormat = getClientDataFormat('RoundOff') ?? envService.roundOffFormat;
  }

  ngOnInit(): void {
    this.createGridColumns();
    this.updateTableColumns();
  }

  createGridColumns(): any {
    this.columns = [
      { name: 'Checkbox', property: 'checkbox', visible: true },
      { name: this.slNumberColumnName, property: 'id', visible: true, isModelProperty: true },
      { name: this.unitNumberCoulmnName, property: 'unitNumber', visible: true, isModelProperty: true },
      { name: this.deviceNameCoulmnName, property: 'deviceName', visible: true, isModelProperty: true },
      { name: this.consumptionCoulmnName, property: 'consumptionLocal', visible: true, isModelProperty: true, columnAlign: { 'text-align': 'right' } },
      { name: this.unitAverageColumnName, property: 'averageConsumptionLocal', visible: true, isModelProperty: true, columnAlign: { 'text-align': 'right' } },
      {
        name: this.differenceColumnName, property: 'consumptionDifferenceLocal', visible: true, isModelProperty: true, columnAlign: { 'text-align': 'right' }
      },
      {
        name: this.differencePercenatgeColumnName, property: 'consumptionDifferencePercentageLocal', visible: true, isModelProperty: true, icon: 'status', columnAlign: { 'text-align': 'right' }
      }
    ] as ListColumn[];

  }


  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  updateTableColumns() {
    this.columns.splice(0, 1);
  }

  onSelectedRows(selectedRows: Bill[]) {
    this.selectedRows = [];
    this.selectedRows = selectedRows;
    this.rowsSelected.emit(this.selectedRows);
  }

  updateDataFormats(outstandingBills: Bill[]) {
    if (outstandingBills) {
      outstandingBills.forEach(billMaster => {

      })
    }
    return outstandingBills;
  }  

}

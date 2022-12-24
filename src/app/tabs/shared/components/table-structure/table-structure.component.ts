import { Component, OnInit, Input, ViewChild, AfterViewInit, OnDestroy, Output, EventEmitter, ElementRef } from '@angular/core';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { MatTableDataSource } from '@angular/material/table';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { getClientDataFormat } from '../../utilities/utility';

@Component({
  selector: 'app-table-structure',
  templateUrl: './table-structure.component.html',
  styleUrls: ['./table-structure.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation]
})
export class TableStructureComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() columns: ListColumn[] = [];
  @Input() buttonVisible: boolean = true;
  data: any[] = [];
  autoSelect: boolean = false;
  currency = getClientDataFormat('Currency');
  roundFormat = getClientDataFormat('RoundOff');

  @Input() get tableData(): any[] { return this.data }
  set tableData(value: any[]) {
    this.dataSource = new MatTableDataSource();    
    this.dataSource.data = this.data = value;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.selection = new SelectionModel<any>(true, []);
    if (this.dataSource && this.dataSource.data.length && this.autoSelect) {
      this.masterToggle();
    }
  }

  @Input() hideHeader: boolean = true;
  @Input() hideFilter: boolean = true;
  @Input() formName: string = '';
  @Input() visibleDeleteButton: boolean = true;
  @Input() visibleUpdateButton: boolean = false;
  @Input() visiblePrintButton: boolean = false;
  @Input() disableCheckBox: boolean = false;

  @Input() get isAutoSelect(): boolean { return this.autoSelect; }
  set isAutoSelect(value: boolean) {
    this.autoSelect = value;
    if (this.dataSource && this.dataSource.data.length && value) {
      this.masterToggle();
    }
  }

  @Output() selectedRows = new EventEmitter<any[]>();
  @Output() printDataRow = new EventEmitter<any[]>();
  @Output() changedRow = new EventEmitter();
  @Output() updateRow = new EventEmitter<any>();
  @Output() deleteRow = new EventEmitter<any>();
  @Output() addItemClicked = new EventEmitter();

  pageSize = 10;
  dataSource: MatTableDataSource<any> | null;
  selection = new SelectionModel<any>(true, []);

  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  constructor() { }

  ngOnInit(): void {
  }

  updateRows(row) {
    this.updateRow.emit(row);
  }

  deleteRows(row) {
    this.deleteRow.emit(row);
  }

  printRows(row) {
    this.printDataRow.emit(row);
  }

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy() {
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach(row => this.selection.select(row));
    this.selectedRows.emit(this.selection.selected);
  }

  isCheckChange(row) {
    this.selection.toggle(row);
    this.selectedRows.emit(this.selection.selected);
  }

  onFilterChange(value) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

  onTextChange(row: any) {
    this.changedRow.emit();
  }

  addItem() {
    this.addItemClicked.emit();
  }


}

import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';

@Component({
  selector: 'fury-expandable-table-structure',
  templateUrl: './expandable-table-structure.component.html',
  styleUrls: ['./expandable-table-structure.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class ExpandableTableStructureComponent implements OnInit {

  @ViewChild(MatSort, { static: false })
  set sort(value: MatSort) {
    if (this.dataSource) {
      if (value && value.active && value.active != '') {
        let index = value.active.indexOf('local');
        if (index > -1) {
          value.active = value.active.substr(0, index);
          if (value.start == 'asc') {
            value.start = 'desc';
          }
          else {
            value.start = 'asc';
          }
        }
      }
      this.dataSource.sort = value;
    }
  }
  @ViewChildren('innerSort') innerSort: QueryList<MatSort>;
  @ViewChildren('innerTables') innerTables: QueryList<MatTable<any>>;
  @ViewChild(MatPaginator, { static: false })
  set paginator(value: MatPaginator) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }


  @Input() get tableData(): any[] { return this.data }
  set tableData(value: any[]) {
    this.dataSource = new MatTableDataSource();
    this.dataSource.data = this.data = value;
    this.selection = new SelectionModel<any>(true, []);
  }
  @Input() innerTableName: string = 'bills' || 'billMasters';
  @Input() columnsToDisplay: any[] = [];
  @Input() innerDisplayedColumns: any[] = [];
  @Input() columnNames: ListColumn[] = [];
  @Input() visibleButtons: ListColumn[] = [];
  @Input() hideHeader: boolean = true;
  @Input() hideFilter: boolean = true;
  @Input() cssStyledColumn: string = '';
  @Input() role: string = '';
  @Input() filterRole: string = 'External';
  @Input() buttonName: string = 'Modify';
  @Input() disableColumn: string = '';
  @Input() buttonDisableColumn: string = '';
  @Input() viewButtonColumn = '';
  @Output() selectedRows = new EventEmitter<any[]>();
  @Output() updateRow = new EventEmitter<any[]>();
  @Output() viewDataRow = new EventEmitter<any[]>();
  @Output() printDataRow = new EventEmitter<any[]>();
  @Output() deleteDataRow = new EventEmitter<any[]>();
  @Output() rejectDataRow = new EventEmitter<any[]>();
  @Output() failDataRow = new EventEmitter<any[]>();
  @Output() remarksDataRow = new EventEmitter<any[]>();
  @Output() filterDataRow = new EventEmitter<any[]>();
  @Output() advanceAdjustedRow = new EventEmitter<any[]>();

  pageSize = 10;
  dataSource: MatTableDataSource<any> | null;
  selection = new SelectionModel<any>(true, []);
  data: any[] = [];
  expandedElement: any | null;
  filterColumns: ListColumn[] = [];


  constructor(
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }

  toggleRow(element: any) {
    element[this.innerTableName] && element[this.innerTableName].length ? (this.expandedElement = this.expandedElement === element ? null : element) : null;
    this.cd.detectChanges();
    this.innerTables.forEach((table, index) => (table.dataSource as MatTableDataSource<any>).sort = this.innerSort.toArray()[index]);
  }

  applyFilter(filterValue: string) {
    this.innerTables.forEach((table, index) => (table.dataSource as MatTableDataSource<any>).filter = filterValue.trim().toLowerCase());
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

  checkColumnNames(property: string) {
    const item = this.columnNames.find(x => x.property === property);
    if (item) {
      return item.name.toUpperCase();
    } else {
      return '';
    }
  }

  checkColumnAlign(property: string) {
    const columnAlign = { 'text-align': 'left' };
    const item = this.columnNames.find(x => x.property === property);
    if (item && item.columnAlign) {
      return item.columnAlign;
    } else {
      return columnAlign;
    }
  }

  updateRows(row) {
    this.updateRow.emit(row);
  }

  viewData(row) {
    this.viewDataRow.emit(row);
  }

  printRows(row) {
    this.printDataRow.emit(row);
  }

  deleteRows(row) {
    this.deleteDataRow.emit(row);
  }

  rejectRows(row) {
    this.rejectDataRow.emit(row);
  }

  failRows(row) {
    this.failDataRow.emit(row);
  }

  remarksRows(row) {
    this.remarksDataRow.emit(row);
  }

  advanceAdjustRows(row) {
    this.advanceAdjustedRow.emit(row);
  }

  checkButtonVisiblity(property: string) {
    if (this.visibleButtons && this.visibleButtons.length) {
      const item = this.visibleButtons.find(x => x.property === property);
      if (item) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }


  onFilterChange(value) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
    this.filterDataRow.emit(this.dataSource.filteredData);
  }


  shuffleColumns() {
    this.columnsToDisplay.reverse();
  }

  visibleViewButton(data: any) {
    let visible = true;
    if (!data) {
      visible = false;
    } else {
      if (this.viewButtonColumn) {
        visible = data[this.viewButtonColumn] ? true : false;
      } else {
        visible = true;
      }
    }
    return visible;
  }

}
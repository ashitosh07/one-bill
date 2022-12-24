import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { Bill } from 'src/app/tabs/shared/models/bill.model';
import { CreditNote } from 'src/app/tabs/shared/models/credit-note.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'fury-credit-note-history-details',
  templateUrl: './credit-note-history-details.component.html',
  styleUrls: ['./credit-note-history-details.component.scss']
})
export class CreditNoteHistoryDetailsComponent implements OnInit {


  @Output() printClicked = new EventEmitter();
  @Output() exportClicked = new EventEmitter();

  constructor() { }

  ngOnInit(): void {

  }

  onPrint() {
    this.printClicked.emit();    
  }

  onExport()
  {
    this.exportClicked.emit();
  }
  
}

import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'fury-dynamic-table-structure',
  templateUrl: './dynamic-table-structure.component.html',
  styleUrls: ['./dynamic-table-structure.component.scss']
})
export class DynamicTableStructureComponent implements OnInit {

  @Input() tableData: any[] = [];
  @Input() columnNames: string[] = [];
  
  @ViewChild('TABLE') table: ElementRef;
  constructor() { }

  ngOnInit(): void {
  }

  capitalize(s: string): string {
    s= s.replace('Local','');
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}

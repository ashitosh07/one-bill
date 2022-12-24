import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'fury-invoice-aging-report-footer-toolbar',
  templateUrl: './invoice-aging-report-footer-toolbar.component.html',
  styleUrls: ['./invoice-aging-report-footer-toolbar.component.scss']
})
export class InvoiceAgingReportFooterToolbarComponent implements OnInit {

  
  @Output() printClicked = new EventEmitter();
  

  constructor() { }

  ngOnInit(): void {
  }

  

  onPrint() {
    this.printClicked.emit();
  }

  
}

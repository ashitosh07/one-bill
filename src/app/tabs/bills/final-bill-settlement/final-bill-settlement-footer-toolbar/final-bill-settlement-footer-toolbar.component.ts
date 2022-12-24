import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-final-bill-settlement-footer-toolbar',
  templateUrl: './final-bill-settlement-footer-toolbar.component.html',
  styleUrls: ['./final-bill-settlement-footer-toolbar.component.scss']
})
export class FinalBillSettlementFooterToolbarComponent implements OnInit {

  @Output() saveClicked = new EventEmitter<boolean>();
  @Output() printClicked = new EventEmitter<boolean>();

  @Input() isDisabled = false; 
  @Input() isPrintDisable = true; 

  constructor() { }

  ngOnInit(): void {   
  }

  onSave() {
    this.saveClicked.emit(true);
  }

  onPrint() {
    this.printClicked.emit(true);
  }
}

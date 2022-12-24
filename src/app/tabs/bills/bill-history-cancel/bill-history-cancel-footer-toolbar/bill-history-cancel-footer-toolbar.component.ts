import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'fury-bill-history-cancel-footer-toolbar',
  templateUrl: './bill-history-cancel-footer-toolbar.component.html',
  styleUrls: ['./bill-history-cancel-footer-toolbar.component.scss']
})
export class BillHistoryCancelFooterToolbarComponent implements OnInit {

  @Output() sendEmailClicked = new EventEmitter();
  @Output() printClicked = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
  }

  onSendEmail() {
    this.sendEmailClicked.emit();
  }

  onPrint() {
    this.printClicked.emit();
  }

}

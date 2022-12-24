import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-create-bill-footer-toolbar',
  templateUrl: './create-bill-footer-toolbar.component.html',
  styleUrls: ['./create-bill-footer-toolbar.component.scss']
})
export class CreateBillFooterToolbarComponent implements OnInit {


  // @Output() saveClicked = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }

  // onSave() {
  //   this.saveClicked.emit();
  // }

  onExport() {

  }

  onPrint() {

  }

}

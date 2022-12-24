import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'fury-failed-bills-footer-toolbar',
  templateUrl: './failed-bills-footer-toolbar.component.html',
  styleUrls: ['./failed-bills-footer-toolbar.component.scss']
})
export class FailedBillsFooterToolbarComponent implements OnInit {

  
  @Output() forceVerifyClicked = new EventEmitter();
  @Output() averageConsumptionClicked = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  onForceVerify() {
    this.forceVerifyClicked.emit();
  }

  onAverageConsumption() {
     this.averageConsumptionClicked.emit();
  }

}

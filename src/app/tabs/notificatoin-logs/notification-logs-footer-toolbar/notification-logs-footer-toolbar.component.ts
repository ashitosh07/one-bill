import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { UserActions } from 'src/app/tabs/shared/models/user-actions.model';

@Component({
  selector: 'fury-notification-logs-footer-toolbar',
  templateUrl: './notification-logs-footer-toolbar.component.html',
  styleUrls: ['./notification-logs-footer-toolbar.component.scss']
})
export class NotificationLogsFooterToolbarComponent implements OnInit {

  showAprrovedButton: boolean = false;
  actions: UserActions[] = [];

  mode: string = '';

  @Input() get userActions(): UserActions[] { return this.actions }
  set userActions(value: UserActions[]) {
    this.actions = value;
    if (this.actions && this.actions.length) {
      const action = this.actions.find(x => x.actionName === 'Bill Approval')
      if (action) {
        this.showAprrovedButton = true;
      } else {
        this.showAprrovedButton = false;
      }
    }
  }

  @Output() sendInvoiceClicked = new EventEmitter<string>();
  @Output() printClicked = new EventEmitter();
  @Output() sendSMSClicked = new EventEmitter();
  @Output() printSummaryClicked = new EventEmitter();
  @Output() approveClickedClicked = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  onSendInvoice(type: string) {
    this.sendInvoiceClicked.emit(type);
  }

  onPrint() {
    this.printClicked.emit();
  }

  onSendSMS() {
    this.sendSMSClicked.emit();
  }

  onPrintSummary() {
    this.printSummaryClicked.emit();
  }

  onApprove() {
    this.approveClickedClicked.emit();
  }

}

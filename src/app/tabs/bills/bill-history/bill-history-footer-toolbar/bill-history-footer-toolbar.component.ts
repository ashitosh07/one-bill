import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import { UserActions } from 'src/app/tabs/shared/models/user-actions.model';
import { MasterService } from 'src/app/tabs/shared/services/master.service';

@Component({
  selector: 'fury-bill-history-footer-toolbar',
  templateUrl: './bill-history-footer-toolbar.component.html',
  styleUrls: ['./bill-history-footer-toolbar.component.scss']
})
export class BillHistoryFooterToolbarComponent implements OnInit {

  role: string = '';

  showAprrovedButton: boolean = false;
  actions: UserActions[] = [];
  ownerId: number = 0;


  billFeeType: string = '';
  @Input() disable: false;
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
  @Input() isApproveBills = false;
  @Input() isRejectedBills = false;
  @Input() parameterValue = false;

  @Output() sendInvoiceClicked = new EventEmitter<string>();
  @Output() printClicked = new EventEmitter();
  @Output() sendNotificationsClicked = new EventEmitter();
  @Output() printSummaryClicked = new EventEmitter<string>();
  @Output() approveClickedClicked = new EventEmitter();
  @Output() regenerateClicked = new EventEmitter();
  @Output() excelExportClicked = new EventEmitter();
  @Output() billConsumptionExcelExportClicked = new EventEmitter();

  constructor(private jwtHelperService: JwtHelperService,
    private cookieService: CookieService) { }

  ngOnInit(): void {
    let token = this.cookieService.get('access_token');

    const decodedToken = this.jwtHelperService.decodeToken(token);
    if (decodedToken)
      this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    this.ownerId = parseInt(this.cookieService.get('ownerId'));      
  }

  onSendInvoice(type: string) {
    this.sendInvoiceClicked.emit(type);
  }

  onPrint() {
    this.printClicked.emit();
  }

  onPrintSummary(type: string) {
    this.printSummaryClicked.emit(type);
  }

  onApprove() {
    this.approveClickedClicked.emit();
  }

  onRegenerate() {
    this.regenerateClicked.emit();
  }

  onSendNotifications() {
    this.sendNotificationsClicked.emit();
  }

  onExcelExport() {
    this.excelExportClicked.emit();
  }

  onBillConsumptionExcelExport() {
    this.billConsumptionExcelExportClicked.emit();
  }
}

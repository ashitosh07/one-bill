import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import { UserActions } from 'src/app/tabs/shared/models/user-actions.model';

@Component({
  selector: 'fury-account-statement-footer-toolbar',
  templateUrl: './account-statement-footer-toolbar.component.html',
  styleUrls: ['./account-statement-footer-toolbar.component.scss']
})
export class AccountStatementFooterToolbarComponent implements OnInit {

  role: string = '';

  showAprrovedButton: boolean = false;
  actions: UserActions[] = [];

  billType: string = '';
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

  @Output() sendInvoiceClicked = new EventEmitter<string>();
  @Output() printClicked = new EventEmitter<string>();
  @Output() sendSMSClicked = new EventEmitter();
  @Output() printSummaryClicked = new EventEmitter();
  @Output() approveClickedClicked = new EventEmitter();
  @Output() regenerateClicked = new EventEmitter();
  @Output() exportClicked = new EventEmitter();


  constructor(private jwtHelperService: JwtHelperService,
    private cookieService: CookieService) { }

  ngOnInit(): void {
    let token = this.cookieService.get('access_token');

    const decodedToken = this.jwtHelperService.decodeToken(token);
    if (decodedToken)
      this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

  }


  onPrint(type: string) {
    this.printClicked.emit(type);
  }

  onExport()
  {
    this.exportClicked.emit();
  }

  onSendSMS() {
    this.sendSMSClicked.emit();
  }
}

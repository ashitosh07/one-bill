import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'fury-payment-history-footer-toolbar',
  templateUrl: './payment-history-footer-toolbar.component.html',
  styleUrls: ['./payment-history-footer-toolbar.component.scss']
})
export class PaymentHistoryFooterToolbarComponent implements OnInit {

  ownerId: number = 0;

  @Input() hide: boolean = true;
  @Input() show: boolean = true;
  @Input() visible: boolean = true;

  @Output() sendReceiptClicked = new EventEmitter();
  @Output() printClicked = new EventEmitter();
  @Output() exportClicked = new EventEmitter();

  constructor(private cookieService: CookieService) { }

  ngOnInit(): void {
    this.ownerId = parseInt(this.cookieService.get('ownerId')) ?? 0;
  }

  onSendReceipt() {
    this.sendReceiptClicked.emit();
  }

  onPrint() {
    this.printClicked.emit();
  }

  onExport() {
    this.exportClicked.emit();
  }

}

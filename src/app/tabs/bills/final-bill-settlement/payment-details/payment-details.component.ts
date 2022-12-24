import { DatePipe } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-payment-details',
  templateUrl: './payment-details.component.html',
  styleUrls: ['./payment-details.component.scss']
})
export class PaymentDetailsComponent implements OnInit {


  @Input() banks: any[] = [];
  @Input() paymentModes: any[] = [];
  @Input() isShowValidation: boolean = false;

  paymentModeId = 0;
  bankId = 0;
  paymentDate: string = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  refNumber = '';
  remarks = '';
  disableBank = false;
  @Output() validate = new EventEmitter<boolean>();

  constructor(private datePipe: DatePipe) { }

  ngOnInit(): void {
  }

  onChangeBank(value: any) {
    this.bankId = value;
    this.validateControls()
  }

  onChangePaymentMode(value: any) {
    this.paymentModeId = value;
    const item = this.paymentModes.find(x => x.value == value);
    if (item) {
      this.disableBank = item.label === 'Cash- Billing Collection';
      this.bankId = 0;
    }
    this.validateControls();
  }

  validateControls() {
    let valid = true;
    if ((!this.disableBank && !this.bankId) || !this.paymentModeId || !this.paymentDate) {
      valid = false
    }
    this.validate.emit(valid);
  }

  onDateChange(event: any) {
    this.validateControls();
  }

}

import { Component, OnInit, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { ManageParams } from 'src/app/tabs/shared/models/manage-params.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { MatOption } from '@angular/material/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { inputs } from '@syncfusion/ej2-angular-navigations/src/accordion/accordion.component';
import { validateDates } from '../../../shared/utilities/utility';
import { MasterService } from 'src/app/tabs/shared/services/master.service';
import { Master } from 'src/app/tabs/shared/models/master.model';

@Component({
  selector: 'app-payment-history-toolbar',
  templateUrl: './payment-history-toolbar.component.html',
  styleUrls: ['./payment-history-toolbar.component.scss']
})
export class PaymentHistoryToolbarComponent implements OnInit {

  @Input() paymentModes: any[] = [];
  @Output() searchClicked = new EventEmitter<ManageParams>();

  @ViewChild('allSelected') private allSelected: MatOption;

  manageParams: ManageParams = {};
  fromDate = '';
  toDate = '';
  paymentMode = [];
  isViewSecurityDeposit: boolean = false;
  ownerId: number = 0;
  clientId: number = 0;
  form: FormGroup;
  @Input() role: string = '';
  isValidDate: boolean = true;
  lstMonths: Master[] = [];
  monthSelected: string = '3 Months';   

  constructor(private snackbar: MatSnackBar,
    private datePipe: DatePipe,private masterService: MasterService,
    private fb: FormBuilder,
    private cookieService: CookieService) { }

  ngOnInit(): void {
    this.ownerId = parseInt(this.cookieService.get('ownerId'));

    this.paymentModes.splice(0, 1);

    if (this.ownerId > 0) {
      this.masterService.getSystemMasterdata(81, 0).subscribe((data: Master[]) => {
        if(data && data.length > 0)
        {
          this.lstMonths = data;
          this.monthSelected = this.lstMonths[0].description;
        } 
        this.onSearch();
      });      
    }
    this.form = this.fb.group({
      paymentMode: ['']
    });
  }

  getDates()
  {
    if(this.lstMonths != [])    
    {
      if(this.monthSelected != '')
      {
        let month = this.monthSelected.substr(0,this.monthSelected.indexOf(' '));
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setMonth(fromDate.getMonth() - parseInt(month)+1);
        fromDate.setDate(1);
        this.fromDate = fromDate.toString();
        this.toDate = toDate.toString();
      }      
    }    
  }

  onSearch() {
    if(this.ownerId > 0)
    {
      this.getDates();
    }
    this.ownerId = parseInt(this.cookieService.get('ownerId'));
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    if ((this.fromDate && this.toDate) || this.paymentMode.length > 0 || this.ownerId > 0) {

      let index = this.paymentMode.findIndex((mode) => mode == 0)
      if (index >= 0) {
        this.paymentMode.splice(index, 1);
      }
      let paymentMode = this.paymentMode.join(',');
      this.manageParams = {
        fromDate: this.fromDate ? `${this.datePipe.transform(this.fromDate, 'yyyy-MM-dd')}` : '',
        toDate: this.toDate ? `${this.datePipe.transform(this.toDate, 'yyyy-MM-dd')}` : '',
        paymentMode: `${paymentMode}`,
        paymentId: 0,
        tenantId: this.ownerId.toString(),
        clientId: this.clientId,
        billType: this.isViewSecurityDeposit ? 3 : 0
      }
      this.searchClicked.emit(this.manageParams);
    } else {
      this.snackbar.open('Invalid search parameters', null, {
        duration: 5000,
        verticalPosition: 'top',
        horizontalPosition: 'end',
        panelClass: ['yellow-snackbar'],
      });
    }
  }

  onChangePaymentMode(value: any) {
    this.paymentMode = value;
  }

  toggleAllSelection() {
    if (this.allSelected.selected) {
      this.form.controls.paymentMode
        .patchValue([...this.paymentModes.map(item => item.value), 0]);
    } else {
      this.form.controls.paymentMode.patchValue([]);
    }
  }

  togglePerOne(all) {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }
    if (this.form.controls.paymentMode.value.length == this.paymentModes.length)
      this.allSelected.select();
  }

  changeViewSecurityDeposit(event: any) {
    this.isViewSecurityDeposit = event.checked;
  }

  validateFromDateAndToDate()
  {
    if(this.fromDate && this.toDate)
    {
      let startDate = new Date(this.fromDate);
      let endDate = new Date(this.toDate);
      this.isValidDate = validateDates(startDate,endDate);
    }    
  }

  onChangeMonths(event)
  {
    this.monthSelected = event;
  }

}

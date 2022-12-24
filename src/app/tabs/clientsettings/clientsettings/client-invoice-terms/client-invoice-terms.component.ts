import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { ClientsettingsService } from '../../clientsettings.service';

@Component({
  selector: 'fury-client-invoice-terms',
  templateUrl: './client-invoice-terms.component.html',
  styleUrls: ['./client-invoice-terms.component.scss']
})
export class ClientInvoiceTermsComponent implements OnInit {

  invoiceTerms: FormGroup;

  name: string = '';
  termsAndCondition: string = '';
  clientId: number;

  constructor(private fb: FormBuilder,
              private clientSettingService: ClientsettingsService,
              private cookieService: CookieService) {
    this.invoiceTerms = fb.group({
      'name': [''],
      'termsAndCondition': [null]
    });
   }

  ngOnInit(): void {
    this.clientId = Number( this.cookieService.get('globalClientId') );

    this.clientSettingService.getTermsAndConditions(this.clientId).subscribe((data: any) => {
      if(data) {
        this.name = data['name'];
        this.termsAndCondition = data['termsAndCondition'];
      } 
    }    
    )
  }

}

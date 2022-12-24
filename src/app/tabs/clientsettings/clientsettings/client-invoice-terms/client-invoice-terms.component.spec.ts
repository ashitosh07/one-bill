import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientInvoiceTermsComponent } from './client-invoice-terms.component';

describe('ClientInvoiceTermsComponent', () => {
  let component: ClientInvoiceTermsComponent;
  let fixture: ComponentFixture<ClientInvoiceTermsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientInvoiceTermsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientInvoiceTermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

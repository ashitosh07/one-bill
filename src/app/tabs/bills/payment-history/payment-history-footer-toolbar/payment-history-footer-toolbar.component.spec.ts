import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentHistoryFooterToolbarComponent } from './payment-history-footer-toolbar.component';

describe('PaymentHistoryFooterToolbarComponent', () => {
  let component: PaymentHistoryFooterToolbarComponent;
  let fixture: ComponentFixture<PaymentHistoryFooterToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentHistoryFooterToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentHistoryFooterToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

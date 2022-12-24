import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBillPaymentComponent } from './create-bill-payment.component';

describe('CreateBillPaymentComponent', () => {
  let component: CreateBillPaymentComponent;
  let fixture: ComponentFixture<CreateBillPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateBillPaymentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateBillPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

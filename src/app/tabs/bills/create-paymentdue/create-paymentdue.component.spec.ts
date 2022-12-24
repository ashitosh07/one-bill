import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePaymentdueComponent } from './create-paymentdue.component';

describe('CreatePaymentdueComponent', () => {
  let component: CreatePaymentdueComponent;
  let fixture: ComponentFixture<CreatePaymentdueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreatePaymentdueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePaymentdueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

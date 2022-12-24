import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillRefundComponent } from './bill-refund.component';

describe('BillRefundComponent', () => {
  let component: BillRefundComponent;
  let fixture: ComponentFixture<BillRefundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillRefundComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillRefundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

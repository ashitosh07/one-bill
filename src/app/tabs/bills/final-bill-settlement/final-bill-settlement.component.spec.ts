import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalBillSettlementComponent } from './final-bill-settlement.component';

describe('FinalBillSettlementComponent', () => {
  let component: FinalBillSettlementComponent;
  let fixture: ComponentFixture<FinalBillSettlementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinalBillSettlementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinalBillSettlementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

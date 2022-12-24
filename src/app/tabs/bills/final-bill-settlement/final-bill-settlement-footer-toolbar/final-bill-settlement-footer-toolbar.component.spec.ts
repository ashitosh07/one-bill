import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalBillSettlementFooterToolbarComponent } from './final-bill-settlement-footer-toolbar.component';

describe('FinalBillSettlementFooterToolbarComponent', () => {
  let component: FinalBillSettlementFooterToolbarComponent;
  let fixture: ComponentFixture<FinalBillSettlementFooterToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FinalBillSettlementFooterToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FinalBillSettlementFooterToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

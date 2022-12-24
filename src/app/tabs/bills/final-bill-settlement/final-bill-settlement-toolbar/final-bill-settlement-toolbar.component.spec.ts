import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalBillSettlementToolbarComponent } from './final-bill-settlement-toolbar.component';

describe('FinalBillSettlementToolbarComponent', () => {
  let component: FinalBillSettlementToolbarComponent;
  let fixture: ComponentFixture<FinalBillSettlementToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinalBillSettlementToolbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinalBillSettlementToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

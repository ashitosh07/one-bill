import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillHistoryCancelComponent } from './bill-history-cancel.component';

describe('BillHistoryComponent', () => {
  let component: BillHistoryCancelComponent;
  let fixture: ComponentFixture<BillHistoryCancelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillHistoryCancelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillHistoryCancelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

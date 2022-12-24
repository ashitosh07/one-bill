import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillHistoryCancelFooterToolbarComponent } from './bill-history-cancel-footer-toolbar.component';

describe('BillHistoryFooterToolbarComponent', () => {
  let component: BillHistoryCancelFooterToolbarComponent;
  let fixture: ComponentFixture<BillHistoryCancelFooterToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillHistoryCancelFooterToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillHistoryCancelFooterToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

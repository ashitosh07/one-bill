import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillHistoryFooterToolbarComponent } from './bill-history-footer-toolbar.component';

describe('BillHistoryFooterToolbarComponent', () => {
  let component: BillHistoryFooterToolbarComponent;
  let fixture: ComponentFixture<BillHistoryFooterToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillHistoryFooterToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillHistoryFooterToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

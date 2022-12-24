import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceAgingReportFooterToolbarComponent } from './invoice-aging-report-footer-toolbar.component';

describe('BillHistoryFooterToolbarComponent', () => {
  let component: InvoiceAgingReportFooterToolbarComponent;
  let fixture: ComponentFixture<InvoiceAgingReportFooterToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceAgingReportFooterToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceAgingReportFooterToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

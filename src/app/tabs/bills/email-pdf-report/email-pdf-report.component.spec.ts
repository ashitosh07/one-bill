import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailPdfReportComponent } from './email-pdf-report.component';

describe('EmailPdfReportComponent', () => {
  let component: EmailPdfReportComponent;
  let fixture: ComponentFixture<EmailPdfReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmailPdfReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailPdfReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

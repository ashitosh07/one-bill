import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunicationSummaryComponent } from './communication-summary.component';

describe('CommunicationSummaryComponent', () => {
  let component: CommunicationSummaryComponent;
  let fixture: ComponentFixture<CommunicationSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommunicationSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunicationSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

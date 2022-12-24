import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FailedBillsFooterToolbarComponent } from './failed-bills-footer-toolbar.component';

describe('FailedBillsFooterToolbarComponent', () => {
  let component: FailedBillsFooterToolbarComponent;
  let fixture: ComponentFixture<FailedBillsFooterToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FailedBillsFooterToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FailedBillsFooterToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

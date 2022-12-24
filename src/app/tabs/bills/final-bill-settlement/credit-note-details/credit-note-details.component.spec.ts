import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditNoteDetailsComponent } from './credit-note-details.component';

describe('CreditNoteDetailsComponent', () => {
  let component: CreditNoteDetailsComponent;
  let fixture: ComponentFixture<CreditNoteDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreditNoteDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditNoteDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

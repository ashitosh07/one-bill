import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditNoteHistoryToolbarComponent } from './credit-note-toolbar.component';

describe('CreditNoteHistoryToolbarComponent', () => {
  let component: CreditNoteHistoryToolbarComponent;
  let fixture: ComponentFixture<CreditNoteHistoryToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreditNoteHistoryToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditNoteHistoryToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

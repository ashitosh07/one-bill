import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreditNoteHistoryComponent } from './credit-note-history.component';

describe('CreditNoteHistoryComponent', () => {
  let component: CreditNoteHistoryComponent;
  let fixture: ComponentFixture<CreditNoteHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreditNoteHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditNoteHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

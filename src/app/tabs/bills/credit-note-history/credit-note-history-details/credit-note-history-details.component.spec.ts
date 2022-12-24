import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreditNoteHistoryDetailsComponent } from './credit-note-history-details.component';

describe('CreditNoteHistoryDetailsComponent', () => {
  let component: CreditNoteHistoryDetailsComponent;
  let fixture: ComponentFixture<CreditNoteHistoryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreditNoteHistoryDetailsComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditNoteHistoryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

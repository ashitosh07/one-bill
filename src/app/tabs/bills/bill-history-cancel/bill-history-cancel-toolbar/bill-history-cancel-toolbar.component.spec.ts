import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillHistoryToolbarComponent } from './bill-history-cancel-toolbar.component';

describe('BillHistoryToolbarComponent', () => {
  let component: BillHistoryToolbarComponent;
  let fixture: ComponentFixture<BillHistoryToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillHistoryToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillHistoryToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

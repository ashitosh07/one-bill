import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelConfirmationDialogComponent } from './cancel-confirmation-dialog.component';

describe('CancelConfirmationDialogComponent', () => {
  let component: CancelConfirmationDialogComponent;
  let fixture: ComponentFixture<CancelConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CancelConfirmationDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

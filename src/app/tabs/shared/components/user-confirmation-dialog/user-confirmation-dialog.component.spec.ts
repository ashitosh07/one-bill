import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserConfirmationDialogComponent } from './user-confirmation-dialog.component';

describe('UserConfirmationDialogComponent', () => {
  let component: UserConfirmationDialogComponent;
  let fixture: ComponentFixture<UserConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserConfirmationDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

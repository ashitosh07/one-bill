import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserConfirmationPopupComponent } from './user-confirmation-popup.component';

describe('UserConfirmationPopupComponent', () => {
  let component: UserConfirmationPopupComponent;
  let fixture: ComponentFixture<UserConfirmationPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserConfirmationPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserConfirmationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

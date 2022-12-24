import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomValidationErrorsComponent } from './custom-validation-errors.component';

describe('CustomValidationErrorsComponent', () => {
  let component: CustomValidationErrorsComponent;
  let fixture: ComponentFixture<CustomValidationErrorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomValidationErrorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomValidationErrorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

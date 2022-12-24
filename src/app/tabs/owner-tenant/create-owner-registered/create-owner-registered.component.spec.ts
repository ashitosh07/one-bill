import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOwnerRegisteredComponent } from './create-owner-registered.component';

describe('CreateOwnerRegisteredComponent', () => {
  let component: CreateOwnerRegisteredComponent;
  let fixture: ComponentFixture<CreateOwnerRegisteredComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateOwnerRegisteredComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateOwnerRegisteredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

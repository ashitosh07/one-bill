import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateVariablepayComponent } from './create-variablepay.component';

describe('CreateVariablepayComponent', () => {
  let component: CreateVariablepayComponent;
  let fixture: ComponentFixture<CreateVariablepayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateVariablepayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateVariablepayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

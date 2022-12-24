import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariablepayCreateUpdateComponent } from './variablepay-create-update.component';

describe('VariablepayCreateUpdate.ComponentComponent', () => {
  let component: VariablepayCreateUpdateComponent;
  let fixture: ComponentFixture<VariablepayCreateUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VariablepayCreateUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariablepayCreateUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

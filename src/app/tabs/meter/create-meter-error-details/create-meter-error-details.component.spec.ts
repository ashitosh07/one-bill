import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMeterErrorDetailsComponent } from './create-meter-error-details.component';

describe('CreateMeterErrorDetailsComponent', () => {
  let component: CreateMeterErrorDetailsComponent;
  let fixture: ComponentFixture<CreateMeterErrorDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateMeterErrorDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateMeterErrorDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

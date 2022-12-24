import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMeterReplacementComponent } from './create-meter-replacement.component';

describe('CreateMeterreplacementComponent', () => {
  let component: CreateMeterReplacementComponent;
  let fixture: ComponentFixture<CreateMeterReplacementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateMeterReplacementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateMeterReplacementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

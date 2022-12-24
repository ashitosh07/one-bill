import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDeviceDataDetailsComponent } from './create-device-data-details.component';

describe('CreateDeviceDataDetailsComponent', () => {
  let component: CreateDeviceDataDetailsComponent;
  let fixture: ComponentFixture<CreateDeviceDataDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateDeviceDataDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateDeviceDataDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

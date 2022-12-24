import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateServiceDisconnectionComponent } from './create-service-disconnection.component';

describe('CreateServiceDisconnectionComponent', () => {
  let component: CreateServiceDisconnectionComponent;
  let fixture: ComponentFixture<CreateServiceDisconnectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateServiceDisconnectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateServiceDisconnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

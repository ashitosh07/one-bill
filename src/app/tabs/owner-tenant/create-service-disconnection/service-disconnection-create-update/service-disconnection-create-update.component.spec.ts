import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceDisconnectionCreateUpdateComponent } from './service-disconnection-create-update.component';

describe('ServiceDisconnectionCreateUpdateComponent', () => {
  let component: ServiceDisconnectionCreateUpdateComponent;
  let fixture: ComponentFixture<ServiceDisconnectionCreateUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceDisconnectionCreateUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceDisconnectionCreateUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

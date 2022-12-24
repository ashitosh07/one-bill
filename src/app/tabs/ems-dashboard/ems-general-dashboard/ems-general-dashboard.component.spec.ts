import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmsGeneralDashboardComponent } from './ems-general-dashboard.component';

describe('EmsGeneralDashboardComponent', () => {
  let component: EmsGeneralDashboardComponent;
  let fixture: ComponentFixture<EmsGeneralDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmsGeneralDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmsGeneralDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

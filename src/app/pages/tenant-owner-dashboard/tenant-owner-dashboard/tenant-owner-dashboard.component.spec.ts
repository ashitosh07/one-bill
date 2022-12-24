import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantOwnerDashboardComponent } from './tenant-owner-dashboard.component';

describe('TenantOwnerDashboardComponent', () => {
  let component: TenantOwnerDashboardComponent;
  let fixture: ComponentFixture<TenantOwnerDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TenantOwnerDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TenantOwnerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

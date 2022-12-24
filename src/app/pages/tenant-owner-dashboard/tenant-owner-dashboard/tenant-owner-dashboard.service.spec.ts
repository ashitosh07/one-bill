import { TestBed } from '@angular/core/testing';

import { TenantOwnerDashboardService } from './tenant-owner-dashboard.service';

describe('TenantOwnerDashboardService', () => {
  let service: TenantOwnerDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TenantOwnerDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

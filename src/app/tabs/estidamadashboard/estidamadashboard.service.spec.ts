import { TestBed } from '@angular/core/testing';

import { EstidamadashboardService } from './estidamadashboard.service';

describe('EstidamadashboardService', () => {
  let service: EstidamadashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstidamadashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

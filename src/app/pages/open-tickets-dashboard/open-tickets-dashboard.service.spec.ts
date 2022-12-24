import { TestBed } from '@angular/core/testing';

import { OpenTicketsDashboardService } from './open-tickets-dashboard.service';

describe('OpenTicketsDashboardService', () => {
  let service: OpenTicketsDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenTicketsDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

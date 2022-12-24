import { TestBed } from '@angular/core/testing';

import { GeneraldashboardService } from './generaldashboard.service';

describe('GeneraldashboardService', () => {
  let service: GeneraldashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeneraldashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

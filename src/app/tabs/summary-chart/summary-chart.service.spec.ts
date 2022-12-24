import { TestBed } from '@angular/core/testing';

import { SummaryChartService } from './summary-chart.service';

describe('SummaryChartService', () => {
  let service: SummaryChartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SummaryChartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

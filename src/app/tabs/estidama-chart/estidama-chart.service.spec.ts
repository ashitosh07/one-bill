import { TestBed } from '@angular/core/testing';

import { EstidamaChartService } from './estidama-chart.service';

describe('EstidamaChartService', () => {
  let service: EstidamaChartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstidamaChartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

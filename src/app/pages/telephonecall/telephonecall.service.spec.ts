import { TestBed } from '@angular/core/testing';

import { TelephonecallService } from './telephonecall.service';

describe('TelephonecallService', () => {
  let service: TelephonecallService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TelephonecallService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

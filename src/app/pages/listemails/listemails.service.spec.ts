import { TestBed } from '@angular/core/testing';

import { ListemailsService } from './listemails.service';

describe('ListemailsService', () => {
  let service: ListemailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListemailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

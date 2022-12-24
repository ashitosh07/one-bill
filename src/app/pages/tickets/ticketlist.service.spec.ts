import { TestBed } from '@angular/core/testing';

import { TicketlistService } from './ticketlist.service';

describe('TicketlistService', () => {
  let service: TicketlistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TicketlistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

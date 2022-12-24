import { TestBed } from '@angular/core/testing';

import { ClientsettingsService } from './clientsettings.service';

describe('ClientsettingsService', () => {
  let service: ClientsettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientsettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

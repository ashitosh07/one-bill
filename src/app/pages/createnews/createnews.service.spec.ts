import { TestBed } from '@angular/core/testing';

import { CreatenewsService } from './createnews.service';

describe('CreatenewsService', () => {
  let service: CreatenewsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreatenewsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

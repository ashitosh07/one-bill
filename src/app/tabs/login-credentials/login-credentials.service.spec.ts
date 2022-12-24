import { TestBed } from '@angular/core/testing';

import { LoginCredentialsService } from './login-credentials.service';

describe('LoginCredentialsService', () => {
  let service: LoginCredentialsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginCredentialsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

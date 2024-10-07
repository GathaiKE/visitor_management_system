import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { isClientAdminGuard } from './is-client-admin.guard';

describe('isClientAdminGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => isClientAdminGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { isSuperAdminGuard } from './is-super-admin.guard';

describe('isSuperAdminGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => isSuperAdminGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

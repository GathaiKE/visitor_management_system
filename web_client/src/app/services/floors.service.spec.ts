import { TestBed } from '@angular/core/testing';

import { FloorsService } from './floors.service';

describe('FloorsService', () => {
  let service: FloorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FloorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

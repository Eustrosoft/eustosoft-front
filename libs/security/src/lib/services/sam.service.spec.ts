import { TestBed } from '@angular/core/testing';

import { SamService } from './sam.service';

describe('SamServiceService', () => {
  let service: SamService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { AuctionUsersService } from './auction-users.service';

describe('AuctionUsersService', () => {
  let service: AuctionUsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuctionUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerAuctionsDetailsComponent } from './seller-auctions-details.component';

describe('SellerAuctionsDetailsComponent', () => {
  let component: SellerAuctionsDetailsComponent;
  let fixture: ComponentFixture<SellerAuctionsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerAuctionsDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SellerAuctionsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

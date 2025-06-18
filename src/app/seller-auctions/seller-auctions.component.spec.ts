import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerAuctionsComponent } from './seller-auctions.component';

describe('SellerAuctionsComponent', () => {
  let component: SellerAuctionsComponent;
  let fixture: ComponentFixture<SellerAuctionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerAuctionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SellerAuctionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

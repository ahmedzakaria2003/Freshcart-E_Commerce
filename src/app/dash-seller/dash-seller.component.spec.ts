import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashSellerComponent } from './dash-seller.component';

describe('DashSellerComponent', () => {
  let component: DashSellerComponent;
  let fixture: ComponentFixture<DashSellerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashSellerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashSellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllOrderProductsComponent } from './all-order-products.component';

describe('AllOrderProductsComponent', () => {
  let component: AllOrderProductsComponent;
  let fixture: ComponentFixture<AllOrderProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllOrderProductsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllOrderProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

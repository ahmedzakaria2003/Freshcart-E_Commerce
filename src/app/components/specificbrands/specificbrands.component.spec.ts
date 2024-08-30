import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecificbrandsComponent } from './specificbrands.component';

describe('SpecificbrandsComponent', () => {
  let component: SpecificbrandsComponent;
  let fixture: ComponentFixture<SpecificbrandsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecificbrandsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpecificbrandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

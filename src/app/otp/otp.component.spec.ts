import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpComponent } from './otp.component';

describe('OTPComponent', () => {
  let component: OtpComponent;
  let fixture: ComponentFixture<OtpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OtpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

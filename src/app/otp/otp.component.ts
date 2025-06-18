import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import emailjs from 'emailjs-com'; // استيراد EmailJS

@Component({
  selector: 'app-otp',
  standalone: true,
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class OtpComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  otpForm: FormGroup = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
  });

  isFailed: boolean = false;
  email: string = localStorage.getItem('userEmail') || ''; // الإيميل من localStorage

  ngOnInit(): void {
    // توليد OTP وإرساله عبر الإيميل
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem('otpCode', generatedOtp);
    this.sendOtpEmail(generatedOtp);

    // إزالة الـ OTP من localStorage بعد 10 دقايق (600,000 مللي ثانية)
    setTimeout(() => {
      localStorage.removeItem('otpCode');
    }, 600000); // 10 دقايق
  }
sendOtpEmail(otp: string) {
  if (!this.email) {
    this.isFailed = true;
    return;
  }

  const templateParams = {
    name: 'User',        // لو عندك اسم المستخدم في localStorage خليه ديناميكي
    email: this.email,   // لازم يتطابق مع {{email}} في EmailJS Template
    otp: otp             // لازم يتطابق مع {{otp}} في EmailJS Template
  };

  emailjs.send(
    'service_sl5gh1g',         // ✅ Service ID بتاعك
    'template_vg9cgqa',        // ✅ Template ID بتاعك
    templateParams,
    'ehB_nRjNMkg89eJpK'        // ✅ Public Key بتاعك
  ).then((response) => {
    console.log('✅ OTP sent successfully:', response);
  }).catch((error) => {
    console.error('❌ Failed to send OTP:', error);
    this.isFailed = true;
  });
}

  verifyOTP(): void {
    const enteredOTP = this.otpForm.value.otp;
    const storedOTP = localStorage.getItem('otpCode');

    if (enteredOTP === storedOTP) {
      this.isFailed = false;
      localStorage.removeItem('otpCode');
      localStorage.setItem('isVerified', 'true'); // تحديد التحقق
      this.router.navigate(['/home']); // توجيه للـ Dashboard
    } else {
      this.isFailed = true;
    }
  }
}

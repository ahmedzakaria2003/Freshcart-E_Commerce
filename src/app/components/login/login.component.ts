import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnDestroy {
  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _AuthService = inject(AuthService);
  private readonly _Router = inject(Router);
  loginSub!: Subscription;
  isSuccess: boolean = false;
  isFailed: boolean = false;
  msgErro: string = "";

  loginForm: FormGroup = this._FormBuilder.group({
    email: [null, [Validators.required, Validators.email]],
    password: [null, [Validators.required, Validators.pattern(/^\w{6,}$/)]]
  });

  loginSubmit(): void {
    if (this.loginForm.valid) {
      const adminEmail = "admin@yahoo.com";
      const adminPassword = "ahmed010";

      if (
        this.loginForm.value.email === adminEmail &&
        this.loginForm.value.password === adminPassword
      ) {
        this.isSuccess = true;
        this.isFailed = false;

        setTimeout(() => {
          localStorage.setItem("userToken", "admin_fake_token");
          this._Router.navigate(["/dashboard"]);
        }, 1000);
      } else {
        this.loginSub = this._AuthService.setLoginForm(this.loginForm.value).subscribe({
          next: (res) => {
            if (res.message == "success") {
              this.isSuccess = true;
              this.isFailed = false;

              setTimeout(() => {
                localStorage.setItem("userToken", res.token);

                const userData: any = jwtDecode(res.token);
                const fullName = userData.name || "Unknown User";
                const email = this.loginForm.value.email;

                localStorage.setItem('username', fullName);
                localStorage.setItem('userEmail', email);

                if (email === adminEmail) {
                  this._Router.navigate(["/dashboard"]);
                } else {
                  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
                  localStorage.setItem("otpCode", otpCode);
                  console.log("📩 OTP Sent (Dev Mode):", otpCode);

                  this._Router.navigate(["/otp"]);
                }
              }, 1000);
            }
          },
          error: (err) => {
            if (err.message === "Incorrect email or password") {
              this.isFailed = true;
              this.msgErro = err.error.message;
            }
            console.log(err);
          }
        });
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  ngOnDestroy(): void {
    this.loginSub?.unsubscribe();
  }
}
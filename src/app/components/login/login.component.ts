import { Component, ElementRef, HostListener, ViewChild, viewChild, input, inject, OnDestroy } from '@angular/core';
import { EmailValidator, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { EmptyError, Subscription } from 'rxjs';

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
  loginSub !: Subscription;
  isSuccess: boolean = false;
  isFailed: boolean = false;
  msgErro: string = "";
  loginForm: FormGroup = this._FormBuilder.group({

    email: [null, [Validators.required, Validators.email]],

    password: [null, [Validators.required, Validators.pattern(/^\w{6,}$/)]]

  })


  loginSubmit(): void {
    if (this.loginForm.valid) {
      this.loginSub = this._AuthService.setLoginForm(this.loginForm.value).subscribe({
        next: (res) => {
          if (res.message == "success") {
            this.isSuccess = true;
            this.isFailed = false;

            setTimeout(() => {
              // 1- save token
              localStorage.setItem('userToken', res.token)


              // 2- decode token
              this._AuthService.saveUserData();

              // 3- navigate to home

              this._Router.navigate(['/home']);
            }, 1000);
          }

        },
        error: (err) => {
          if (err.message = "Incorrect email or password") {
            this.isFailed = true
            this.msgErro = err.error.message;
          }
          console.log(err);
        }

      })
    }
    else {
      this.loginForm.markAllAsTouched();
    }
  }


  ngOnDestroy(): void {
    this.loginSub?.unsubscribe();

  }
}

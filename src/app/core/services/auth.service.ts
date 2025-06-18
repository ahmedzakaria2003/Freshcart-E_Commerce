import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private _HttpClient: HttpClient, 
    private _Router: Router
  ) {}

  userData: any = null;

  // 🛠️ دالة تسجيل المستخدم
  setRegisterForm(data: object): Observable<any> {
    return this._HttpClient.post(`${environment.baseUrl}/api/v1/auth/signup`, data);
  }

  // 🛠️ دالة تسجيل الدخول
  setLoginForm(data: object): Observable<any> {
    return this._HttpClient.post(`${environment.baseUrl}/api/v1/auth/signin`, data);
  }

  // ✅ دالة لاسترجاع بيانات المستخدم باستخدام الإيميل من الـ API
  getUserByEmail(email: string): Observable<any> {
    return this._HttpClient.get(`${environment.baseUrl}/api/v1/users?email=${email}`);
  }

  // 🛠️ حفظ بيانات المستخدم بعد تسجيل الدخول
saveUserData(): void {
  const token = localStorage.getItem('userToken');

  if (token !== null) {
    // ✅ فك التوكن باستخدام `jwtDecode`
    this.userData = jwtDecode(token);
    console.log("🔍 Decoded Token Data:", this.userData);

    // ✅ استخراج البيانات من التوكن
    const userId = this.userData.id;
    const username = this.userData.name || "Unknown User";

    // ✅ حفظ البيانات في `localStorage`
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
  }
}

  // 🛠️ دالة تسجيل الخروج
  logOut(): void {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userEmail');
    this.userData = null;
    this._Router.navigate(['/login']);
  }

  // 🛠️ دالة نسيان كلمة المرور
  forgetPassword(data: object): Observable<any> {
    return this._HttpClient.post(`${environment.baseUrl}/api/v1/auth/forgotPasswords`, data);
  }

  // 🛠️ دالة إعادة تعيين كلمة المرور
  resetPassword(data: object): Observable<any> {
    return this._HttpClient.put(`${environment.baseUrl}/api/v1/auth/resetPassword`, data);
  }

  // 🛠️ دالة التحقق من كود إعادة التعيين
  resetCode(data: object): Observable<any> {
    return this._HttpClient.post(`${environment.baseUrl}/api/v1/auth/verifyResetCode`, data);
  }
}

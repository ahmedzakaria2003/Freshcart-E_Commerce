import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // استيراد Router من @angular/router
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule], // تأكيد إضافة RouterModule
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private router = inject(Router); // استخدام inject بدل Constructor (طريقة حديثة)

  ngOnInit(): void {
    // توجيه تلقائي لـ /dashboard/home-dash لما الصفحة تتحمل
    this.router.navigate(['/dashboard/home-dash']);
  }

  logout() {
    localStorage.removeItem('userToken');
    window.location.href = '/login';
  }
}

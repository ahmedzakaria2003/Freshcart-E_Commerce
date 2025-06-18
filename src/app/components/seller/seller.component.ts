import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ChatComponent } from "../../chat/chat.component";

@Component({
  selector: 'app-seller',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ChatComponent],
  templateUrl: './seller.component.html',
  styleUrl: './seller.component.scss'
})
export class SellerComponent {

constructor(private router: Router) {} // إضافة Router

  ngOnInit(): void {
    // توجيه تلقائي لـ /seller/sellerreport لما الصفحة تتحمل
    this.router.navigate(['/seller/sellerreport']);
  }
  
}

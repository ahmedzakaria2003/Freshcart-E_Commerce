import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pay.component.html',
  styleUrls: ['./pay.component.scss']
})
export class PayComponent implements OnInit {
  totalAmount: number = 0;
  auctionId: number | null = null;
  paymentForm: FormGroup;

  constructor(private route: ActivatedRoute, private fb: FormBuilder) {
    this.paymentForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      cardNumber: ['', [Validators.required, this.cardNumberValidator()]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvc: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
      cardholderName: ['', Validators.required],
      country: ['Egypt', Validators.required],
      saveInfo: [false]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.totalAmount = +params['totalAmount'] || 0;
      this.auctionId = +params['auctionId'] || null;
    });

    const token = localStorage.getItem("userToken");
    const userData = this.decodeToken(token);
    const userEmail = userData.email || '';
    this.paymentForm.patchValue({ email: userEmail });
  }

  cardNumberValidator() {
    return (control: any) => {
      if (!control.value) return null;
      const cleanedValue = this.cleanCardNumber(control.value);
      const isValid = /^\d{16}$/.test(cleanedValue);
      return isValid ? null : { pattern: true };
    };
  }

  cleanCardNumber(value: string): string {
    return value.replace(/\D/g, '');
  }

  formatCardNumber(event: any) {
    let value = this.cleanCardNumber(event.target.value);
    value = value.replace(/(\d{4})/g, '$1 ').trim();
    this.paymentForm.get('cardNumber')?.setValue(value, { emitEvent: false });
  }

  formatExpiryDate(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 3) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.paymentForm.get('expiryDate')?.setValue(value);
  }

  confirmPayment() {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    if (this.auctionId === null) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Auction ID is missing. Please try again.',
        confirmButtonText: 'OK'
      });
      return;
    }

    const token = localStorage.getItem("userToken");
    const userData = this.decodeToken(token);
    const userId = userData.email || userData.name || "defaultUser";

    let wonAuctions = JSON.parse(localStorage.getItem('wonAuctions') || '{}');
    if (!wonAuctions[userId]) {
      wonAuctions[userId] = [];
    }

    const paidAuction = wonAuctions[userId].find(
      (auction: any) => auction.id === this.auctionId
    );
    wonAuctions[userId] = wonAuctions[userId].filter(
      (auction: any) => auction.id !== this.auctionId
    );

    localStorage.setItem('wonAuctions', JSON.stringify(wonAuctions));

    let paidAuctions = JSON.parse(localStorage.getItem('paidAuctions') || '{}');
    if (!paidAuctions[userId]) {
      paidAuctions[userId] = [];
    }
    if (paidAuction) {
      paidAuctions[userId].push({
        id: this.auctionId,
        title: paidAuction.title,
        amount: this.totalAmount,
        paidAt: new Date().toISOString()
      });
    }
    localStorage.setItem('paidAuctions', JSON.stringify(paidAuctions));

    Swal.fire({
      icon: 'success',
      title: 'Payment Successful',
      text: `You have successfully paid EGP ${this.totalAmount} for this auction!`,
      confirmButtonText: 'OK',
      timer: 2000
    }).then(() => {
      window.location.href = '/profile';
    });
  }

  decodeToken(token: string | null): any {
    if (!token) return {};
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }
}
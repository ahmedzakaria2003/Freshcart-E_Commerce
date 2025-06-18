import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2'; // تأكد إن المكتبة مضافة

@Component({
  selector: 'app-admin-seller',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './admin-seller.component.html',
  styleUrls: ['./admin-seller.component.scss']
})
export class AdminSellerComponent implements OnInit {
  sellerAuctions: any[] = [];

  constructor() {}

  ngOnInit(): void {
    this.loadSellerAuctions();
  }

  private loadSellerAuctions(): void {
    const allAuctions = this.getAllAuctions();
    console.log('All Auctions:', allAuctions); // Debugging
    this.sellerAuctions = allAuctions;
  }

  private getAllAuctions(): any[] {
    let allAuctions: any[] = [];
    for (let key in localStorage) {
      if (key.startsWith('auctions-seller-')) {
        try {
          const sellerAuctions = JSON.parse(localStorage.getItem(key) || '[]');
          allAuctions.push(...sellerAuctions);
        } catch (e) {
          console.error(`Error parsing auctions for key ${key}:`, e);
        }
      }
    }
    return allAuctions;
  }

  getAuctionStatus(auction: any): string {
    const endTime = new Date(auction.endTime);
    const now = new Date();
    return endTime > now ? 'Open' : 'Closed';
  }

  flagAsProblem(id: number): void {
    const auction = this.sellerAuctions.find(a => a.id === id);
    if (auction) {
      auction.hasProblem = true;
      this.updateAuctionData(auction);
      alert(`Auction "${auction.name}" has been flagged as a problem at ${new Date().toLocaleString()}`);
    }
  }

  adminDeleteAuction(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action will permanently delete the auction!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.sellerAuctions = this.sellerAuctions.filter(a => a.id !== id);
        this.updateAuctionData();
        Swal.fire({
          title: 'Deleted!',
          text: 'The auction has been deleted successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
          timer: 2000
        });
      }
    });
  }

  private updateAuctionData(auction?: any): void {
    const allAuctions = this.getAllAuctions();
    const updatedAuctions = auction ? allAuctions.map(a => a.id === auction.id ? auction : a) : this.sellerAuctions;
    const sellerIds = [...new Set(updatedAuctions.map((auction: any) => auction.sellerId))];
    sellerIds.forEach(sellerId => {
      const auctionsForSeller = updatedAuctions.filter((auction: any) => auction.sellerId === sellerId);
      localStorage.setItem(`auctions-seller-${sellerId}`, JSON.stringify(auctionsForSeller));
    });
  }
}
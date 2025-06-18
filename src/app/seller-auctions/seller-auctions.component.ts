import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seller-auctions',
  standalone: true,
  imports: [],
  templateUrl: './seller-auctions.component.html',
  styleUrl: './seller-auctions.component.scss'
})
export class SellerAuctionsComponent {
  auctions: any[] = [];
  auctionTimer: any;

  private router = inject(Router);

  ngOnInit(): void {
    this.loadAllAuctions();
  }

  private loadAllAuctions() {
    this.auctions = [];

    for (let key in localStorage) {
      if (key.startsWith('auctions-seller-')) {
        const sellerAuctions = JSON.parse(localStorage.getItem(key) || '[]');
        this.auctions.push(...sellerAuctions);
      }
    }

    this.auctions.sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());
  }

  viewAuctionDetails(auctionId: number) {
    this.router.navigate([`/auction-details/${auctionId}`]); 
  }

  isAuctionOpen(auction: any): boolean {
    return new Date().getTime() < new Date(auction.endTime).getTime();
  }

  isAuctionEnded(auction: any): boolean {
    return new Date().getTime() >= new Date(auction.endTime).getTime();
  }

  getTimeLeft(endTime: string): string {
    const endDate = new Date(endTime).getTime();
    const currentDate = new Date().getTime();
    const timeLeft = endDate - currentDate;

    if (timeLeft <= 0) {
      return 'Auction Ended';
    }

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  startAuctionTimer(auction: any) {
    if (this.isAuctionOpen(auction)) {
      this.auctionTimer = setInterval(() => {
        auction.timeLeft = this.getTimeLeft(auction.endTime); 
        if (this.isAuctionEnded(auction)) {
          clearInterval(this.auctionTimer); 
        }
      }, 1000);
    }
  }
}

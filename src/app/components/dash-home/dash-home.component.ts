import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dash-home',
  standalone: true,
  imports: [DatePipe, CommonModule, FormsModule],
  templateUrl: './dash-home.component.html',
  styleUrl: './dash-home.component.scss'
})
export class DashHomeComponent implements OnInit {
  auctions: any[] = [];
  totalAuctions: number = 0;
  openAuctions: number = 0;
  closedAuctions: number = 0;
  totalBids: number = 0;
  selectedAuction: any = null;

  mostBiddersAuction: any = {};
  highestBidAuction: any = {};
  categoryDistribution: { [key: string]: number } = {};
  mostActiveBidder: string = '';
  mostActiveBidderCount: number = 0;

  get categoryKeys(): string[] {
    return Object.keys(this.categoryDistribution);
  }

  ngOnInit(): void {
    this.loadAuctions();
    this.calculateStats();
  }

  loadAuctions() {
    const auctions = JSON.parse(localStorage.getItem('auctions') || '[]');
    this.auctions = auctions;
  }

  calculateStats() {
    const now = new Date().getTime();
    this.totalAuctions = this.auctions.length;
    this.openAuctions = this.auctions.filter(a => new Date(a.endTime).getTime() > now).length;
    this.closedAuctions = this.auctions.filter(a => new Date(a.endTime).getTime() <= now).length;
    this.totalBids = this.auctions.reduce((sum, auction) => sum + (auction.bids?.length || 0), 0);

    this.mostBiddersAuction = this.auctions.reduce((maxAuction, auction) => {
      return (auction.bids?.length || 0) > (maxAuction.bids?.length || 0) ? auction : maxAuction;
    }, {});

    this.highestBidAuction = this.auctions.reduce((maxAuction, auction) => {
      const currentHighest = auction.bids?.length ? Math.max(...auction.bids.map((bid: any) => bid.amount)) : null;
      const maxHighest = maxAuction.bids?.length ? Math.max(...maxAuction.bids.map((bid: any) => bid.amount)) : null;
      return (currentHighest !== null && (currentHighest > (maxHighest || 0))) ? auction : maxAuction;
    }, {});

    this.categoryDistribution = {};
    this.auctions.forEach(auction => {
      const cat = auction.category || 'Unspecified';
      this.categoryDistribution[cat] = (this.categoryDistribution[cat] || 0) + 1;
    });

    const bidderCount: { [key: string]: number } = {};
    this.auctions.forEach(auction => {
      auction.bids?.forEach((bid: any) => {
        const username = bid.username;
        if (username) {
          bidderCount[username] = (bidderCount[username] || 0) + 1;
        }
      });
    });

    let maxBidder = '';
    let maxBidCount = 0;
    for (const bidder in bidderCount) {
      if (bidderCount[bidder] > maxBidCount) {
        maxBidCount = bidderCount[bidder];
        maxBidder = bidder;
      }
    }
    this.mostActiveBidder = maxBidder;
    this.mostActiveBidderCount = maxBidCount;
  }

  viewAuctionDetails(auction: any) {
    this.selectedAuction = auction;
  }

  closeDetailsModal() {
    this.selectedAuction = null;
  }

  getAuctionStatus(auction: any): string {
    const now = new Date().getTime();
    return now >= new Date(auction.endTime).getTime() ? 'Closed' : 'Open';
  }

  getHighestBid(auction: any): string {
    if (!auction.bids || auction.bids.length === 0) {
      return 'Not Bid Yet';
    }
    const highest = Math.max(...auction.bids.map((bid: any) => {
      // تحقق من إن bid.amount موجود وهو عدد
      if (typeof bid.amount !== 'number' || isNaN(bid.amount)) {
        console.error('Invalid bid amount found:', bid);
        return 0; // أو قيمة Default لو فيه خطأ
      }
      return bid.amount;
    }));
    return `$${highest}`;
  }

  printAuctionDetails(): void {
    const printContents = document.getElementById('auctionDetailsModal')?.innerHTML;
    if (printContents) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      location.reload();
    }
  }

  printReport(): void {
    window.print();
  }
}
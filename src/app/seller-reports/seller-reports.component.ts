import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-seller-report',
  standalone: true,
  imports: [DatePipe, CommonModule, FormsModule],
  templateUrl: './seller-reports.component.html',
  styleUrl: './seller-reports.component.scss'
})

export class SellerReportComponent implements OnInit {
  auctions: any[] = [];
  totalAuctions: number = 0;
  openAuctions: number = 0;
  closedAuctions: number = 0;
  totalBids: number = 0;
  selectedAuction: any = null;
  highestBidAuction: any = {};
  mostActiveAuction: any = {};

  ngOnInit(): void {
    this.loadAuctions();
    this.calculateStats();
  }

  private loadAuctions(): void {
    const token = localStorage.getItem('userToken');
    const userData = this.decodeToken(token);
    const sellerId = userData.id;

    let allAuctions: any[] = [];
    const key = `auctions-seller-${sellerId}`;
    const sellerAuctions = JSON.parse(localStorage.getItem(key) || '[]');
    allAuctions.push(...sellerAuctions);
    this.auctions = allAuctions;
  }

  private decodeToken(token: string | null): any {
    if (!token) return {};
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(jsonPayload);
  }

  calculateStats(): void {
    const now = new Date().getTime();
    this.totalAuctions = this.auctions.length;
    this.openAuctions = this.auctions.filter(a => new Date(a.endTime).getTime() > now).length;
    this.closedAuctions = this.auctions.filter(a => new Date(a.endTime).getTime() <= now).length;
    this.totalBids = this.auctions.reduce((sum, auction) => sum + (auction.bids?.length || 0), 0);

    // تحسين حساب Highest Bid
    this.highestBidAuction = this.auctions.reduce((maxAuction, auction) => {
      const currentHighest = auction.bids?.length ? Math.max(...auction.bids.map((bid: any) => bid.amount)) : null;
      const maxHighest = maxAuction.bids?.length ? Math.max(...maxAuction.bids.map((bid: any) => bid.amount)) : null;
      return (currentHighest !== null && (currentHighest > (maxHighest || 0))) ? auction : maxAuction;
    }, {});

    // تحسين حساب Most Active Auction
    this.mostActiveAuction = this.auctions.reduce((maxAuction, auction) => {
      return (auction.bids?.length || 0) > (maxAuction.bids?.length || 0) ? auction : maxAuction;
    }, {});
  }

  viewAuctionDetails(auction: any): void {
    this.selectedAuction = auction;
  }

  closeDetailsModal(): void {
    this.selectedAuction = null;
  }

  getAuctionStatus(auction: any): string {
    const now = new Date().getTime();
    return now >= new Date(auction.endTime).getTime() ? 'Closed' : 'Open';
  }

  getHighestBid(auction: any): string {
    return auction.bids?.length ? `$${Math.max(...auction.bids.map((bid: any) => bid.amount))}` : 'Not Bid Yet';
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
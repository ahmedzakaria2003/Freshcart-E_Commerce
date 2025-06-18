import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ChatComponent } from "../../chat/chat.component";

@Component({
  standalone: true,
  selector: 'app-auction-list',
  templateUrl: './auction-users.component.html',
  styleUrls: ['./auction-users.component.scss'],
  imports: [DatePipe, FormsModule, CommonModule, ChatComponent]
})
export class AuctionListComponent implements OnInit {
  auctions: any[] = [];
  auctionTimer: any;
  private router = inject(Router);

  searchTerm: string = '';
  selectedFilter: string = 'name';
  statusFilter: string = 'all'; // all | open | closed | endingSoon
  sortBy: string = ''; // priceAsc | priceDesc | timeAsc | timeDesc

  ngOnInit(): void {
    const savedAuctions = localStorage.getItem('auctions');
    this.auctions = savedAuctions ? JSON.parse(savedAuctions) : [];
  }

  addAuction(newAuction: any) {
    this.auctions.push(newAuction);
    localStorage.setItem('auctions', JSON.stringify(this.auctions));
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
    const timeLeft = new Date(endTime).getTime() - new Date().getTime();
    if (timeLeft <= 0) return 'Auction Ended';

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  }

  isEndingSoon(auction: any): boolean {
    const timeLeft = new Date(auction.endTime).getTime() - new Date().getTime();
    return timeLeft > 0 && timeLeft <= 5 * 60 * 1000; 
  }

  getFilteredAuctions(): any[] {
    let filtered = this.auctions.filter((auction) => {
      const field = (auction[this.selectedFilter] || '').toLowerCase();
      const search = this.searchTerm.toLowerCase();
      const matchesSearch = field.includes(search);

      const isOpen = this.isAuctionOpen(auction);
      const isClosed = this.isAuctionEnded(auction);
      const isSoon = this.isEndingSoon(auction);

      if (this.statusFilter === 'open' && !isOpen) return false;
      if (this.statusFilter === 'closed' && !isClosed) return false;
      if (this.statusFilter === 'endingSoon' && !isSoon) return false;

      return matchesSearch;
    });

    switch (this.sortBy) {
      case 'priceAsc':
        filtered.sort((a, b) => a.currentBid - b.currentBid);
        break;
      case 'priceDesc':
        filtered.sort((a, b) => b.currentBid - a.currentBid);
        break;
      case 'timeAsc':
        filtered.sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime());
        break;
      case 'timeDesc':
        filtered.sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());
        break;
    }

    return filtered;
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

import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-seller-auctions-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seller-auctions-details.component.html',
  styleUrls: ['./seller-auctions-details.component.scss']
})
export class SellerAuctionsDetailsComponent implements OnInit {
  auction: any;
  newBid: number = 0;
  bidHistory: { username: string; amount: number }[] = [];
  timeLeft: string = '';
  auctionEnded: boolean = false;
  winner: string | null = null;
  paymentAmount: number = 50;
  enteredAmount: number = 0;
  showPaymentPopup: boolean = false;
  isBidDisabled: boolean = true;
  isSeller: boolean = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const auctionId = +this.route.snapshot.paramMap.get('id')!;

    const token = localStorage.getItem("userToken");
    const userData = this.decodeToken(token);
    const currentUserId = userData.id || null;

    const allAuctions = this.getAllAuctions();
    this.auction = allAuctions.find((auction: any) => auction.id === auctionId);

    if (this.auction) {
      this.isSeller = this.auction.sellerId === currentUserId;
      this.bidHistory = this.auction.bids || [];
      this.calculateTimeLeft();

      if (!this.isSeller) {
        const paymentKey = `hasPaid_${currentUserId}_${auctionId}`;
        this.isBidDisabled = localStorage.getItem(paymentKey) !== 'true';
      }
    }
  }

  private getAllAuctions(): any[] {
    let allAuctions: any[] = [];
    for (let key in localStorage) {
      if (key.startsWith('auctions-seller-')) {
        const sellerAuctions = JSON.parse(localStorage.getItem(key) || '[]');
        allAuctions.push(...sellerAuctions);
      }
    }
    return allAuctions;
  }

  openPaymentPopup(): void {
    this.showPaymentPopup = true;
  }

  makePayment(): void {
    if (this.enteredAmount >= this.paymentAmount) {
      const token = localStorage.getItem("userToken");
      const userData = this.decodeToken(token);
      const userId = userData.id;
      const auctionId = this.auction.id;

      const paymentKey = `hasPaid_${userId}_${auctionId}`;
      localStorage.setItem(paymentKey, 'true');
      this.isBidDisabled = false;
      this.showPaymentPopup = false;

      Swal.fire({
        icon: 'success',
        title: 'Payment Successful',
        text: 'You can now place your bid for this auction!',
        confirmButtonText: 'OK',
        timer: 2000
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Amount',
        text: 'Please pay the required symbolic amount',
        confirmButtonText: 'Try Again'
      });
    }
  }

  placeBid(newBid: number) {
    if (this.isBidDisabled) {
      Swal.fire({
        icon: 'warning',
        title: 'Please pay the required amount before placing a bid.',
        confirmButtonText: 'OK'
      });
      this.openPaymentPopup();
      return;
    }

    if (newBid > this.auction.currentBid) {
      const token = localStorage.getItem("userToken");
      const userData = this.decodeToken(token);
      const username = userData.name || userData.email?.split('@')[0] || 'Unknown';
      const newBidDetails = { username, amount: newBid };

      this.bidHistory.push(newBidDetails);
      this.auction.currentBid = newBid;
      this.auction.bids = this.bidHistory;

      this.updateAuctionData();
      this.saveActiveBid(this.auction, newBid);

      Swal.fire({
        icon: 'success',
        title: 'Your bid has been accepted!',
        text: `Your bid of $${newBid} has been placed.`,
        confirmButtonText: 'OK',
        timer: 2000
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Your bid must be higher than the current price.',
        confirmButtonText: 'Try Again'
      });
    }
  }

  private saveActiveBid(auction: any, bidAmount: number): void {
    const token = localStorage.getItem("userToken");
    const userData = this.decodeToken(token);
    const userId = userData.email || userData.name || "defaultUser";

    let activeBids = JSON.parse(localStorage.getItem('activeBids') || '{}');

    if (!activeBids[userId]) {
      activeBids[userId] = [];
    }

    const existingBidIndex = activeBids[userId].findIndex((bid: any) => bid.auctionId === auction.id);

    const newBid = {
      auctionId: auction.id,
      amount: bidAmount,
      date: new Date().toISOString()
    };

    if (existingBidIndex !== -1) {
      activeBids[userId][existingBidIndex] = newBid;
    } else {
      activeBids[userId].push(newBid);
    }

    localStorage.setItem('activeBids', JSON.stringify(activeBids));
  }

  private updateAuctionData() {
    let allAuctions = this.getAllAuctions();

    const auctionIndex = allAuctions.findIndex((auction: any) => auction.id === this.auction.id);
    if (auctionIndex !== -1) {
      allAuctions[auctionIndex] = { ...this.auction, bids: this.bidHistory };
    } else {
      allAuctions.push({ ...this.auction, bids: this.bidHistory });
    }

    const sellerAuctions = allAuctions.filter((auction: any) => auction.sellerId === this.auction.sellerId);
    localStorage.setItem(`auctions-seller-${this.auction.sellerId}`, JSON.stringify(sellerAuctions));

    const otherAuctions = allAuctions.filter((auction: any) => auction.sellerId !== this.auction.sellerId);
    const sellerIds = [...new Set(otherAuctions.map((auction: any) => auction.sellerId))];
    sellerIds.forEach(sellerId => {
      const auctionsForSeller = otherAuctions.filter((auction: any) => auction.sellerId === sellerId);
      localStorage.setItem(`auctions-seller-${sellerId}`, JSON.stringify(auctionsForSeller));
    });

    localStorage.setItem(`auctionDetails_${this.auction.id}`, JSON.stringify(this.auction));
  }

  calculateTimeLeft() {
    const endTime = new Date(this.auction.endTime).getTime();
    const currentTime = new Date().getTime();
    const timeRemaining = endTime - currentTime;

    if (timeRemaining <= 0) {
      this.auctionEnded = true;
      this.timeLeft = 'Auction Ended';
      this.declareWinner();
    } else {
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
      this.timeLeft = `${hours}h ${minutes}m ${seconds}s`;
    }
    setTimeout(() => this.calculateTimeLeft(), 1000);
  }

  declareWinner() {
    if (this.auction.status === 'Closed') return;

    if (this.bidHistory.length > 0) {
      const highestBid = this.bidHistory.reduce((maxBid, bid) => bid.amount > maxBid.amount ? bid : maxBid);

      this.winner = `Winner: ${highestBid.username} with a bid of $${highestBid.amount}`;
      this.auction.winner = highestBid.username;
      this.auction.winnerAmount = highestBid.amount;
      this.auction.status = 'Closed';

      this.bidHistory = this.bidHistory.map(bid => ({
        ...bid,
        status: bid.username.toLowerCase() === highestBid.username.toLowerCase() && bid.amount === highestBid.amount ? 'Winner' : 'Loser'
      }));
      this.auction.bids = this.bidHistory;

      this.updateAuctionData();
      this.saveWonAuction(this.auction, highestBid.username);

      const participants = [...new Set(this.bidHistory.map(bid => bid.username).filter((username: string) => username))];
      participants.forEach(participant => {
        if (participant.toLowerCase() !== highestBid.username.toLowerCase()) {
          this.saveLostAuction(this.auction, participant);
        }
      });

      const token = localStorage.getItem("userToken");
      const userData = this.decodeToken(token);
      const userId = userData.email || userData.name || "defaultUser";
      this.removeFromActiveBids(this.auction.id, userId);
    }
  }

  saveWonAuction(auction: any, winnerUsername: string): void {
    let wonAuctions = JSON.parse(localStorage.getItem('wonAuctions') || '{}');
    let lostAuctions = JSON.parse(localStorage.getItem('lostAuctions') || '{}');

    Object.keys(wonAuctions).forEach(user => {
      if (user.toLowerCase() !== winnerUsername.toLowerCase()) {
        wonAuctions[user] = wonAuctions[user]?.filter((wonAuction: any) => wonAuction.id !== auction.id) || [];
      }
    });

    if (!wonAuctions[winnerUsername]) wonAuctions[winnerUsername] = [];

    const auctionData = {
      id: auction.id,
      title: auction.name || "Untitled Auction",
      winnerAmount: auction.winnerAmount,
      endTime: auction.endTime
    };

    const existingAuctionIndex = wonAuctions[winnerUsername].findIndex((wonAuction: any) => wonAuction.id === auction.id);
    if (existingAuctionIndex !== -1) {
      wonAuctions[winnerUsername][existingAuctionIndex] = auctionData;
    } else {
      wonAuctions[winnerUsername].push(auctionData);
    }

    if (lostAuctions[winnerUsername]) {
      lostAuctions[winnerUsername] = lostAuctions[winnerUsername].filter((lostAuction: any) => lostAuction.id !== auction.id);
    }

    localStorage.setItem('wonAuctions', JSON.stringify(wonAuctions));
    localStorage.setItem('lostAuctions', JSON.stringify(lostAuctions));
  }

  saveLostAuction(auction: any, loserUsername: string): void {
    let wonAuctions = JSON.parse(localStorage.getItem('wonAuctions') || '{}');
    let lostAuctions = JSON.parse(localStorage.getItem('lostAuctions') || '{}');

    if (wonAuctions[loserUsername]?.some((wonAuction: any) => wonAuction.id === auction.id)) return;

    if (!lostAuctions[loserUsername]) lostAuctions[loserUsername] = [];

    const auctionData = {
      id: auction.id,
      title: auction.name || "Untitled Auction",
      winner: auction.winner,
      winnerAmount: auction.winnerAmount,
      endTime: auction.endTime
    };

    const existingAuctionIndex = lostAuctions[loserUsername].findIndex((lostAuction: any) => lostAuction.id === auction.id);
    if (existingAuctionIndex === -1) {
      lostAuctions[loserUsername].push(auctionData);
    } else {
      lostAuctions[loserUsername][existingAuctionIndex] = auctionData;
    }

    localStorage.setItem('lostAuctions', JSON.stringify(lostAuctions));
  }

  removeFromActiveBids(auctionId: number, userId: string): void {
    let activeBids = JSON.parse(localStorage.getItem('activeBids') || '{}');
    if (activeBids[userId]) {
      activeBids[userId] = activeBids[userId].filter((bid: any) => bid.auctionId !== auctionId);
      localStorage.setItem('activeBids', JSON.stringify(activeBids));
    }
  }

  decodeToken(token: string | null): any {
    if (!token) return {};
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(jsonPayload);
  }

  get maxBid(): number {
    return Math.max(...this.bidHistory.map(bid => bid.amount), 0);
  }

  isBiddisabled(): boolean {
    return this.auctionEnded || this.isBidDisabled;
  }
}


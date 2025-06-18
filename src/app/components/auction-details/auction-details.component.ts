import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { ChatComponent } from "../../chat/chat.component";

@Component({
  selector: 'app-auction-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatComponent],
  templateUrl: './auction-details.component.html',
  styleUrls: ['./auction-details.component.scss']
})
export class AuctionDetailsComponent implements OnInit {
  auction: any;
  newBid: number = 0;
  bidHistory: { username: string; amount: number; status?: string }[] = [];
  timeLeft: string = '';
  auctionEnded: boolean = false;
  winner: string | null = null;
  hasPaid: boolean = false;
  paymentAmount: number = 50;
  enteredAmount: number = 0;
  showPaymentPopup: boolean = false;
  isBidDisabledd: boolean = true;
  winnerDeclared: boolean = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const auctionId = +this.route.snapshot.paramMap.get('id')!;

    const token = localStorage.getItem("userToken");
    const userData = this.decodeToken(token);
    const userId = userData.email || userData.name || "defaultUser";

    let allAuctions: any[] = JSON.parse(localStorage.getItem('auctions') || '[]');
    for (let key in localStorage) {
      if (key.startsWith('auctions-seller-')) {
        const sellerAuctions = JSON.parse(localStorage.getItem(key) || '[]');
        allAuctions.push(...sellerAuctions);
      }
    }

    allAuctions = allAuctions.filter(
      (auction: any, index: number, self: any[]) =>
        index === self.findIndex((a: any) => a.id === auction.id)
    );

    this.auction = allAuctions.find((auction: any) => auction.id === auctionId);

    if (this.auction) {
      const paymentKey = `hasPaid_${this.auction.id}_${userId}`;
      this.hasPaid = localStorage.getItem(paymentKey) === 'true';
      this.isBidDisabledd = !this.hasPaid;

      this.bidHistory = this.auction.bids || [];
      this.calculateTimeLeft();

      if (new Date(this.auction.endTime).getTime() <= new Date().getTime()) {
        this.auctionEnded = true;
        this.timeLeft = 'Auction Ended';
        if (!this.winnerDeclared && !this.bidHistory.some(bid => bid.status)) {
          this.declareWinner();
          this.winnerDeclared = true;
        }
      }
    } else {
      console.warn(`Auction with ID ${auctionId} not found in allAuctions`);
    }
  }

  openPaymentPopup(): void {
    this.showPaymentPopup = true;
  }

  makePayment(): void {
    if (this.enteredAmount >= this.paymentAmount) {
      this.hasPaid = true;
      this.isBidDisabledd = false;
      this.showPaymentPopup = false;

      const token = localStorage.getItem("userToken");
      const userData = this.decodeToken(token);
      const userId = userData.email || userData.name || "defaultUser";

      const paymentKey = `hasPaid_${this.auction.id}_${userId}`;
      localStorage.setItem(paymentKey, 'true');

      Swal.fire({
        icon: 'success',
        title: 'Payment Successful',
        text: 'You can now place your bid!',
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
    const token = localStorage.getItem("userToken");
    const userData = this.decodeToken(token);
    const username = userData.name || userData.email?.split('@')[0] || 'Unknown';
    const userId = userData.email || userData.name || "defaultUser";

    if (!username) {
      console.error("Error: username is undefined or empty. Token data:", userData);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Unable to place bid: User information is missing.',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!this.hasPaid) {
      Swal.fire({
        icon: 'warning',
        title: 'Please pay the required amount before placing a bid.',
        confirmButtonText: 'OK'
      });
      this.openPaymentPopup();
      return;
    }

    if (newBid > this.auction.currentBid) {
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

  updateAuctionData(): void {
    const auctionData = {
      ...this.auction,
      bids: this.bidHistory,
      currentBid: this.auction.currentBid,
      winner: this.auction.winner,
      winnerAmount: this.auction.winnerAmount,
      status: this.auction.status,
      winnerDetails: this.auction.winnerDetails
    };

    let allAuctions = JSON.parse(localStorage.getItem('auctions') || '[]');
    const auctionIndex = allAuctions.findIndex((auction: any) => auction.id === this.auction.id);
    if (auctionIndex !== -1) {
      allAuctions[auctionIndex] = auctionData;
    } else {
      allAuctions.push(auctionData);
    }
    localStorage.setItem('auctions', JSON.stringify(allAuctions));
    localStorage.setItem(`auctionDetails_${this.auction.id}`, JSON.stringify(auctionData));
  }

  saveActiveBid(auction: any, bidAmount: number): void {
    const token = localStorage.getItem("userToken");
    const userData = this.decodeToken(token);
    const userId = userData.email || userData.name || "defaultUser";

    let activeBids = JSON.parse(localStorage.getItem('activeBids') || '{}');

    if (!activeBids[userId]) {
      activeBids[userId] = [];
    }

    const existingBidIndex = activeBids[userId].findIndex(
      (bid: any) => bid.auctionId === auction.id
    );

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

  calculateTimeLeft() {
    const endTime = new Date(this.auction.endTime).getTime();
    const currentTime = new Date().getTime();
    const timeRemaining = endTime - currentTime;

    if (timeRemaining <= 0) {
      this.auctionEnded = true;
      this.timeLeft = 'Auction Ended';
      if (!this.winnerDeclared && !this.bidHistory.some(bid => bid.status)) {
        this.declareWinner();
        this.winnerDeclared = true;
      }
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

    const token = localStorage.getItem("userToken");
    const userData = this.decodeToken(token);
    const userId = userData.email || userData.name || "defaultUser";
    const username = userData.name || userData.email?.split('@')[0] || 'Unknown';

    if (this.bidHistory.length > 0) {
      const validBids = this.bidHistory.filter(bid => typeof bid.amount === 'number' && !isNaN(bid.amount));
      if (validBids.length === 0) {
        console.error("No valid bids found in bidHistory:", this.bidHistory);
        this.auction.status = 'Closed';
        this.updateAuctionData();
        return;
      }

      const highestBid = validBids.reduce((maxBid, bid) => bid.amount > maxBid.amount ? bid : maxBid, validBids[0]);
      if (!highestBid || !highestBid.username) {
        console.error("Error: highestBid or highestBid.username is undefined. bidHistory:", this.bidHistory);
        this.auction.status = 'Closed';
        this.updateAuctionData();
        return;
      }

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

      this.auction.winnerDetails = {
        email: userData.email || 'N/A',
        phone: userData.phone || 'N/A'
      };

      this.updateAuctionData();
      this.removeFromActiveBids(this.auction.id, userId);
    } else {
      this.auction.status = 'Closed';
      this.updateAuctionData();
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

    const existingAuctionIndex = wonAuctions[winnerUsername].findIndex((wonAuction: any) => wonAuction.id === auction.id);
    const auctionData = {
      id: auction.id,
      title: auction.name || "Untitled Auction",
      winnerAmount: auction.winnerAmount,
      endTime: auction.endTime
    };

    if (existingAuctionIndex !== -1) {
      console.log(`Auction ${auction.id} already exists in wonAuctions for user ${winnerUsername}, updating...`);
      wonAuctions[winnerUsername][existingAuctionIndex] = auctionData;
    } else {
      console.log("Saving auction for user", winnerUsername, ":", auctionData);
      wonAuctions[winnerUsername].push(auctionData);
    }

    if (lostAuctions[winnerUsername]) {
      lostAuctions[winnerUsername] = lostAuctions[winnerUsername].filter(
        (lostAuction: any) => lostAuction.id !== auction.id
      );
      console.log(`Removed auction ${auction.id} from lostAuctions for user ${winnerUsername}`);
    }

    localStorage.setItem('wonAuctions', JSON.stringify(wonAuctions));
    localStorage.setItem('lostAuctions', JSON.stringify(lostAuctions));

    console.log(`Updated wonAuctions for ${winnerUsername}:`, wonAuctions[winnerUsername]);
    console.log("Current Local Storage wonAuctions:", localStorage.getItem('wonAuctions'));
  }

  saveLostAuction(auction: any, loserUsername: string): void {
    console.log(`Starting saveLostAuction for user ${loserUsername}, auction:`, auction);

    let wonAuctions = JSON.parse(localStorage.getItem('wonAuctions') || '{}');
    let lostAuctions = JSON.parse(localStorage.getItem('lostAuctions') || '{}');

    if (wonAuctions[loserUsername]?.some((wonAuction: any) => wonAuction.id === auction.id)) {
      console.log(`User ${loserUsername} is already in wonAuctions for auction ${auction.id}, skipping lostAuctions.`);
      return;
    }

    if (!lostAuctions[loserUsername]) {
      lostAuctions[loserUsername] = [];
      console.log(`Initialized lostAuctions for user ${loserUsername}`);
    }

    const existingAuctionIndex = lostAuctions[loserUsername].findIndex(
      (lostAuction: any) => lostAuction.id === auction.id
    );

    const auctionData = {
      id: auction.id,
      title: auction.name || "Untitled Auction",
      winner: auction.winner,
      winnerAmount: auction.winnerAmount,
      endTime: auction.endTime
    };

    if (existingAuctionIndex === -1) {
      console.log(`Saving lost auction for user ${loserUsername}:`, auctionData);
      lostAuctions[loserUsername].push(auctionData);
    } else {
      console.log(`Auction ${auction.id} already exists in lostAuctions for user ${loserUsername}, updating...`);
      lostAuctions[loserUsername][existingAuctionIndex] = auctionData;
    }

    localStorage.setItem('lostAuctions', JSON.stringify(lostAuctions));
    console.log(`Updated lostAuctions for ${loserUsername}:`, lostAuctions[loserUsername]);
    console.log("Current Local Storage lostAuctions:", localStorage.getItem('lostAuctions'));
  }

  removeFromActiveBids(auctionId: number, userId: string): void {
    let activeBids = JSON.parse(localStorage.getItem('activeBids') || '{}');

    if (activeBids[userId]) {
      activeBids[userId] = activeBids[userId].filter(
        (bid: any) => bid.auctionId !== auctionId
      );
      localStorage.setItem('activeBids', JSON.stringify(activeBids));
      console.log(`Removed auction ${auctionId} from activeBids for user ${userId}:`, activeBids[userId]);
    }
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

  get maxBid(): number {
    return Math.max(...this.bidHistory.map(bid => bid.amount), 0);
  }

  isBidDisabled(): boolean {
    return this.auctionEnded;
  }
}
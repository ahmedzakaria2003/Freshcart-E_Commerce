import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ChatComponent } from "../chat/chat.component";

@Component({
  standalone: true,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [CommonModule, FormsModule, ChatComponent]
})
export class ProfileComponent implements OnInit {
  wonAuctions: any[] = [];
  wonAuctionsDetails: any[] = [];
  activeAuctions: any[] = [];
  lostAuctions: any[] = [];
  lostAuctionsDetails: any[] = [];
  totalAmount: number = 0;
  userName: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem("userToken");
    const userData = this.decodeToken(token);
    console.log("Token data in Profile:", userData);
    const userId = userData.email || userData.name || "defaultUser";
    this.userName = userData.name || userData.email?.split('@')[0] || 'User';
    console.log("UserId in Profile:", userId);

    if (!userId || userId === "undefined") {
      console.error("Error: Could not determine userId in Profile. Token data:", userData);
      return;
    }

    let allAuctions: any[] = JSON.parse(localStorage.getItem('auctions') || '[]');
    const auctionsFromUser = [...allAuctions]; 
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
    console.log("All Auctions after removing duplicates:", allAuctions);

    const wonAuctions = JSON.parse(localStorage.getItem('wonAuctions') || '{}');
    console.log("Raw wonAuctions from Local Storage:", wonAuctions);
    this.wonAuctions = wonAuctions[userId] || [];
    console.log("Loaded wonAuctions:", this.wonAuctions);

    this.wonAuctionsDetails = this.wonAuctions
      .filter((wonAuction: any, index: number, self: any[]) =>
        index === self.findIndex((a: any) => a.id === wonAuction.id)
      )
      .map((wonAuction: any) => {
        const fullAuction = allAuctions.find((auction: any) => auction.id === wonAuction.id);
        if (!fullAuction) {
          console.warn(`Auction with ID ${wonAuction.id} not found in allAuctions`);
          return null;
        }
        const userBid = fullAuction.bids?.find((bid: any) => bid.username.toLowerCase() === userId.toLowerCase());
        const isFromSeller = !auctionsFromUser.some((auction: any) => auction.id === wonAuction.id);
        return {
          ...wonAuction,
          imageUrl: fullAuction?.imageUrl,
          category: fullAuction?.category,
          location: fullAuction?.location,
          title: fullAuction?.name || wonAuction.title,
          isPaid: wonAuction.isPaid || false,
          status: userBid?.status || 'Winner',
          source: isFromSeller ? 'seller' : 'user' 
        };
      })
      .filter((auction: any) => auction !== null);
    console.log("Won Auctions with Details:", this.wonAuctionsDetails);

    this.totalAmount = this.wonAuctionsDetails
      .filter(auction => !auction.isPaid)
      .reduce((sum, auction) => sum + (auction.winnerAmount || 0), 0);

    let activeBids = JSON.parse(localStorage.getItem('activeBids') || '{}');
    console.log("Raw activeBids from Local Storage:", activeBids);

    const userBids = activeBids[userId] || [];
    console.log("User Bids for userId", userId, ":", userBids);

    const latestBidsMap = new Map<number, any>();
    userBids.forEach((bid: any) => {
      if (!bid || !bid.auctionId) {
        console.warn("Invalid bid format, missing auctionId:", bid);
        return;
      }
      if (!latestBidsMap.has(bid.auctionId) || new Date(bid.date) > new Date(latestBidsMap.get(bid.auctionId).date)) {
        latestBidsMap.set(bid.auctionId, bid);
      }
    });

    const latestBids = Array.from(latestBidsMap.values());
    console.log("Latest Bids after removing duplicates:", latestBids);

    this.activeAuctions = latestBids
      .map((bid: any) => {
        console.log("Processing bid:", bid);
        const auction = allAuctions.find((a: any) => a.id === bid.auctionId);
        console.log("Found auction for auctionId", bid.auctionId, ":", auction);
        if (auction && auction.status === 'Open') {
          const highestBid = auction.bids?.length > 0
            ? Math.max(...auction.bids.map((b: any) => b.amount))
            : 0;
          const isFromSeller = !auctionsFromUser.some((a: any) => a.id === bid.auctionId);
          return {
            ...auction,
            userBid: bid.amount,
            bidDate: bid.date,
            highestBid: highestBid,
            source: isFromSeller ? 'seller' : 'user'
          };
        }
        console.warn(`Auction with ID ${bid.auctionId} not found or not open`);
        return null;
      })
      .filter((auction: any) => auction !== null);
    console.log("Final Active Auctions:", this.activeAuctions);

    const lostAuctions = JSON.parse(localStorage.getItem('lostAuctions') || '{}');
    console.log("Raw lostAuctions from Local Storage:", lostAuctions);
    this.lostAuctions = lostAuctions[userId] || [];
    console.log("Loaded lostAuctions:", this.lostAuctions);

    this.lostAuctionsDetails = this.lostAuctions
      .filter((lostAuction: any, index: number, self: any[]) =>
        index === self.findIndex((a: any) => a.id === lostAuction.id)
      )
      .map((lostAuction: any) => {
        const fullAuction = allAuctions.find((auction: any) => auction.id === lostAuction.id);
        if (!fullAuction) {
          console.warn(`Auction with ID ${lostAuction.id} not found in allAuctions`);
          return null;
        }
        const userBid = fullAuction.bids?.find((bid: any) => bid.username.toLowerCase() === userId.toLowerCase());
        const isFromSeller = !auctionsFromUser.some((auction: any) => auction.id === lostAuction.id);
        return {
          ...lostAuction,
          imageUrl: fullAuction?.imageUrl,
          category: fullAuction?.category,
          location: fullAuction?.location,
          title: fullAuction?.name || lostAuction.title,
          status: userBid?.status || 'Loser',
          source: isFromSeller ? 'seller' : 'user' 
        };
      })
      .filter((auction: any) => auction !== null);
    console.log("Lost Auctions with Details:", this.lostAuctionsDetails);

    allAuctions.forEach((auction: any) => {
      if (auction.status === 'Closed' && auction.bids?.length > 0) {
        const userBid = auction.bids.find((bid: any) => bid.username.toLowerCase() === userId.toLowerCase());
        if (userBid && !this.wonAuctions.some((won: any) => won.id === auction.id) && !this.lostAuctions.some((lost: any) => lost.id === auction.id)) {
          console.log(`User ${userId} participated in auction ${auction.id} but was not recorded as Winner or Loser. Adding to lostAuctions.`);
          this.lostAuctions.push({
            id: auction.id,
            title: auction.name || "Untitled Auction",
            winner: auction.winner,
            winnerAmount: auction.winnerAmount,
            endTime: auction.endTime
          });
          this.lostAuctionsDetails.push({
            id: auction.id,
            title: auction.name || "Untitled Auction",
            winner: auction.winner,
            winnerAmount: auction.winnerAmount,
            endTime: auction.endTime,
            imageUrl: auction.imageUrl,
            category: auction.category,
            location: auction.location,
            status: userBid.status || 'Loser',
            source: !auctionsFromUser.some((a: any) => a.id === auction.id) ? 'seller' : 'user'
          });
          lostAuctions[userId] = this.lostAuctions;
          localStorage.setItem('lostAuctions', JSON.stringify(lostAuctions));
        }
      }
    });
  }

  makePaymentForAuction(auction: any) {
    Swal.fire({
      icon: 'info',
      title: 'Confirm Payment',
      text: `You are about to pay $${auction.winnerAmount} for ${auction.title}.`,
      showCancelButton: true,
      confirmButtonText: 'Proceed to Payment',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/payment'], { queryParams: { totalAmount: auction.winnerAmount, auctionId: auction.id } });
      }
    });
  }

  viewAuctionDetails(auction: any) {
    if (auction.source === 'seller') {
      this.router.navigate(['/seller-auctions-details', auction.id]);
    } else {
      this.router.navigate(['/auction-details', auction.id]);
    }
  }

  decodeToken(token: string | null): any {
    if (!token) {
      console.error("No token found in Local Storage");
      return {};
    }
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
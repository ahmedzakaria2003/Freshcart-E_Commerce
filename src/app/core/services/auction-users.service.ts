import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AuctionService {
  private auctionsSubject = new BehaviorSubject<any[]>(this.loadAuctions());
  auctions$ = this.auctionsSubject.asObservable();
  

  constructor() {}

  loadAuctions(): any[] {
    const auctions = localStorage.getItem("auctions");
    return auctions ? JSON.parse(auctions) : [];
  }

  addAuction(newAuction: any) {
    const updatedAuctions = [...this.auctionsSubject.value, newAuction];
    this.auctionsSubject.next(updatedAuctions);
    localStorage.setItem("auctions", JSON.stringify(updatedAuctions));
  }

  placeBid(auctionId: number, bidAmount: number, user: string) {
    const auctions = this.auctionsSubject.value;
    const auction = auctions.find((a) => a.id === auctionId);

    if (auction) {
      auction.currentPrice = bidAmount;
      auction.bids.push({ user, amount: bidAmount, time: new Date().toISOString() });
      this.auctionsSubject.next(auctions);
      localStorage.setItem("auctions", JSON.stringify(auctions));
    }
  }
  
}


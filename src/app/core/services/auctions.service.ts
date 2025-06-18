import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { of } from 'rxjs';


@Injectable({
  providedIn: "root",
})
export class AuctionUsersService {
  private auctionsSubject = new BehaviorSubject<any[]>([]); 
  auctions$ = this.auctionsSubject.asObservable(); 
  constructor() {
    this.loadAuctionsFromLocalStorage();
  }

  private loadAuctionsFromLocalStorage() {
    const storedAuctions = localStorage.getItem("auctions");
    if (storedAuctions) {
      this.auctionsSubject.next(JSON.parse(storedAuctions));
    }
  }

  addAuction(newAuction: any) {
    const updatedAuctions = [...this.auctionsSubject.value, newAuction];
    this.auctionsSubject.next(updatedAuctions);
    localStorage.setItem("auctions", JSON.stringify(updatedAuctions));
  }

  updateAuction(updatedAuction: any) {
    const auctions = this.auctionsSubject.value;
    const index = auctions.findIndex(a => a.id === updatedAuction.id);

    if (index !== -1) {
      auctions[index] = updatedAuction;
      this.auctionsSubject.next([...auctions]);  
      localStorage.setItem("auctions", JSON.stringify(auctions));
    }
  }

  deleteAuction(id: number) {
    const auctions = this.auctionsSubject.value.filter(a => a.id !== id);
    this.auctionsSubject.next(auctions);
    localStorage.setItem("auctions", JSON.stringify(auctions));
  }

  getBiddingHistory(auctionId: string): Observable<any> {
    const history = JSON.parse(localStorage.getItem(`auction-${auctionId}-history`) || '[]');
    const highestBid = history.length > 0 ? history.reduce((max: { username: string, amount: number }, bid: { username: string, amount: number }) => bid.amount > max.amount ? bid : max) : { username: '', amount: 0 };

    return of({ history: history, highestBid: highestBid });
  }

  placeBid(auctionId: string, username: string, amount: number): void {
    const history = JSON.parse(localStorage.getItem(`auction-${auctionId}-history`) || '[]');
    
    history.push({ username, amount });

    localStorage.setItem(`auction-${auctionId}-history`, JSON.stringify(history));
}



}




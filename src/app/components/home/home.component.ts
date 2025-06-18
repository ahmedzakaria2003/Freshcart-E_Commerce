import { Iproduct } from './../../core/interfaces/iproduct';
import { Component, computed, inject, OnDestroy, OnInit, Renderer2, Signal, signal, WritableSignal } from '@angular/core';
import { ProductsService } from '../../core/services/products.service';
import { Subscription } from 'rxjs';
import { CategorieService } from '../../core/services/categorie.service';
import { Icategory } from '../../core/services/icategory';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { CommonModule, DatePipe, NgClass, NgFor } from '@angular/common';
import { TextPipe } from '../../core/pipes/text.pipe';
import { SearchPipe } from '../../core/pipes/search.pipe';
import { FormsModule, NgModel } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { WishlistService } from '../../core/services/wishlist.service';
import { Iwishlist } from '../../core/interfaces/iwishlist';
import { NgxSpinnerService } from 'ngx-spinner';
import { RouterLink, Router } from '@angular/router';
import { ChatComponent } from "../../chat/chat.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CarouselModule, RouterLink, FormsModule, CommonModule, ChatComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly _ProductsService = inject(ProductsService);
  private readonly _CategorieService = inject(CategorieService);
  private readonly _CartService = inject(CartService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _WishlistService = inject(WishlistService);
  private readonly _NgxSpinnerService = inject(NgxSpinnerService);
  private readonly _Renderer2 = inject(Renderer2);
  private router = inject(Router);

  allProductSub !: Subscription;
  productList: WritableSignal<Iproduct[]> = signal([]);
  categoryList: Icategory[] = [];
  WhishList: Iwishlist[] = [];
  productsIdInFav: any[] = [];
  date = new Date();
  text: string = "";
  auctionn: any[] = [];
  auctionTimer: any;

  // إضافة متغيرات الفلتريشن زي `AuctionListComponent`
  searchTerm: string = '';
  selectedFilter: string = 'name';
  statusFilter: string = 'all'; // all | open | closed | endingSoon
  sortBy: string = ''; // priceAsc | priceDesc | timeAsc | timeDesc

  isAuctionOpen(auction: any): boolean {
    const endDate = new Date(auction.endTime).getTime();
    const currentDate = new Date().getTime();
    return currentDate < endDate;
  }

  isAuctionEnded(auction: any): boolean {
    const endDate = new Date(auction.endTime).getTime();
    const currentDate = new Date().getTime();
    return currentDate >= endDate;
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

  viewAuctionDetails(auctionId: number) {
    this.router.navigate([`/seller-auctions-details/${auctionId}`]);
  }

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    autoplay: true,
    autoplayTimeout: 2000,
    autoplayHoverPause: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['<i class="fa-solid fa-left-long "></i>', '<i class="fa-solid fa-right-long"></i>'],
    responsive: {
      0: {
        items: 1
      }
    },
    nav: true
  }

  customOptionsMain: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    items: 1,
    nav: true
  }

  price: WritableSignal<number> = signal(10);
  size: WritableSignal<number> = signal(20);
  totalPrice: Signal<number> = computed(() => this.price() * this.size());

  changeCounter(): void {
    this.price.set(30);
  }

  ngOnInit(): void {
    this.loadAuctionsFromStorage();

    this._CategorieService.getAllCategories().subscribe({
      next: (res) => {
        this.categoryList = res.data;
      },
      error: (err) => {
        console.log(err);
      }
    });

    this.allProductSub = this._ProductsService.getAllproducts().subscribe({
      next: (res) => {
        this.productList.set(res.data);
      },
      error: (err) => {
        console.log(err);
      }
    });

    this._WishlistService.getUserWishlist().subscribe({
      next: (res) => {
        console.log(res);
        this.WhishList = res.data;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  private loadAuctionsFromStorage() {
    try {
      let uniqueAuctions: any[] = [];
      let seenAuctionIds = new Set();

      for (let key in localStorage) {
        if (key.startsWith('auctions-seller-')) {
          const sellerAuctions = JSON.parse(localStorage.getItem(key) || '[]');
          sellerAuctions.forEach((auction: any) => {
            if (!seenAuctionIds.has(auction.id)) {
              seenAuctionIds.add(auction.id);
              uniqueAuctions.push(auction);
            }
          });
        }
      }
      this.auctionn = uniqueAuctions;
    } catch (error) {
      console.error("❌ خطأ أثناء تحميل المزادات من Local Storage:", error);
    }
  }

  getCart(id: string, element: HTMLButtonElement): void {
    this._Renderer2.setAttribute(element, 'disabled', 'true');
    this._CartService.goToCart(id).subscribe({
      next: (res) => {
        console.log(res);
        this._CartService.countProductsInCart.set(res.numOfCartItems);
        this._Renderer2.removeAttribute(element, 'disabled');
        this._ToastrService.success(res.message, 'Auction Net', {
          progressBar: true,
          progressAnimation: 'increasing'
        });
      },
      error: (err) => {
        console.log(err);
        this._Renderer2.removeAttribute(element, 'disabled');
      }
    });
  }

  getWishlist(productId: string): void {
    this._WishlistService.addProductToWishlist(productId).subscribe({
      next: (res) => {
        console.log(res);
        this.productsIdInFav = res.data;
        this._WishlistService.countOfProductsInWishlist.set(res.data.length);
        this._ToastrService.info(res.message, 'Auction Net', {
          progressBar: true,
          progressAnimation: 'increasing'
        });
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  removeProductFromFav(productId: string): void {
    this._WishlistService.removeProductFromWishlist(productId).subscribe({
      next: (res) => {
        this.productsIdInFav = res.data;
        this._WishlistService.countOfProductsInWishlist.set(res.data.length);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  ngOnDestroy(): void {
    this.allProductSub?.unsubscribe();
  }

  activeIndex: number | null = null;

  // إضافة دوال الفلتريشن زي `AuctionListComponent`
  isEndingSoon(auction: any): boolean {
    const timeLeft = new Date(auction.endTime).getTime() - new Date().getTime();
    return timeLeft > 0 && timeLeft <= 5 * 60 * 1000;
  }

  getFilteredAuctions(): any[] {
    let filtered = this.auctionn.filter((auction) => {
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

  // startAuctionTimer(auction: any) {
  //   if (this.isAuctionOpen(auction)) {
  //     this.auctionTimer = setInterval(() => {
  //       auction.timeLeft = this.getTimeLeft(auction.endTime);
  //       if (this.isAuctionEnded(auction)) {
  //         clearInterval(this.auctionTimer);
  //       }
  //     }, 1000);
  //   }
  // }
}
  
  

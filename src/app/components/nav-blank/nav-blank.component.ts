import { CartService } from './../../core/services/cart.service';
import { Component, ElementRef, HostListener, inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-nav-blank',
  standalone: true,
  imports: [RouterLink, RouterLinkActive,],
  templateUrl: './nav-blank.component.html',
  styleUrl: './nav-blank.component.scss'
})
export class NavBlankComponent implements OnInit {
  private readonly _AuthService = inject(AuthService);
  private readonly _CartService = inject(CartService);
  private readonly _WishlistService = inject(WishlistService);
  private readonly _Renderer2 = inject(Renderer2);
  


  productCountInCart: any = 0
  wishlistCount: any = 0;






  



  ngOnInit(): void {


    
    this._CartService.countProductsInCart.subscribe({
      next: (res) => {

        this.productCountInCart = res;


      }

    })

    this._WishlistService.countOfProductsInWishlist.subscribe({
      next: (res) => {

        this.wishlistCount = res


      }
    })
  }


  logOut(): void {

    this._AuthService.logOut()
    // console.log('logOut');
  }





}
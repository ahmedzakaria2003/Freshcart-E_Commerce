import { CartService } from './../../core/services/cart.service';
import { Component, computed, ElementRef, HostListener, inject, OnInit, Renderer2, ViewChild, Signal, signal } from '@angular/core';
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
  


  productCountInCart:Signal<number> = computed(() => this._CartService.countProductsInCart())

  wishlistCount : Signal<number> = computed(() => this._WishlistService.countOfProductsInWishlist())






  



  ngOnInit(): void {


  


    this._CartService.getProductsCart().subscribe({


      next:(res)=>{
console.log('cart items' , res.countProductsInCart);

this._CartService.countProductsInCart.set(res.numOfCartItems)

      }
    })

 
    this._WishlistService.getUserWishlist().subscribe({

      next:(res)=>{
this._WishlistService.countOfProductsInWishlist.set(res.count)

      }
    })
  }


  logOut(): void {

    this._AuthService.logOut()
    
      // مسح بيانات المستخدم من localStorage
      localStorage.removeItem('userToken');
      localStorage.removeItem('userProfile');
      
      // إعادة التوجيه إلى صفحة أخرى مثل صفحة تسجيل الدخول
    }
    // console.log('logOut');
  }






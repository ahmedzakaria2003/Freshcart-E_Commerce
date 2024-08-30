import { Iwishlist } from './../../core/interfaces/iwishlist';
import { Component, inject, OnInit, PipeTransform, Renderer2 } from '@angular/core';
import { WishlistService } from '../../core/services/wishlist.service';
import { TextPipe } from '../../core/pipes/text.pipe';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [RouterLink, TextPipe],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss'
})
export class WishlistComponent implements OnInit {
  private readonly _CartService = inject(CartService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _WishlistService = inject(WishlistService);
  private readonly _Renderer2 = inject(Renderer2);


  products: Iwishlist[] = []        // [{product},{product},{product}]
  productsIdInFav: any[] = []


  ngOnInit(): void {
    this._WishlistService.getUserWishlist().subscribe({          // [{},{},{}]
      next: (res) => {


        this.products = res.data
        let productsId: any = this.products.map((item) => item._id)
        this.productsIdInFav = productsId
        this._WishlistService.countOfProductsInWishlist.next(res.count)
      },
      error: (err) => {
        console.log(err);
      }
    })





  }


  getCart(id: string  , element:HTMLButtonElement): void {
    this._Renderer2.setAttribute(element,'disabled','true')

    this._CartService.goToCart(id).subscribe({
      next: (res) => {
        console.log(res);
        this._CartService.countProductsInCart.next(res.numOfCartItems);
        this._Renderer2.removeAttribute(element,'disabled')
        this._ToastrService.success(res.message, 'Fresh cart', {
          progressBar: true,
          progressAnimation: 'increasing'
        })
  
      },
  
      error: (err) => {
  
        console.log(err);
        this._Renderer2.removeAttribute(element,'disabled')
  
  
  
      }
  
    })
  
  
  }



  removeProductFromFav(productId: string): void {
    this._WishlistService.removeProductFromWishlist(productId).subscribe({
      next: (res) => {

        this.productsIdInFav = res.data
        this.products = this.products.filter((item) => this.productsIdInFav.includes(item._id))
        this._WishlistService.countOfProductsInWishlist.next(res.data.length)
        this._ToastrService.error('Item deleted from your wishlist', 'Fresh cart')

      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      }
    })

  }
}





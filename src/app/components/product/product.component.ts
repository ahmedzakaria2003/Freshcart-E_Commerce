import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { ProductsService } from '../../core/services/products.service';
import { Iproduct } from '../../core/interfaces/iproduct';
import { FormsModule, NgModel } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SearchPipe } from '../../core/pipes/search.pipe';
import { TextPipe } from '../../core/pipes/text.pipe';
import { CartService } from '../../core/services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [RouterLink, TextPipe, SearchPipe, FormsModule ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnInit {
  private readonly _ProductsService = inject(ProductsService);
  private readonly _CartService = inject(CartService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _WishlistService = inject(WishlistService);
  private readonly _Renderer2 = inject(Renderer2);


  text: string = "";
  productsIdInFav: any[] = []
  productsList: Iproduct[] = [];
  ngOnInit(): void {
    this._ProductsService.getAllproducts().subscribe({

      next: (res) => {

        console.log(res);
        this.productsList = res.data;

      },
      error: (err) => {

        console.log(err);

      }

    })
    this._WishlistService.getUserWishlist().subscribe({

      next: (res) => {

        console.log(res);
        this._WishlistService.countOfProductsInWishlist.next(res.count)


      },
      error: (err) => {

        console.log(err);

      }

    })
    this._CartService.getProductsCart().subscribe({

      next: (res) => {
        this._CartService.countProductsInCart.next(res.numOfCartItems);

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

  getWishlist(productId: string): void {
    this._WishlistService.addProductToWishlist(productId).subscribe({
      next: (res) => {
        console.log(res);
        this.productsIdInFav = res.data
        this._WishlistService.countOfProductsInWishlist.next(res.data.length)
        this._ToastrService.info(res.message, 'Fresh cart', {
          progressBar: true,
          progressAnimation: 'increasing'
        })

      },

      error: (err) => {

        console.log(err);


      }

    })


  }
  removeProductFromFav(productId: string): void {
    this._WishlistService.removeProductFromWishlist(productId).subscribe({
      next: (res) => {
        this.productsIdInFav = res.data
        this._WishlistService.countOfProductsInWishlist.next(res.data.length)

      },
      error: (err) => {
        console.log(err);
      }
    })


  }

}

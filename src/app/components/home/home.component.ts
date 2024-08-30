import { Iproduct } from './../../core/interfaces/iproduct';
import { Component, inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ProductsService } from '../../core/services/products.service';
import { Subscription } from 'rxjs';
import { CategorieService } from '../../core/services/categorie.service';
import { Icategory } from '../../core/services/icategory';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TextPipe } from '../../core/pipes/text.pipe';
import { SearchPipe } from '../../core/pipes/search.pipe';
import { FormsModule, NgModel } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { WishlistService } from '../../core/services/wishlist.service';
import { Iwishlist } from '../../core/interfaces/iwishlist';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CarouselModule, RouterLink, FormsModule, TextPipe, SearchPipe],
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




  allProductSub !: Subscription;
  productList: Iproduct[] = [];
  categoryList: Icategory[] = [];
  WhishList: Iwishlist[] = [];
  productsIdInFav: any[] = []

  date = new Date();
  text: string = ""




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
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 6
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






  ngOnInit(): void {

    this._CategorieService.getAllCategories().subscribe({

      next: (res) => {
        // console.log(res);
        this.categoryList = res.data;

      },
      error: (err) => {
        console.log(err);

      }
    })

    this.allProductSub = this._ProductsService.getAllproducts().subscribe({

      next: (res) => {
        // console.log(res);
        this.productList = res.data;

      },
      error: (err) => {

        // console.log(err);

      }
    })



    this._WishlistService.getUserWishlist().subscribe({

      next: (res) => {

        console.log(res);
        this._WishlistService.countOfProductsInWishlist.next(res.count)

        this.WhishList = res.data

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
        this.productsIdInFav = res.data;
        this._WishlistService.countOfProductsInWishlist.next(res.data.length);
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

  ngOnDestroy(): void {
    this.allProductSub?.unsubscribe();
  }
}
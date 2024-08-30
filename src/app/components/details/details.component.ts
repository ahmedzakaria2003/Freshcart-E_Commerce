import { get } from 'http';
import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { log } from 'console';
import { CategorieService } from '../../core/services/categorie.service';
import { ProductsService } from '../../core/services/products.service';
import { Iproduct } from '../../core/interfaces/iproduct';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { CartService } from '../../core/services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [ CarouselModule ],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnInit {
private readonly _ActivatedRoute = inject(ActivatedRoute);
private readonly _ProductsService = inject(ProductsService);
private readonly _CategorieService = inject(CategorieService);
private readonly _CartService= inject(CartService);
private readonly _ToastrService= inject(ToastrService);
private readonly _WishlistService= inject(WishlistService);
private readonly _Renderer2 = inject(Renderer2);



detailsProduct:Iproduct |null = null;




customOptions: OwlOptions = {
  loop: true,
  mouseDrag: true,
  touchDrag: false,
  pullDrag: false,
  dots: false,
  navSpeed: 700,
  navText: ['', ''],
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




ngOnInit():void{
  this._ActivatedRoute.paramMap.subscribe({

    next:(p)=>{
let idProduct = (p.get('id'));

// logic API ...>callApiSpecific..>getSpecificProduct

this._ProductsService.getSpesificProduct(idProduct).subscribe({
  next:(res)=>{
   this.detailsProduct = res.data;


},
error:(err)=>{
  console.log(err)
  
    }
})
  


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

  getWishlist(id:string):void{
    this._WishlistService.addProductToWishlist(id).subscribe({
    next:(res)=>{
    console.log(res);
    this._WishlistService.countOfProductsInWishlist.next(res.data.length);
    this._ToastrService.success(res.message ,  'Fresh cart' , {progressBar:true ,
      progressAnimation:'increasing'
      })
    
    },
    
    error:(err)=>{
    
      console.log(err);
      
      
      }
    
    })
  
  
  }
  

}

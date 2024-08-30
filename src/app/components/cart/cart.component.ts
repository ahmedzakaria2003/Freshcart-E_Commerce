import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { CartService } from '../../core/services/cart.service';
import { Icart } from '../../core/interfaces/icart';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CurrencyPipe,RouterLink,],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
private readonly _CartService = inject(CartService);
private readonly _ToastrService = inject(ToastrService);
private readonly _Router = inject(Router);
private readonly _Renderer2 = inject(Renderer2);





cartDetails: Icart | null  = null ;
ngOnInit():void{

this._CartService.getProductsCart().subscribe({


  next:(res)=>{
    this.cartDetails = res.data
    
  },
  error:(err)=>{
    console.log(err);

  }
})

}

removeItemCart(id:string  , element:HTMLButtonElement):void{
  this._Renderer2.setAttribute(element,'disabled','true')

this._CartService.removeSpecificCartItem(id).subscribe({

next:(res)=>{
console.log(res);
this._Renderer2.removeAttribute(element,'disabled')
this._CartService.countProductsInCart.next(res.numOfCartItems);
this._ToastrService.error('item deleted');
this.cartDetails = res.data;


},

error:(err)=>{
  console.log(err);
  this._Renderer2.removeAttribute(element,'disabled')

  }

})


}
  
cartCount(id:string , count:number ,element:HTMLButtonElement):void{
  this._Renderer2.removeAttribute(element,'disabled','true')

  this._CartService.updateCartCount(id , count).subscribe({
next:(res)=>{

  console.log(res);
  this.cartDetails = res.data ;
  this._Renderer2.removeAttribute(element,'disabled')


},


error:(err)=>{
  console.log(err);
  this._Renderer2.removeAttribute(element,'disabled')

}
  })
}

clearCartItems(element:HTMLButtonElement):void{
  this._Renderer2.setAttribute(element,'disabled','true')
this._CartService.clearCartItems().subscribe({
next:(res)=>{
  console.log(res);

  if(res.message === "success"){
this._Renderer2.removeAttribute(element,'disabled')

  this.cartDetails = null
  this._CartService.countProductsInCart.next(0);
  }

},
error:(err)=>{

  console.log(err);
  this._Renderer2.removeAttribute(element,'disabled')

}

})

}

}

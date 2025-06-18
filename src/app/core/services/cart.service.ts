import { HttpClient } from '@angular/common/http';
import { inject, Injectable, OnInit, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CartService  {


  countProductsInCart:WritableSignal<number> = signal(0);
  constructor(private _HttpClient: HttpClient) { }

 

  // getWonAuctions(): Observable<any> {
  //   const wonAuctions = JSON.parse(localStorage.getItem('wonAuctions') || '[]');
  //   return new Observable(observer => {
  //     observer.next(wonAuctions);
  //     observer.complete();
  //   });
  // }




  goToCart(id: string): Observable<any> {

    return this._HttpClient.post(`${environment.baseUrl}/api/v1/cart`,
      {
        "productId": id
      }
    
    )
  }



  getProductsCart(): Observable<any> {

    return this._HttpClient.get(`${environment.baseUrl}/api/v1/cart`

 
    )
  }



  removeSpecificCartItem(id: string): Observable<any> {


    return this._HttpClient.delete(`${environment.baseUrl}/api/v1/cart/${id}`,




    )
  }

  updateCartCount(id: string, newCount: number): Observable<any> {


    return this._HttpClient.put(`${environment.baseUrl}/api/v1/cart/${id}`,

      {
       "count" : newCount
      }  



    
    )
  }


  clearCartItems(): Observable<any> {


    return this._HttpClient.delete(`${environment.baseUrl}/api/v1/cart/`



    )
  }


}

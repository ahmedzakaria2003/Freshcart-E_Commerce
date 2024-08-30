import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  constructor( private _HttpClient : HttpClient) { }



  countOfProductsInWishlist:BehaviorSubject<number>=new BehaviorSubject(0)
  addProductToWishlist(product_Id:string):Observable<any>
  {
    return this._HttpClient.post(`${environment.baseUrl}/api/v1/wishlist`
      
      ,{
      productId:product_Id
    })
  }

  getUserWishlist():Observable<any>
  {
    return this._HttpClient.get(`${environment.baseUrl}/api/v1/wishlist`

      
    

  )}

  removeProductFromWishlist(productId:string):Observable<any>
  {
    return this._HttpClient.delete(`${environment.baseUrl}/api/v1/wishlist/${productId}`)

      
    }

  }

  
  

    


import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor(private _HttpClient: HttpClient) { }

  idCash: string = ''
  checkOut(idCart: string | null, shippingDetails: object): Observable<any> {
    return this._HttpClient.post(`${environment.baseUrl}/api/v1/orders/checkout-session/${idCart}?url=${environment.urlServer}`,
      {
        "shippingAddress": shippingDetails
      }




    )
  }

  checkOutCash(idCash: string | null, shippingDetails: object): Observable<any> {

    return this._HttpClient.post(`${environment.baseUrl}/api/v1/orders/${idCash}`, {

      "shippingAddress": shippingDetails
    }



    )
  }
}

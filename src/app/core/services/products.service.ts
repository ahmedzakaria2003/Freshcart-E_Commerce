import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { get } from 'http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
private readonly _HttpClient = inject(HttpClient)

getAllproducts():Observable<any>{
return this._HttpClient.get(`${environment.baseUrl}/api/v1/products`)

}

getSpesificProduct(id:string|null):Observable<any>{
  return this._HttpClient.get(`${environment.baseUrl}/api/v1/products/${id}`)
}
}

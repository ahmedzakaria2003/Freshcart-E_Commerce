import { Iallorders } from './../../core/interfaces/iallorders';
import { Component, inject, OnInit } from '@angular/core';
import { AllordersService } from '../../core/services/allorders.service';
import { AuthService } from '../../core/services/auth.service';
import { CurrencyPipe, } from '@angular/common';

@Component({
  selector: 'app-all-order-products',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './all-order-products.component.html',
  styleUrl: './all-order-products.component.scss'
})
export class AllOrderProductsComponent implements OnInit {
private readonly _AllordersService = inject(AllordersService);
private readonly _AuthService= inject(AuthService);

allOrdersDetails:Iallorders[]= [];
userdata:any ;
userId :string|null=''


ngOnInit(): void {


this._AuthService.saveUserData();
this.userdata=this._AuthService.userData;
this.userId = this.userdata.id;

this._AllordersService.getUsersOrders(this.userId).subscribe({
next:(res)=>{
this.allOrdersDetails = res;
console.log(res);

},
error:(err)=>{
  console.log(err);
  
  }

})

}
}



import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrdersService } from '../../core/services/orders.service';
import { url } from 'inspector';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _ActivatedRoute = inject(ActivatedRoute);
  private readonly _OrdersService = inject(OrdersService);
  private readonly _Router = inject(Router);
  private readonly _ToastrService = inject(ToastrService);




  ordersForm: FormGroup = this._FormBuilder.group({

    details: [null, [Validators.required]],
    phone: [null, [Validators.required, (Validators.pattern(/^01[0125][0-9]{8}$/))]],
    city: [null, [Validators.required]]
  })

  cartId: string | null = "";
  cashId: string | null = "";


  ngOnInit(): void {

    this._ActivatedRoute.paramMap.subscribe({
      next: (params) => {

        this.cartId = params.get('id');
        this.cashId = params.get('id');

        console.log(this.cartId);

      },
      error: (err) => {

        console.log(err);

      }


    })
  }

  orderOnlineSubmit(form: FormGroup): void {

    console.log(this.ordersForm.value);

    if (form.valid) {

      this._OrdersService.checkOut(this.cartId, this.ordersForm.value).subscribe({

        next: (res) => {

          console.log(this.ordersForm.value);

          console.log(res);

          if (res.status == 'success') {
            window.open(res.session.url, '_self')
          }



        },

        error: (err) => {
          console.log(err);
          this._ToastrService.error('cart is empty', 'Fresh cart',)

        }
      })

    }


  }

  orderCashSubmit(form: FormGroup): void {
    if (form.valid) {



      this._OrdersService.checkOutCash(this.cashId, this.ordersForm.value).subscribe({

        next: (res) => {
          console.log(this.ordersForm.value);
          if (res.status == 'success') {

            this._Router.navigate(['/allorders'])
          }

        }



        ,
        error: (err) => {

          this._ToastrService.error('cart is empty', 'Fresh cart',)
          console.log(err);


        }
      })
    }
  }





}

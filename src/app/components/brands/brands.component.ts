import { Ibrands } from './../../core/interfaces/ibrands';
import { Component, inject, OnInit } from '@angular/core';
import { BrandsService } from '../../core/services/brands.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.scss'
})
export class BrandsComponent  implements OnInit{
  private readonly _BrandsService = inject(BrandsService);
  brandsList:Ibrands[] = [];

  ngOnInit(): void {
    this._BrandsService.getAllBrands().subscribe({
next:(res)=>{
console.log(res);
this.brandsList = res.data ;

},
error:(err)=>{
  console.log(err);
  

}

    })

  }

}

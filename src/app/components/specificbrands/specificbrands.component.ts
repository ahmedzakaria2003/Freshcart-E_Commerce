import { Component, inject, OnInit } from '@angular/core';
import { BrandsService } from '../../core/services/brands.service';
import { ActivatedRoute } from '@angular/router';
import { Ibrands } from '../../core/interfaces/ibrands';

@Component({
  selector: 'app-specificbrands',
  standalone: true,
  imports: [],
  templateUrl: './specificbrands.component.html',
  styleUrl: './specificbrands.component.scss'
})
export class SpecificbrandsComponent implements OnInit {
  private readonly _BrandsService = inject(BrandsService);
  private readonly _ActivatedRoute = inject(ActivatedRoute);
  brandDetails: Ibrands | null = null;
  ngOnInit(): void {
    this._ActivatedRoute.paramMap.subscribe({

      next: (p) => {

        let idBrands = (p.get('id'));
        this._BrandsService.getSpecificBrand(idBrands).subscribe({
          next: (res) => {

            this.brandDetails = res.data;

          },
          error: (err) => {

            console.log(err);
          }

        })
      }


    })
  }




}

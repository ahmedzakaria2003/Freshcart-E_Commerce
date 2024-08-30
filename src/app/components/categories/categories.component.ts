import { Component, inject, OnInit } from '@angular/core';
import { CategorieService } from '../../core/services/categorie.service';
import { Icategory } from '../../core/interfaces/icategory';
import {  RouterLink } from '@angular/router';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [RouterLink,],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {

  


private readonly _CategorieService = inject(CategorieService);
categoriesList:Icategory[] = [];
ngOnInit(): void {

  this._CategorieService.getAllCategories().subscribe({

next:(res)=>{

  console.log(res);
  this.categoriesList = res.data
},
error:(err)=>{

  console.log(err);
  
}


  })
}


}

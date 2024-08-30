import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CategorieService } from '../../core/services/categorie.service';
import { Icategory } from '../../core/interfaces/icategory';

@Component({
  selector: 'app-categories-details',
  standalone: true,
  imports: [],
  templateUrl: './categories-details.component.html',
  styleUrl: './categories-details.component.scss'
})
export class CategoriesDetailsComponent implements OnInit {
  private readonly _ActivatedRoute = inject(ActivatedRoute);
  private readonly _CategorieService = inject(CategorieService);

categoryDetails:Icategory | null = null;
ngOnInit(): void {
this._ActivatedRoute.paramMap.subscribe({
  next:(p)=>{
    let idCategory = (p.get('id'));
 
    this._CategorieService.getAllSepcificCategories(idCategory).subscribe({
next:(res)=>{
this.categoryDetails = res.data ;

},  error:(err)=>{

  console.log(err);
  
}
  
    })

  }
})

}

}

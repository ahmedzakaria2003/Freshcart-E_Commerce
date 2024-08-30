import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule,NgClass,],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnDestroy {

isLoading:boolean =false;

msgError:boolean = false ;

isSuccess:boolean = false

registerSub !:Subscription ;

private readonly _Router = inject(Router)
private readonly _AuthService= inject(AuthService)
private readonly _FormBuilder = inject(FormBuilder)
registerForm:FormGroup =this._FormBuilder.group({

name:[null,[Validators.required , Validators.minLength(3),Validators.maxLength(20)]],
email:[null,[Validators.required,Validators.email]],
password:[null,[Validators.required,Validators.pattern(/^\w{6,}$/)]],
rePassword:[null,[Validators.required]],
myPhone:[null,[Validators.required,(Validators.pattern(/^01[0125][0-9]{8}$/))]]

}, {validators:this.confirmPassword})


// Custom validation function    g....>registerForm
confirmPassword( g   : AbstractControl )  {
if(g.get('password')?.value === g.get('rePassword')?.value)
{
return null
}
 else  {
  return{misMatch:true}
}
}


RegisterSubmit():void{
  if(this.registerForm.valid){
    this.isLoading = true;
 this.registerSub =  this._AuthService.setRegisterForm(this.registerForm.value).subscribe({

  next:(res)=>{
    // true>>navigate>>login
    if(res.message=='success'){
      this.isSuccess=true; 
      this.msgError = false
setTimeout(() => {
  this._Router.navigate(['/login']);
}, 1000);
    }
console.log(res);
this.isLoading =false;
  },

error:(err:HttpErrorResponse)=>{
  // show error to html user
this.msgError = err.error.message;
this.isLoading = false;


}

   })

   
  }
  else{
this.registerForm.setErrors({misMatch:true});
    this.registerForm.markAllAsTouched();
  }
 }
ngOnDestroy(): void {
  this.registerSub?.unsubscribe();
}


}

import { DatePipe } from '@angular/common';
import { AuthService } from './../../core/services/auth.service';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { log } from 'console';

@Component({
  selector: 'app-forgo-password',
  standalone: true,
  imports: [ReactiveFormsModule,],
  templateUrl: './forgo-password.component.html',
  styleUrl: './forgo-password.component.scss'
})
export class ForgoPasswordComponent {
private readonly _AuthService= inject(AuthService);
private readonly _Router= inject(Router);
private readonly _FormBuilder = inject(FormBuilder)


step1:boolean=true;
step2:boolean=false;
step3:boolean=false;
email:string ='';

userMsg:string = '';



forgetForm:FormGroup = this._FormBuilder.group({
  email: [ null, [   Validators.required ,Validators.email]]

})

resetCodeForm:FormGroup = this._FormBuilder.group({
  resetCode: [null, [  Validators.required ,Validators.pattern(/^[0-9]{6}$/)]]

})


resetPassword:FormGroup = this._FormBuilder.group({
  newPassword: new FormControl('',[Validators.pattern(/^[a-zA-Z0-9_@]{6,}$/)])
})

forgetPassword():void{
  let userEmail = this.forgetForm.value;
  this.email = userEmail.email;

  this._AuthService.forgetPassword(userEmail).subscribe({
    next:(response)=>{
      console.log(response);
      this.userMsg = response.message;
      this.step1 = false;
      this.step2 = true;
      
    },
     error:(err)=>{
      this.userMsg = err.error.message
     }
  })
}

resetCode():void{
  let resetCode = this.resetCodeForm.value;
  this._AuthService.resetCode(resetCode).subscribe({
    next:(res)=>{
      console.log(res);
      this.userMsg = res.status;
      this.step2 = false;
      this.step3 = true;
      
    },
    error:(err)=>{
      this.userMsg = err.error.message
     }
  })
}

newPassword():void{
  let resetPassword = this.resetPassword.value;
  resetPassword.email = this.email;

  this._AuthService.resetPassword(resetPassword).subscribe({
    next:(res)=>{
      console.log(res);
      if(res.token ){
        this._AuthService.saveUserData();
        localStorage.setItem('userToken',res.token);
        this._Router.navigate(['/home'])
      }
    },
    error:(err)=>{
      this.userMsg = err.error.message
     }
  })

}


}
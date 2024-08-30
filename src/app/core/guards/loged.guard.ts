import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';



export const logedGuard: CanActivateFn = (route, state) => {

let _Router = inject(Router);
// Global object...>window, document , localstorage , navigation ..>dont work in guard , lifecyclecomponent(ssr) 
// check type global object!== undefined

if( typeof localStorage!== 'undefined'){

  // user in first case was logedin so..i prevent him  navigate to login
  if(  localStorage.getItem('userToken')!== null){
    return false 
     
    
    }
    // in this case user wasnt loged in so i navigate him to login page
    else{
      return true
      // navigate...>login
    _Router.navigate(['/login']);
    }
}
else{
  return false;
}
};

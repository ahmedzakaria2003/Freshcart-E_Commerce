import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {

  let _Router = inject(Router)
// check type of Global object 

if(typeof localStorage!=='undefined'){
  
// user in first case was logedin so..i allow him navigate to home
if(localStorage.getItem('userToken')!==null){
  return true;
  // navigate....>home
_Router.navigate(['/home']);
}
// in this case user wasnt logedin so i prevent him navigate to homepage 

else{

  return false;
}
}
else{
  return false;

}

};

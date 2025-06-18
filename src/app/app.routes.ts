import { DashHomeComponent } from './components/dash-home/dash-home.component';
import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideServerRendering } from '@angular/platform-server';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { BlankLayoutComponent } from './layouts/blank-layout/blank-layout.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { authGuard } from './core/guards/auth.guard';
import { logedGuard } from './core/guards/loged.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import path from 'path';
import { Component } from '@angular/core';
import { ProfileComponent } from './profile/profile.component';
import { PayComponent } from './pay/pay.component';
import { ChatComponent } from './chat/chat.component';
import { OtpComponent } from './otp/otp.component';
import { AdminSellerComponent } from './admin-seller/admin-seller.component';
import { SellerReportComponent } from './seller-reports/seller-reports.component';


export const routes: Routes = [
  {
    path: '', 
    component: AuthLayoutComponent, 
    canActivate: [logedGuard], 
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { 
        path: 'login', 
        title: 'Login', 
        loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) 
      },
      { 
        path: 'register', 
        title: 'Register', 
        loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent) 
      },
      { 
        path: 'forgot', 
        title: 'Forget Password', 
        loadComponent: () => import('./components/forgo-password/forgo-password.component').then(m => m.ForgoPasswordComponent) 
      }
    ]
  },
  {
    path: '', 
    component: BlankLayoutComponent, 
    canActivate: [authGuard], 
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { 
        path: 'home', 
        title: 'Home', 
        loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) 
      },
      { 
        path: 'cart', 
        title: 'Cart', 
        loadComponent: () => import('./components/cart/cart.component').then(m => m.CartComponent) 
      },
      { 
        path: 'categories', 
        title: 'Categories', 
        loadComponent: () => import('./components/categories/categories.component').then(m => m.CategoriesComponent) 
      },
      { 
        path: 'product', 
        title: 'Products', 
        loadComponent: () => import('./components/product/product.component').then(m => m.ProductComponent) 
      },
      { 
        path: 'brands', 
        title: 'Brands', 
        loadComponent: () => import('./components/brands/brands.component').then(m => m.BrandsComponent) 
      },
      { 
        path: 'details/:id', 
        title: 'Details', 
        loadComponent: () => import('./components/details/details.component').then(m => m.DetailsComponent) 
      },
      { 
        path: 'wishlist', 
        title: 'Wishlist', 
        loadComponent: () => import('./components/wishlist/wishlist.component').then(m => m.WishlistComponent) 
      },
      { 
        path: 'allorders', 
        title: 'All Orders', 
        loadComponent: () => import('./components/all-order-products/all-order-products.component').then(m => m.AllOrderProductsComponent) 
      },
      { 
        path: 'orders/:id', 
        title: 'Orders', 
        loadComponent: () => import('./components/orders/orders.component').then(m => m.OrdersComponent) 
      },
      { 
        path: 'categoriesDetails/:id', 
        title: 'Categories Details', 
        loadComponent: () => import('./components/categories-details/categories-details.component').then(m => m.CategoriesDetailsComponent) 
      },
      { 
        path: 'specificbrand/:id', 
        title: 'Specific Brand', 
        loadComponent: () => import('./components/specificbrands/specificbrands.component').then(m => m.SpecificbrandsComponent) 
      },
    
    
    { path: "auctions-users", loadComponent: () => import("./components/auction-users/auction-users.component").then(m => m.AuctionListComponent) },
    
    { path: "auction-details/:id", loadComponent: () => import("./components/auction-details/auction-details.component").then(m => m.AuctionDetailsComponent) },
    { path: 'profile', component: ProfileComponent },

    
    { path: "seller-auctions", loadComponent: () => import("./seller-auctions/seller-auctions.component").then(m => m.SellerAuctionsComponent) },
    { path: "seller-auctions-details/:id", loadComponent: () => import("./seller-auctions-details/seller-auctions-details.component").then(m => m.SellerAuctionsDetailsComponent) },
  ]
  },
  { path: "dashboard", component: DashboardComponent, children: [
    { path: "home-dash", loadComponent: () => import("./components/dash-home/dash-home.component").then(m => m.DashHomeComponent) },
    { path: "auctions", loadComponent: () => import("./components/auctions/auctions.component").then(m => m.AuctionsComponent) },

    {path:"admin-seller", component:AdminSellerComponent},



    { path: "", redirectTo: "home", pathMatch: "full" }
]},


{ path: "seller", loadComponent: () => import("./components/seller/seller.component").then(m => m.SellerComponent), children:[
  { path: "dash*seller", loadComponent: () => import("./dashboard-seller/dashboard-seller.component").then(m => m.DashboardSellerComponent) },
{path:"sellerreport", component:SellerReportComponent},
{
        path: 's',
        redirectTo: 'sellerreport',
        pathMatch: 'full'
      },


] },
{ path: 'payment', component: PayComponent },
{ path: 'chat', component: ChatComponent },
{ path: 'otp', component: OtpComponent },

  { path: '**', component: NotfoundComponent }
];

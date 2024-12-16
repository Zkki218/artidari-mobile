import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { redirectUnauthorizedTo, redirectLoggedInTo, canActivate } from '@angular/fire/auth-guard';
import { introGuard } from './guards/intro.guard';
import { AuthAdminGuard } from './guards/auth-admin.guard';
import { AuthUserGuard } from './guards/auth-user.guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToHome = () => redirectLoggedInTo(['tabs/home']);


const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/home', // Redirect to home if logged in
    pathMatch: 'full'
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then( m => m.TabsPageModule),
    ...canActivate(redirectUnauthorizedToLogin),
    canActivate: [AuthUserGuard]
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule),
    ...canActivate(redirectLoggedInToHome), // Redirect to home if already logged in
  },
  {
    path: 'intro',
    loadChildren: () => import('./intro/intro.module').then( m => m.IntroPageModule),
    canActivate: [introGuard]
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then( m => m.RegisterPageModule),
    ...canActivate(redirectLoggedInToHome), // Redirect to home if already logged in
  },
  {
    path: 'admin-tabs',
    loadChildren: () => import('./admin-tabs/admin-tabs.module').then( m => m.AdminTabsPageModule),
    ...canActivate(redirectUnauthorizedToLogin),
    canActivate: [AuthAdminGuard]
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
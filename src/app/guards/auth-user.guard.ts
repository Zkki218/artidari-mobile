import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Adjust path if needed
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class AuthUserGuard implements CanActivate  {
  constructor(private authService: AuthService, private router: Router) {}


  canActivate(): Observable<boolean> {
    return this.authService.user$.pipe(
      take(1), // Important: Take only one emission to avoid multiple redirects
      map(user => {
        if (user && user.email !== 'admin@admin.com') { // Allow access if user exists and is not admin
          return true;
        } else if (user && user.email === 'admin@admin.com'){
          this.router.navigate(['/admin-tabs/dashboard']); // Redirect admin to admin tabs
          return false;
        }
         else {
          this.router.navigate(['/login']); // Redirect to login if not logged in
          return false;
        }
      })
    );
  }
}
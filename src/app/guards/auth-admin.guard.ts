import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Adjust path if needed
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthAdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.user$.pipe(
      take(1), // Take only one value from the observable
      map(user => {
        if (user && user.email === 'admin@admin.com') {
          return true;
        } else if (user) {
          this.router.navigate(['/tabs/home']); // Redirect normal users to normal tabs
          return false;
        } else {
          this.router.navigate(['/login']);  // Redirect to login if not logged in
          return false;
        }
      })
    );
  }
}
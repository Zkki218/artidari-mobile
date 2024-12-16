import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { StorageService } from '../services/storage.service';

export const INTRO_KEY = 'intro-seen';

@Injectable({
  providedIn: 'root',
})
export class introGuard implements CanActivate {
  constructor(private router: Router, private StorageService: StorageService) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    const hasSeenIntro = await this.StorageService.get(INTRO_KEY);
    if (hasSeenIntro && (hasSeenIntro === 'true')) {
      const redirectUrl = localStorage.getItem('redirectUrl') || '/'; // Get the original URL or default to /home
      localStorage.removeItem('redirectUrl'); // Clear the stored URL
      return this.router.parseUrl(redirectUrl); // Redirect to the original or default URL
    } else {
      localStorage.setItem('redirectUrl', state.url); // Store the current URL for redirection after intro
      return this.router.parseUrl('/intro');  // Redirect to intro
    }
  }
}

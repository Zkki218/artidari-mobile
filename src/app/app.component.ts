import { Component } from '@angular/core';
import { register } from 'swiper/element/bundle';
import { StorageService } from './services/storage.service'; // Import the service

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private storageService: StorageService) { // Inject StorageService
    this.initializeApp();
  }

  async initializeApp() {
    await this.storageService.init(); // Wait for storage initialization

    // ... any other initialization logic you might have ...
  }
}
import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { introGuard } from './intro.guard';
import { RouterTestingModule } from '@angular/router/testing'; // Import RouterTestingModule
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { of } from 'rxjs';

describe('introGuard', () => {
  let guard: introGuard;
  let router: Router;
  let storageService: StorageService;

  beforeEach(() => {
    const mockStorageService = {
      get: (key: string) => of('true'), // Or of(null) to test the other condition
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule], // Add this for routing
      providers: [
        introGuard,
        { provide: StorageService, useValue: mockStorageService },
      ],
    });
    guard = TestBed.inject(introGuard);
    router = TestBed.inject(Router);
    storageService = TestBed.inject(StorageService);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should redirect to /home if intro has been seen', async () => {
    spyOn(storageService, 'get').and.returnValue(Promise.resolve('true')); // Mock the StorageService

    const canActivate = await guard.canActivate({} as any, {} as any);
    expect(canActivate.toString()).toBe('/home');
  });

  it('should redirect to /intro if intro has not been seen', async () => {
    spyOn(storageService, 'get').and.returnValue(Promise.resolve(null)); // Mock the StorageService

    const canActivate = await guard.canActivate(
      {} as any,
      { url: '/home' } as any
    );

    expect(canActivate.toString()).toBe('/intro');
  });
});

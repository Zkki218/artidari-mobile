import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import {
  BehaviorSubject,
  combineLatest,
  firstValueFrom,
  map,
  Observable,
  of,
} from 'rxjs';
import { EditProfileModalComponent } from 'src/app/components/edit-profile-modal/edit-profile-modal.component';
import { IstilahDetailModalComponent } from 'src/app/components/istilah-detail-modal/istilah-detail-modal.component';
import { AuthService } from 'src/app/services/auth.service';
import {
  Bookmark,
  FirestoreService,
  Istilah,
  UserData,
} from 'src/app/services/firestore.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  username: string | null = null;
  email: string | null = null;
  description: string | null = null; // Add description property
  profileImageUrl: string =
    'https://ionicframework.com/docs/img/demos/avatar.svg';
  userId: string | null = null;
  userData$: Observable<UserData | undefined> | null = null; // Use an observable to hold UserData
  istilahList$: Observable<Istilah[]> | undefined;
  searchQuery: string = '';
  userBookmarks$: BehaviorSubject<Bookmark[]> = new BehaviorSubject<Bookmark[]>(
    []
  );
  istilahCount: number = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private firestoreService: FirestoreService, // Inject FirestoreService
    private modalController: ModalController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.userId = user.uid;
        this.username = user.displayName;
        this.email = user.email;
        this.userData$ = this.firestoreService.getUserDocument(this.userId!); // Update userData$ when user changes
        this.userData$.subscribe(
          (userData) => (this.description = userData?.description || null)
        );
        this.loadIstilah(); // Immediately load data
        this.firestoreService
          .getUserBookmarks(this.userId!)
          .subscribe((bookmarks) => {
            this.userBookmarks$.next(bookmarks);
          });
      } else {
        this.router.navigate(['/login']); // Redirect if not logged in
      }
    });
  }

  async loadIstilah(event?: any) {
    this.istilahList$ = combineLatest([
      this.firestoreService.getUserIstilah(this.userId!, this.searchQuery),
      this.userBookmarks$,
    ]).pipe(
      map(([istilahList, bookmarks]) => {
        this.istilahCount = istilahList.length;
        return istilahList.map((istilah) => {
          const isBookmarked = bookmarks.some(
            (bookmark) => bookmark.istilahId === istilah.id
          );
          return { ...istilah, isBookmarked };
        });
      })
    );
  }

  async openEditProfileModal() {
    const modal = await this.modalController.create({
      component: EditProfileModalComponent,
      componentProps: { userData: await firstValueFrom(this.userData$!) }, // Pass user data
    });

    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.userData$ = of(data.data); // Update the userData after save
        this.presentToast('Profile berhasil diperbarui');
        this.ngOnInit(); // or any method to refresh the displayed data
      }
    });

    await modal.present();
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']); // Navigate to login after logout
      },
      error: (err) => {
        console.error('Logout failed', err);
      },
    });
  }

  doRefresh(event: any) {
    if (this.userId) {
      // Make sure user is logged in
      this.userData$ = this.firestoreService.getUserDocument(this.userId); // Re-fetch user data
      this.userData$.subscribe((userData) => {
        // Subscribe again to update description
        if (userData) {
          // Check if data is retrieved successfully
          this.description = userData.description || null;
          event.target.complete(); // Signal that refreshing is complete
        }
      });
      this.searchQuery = '';
      this.loadIstilah(event);
    }
  }

  onSearch(event: any) {
    this.searchQuery = event.target.value;
    this.loadIstilah(event);
  }

  isBookmarked(istilah: Istilah): boolean {
    return this.userBookmarks$.value.some(
      (bookmark) => bookmark.istilahId === istilah.id
    );
  }

  async openIstilahModal(istilah: Istilah) {
    const modal = await this.modalController.create({
      component: IstilahDetailModalComponent,
      componentProps: { istilah: istilah }, // Pass the istilah data
    });
    return await modal.present();
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2500,
      position: 'top',
    });

    await toast.present();
  }
}

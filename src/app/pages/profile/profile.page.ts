import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  firstValueFrom,
} from 'rxjs';
import {
  Bookmark,
  FirestoreService,
  Istilah,
  UserData,
} from 'src/app/services/firestore.service';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { IstilahDetailUserModalComponent } from 'src/app/components/istilah-detail-user-modal/istilah-detail-user-modal.component';
import { EditProfileModalComponent } from 'src/app/components/edit-profile-modal/edit-profile-modal.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UpdateIstilahModalComponent } from 'src/app/components/update-istilah-modal/update-istilah-modal.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  username: string | null = null;
  email: string | null = null;
  description: string | null = null; // Add description property
  profileImageUrl: SafeUrl | string =
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
    private firestoreService: FirestoreService,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.userId = user.uid;
        this.username = user.displayName;
        this.email = user.email;
        if (
          user.providerData.some(
            (provider: { providerId: string }) =>
              provider.providerId === 'google.com'
          )
        ) {
          this.profileImageUrl = this.sanitizer.bypassSecurityTrustUrl(
            user.photoURL || this.profileImageUrl
          ); // Sanitize URL
          console.log('Google photo URL:', user.photoURL);
        }
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
    if (!this.userId) {
      this.istilahList$ = of([]);
      return;
    }
  
    this.istilahList$ = combineLatest([
      this.firestoreService.getUserIstilah(this.userId, this.searchQuery),
      this.firestoreService.getUserBookmarks(this.userId)
    ]).pipe(
      map(([istilahList, bookmarks]) => {
        return istilahList.map(istilah => {
          const isBookmarked = bookmarks.some(bookmark => bookmark.istilahId === istilah.id);
          return { ...istilah, isBookmarked };
        });
      })
    );
  
    if (event) {
      event.target.complete();
    }
  }

  async openEditProfileModal() {
    const modal = await this.modalController.create({
      component: EditProfileModalComponent,
      componentProps: { userData: await firstValueFrom(this.userData$!), profileImageUrl: this.profileImageUrl }, // Pass user data
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

  async openUpdateIstilahModal(istilah: Istilah) {
      const modal = await this.modalController.create({
        component: UpdateIstilahModalComponent,
        componentProps: { istilah: { ...istilah } },
      });
  
      await modal.present();
  
      const { data } = await modal.onWillDismiss();
      if (data && data.istilah) {
        try {
          await this.firestoreService.updateIstilah(data.istilah);
          await this.presentToast('Istilah berhasil diperbarui');
          this.loadIstilah(); // Refresh the list
        } catch (error) {
          console.error("Error updating istilah:", error);
          // Handle the error, maybe show a toast message
        }
      }
    }
  
  
    async deleteIstilah(istilah: Istilah) {
      const alert = await this.alertController.create({
        header: 'Konfirmasi Hapus',
        message: `Apakah Anda yakin ingin menghapus istilah "${istilah.judul}"?`,
        buttons: [
          {
            text: 'Batal',
            role: 'cancel',
            cssClass: 'secondary',
          },
          {
            text: 'Hapus',
            handler: async () => {
              try {
                await this.firestoreService.deleteIstilah(istilah.id);
                await this.presentToast('Istilah berhasil dihapus');
                this.loadIstilah(); // Refresh the list
              } catch (error) {
                console.error('Error deleting istilah:', error);
                // Handle error, e.g., display a toast message
              }
            },
          },
        ],
      });
  
      await alert.present();
    }

    toggleBookmark(istilah: Istilah) {
      if (this.userId) {
        this.firestoreService.toggleBookmark(istilah.id, this.userId).then(() => {
          // Directly reload the istilah list
          this.loadIstilah(); // or this.loadBookmark() for bookmarked page
        });
      } else {
        console.error('User not logged in');
      }
    }

  like(istilah: Istilah) {
    if (this.userId) {
      this.firestoreService.likeIstilah(istilah.id, this.userId);
    } else {
      console.log('User not logged in');
    }
  }

  dislike(istilah: Istilah) {
    if (this.userId) {
      this.firestoreService.dislikeIstilah(istilah.id, this.userId);
    } else {
      console.log('User not logged in');
    }
  }

  isBookmarked(istilah: Istilah): boolean {
    return this.userBookmarks$.value.some(
      (bookmark) => bookmark.istilahId === istilah.id
    );
  }

  async openIstilahModal(istilah: Istilah) {
    const modal = await this.modalController.create({
      component: IstilahDetailUserModalComponent,
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

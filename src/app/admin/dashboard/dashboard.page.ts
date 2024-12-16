import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { BehaviorSubject, combineLatest, map, Observable, of } from 'rxjs';
import { IstilahDetailModalComponent } from 'src/app/components/istilah-detail-modal/istilah-detail-modal.component';
import { UpdateIstilahModalComponent } from 'src/app/components/update-istilah-modal/update-istilah-modal.component';
import { AuthService } from 'src/app/services/auth.service';
import {
  Bookmark,
  FirestoreService,
  Istilah,
} from 'src/app/services/firestore.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  istilahList$: Observable<Istilah[]> | undefined;
  searchQuery: string = '';
  userId: string | undefined;
  userBookmarks$: BehaviorSubject<Bookmark[]> = new BehaviorSubject<Bookmark[]>(
    []
  );

  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      // Use switchMap to cancel previous inner subscriptions.
      if (user) {
        this.userId = user.uid;
        this.loadIstilah(); // Immediately load data when user logs in
        this.firestoreService
          .getUserBookmarks(this.userId!)
          .subscribe((bookmarks) => {
            this.userBookmarks$.next(bookmarks);
          });
      } else {
        this.userId = undefined;
        this.userBookmarks$.next([]); // Clear bookmarks on logout
        this.istilahList$ = of([]); // Clear the istilah list when logged out
      }
    });
  }

  async loadIstilah(event?: any) {
    this.istilahList$ = combineLatest([
      this.firestoreService.getIstilahList(this.searchQuery),
      this.userBookmarks$,
    ]).pipe(
      map(([istilahList, bookmarks]) => {
        return istilahList.map((istilah) => {
          const isBookmarked = bookmarks.some(
            (bookmark) => bookmark.istilahId === istilah.id
          );
          return { ...istilah, isBookmarked };
        });
      })
    );
  }

  doRefresh(event: any) {
    this.searchQuery = '';
    this.loadIstilah(event);
  }

  onSearch(event: any) {
    this.searchQuery = event.target.value;
    this.loadIstilah(event);
  }

  async openUpdateIstilahModal(istilah: Istilah) {
    const modal = await this.modalController.create({
      component: UpdateIstilahModalComponent,
      componentProps: { istilah: { ...istilah } }, // Pass a copy of the istilah
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

import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Bookmark, FirestoreService, Istilah } from 'src/app/services/firestore.service';
import { ReportModalComponent } from '../report-modal/report-modal.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-istilah-detail-user-modal',
  templateUrl: './istilah-detail-user-modal.component.html',
  styleUrls: ['./istilah-detail-user-modal.component.scss'],
})
export class IstilahDetailUserModalComponent implements OnInit {
  @Input() istilah: Istilah | undefined; // Receive the istilah data
  userName: string | null = null;
  date: Date | null = null;
  currentUserId = this.authService.getCurrentUserId();
  userBookmarks$: BehaviorSubject<Bookmark[]> = new BehaviorSubject<Bookmark[]>([]);

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    const userId = this.istilah!.userId;
    this.firestoreService.getUserName(userId).subscribe((name) => {
      this.userName = name;
    });
    this.date = this.firestoreService.timestampToDate(this.istilah!.updatedAt);
    this.firestoreService.getUserBookmarks(this.currentUserId!).subscribe((bookmarks) => {
      this.userBookmarks$.next(bookmarks);
    });
  }

  async openReportModal(istilahId: string) {
      const modal = await this.modalController.create({
        component: ReportModalComponent, // Create this component
        componentProps: { istilahId: istilahId },
      });
      return await modal.present();
    }
  
  
    toggleBookmark(istilah: Istilah) {
      if (istilah!.userId) {
        this.firestoreService.toggleBookmark(istilah!.id, this.currentUserId!).then(() => {
          console.log('Istilah ID:', istilah!.id, 'User ID:', this.currentUserId);
          // Update the local bookmarks after successful toggle
          this.firestoreService.getUserBookmarks(this.currentUserId!).subscribe((bookmarks) => {
            this.userBookmarks$.next(bookmarks);
          });
        });
      } else {
        console.error('User not logged in');
      }
    }
  
    like(istilah: Istilah) {
      if(this.istilah!.userId) {
        this.firestoreService.likeIstilah(istilah.id, this.currentUserId!);
  
      } else {
        console.log("User not logged in");
      }
  
    }
  
    dislike(istilah: Istilah) {
      if(this.istilah!.userId) {
        this.firestoreService.dislikeIstilah(istilah.id, this.currentUserId!);
  
      } else {
        console.log("User not logged in");
      }
    }
  
  
    isBookmarked(istilah: Istilah): boolean {
      return this.userBookmarks$.value.some(bookmark => bookmark.istilahId === istilah.id);
    }
  
    timestampToDate(timestamp: any) {
      return this.firestoreService.timestampToDate(timestamp);
    }

  dismissModal() {
    this.modalController.dismiss();
  }
}

// bookmarked.page.ts
import { Component, OnInit } from '@angular/core';
import {
  FirestoreService,
  Istilah,
  Bookmark,
} from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { Observable, combineLatest, BehaviorSubject, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ReportModalComponent } from 'src/app/components/report-modal/report-modal.component';
import { ModalController } from '@ionic/angular';
import { IstilahDetailUserModalComponent } from 'src/app/components/istilah-detail-user-modal/istilah-detail-user-modal.component';

@Component({
  selector: 'app-bookmarked',
  templateUrl: './bookmarked.page.html',
  styleUrls: ['./bookmarked.page.scss'],
})
export class BookmarkedPage implements OnInit {
  bookmarkedIstilah$: Observable<Istilah[]> | undefined;
  searchQuery: string = '';
  userId: string | null = null;
  userBookmarks$: BehaviorSubject<Bookmark[]> = new BehaviorSubject<Bookmark[]>(
    []
  );

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.userId = user.uid;
        this.loadBookmark(); // Load data when user is present
        this.firestoreService
          .getUserBookmarks(this.userId!)
          .subscribe((bookmarks) => {
            this.userBookmarks$.next(bookmarks);
          });
      } else {
        this.userId = null;
        this.userBookmarks$.next([]);
        this.bookmarkedIstilah$ = of([]); // Clear the list
      }
    });
  }

  async loadBookmark(event?: any) {
    if (!this.userId) {
      this.bookmarkedIstilah$ = of([]);
      return;
    }
  
    this.bookmarkedIstilah$ = combineLatest([
      this.firestoreService.getBookmarkedIstilah(this.userId, this.searchQuery),
      this.firestoreService.getUserBookmarks(this.userId)
    ]).pipe(
      map(([istilahList, bookmarks]) => {
        return istilahList.map(istilah => {
          const isBookmarked = bookmarks.some(
            (bookmark) => bookmark.istilahId === istilah.id
          );
          return { ...istilah, isBookmarked };
        });
      })
    );
  
    if (event) {
      event.target.complete();
    }
  }

  doRefresh(event: any) {
    this.searchQuery = '';
    this.loadBookmark(event);
  }

  onSearch(event: any) {
    this.searchQuery = event.target.value;
    this.loadBookmark();
  }

  async openReportModal(istilahId: string) {
    const modal = await this.modalController.create({
      component: ReportModalComponent,
      componentProps: { istilahId: istilahId },
    });
    return await modal.present();
  }

  toggleBookmark(istilah: Istilah) {
  if (this.userId) {
    this.firestoreService.toggleBookmark(istilah.id, this.userId).then(() => {
      // Directly reload the istilah list
      this.loadBookmark(); // or this.loadBookmark() for bookmarked page
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
}

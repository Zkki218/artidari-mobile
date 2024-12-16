// bookmarked.page.ts
import { Component, OnInit } from '@angular/core';
import { FirestoreService, Istilah, Bookmark } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { Observable, combineLatest, BehaviorSubject, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ReportModalComponent } from 'src/app/components/report-modal/report-modal.component';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-bookmarked',
  templateUrl: './bookmarked.page.html',
  styleUrls: ['./bookmarked.page.scss'],
})
export class BookmarkedPage implements OnInit {
  bookmarkedIstilah$: Observable<Istilah[]> | undefined;
  searchQuery: string = '';
  userId: string | null = null;
  userBookmarks$: BehaviorSubject<Bookmark[]> = new BehaviorSubject<Bookmark[]>([]);


  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.loadBookmark(); // Load data when user is present
        this.firestoreService.getUserBookmarks(this.userId!).subscribe((bookmarks) => {
          this.userBookmarks$.next(bookmarks);
        });

      } else {
        this.userId = null;
        this.userBookmarks$.next([]);
        this.bookmarkedIstilah$ = of([]); // Clear the list
      }
    });
  }

  loadBookmark(event?: any) {
    if (this.userId) {
      this.bookmarkedIstilah$ = combineLatest([
        this.firestoreService.getBookmarkedIstilah(this.userId, this.searchQuery),
        this.userBookmarks$ // Add userBookmarks$ to the combineLatest
      ]).pipe(
        map(([istilahList, bookmarks]) => {
          return istilahList.map(istilah => {
            const isBookmarked = bookmarks.some(bookmark => bookmark.istilahId === istilah.id);
            return { ...istilah, isBookmarked }; // Include isBookmarked in each istilah
          });
        }),
        
      );
      if (event) {
        event.target.complete();
      }
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
        // Update the local bookmarks and bookmarkedIstilah after successful toggle
        this.firestoreService.getUserBookmarks(this.userId!).subscribe((bookmarks) => {
          this.userBookmarks$.next(bookmarks);
        });
        this.loadBookmark(); // Refresh the list to reflect the change
      });
    } else {
      console.error('User not logged in');
    }
  }



  like(istilah: Istilah) {
    if(this.userId) {
      this.firestoreService.likeIstilah(istilah.id, this.userId);

    } else {
      console.log("User not logged in");
    }

  }

  dislike(istilah: Istilah) {
    if(this.userId) {
      this.firestoreService.dislikeIstilah(istilah.id, this.userId);

    } else {
      console.log("User not logged in");
    }
  }

  isBookmarked(istilah: Istilah): boolean {
    return this.userBookmarks$.value.some(bookmark => bookmark.istilahId === istilah.id);
  }



}
// home.page.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import {
  FirestoreService,
  Istilah,
  Report,
  Bookmark,
} from '../../services/firestore.service';
import { Observable, combineLatest, BehaviorSubject, of } from 'rxjs';
import { ReportModalComponent } from 'src/app/components/report-modal/report-modal.component';
import { map, switchMap, tap } from 'rxjs/operators';
import { IstilahDetailUserModalComponent } from 'src/app/components/istilah-detail-user-modal/istilah-detail-user-modal.component';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  istilahList$: Observable<Istilah[]> | undefined;
  searchQuery: string = '';
  userId: string | undefined;
  userName: string | null = null;
  date: Date | null = null;
  userBookmarks$: BehaviorSubject<Bookmark[]> = new BehaviorSubject<Bookmark[]>([]);


  constructor(
    private authService: AuthService,
    private router: Router,
    private firestoreService: FirestoreService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.authService.user$.subscribe((user) => { // Use switchMap to cancel previous inner subscriptions.
      if (user) {
        this.userId = user.uid;
        this.loadIstilah(); // Immediately load data when user logs in
        this.firestoreService.getUserBookmarks(this.userId!).subscribe((bookmarks) => {
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
    if (!this.userId) {
      this.istilahList$ = of([]);
      return;
    }

    this.istilahList$ = combineLatest([
      this.firestoreService.getIstilahList(this.searchQuery),
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

  doRefresh(event: any) {
    this.searchQuery = '';
    this.loadIstilah(event);
  }

  onSearch(event: any) {
    this.searchQuery = event.target.value;
    this.loadIstilah(event);
  }

  async openReportModal(istilahId: string) {
    const modal = await this.modalController.create({
      component: ReportModalComponent, // Create this component
      componentProps: { istilahId: istilahId },
    });
    return await modal.present();
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
      console.log("User not logged in");
    }

  }

  dislike(istilah: Istilah) {
    if (this.userId) {
      this.firestoreService.dislikeIstilah(istilah.id, this.userId);

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

  async openIstilahModal(istilah: Istilah) {
    const modal = await this.modalController.create({
      component: IstilahDetailUserModalComponent,
      componentProps: { istilah: istilah }, // Pass the istilah data
    });
    return await modal.present();
  }

  goToSubmitPage() {
    this.router.navigate(['tabs/submit']); // Replace '/submit' with the actual route of your submit page
  }
}
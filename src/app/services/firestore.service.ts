import { Injectable } from '@angular/core';
import {
  collection,
  addDoc,
  Firestore,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  updateDoc,
  serverTimestamp,
  startAfter,
  getDoc,
  setDoc,
  deleteDoc,
  Timestamp,
  documentId,
  onSnapshot,
} from '@angular/fire/firestore';
import { arrayUnion, arrayRemove, increment } from '@firebase/firestore';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

export interface UserData {
  // Interface for user data in Firestore
  uid: string;
  displayName?: string | null;
  email?: string | null;
  description?: string; // Add description field
}

export interface Istilah {
  id: string;
  judul: string;
  deskripsi: string;
  contoh: string;
  like: number;
  dislike: number;
  usersLiked: string[];
  usersDisliked: string[];
  createdAt: Timestamp; // Firebase Timestamp
  updatedAt: Timestamp; // Firebase Timestamp
  isBookmarked?: boolean;
  userId: string;
}

export interface Report {
  istilahJudul: any;
  reportId: string;
  istilahId: string;
  userId: string;
  alasan: string;
  marked?: boolean;
  createdAt: Timestamp;
}

export interface Bookmark {
  istilahId: string;
  timestamp: Timestamp;
}

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  createUserDocument(user: UserData): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${user.uid}`);
    return setDoc(userDocRef, user);
  }

  getUserDocument(userId: string): Observable<UserData | undefined> {
    // Get user data
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return from(getDoc(userDocRef)).pipe(
      map((docSnapshot) => {
        if (docSnapshot.exists()) {
          return { ...(docSnapshot.data() as UserData), uid: docSnapshot.id }; // Return as a UserData object
        } else {
          return undefined;
        }
      })
    );
  }

  updateUserDocument(
    userId: string,
    updatedData: Partial<UserData>
  ): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return updateDoc(userDocRef, updatedData);
  }

  deleteUserDocument(userId: string): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return deleteDoc(userDocRef);
  }

  // Add Istilah
  addIstilah(istilah: Istilah, userId: string): Promise<any> {
    const istilahRef = collection(this.firestore, 'istilah');
    return addDoc(istilahRef, {
      ...istilah,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      like: 0,
      dislike: 0,
      userId: userId,
    });
  }

  async updateIstilah(istilah: Istilah): Promise<void> {
    const istilahDocRef = doc(this.firestore, `istilah/${istilah.id}`);
    return updateDoc(istilahDocRef, { ...istilah, updatedAt: serverTimestamp() });
  }

  async deleteIstilah(istilahId: string): Promise<void> {
    const istilahDocRef = doc(this.firestore, `istilah/${istilahId}`);
    return deleteDoc(istilahDocRef);
  }

  getIstilahList(searchQuery: string = ''): Observable<Istilah[]> {
    let q = query(
      collection(this.firestore, 'istilah'),
      orderBy('createdAt', 'desc')
    );

    if (searchQuery) {
      q = query(
        q,
        where('judul', '>=', searchQuery),
        where('judul', '<=', searchQuery + '\uf8ff')
      ); // Search by title
    }

    return new Observable<Istilah[]>((observer) => {
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const istilahList = querySnapshot.docs.map((doc) => ({
            ...(doc.data() as Istilah),
            id: doc.id,
          }));

          if (istilahList.length === 0 && searchQuery) {
            // Check if search returned no results
            observer.next([]); // Emit an empty array if no results
          } else {
            observer.next(istilahList); // Emit the list of istilah
          }
        },
        (error) => {
          // Handle errors
          console.error('Error fetching istilah:', error);
          observer.error(error); // Pass the error to the observer
        }
      );

      // Return unsubscribe function
      return () => unsubscribe();
    });
  }

  getUserIstilah(userId: string, searchQuery: string = ''): Observable<Istilah[]> {
    const userIstilahRef = collection(this.firestore, 'istilah');
    
    let q = query(
      userIstilahRef,
      orderBy('createdAt', 'desc')
    );

    if (searchQuery) {
      q = query(
        q,
        where('judul', '>=', searchQuery),
        where('judul', '<=', searchQuery + '\uf8ff')
      ); // Search by title
    }

    q = query(q, where('userId', '==', userId));

    return new Observable<Istilah[]>((observer) => {
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const istilahList = querySnapshot.docs.map((doc) => ({
            ...(doc.data() as Istilah),
            id: doc.id,
          }));

          if (istilahList.length === 0 && searchQuery) {
            // Check if search returned no results
            observer.next([]); // Emit an empty array if no results
          } else {
            observer.next(istilahList); // Emit the list of istilah
          }
        },
        (error) => {
          // Handle errors
          console.error('Error fetching istilah:', error);
          observer.error(error); // Pass the error to the observer
        }
      );

      // Return unsubscribe function
      return () => unsubscribe();
    });
  }

  getBookmarkedIstilah(
    userId: string,
    searchQuery: string = ''
  ): Observable<Istilah[]> {
    return this.getUserBookmarks(userId).pipe(
      switchMap((bookmarks) => {
        if (bookmarks.length > 0) {
          const istilahIds = bookmarks.map((bookmark) => bookmark.istilahId);

          let q = query(
            collection(this.firestore, 'istilah'),
            orderBy('createdAt', 'desc')
          );

          if (searchQuery) {
            q = query(q, where('judul', '==', searchQuery));
          }

          q = query(q, where(documentId(), 'in', istilahIds)); // Correct path

          return new Observable<Istilah[]>((observer) => {
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
              const istilahList = querySnapshot.docs.map((doc) => ({
                ...(doc.data() as Istilah),
                id: doc.id,
              }));
              observer.next(istilahList);
            });
            return () => unsubscribe(); // Unsubscribe when the observable is destroyed
          });
        } else {
          return of([]);
        }
      })
    );
  }

  async toggleBookmark(istilahId: string, userId: string) {
    const bookmarkDocRef = doc(
      this.firestore,
      `users/${userId}/bookmarks/${istilahId}`
    );

    const bookmarkDocSnapshot = await getDoc(bookmarkDocRef);

    if (bookmarkDocSnapshot.exists()) {
      await deleteDoc(bookmarkDocRef);
    } else {
      // Bookmark doesn't exist, create it

      setDoc(bookmarkDocRef, { timestamp: serverTimestamp() });
    }
  }

  async likeIstilah(istilahId: string, userId: string) {
    const istilahRef = doc(this.firestore, 'istilah', istilahId);
    const istilahSnap = await getDoc(istilahRef);

    if (istilahSnap.exists()) {
      const usersLiked = istilahSnap.data()['usersLiked'] || [];

      if (!usersLiked.includes(userId)) {
        // Like the post
        await updateDoc(istilahRef, {
          like: increment(1),
          usersLiked: arrayUnion(userId),
        });
      } else {
        // Unlike the post
        await updateDoc(istilahRef, {
          like: increment(-1),
          usersLiked: arrayRemove(userId),
        });
      }
    }
  }

  async dislikeIstilah(istilahId: string, userId: string) {
    const istilahRef = doc(this.firestore, 'istilah', istilahId);
    const istilahSnap = await getDoc(istilahRef);

    if (istilahSnap.exists()) {
      const usersDisliked = istilahSnap.data()['usersDisliked'] || [];
      if (!usersDisliked.includes(userId)) {
        // Dislike the post
        await updateDoc(istilahRef, {
          dislike: increment(1),
          usersDisliked: arrayUnion(userId),
        });
      } else {
        // Undislike the post
        await updateDoc(istilahRef, {
          dislike: increment(-1),
          usersDisliked: arrayRemove(userId),
        });
      }
    }
  }

  // Add Report
  addReport(report: Report): Promise<any> {
    const reportRef = collection(this.firestore, 'reports');
    return addDoc(reportRef, {
      ...report,
      createdAt: serverTimestamp(),
      marked: false,
    });
  }

  getReports(searchQuery: string = ''): Observable<Report[]> {
    let q = query(collection(this.firestore, 'reports'), where('marked', '==', false));

    if (searchQuery) {
      // Add search functionality if needed. For example, if you want search by alasan.
      q = query(q, where('alasan', '>=', searchQuery), where('alasan', '<=', searchQuery + '\uf8ff'));
    }

    return new Observable<Report[]>((observer) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const reports = querySnapshot.docs.map((doc) => ({
          ...(doc.data() as Report),
          reportId: doc.id, // Make sure you have the reportId
        }));
        observer.next(reports);
      });
      return () => unsubscribe();
    });
  }

  async markReport(reportId: string): Promise<void> {
    const reportDocRef = doc(this.firestore, `reports/${reportId}`);
    return updateDoc(reportDocRef, { marked: true });
  }

  async deleteAllReportsForIstilah(istilahId: string): Promise<void> {
    const q = query(collection(this.firestore, 'reports'), where('istilahId', '==', istilahId));
    const querySnapshot = await getDocs(q);

    await Promise.all(querySnapshot.docs.map(doc => deleteDoc(doc.ref)));
    return;
  }

  getUserBookmarks(userId: string): Observable<Bookmark[]> {
    return from(
      getDocs(query(collection(this.firestore, `users/${userId}/bookmarks`)))
    ).pipe(
      map((querySnapshot) => {
        return querySnapshot.docs.map((doc) => {
          return {
            ...(doc.data() as Bookmark),
            istilahId: doc.id,
          };
        });
      })
    );
  }
}

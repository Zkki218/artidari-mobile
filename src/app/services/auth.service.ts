import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  AuthError,
  GoogleAuthProvider,
  signInWithPopup
} from '@angular/fire/auth';
import { BehaviorSubject, from, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { FirestoreService, UserData } from './firestore.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _user$: BehaviorSubject<any> = new BehaviorSubject<any>(null); // BehaviorSubject to hold user state
  user$: Observable<any> = this._user$.asObservable();
  constructor(private auth: Auth, private firestoreService: FirestoreService) {
    this.auth.onAuthStateChanged((user) => {
      // Subscribe to auth state changes
      this._user$.next(user); // Update BehaviorSubject with current user
    });
  }

  getCurrentUser(): any {
    return this.auth.currentUser;
  }

  getCurrentUserId(): string | null {
    return this.auth.currentUser ? this.auth.currentUser.uid : null;
  }

  // Create a user and send verification email.
  createUser(credentials: {
    username: string;
    email: string;
    password: string;
    description: string; // Add description to the credentials
  }): Observable<any> {
    return from(
      createUserWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      )
    ).pipe(
      switchMap((userCredential) => {
        if (!userCredential.user) {
          // Check if user object exists
          throw new Error('User object is null.');
        }
        return from(
          updateProfile(userCredential.user, {
            displayName: credentials.username,
          })
        ).pipe(
          switchMap(() => {
            const userData: UserData = {
              // Create UserData object
              uid: userCredential.user.uid,
              displayName: credentials.username,
              email: credentials.email,
              description: credentials.description, // Include the description
            };
            return this.firestoreService
              .createUserDocument(userData)
              .then(() => userCredential);
          })
        );
      }),
      catchError((error: any) => throwError(() => error)) // Re-throw error after handling
    );
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return from(
      signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      )
    ).pipe(
      catchError((error: AuthError) =>
        throwError(() => this.handleError(error))
      )
    );
  }

  async loginWithGoogle(): Promise<any> {
    const googleAuthProvider = new GoogleAuthProvider();

          googleAuthProvider.addScope('profile');
          googleAuthProvider.addScope('email');



    try {
      const credential = await signInWithPopup(this.auth, googleAuthProvider);


      const user = credential.user;

      if (user) {
        const userData: UserData = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          description: '', // You might want to handle this differently for Google login
        };

        // Check if the user document already exists
        const userDoc = await this.firestoreService.getUserDocument(user.uid).toPromise();


        if (!userDoc) {
          // Create the user document if it doesn't exist
          await this.firestoreService.createUserDocument(userData);
        }
        this._user$.next(user);
      }




      return user;
    } catch (error: any) {
      this.handleError(error);
      throw error; // Re-throw the error for the component to handle
    }
  }

  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        this._user$.next(null); // Force emit null to clear user in components
      }),
      catchError(error => {
        console.error('Logout Error:', error);
        return throwError(() => error); // Re-throw for error handling elsewhere
      })
    );
  }

  // Centralized error handler
  private handleError(error: AuthError) {
    let errorCode = error.code;
    let errorMessage = error.message;

    // Log the full error for debugging
    console.error('Firebase Auth Error:', error);

    // Customize error messages for common scenarios
    switch (errorCode) {
      case 'auth/email-already-in-use':
        errorMessage =
          'This email address is already registered. Try logging in.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address format.';
        break;
      case 'auth/user-not-found':
        errorMessage = 'No user found with this email address.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password. Please try again.';
        break;
      case 'auth/weak-password':
        errorMessage =
          'Password is too weak. Please choose a stronger password with at least 6 characters.';
        break;

      // Add more cases as needed for different auth errors
      default:
        errorMessage = 'An unknown error occurred. Please try again later.';
    }
    return new Error(errorMessage); // Throwing an Error object instead of just a string allows us to keep the original error properties
  }
}

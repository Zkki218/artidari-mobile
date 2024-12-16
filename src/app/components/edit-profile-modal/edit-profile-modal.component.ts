import { Component, Input, OnInit } from '@angular/core';
import { updateProfile } from '@angular/fire/auth';
import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService, UserData } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-edit-profile-modal',
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.scss'],
})
export class EditProfileModalComponent implements OnInit {
  @Input()
  userData!: UserData;
  username!: string;
  description!: string;
  email!: string;
  userId!: string;
  profileImageUrl!: string;

  constructor(
    private modalController: ModalController,
    private firestoreService: FirestoreService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.username = this.userData.displayName || '';
    this.description = this.userData.description || '';
    this.email = this.userData.email || '';
    this.userId = this.userData.uid;
    this.profileImageUrl = this.profileImageUrl || '';
  }

  async saveChanges() {
    const updatedUserData: Partial<UserData> = {
      displayName: this.username,
      description: this.description,
    };

    // Update Firebase Auth profile (username)
    const user = this.authService.getCurrentUser();
    if (user) {
      updateProfile(user, { displayName: this.username })
        .then(() => console.log('Auth profile updated!'))
        .catch((error) => console.error('Error updating Auth profile:', error));
    }

    this.firestoreService
      .updateUserDocument(this.userId, updatedUserData)
      .then(() => {
        console.log('User document updated!');
        this.modalController.dismiss(updatedUserData); // Close the modal and pass back updated data
      })
      .catch((error) => {
        console.error('Error updating user document:', error);
        // Handle error, e.g., show an error message to the user
      });
  }

  dismissModal() {
    this.modalController.dismiss();
  }
}

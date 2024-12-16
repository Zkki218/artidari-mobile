import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-submit',
  templateUrl: './submit.page.html',
  styleUrls: ['./submit.page.scss'],
})
export class SubmitPage implements OnInit {
  userId = this.authService.getCurrentUserId();
  userName: string | null = null;
  istilahForm: FormGroup;
  authSubscription!: Subscription;

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private fb: FormBuilder,
    private toastController: ToastController
  ) {
    this.istilahForm = this.fb.group({
      judul: ['', Validators.required],
      deskripsi: ['', Validators.required],
      contoh: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.authSubscription = this.authService
      .authStateChanges()
      .subscribe((user) => {
        if (user) {
          this.userId = user.uid;
          this.firestoreService
            .getUserName(this.userId)
            .subscribe((displayName) => {
              this.userName = displayName;
            });
        } else {
          this.userId = null;
          this.userName = null;
        }
      });
  }

  submitIstilah() {
    if (this.istilahForm.valid && this.userId && this.userName) {
      this.firestoreService
        .addIstilah(this.istilahForm.value, this.userId!, this.userName!)
        .then(() => {
          this.presentToast('Istilah berhasil ditambahkan');
          this.istilahForm.reset();
        })
        .catch((error) => {
          console.error('Error adding document: ', error);
          // Handle error (e.g., show error message to user)
        });
    }
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

import { Component, Input } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { FirestoreService } from '../../services/firestore.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-report-modal',
  templateUrl: './report-modal.component.html',
  styleUrls: ['./report-modal.component.scss'],
})
export class ReportModalComponent {
  @Input() istilahId: string | undefined;
  reportForm: FormGroup;
  alasanOptions = ['Kebencian', 'Pelecehan', 'SARA', 'Spam'];

  constructor(
    private modalController: ModalController,
    private firestoreService: FirestoreService,
    private fb: FormBuilder,
    private authService: AuthService,
    private toastController: ToastController
  ) {
    this.reportForm = this.fb.group({
      alasan: ['', Validators.required],
    });
  }

  submitReport() {
    if (this.reportForm.valid) {
      const reportData = {
        ...this.reportForm.value,
        istilahId: this.istilahId,
        userId: this.authService.getCurrentUserId(),
      };

      this.firestoreService.addReport(reportData).then(() => {
        this.presentToast('Istilah berhasil dilaporkan');
        this.modalController.dismiss();
      });
    }
  }

  dismissModal() {
    this.modalController.dismiss();
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
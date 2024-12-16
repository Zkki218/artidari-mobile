import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Istilah } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-update-istilah-modal',
  templateUrl: './update-istilah-modal.component.html',
  styleUrls: ['./update-istilah-modal.component.scss'],
})
export class UpdateIstilahModalComponent {
  @Input() istilah!: Istilah;

  constructor(private modalController: ModalController) { }


  dismissModal(istilah?: Istilah) {
    this.modalController.dismiss({ istilah });
  }


  updateIstilah() {
    if (!this.istilah.judul || !this.istilah.deskripsi || !this.istilah.contoh) {
      return;
    }
    this.dismissModal(this.istilah);
  }

}
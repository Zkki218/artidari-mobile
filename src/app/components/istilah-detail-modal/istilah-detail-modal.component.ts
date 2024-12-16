import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Istilah } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-istilah-detail-modal',
  templateUrl: './istilah-detail-modal.component.html',
  styleUrls: ['./istilah-detail-modal.component.scss'],
})
export class IstilahDetailModalComponent  {

  @Input() istilah: Istilah | undefined; // Receive the istilah data

  constructor(private modalController: ModalController) {}

  dismissModal() {
    this.modalController.dismiss();
  }

}

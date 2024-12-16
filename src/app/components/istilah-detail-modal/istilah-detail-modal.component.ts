import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { FirestoreService, Istilah } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-istilah-detail-modal',
  templateUrl: './istilah-detail-modal.component.html',
  styleUrls: ['./istilah-detail-modal.component.scss'],
})
export class IstilahDetailModalComponent implements OnInit {
  @Input() istilah: Istilah | undefined; // Receive the istilah data
  userName: string | null = null;
  date: Date | null = null;

  constructor(
    private firestoreService: FirestoreService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.istilah = this.istilah;
    const userId = this.istilah!.userId;
    this.firestoreService.getUserName(userId).subscribe((name) => {
      this.userName = name;
    });
    this.date = this.firestoreService.timestampToDate(this.istilah!.updatedAt);
  }

  dismissModal() {
    this.modalController.dismiss();
  }
}

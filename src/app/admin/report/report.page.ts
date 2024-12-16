// report.page.ts
import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import {
  FirestoreService,
  Report,
  Istilah,
} from 'src/app/services/firestore.service';
import { Observable, combineLatest, map, of } from 'rxjs';

@Component({
  selector: 'app-report',
  templateUrl: './report.page.html',
  styleUrls: ['./report.page.scss'],
})
export class ReportPage implements OnInit {
  reports$: Observable<Report[]> | undefined;
  searchQuery: string = '';
  istilahData: { [istilahId: string]: Istilah } = {}; // Store istilah data

  constructor(
    private firestoreService: FirestoreService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadReports();
  }

  async loadReports(event?: any) {
    this.reports$ = combineLatest([
      this.firestoreService.getReports(this.searchQuery),
      this.firestoreService.getIstilahList(''), // Get all istilah for lookup
    ]).pipe(
      map(([reports, allIstilah]) => {
        this.istilahData = allIstilah.reduce(
          (acc, cur) => ({ ...acc, [cur.id]: cur }),
          {}
        );

        return reports
          .filter((report) => !report.marked)
          .map((report) => {
            const istilah = this.istilahData[report.istilahId]; // Look up istilah
            return {
              ...report,
              istilahJudul: istilah ? istilah.judul : 'Istilah not found',
            }; //Add judul if available
          });
      })
    );

    if (event) {
      event.target.complete();
    }
  }

  doRefresh(event: any) {
    this.searchQuery = '';
    this.loadReports(event);
  }

  onSearch(event: any) {
    this.searchQuery = event.target.value;
    this.loadReports();
  }

  async markReport(report: Report) {
    try {
      await this.firestoreService.markReport(report.reportId);
      this.presentToast('Laporan berhasil ditandai');
      this.loadReports();
    } catch (error) {
      console.error('Error marking report:', error);
    }
  }

  async deleteAllReportsAndIstilah(report: Report) {
    const istilahJudul = this.getIstilahJudul(report);
    const alert = await this.alertController.create({
      header: 'Konfirmasi Hapus',
      message: `Apakah Anda yakin ingin menghapus semua laporan untuk istilah "${istilahJudul}" dan istilah itu sendiri?`,
      buttons: [
        {
          text: 'Batal',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Hapus',
          handler: async () => {
            try {
              await this.firestoreService.deleteAllReportsForIstilah(
                report.istilahId
              );
              await this.firestoreService.deleteIstilah(report.istilahId);
              await this.presentToast('Semua laporan dan istilah yang terkait berhasil dihapus');
              this.loadReports();
            } catch (err) {
              console.log(err);
            }
          },
        },
      ],
    });
    await alert.present();
  }

  getReportDate(report: Report): string {
    const date = report.createdAt.toDate();
    return date.toLocaleDateString(); // Customize date format as needed
  }

  getIstilahJudul(report: Report): string {
    return this.istilahData[report.istilahId]?.judul || 'Istilah not found';
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

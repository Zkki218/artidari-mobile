import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { IstilahDetailModalComponent } from './istilah-detail-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  declarations: [IstilahDetailModalComponent],
  exports: [IstilahDetailModalComponent]
})
export class IstilahDetailModalModule {}
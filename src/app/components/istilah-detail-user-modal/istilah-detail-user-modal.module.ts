import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { IstilahDetailUserModalComponent } from './istilah-detail-user-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  declarations: [IstilahDetailUserModalComponent],
  exports: [IstilahDetailUserModalComponent]
})
export class IstilahDetailUserModalModule {}
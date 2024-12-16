import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { IstilahDetailAdminModalComponent } from './istilah-detail-admin-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  declarations: [IstilahDetailAdminModalComponent],
  exports: [IstilahDetailAdminModalComponent]
})
export class IstilahDetailAdminModalModule {}
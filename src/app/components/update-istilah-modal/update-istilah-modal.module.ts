import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UpdateIstilahModalComponent } from './update-istilah-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  declarations: [UpdateIstilahModalComponent],
  exports: [UpdateIstilahModalComponent]
})
export class UpdateIstilahModalModule {}
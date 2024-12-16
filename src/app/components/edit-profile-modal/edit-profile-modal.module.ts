import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EditProfileModalComponent } from './edit-profile-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  declarations: [EditProfileModalComponent],
  exports: [EditProfileModalComponent] // Export the component to make it available for other modules
})
export class EditProfileModalModule {}
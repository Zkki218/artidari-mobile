import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BookmarkedPageRoutingModule } from './bookmarked-routing.module';

import { BookmarkedPage } from './bookmarked.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BookmarkedPageRoutingModule
  ],
  declarations: [BookmarkedPage]
})
export class BookmarkedPageModule {}

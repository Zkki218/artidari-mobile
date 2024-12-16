import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BookmarkedPage } from './bookmarked.page';

const routes: Routes = [
  {
    path: '',
    component: BookmarkedPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookmarkedPageRoutingModule {}

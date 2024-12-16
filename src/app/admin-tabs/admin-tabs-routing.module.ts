import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminTabsPage } from './admin-tabs.page';

const routes: Routes = [
  {
      path: '',
      component: AdminTabsPage,
      children: [
        {
          path: 'dashboard',
          loadChildren: () => import('../admin/dashboard/dashboard.module').then(m => m.DashboardPageModule)
        },
        {
          path: 'profile',
          loadChildren: () => import('../admin/profile/profile.module').then(m => m.ProfilePageModule)
        },
        {
          path: 'report',
          loadChildren: () => import('../admin/report/report.module').then(m => m.ReportPageModule)
        },
        {
          path: 'submit',
          loadChildren: () => import('../admin/submit/submit.module').then(m => m.SubmitPageModule)
        },
        {
          path: '',
          redirectTo: '/admin-tabs/dashboard',
          pathMatch: 'full'
        }
      ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminTabsPageRoutingModule {}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { initializeApp, provideFirebaseApp, getApp } from '@angular/fire/app';
import { getAuth, provideAuth, connectAuthEmulator } from '@angular/fire/auth';
import { getFirestore, provideFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

import {Drivers} from '@ionic/storage';
import {IonicStorageModule} from '@ionic/storage-angular';
import {StorageService} from 'src/app/services/storage.service';

import { ReportModalModule } from './components/report-modal/report-modal.module';
import { IstilahDetailUserModalModule } from './components/istilah-detail-user-modal/istilah-detail-user-modal.module';
import { IstilahDetailAdminModalModule } from './components/istilah-detail-admin-modal/istilah-detail-admin.modal.module';
import { EditProfileModalModule } from './components/edit-profile-modal/edit-profile-modal.module';
import { UpdateIstilahModalModule } from './components/update-istilah-modal/update-istilah-modal.module';


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    ReportModalModule,
    IstilahDetailUserModalModule,
    IstilahDetailAdminModalModule,
    EditProfileModalModule,
    UpdateIstilahModalModule,
    IonicStorageModule.forRoot({name: '__mydb', driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]})
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => {
      const auth = getAuth();
      return auth;
    }),
    provideFirestore(() => {
      const firestore = getFirestore();
      return firestore;
    }),
    StorageService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
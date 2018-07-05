import { NgModule, ErrorHandler, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { Device } from '@ionic-native/device';
import { MyApp } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { IonicStorageModule } from '@ionic/storage';
import { WelcomePage } from '../pages/welcome/welcome';
import { ActivationPage } from '../pages/activation/activation';
import { DeveloperPage } from '../pages/developer/developer';
import { ExamListPage } from '../pages/exam-list/exam-list';
import { ExamDetailsPage } from '../pages/exam-details/exam-details';
import { ExamModePage } from '../pages/exam-mode/exam-mode';
import { FlashListPage } from '../pages/flash-list/flash-list';
import { FlashDetailsPage } from '../pages/flash-details/flash-details';
import { TrackerListPage } from '../pages/tracker-list/tracker-list';
import { StoreDetailPage } from '../pages/store-details/store-details';
//import { LoginPage } from '../pages/login/login';
import { ResultPage } from '../pages/result/result';
import { Pin } from '../pages/pin/pin';
import { DbUpdatePage } from '../pages/db-update/db-update';
import { PINDetailPage } from '../pages/pin-detail/pin-detail';
import { TrackerExamDetailPage } from '../pages/tracker-details/tracker-details';
import { StoreListPage } from '../pages/store-list/store-list';
import { DbService } from '../providers/db-service';
import { SQLite } from '@ionic-native/sqlite';
import { StoreService } from '../providers/store-service';
import { FbProvider } from '../providers/fb-provider';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { AdMobFree } from '@ionic-native/admob-free';
import { NativeStorage } from '@ionic-native/native-storage';
import { FlashCardComponent } from '../components/flash-card/flash-card';
import { User, Api } from '../providers'; 
import { ExamSetupPage } from '../pages/exam-setup/exam-setup';

@NgModule({
  declarations: [
    MyApp,
    WelcomePage,
    DeveloperPage,
    ExamListPage,
    ExamDetailsPage,
    ExamModePage,
    ExamSetupPage,
    FlashDetailsPage,
    FlashListPage,
    StoreDetailPage,
    TrackerExamDetailPage,
    TrackerListPage,
    StoreListPage,
    ActivationPage,
    //LoginPage,
    ResultPage,
    Pin,
    PINDetailPage,
    DbUpdatePage,
    FlashCardComponent

  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    WelcomePage,
    DeveloperPage,
    ExamDetailsPage,
    ExamModePage,
    StoreDetailPage,
    TrackerExamDetailPage,
    ExamListPage,
    ExamSetupPage,
    FlashDetailsPage,
    FlashListPage,
    TrackerListPage,
    StoreListPage,
    ActivationPage,
    //LoginPage,
    ResultPage,
    Pin,
    PINDetailPage,
    DbUpdatePage
  ],
  providers: [
    StatusBar, SplashScreen, GoogleAnalytics, NativeStorage, Device, AdMobFree, SQLite, DbService, StoreService, FbProvider, Api,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    User],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule {}

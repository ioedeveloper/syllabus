import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ExamSetupPage } from './exam-setup';

@NgModule({
  declarations: [
    ExamSetupPage,
  ],
  imports: [
    IonicPageModule.forChild(ExamSetupPage),
  ],
})
export class ExamSetupPageModule {}

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ExamModePage } from './exam-mode';

@NgModule({
  declarations: [
    ExamModePage,
  ],
  imports: [
    IonicPageModule.forChild(ExamModePage),
  ],
})
export class ExamModePageModule {}

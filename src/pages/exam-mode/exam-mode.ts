import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import {DbService} from '../../providers/db-service'; 
import { ExamSetupPage } from '../exam-setup/exam-setup';

/**
 * Generated class for the ExamModePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'exam-mode',
  templateUrl: 'exam-mode.html',
})
export class ExamModePage {
  exams: {};
  source: any;
  private user: any;
  private adId: any;
  private exam: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public dbService: DbService, public alertCtrl: AlertController) {
      this.exam = navParams.get('exam');
      this.source = navParams.get('source');
      this.adId = navParams.get('adId');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ExamModePage');
  }

  ionViewWillEnter(){
    this.dbService.findAllEnabledExams(0).then(data => {
      this.exams = data 
    });
  }

itemTapped(event, mode) {
    this.navCtrl.push(ExamSetupPage, {
        exam: this.exam,
        source: this.source,
        user: this.user,
        adId: this.adId,
        mode: mode
    });
}


unavailable(msgType:string){
  let alert = this.alertCtrl.create({
    title: `${msgType}`,
    subTitle: `coming soon...`,
    buttons: ['OK']
});
  alert.present();
}

}

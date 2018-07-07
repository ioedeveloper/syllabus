import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ExamDetailsPage } from '../exam-details/exam-details';

/**
 * Generated class for the ExamSetupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-exam-setup',
  templateUrl: 'exam-setup.html',
})
export class ExamSetupPage {
  public title:any = "";
  private _exam:any;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this._exam = this.navParams.get('exam');
    this.title = this._exam.ExamTitle;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ExamSetupPage');
  }

  start(){
    this.navCtrl.push(ExamDetailsPage, {
      exam: this.navParams.get("exam"),
      source: this.navParams.get("source"),
      user: this.navParams.get("user"),
      adId: this.navParams.get("adId"),
      mode: this.navParams.get("mode")
  });
  }

}

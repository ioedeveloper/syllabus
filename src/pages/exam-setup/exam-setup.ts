import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

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
  public exam = "";
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.exam = this.navParams.get('exam');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ExamSetupPage');
  }

}

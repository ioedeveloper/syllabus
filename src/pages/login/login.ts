import { Component } from '@angular/core';
//import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, ToastController } from 'ionic-angular';

import { User } from '../../providers';
import { ExamListPage } from '../exam-list/exam-list';
import { ActivationPage } from '../activation/activation';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  // The account fields for the login form.
  // If you're using the username field with or without email, make
  // sure to add it to the type
  account: { email: string, password: string } = {
    email: '',
    password: ''
  };

  // Our translated text strings
  private loginErrorString: string;

  constructor(public navCtrl: NavController,
    public user: User,
    public toastCtrl: ToastController) {
  }

  // Attempt to login in through our User service
  doLogin() {
    this.user.login(this.account).subscribe((resp) => {
      if(resp["user"].paid === "No"){
        this.navCtrl.push(ActivationPage);
      }else if(resp["user"].paid === "Yes"){
        this.navCtrl.push(ExamListPage);
        this.navCtrl.setRoot(ExamListPage);
      }
    }, (err) => {
      //this.navCtrl.push(ExamListPage);
      // Unable to log in
      this.loginErrorString = "Unable to sign in. Please check your account information or internet connectivity.";
      let toast = this.toastCtrl.create({
        message: this.loginErrorString,
        duration: 3000,
        position: 'top'
      });
      toast.present();
    });
  }
}

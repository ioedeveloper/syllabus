import { Component } from '@angular/core';
import { NavController, Events, Platform, ModalController, NavParams } from 'ionic-angular';
import { AlertController} from 'ionic-angular';
import { PINDetailPage } from '../pin-detail/pin-detail';
import { DbService } from '../../providers/db-service';
import { Device } from '@ionic-native/device';

@Component({
  selector: 'page-pin',
  templateUrl: 'pin.html',
})
export class Pin {
  private new_pin: any;
  
  public source: any;

  constructor(private device: Device, public platform: Platform, public navCtrl: NavController, public dbService: DbService, public modalCtrl: ModalController, public events: Events, public alertCtrl: AlertController, public navParams: NavParams) {
    this.new_pin = "";
    this.platform.ready().then((readySource) => {this.source = readySource; console.log('Source: ',this.source)});
  }

  showAlert(title,message){
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: [{
        text: 'Close',
        handler: () => {
          setTimeout(()=>this.navCtrl.pop(),1000); 
        }
      }]
    });
    alert.present();
  }
 
  requestPIN() {
    let modal;
    modal = this.modalCtrl.create(PINDetailPage, {});
    modal.onDidDismiss(data=>{
      console.log("modal closed");
      //this.reload()
    });
    modal.present();    
  }

  // Handle the PIN verification
  enterPIN(pin){
    let secureCode=null;
    let str=null;
    let val=null;
    let arr = [];
    if (this.source != "cordova"){
      arr = "0DF0B0CE-BBF6-4A9B-B14D-67485B5F3D18".split('-'); // just for browser
    } else { //on real device
      arr = this.device.uuid.split('-');
    }
    

    if(arr[1] == null) {
      // Android
      str = arr[0].slice(2,10);
      secureCode = parseInt(str,16);
    } else {
      // iOS
      val = arr[3] + arr[1];
      secureCode = parseInt(arr[0],16) + parseInt(val,16);
    }

    if(pin == secureCode){
      console.log("purchaseProduct");
      this.dbService.setProperty('fullversion','true');
      this.dbService.setFullVersion();
      this.dbService.setProperty('admob','false');
      this.showAlert('Full Version Unlocked','Thanks for purchasing Quizionic full version!');
    } else {
      this.showAlert('PIN not valid','Please provide a valid one.');
      console.log("PIN not valid");
    };
  };

  ionViewDidLoad() {
    console.log('ionViewDidLoad Pin');
  }

}

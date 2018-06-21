import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {TrackerExamDetailPage} from '../tracker-details/tracker-details';
import {DbService} from '../../providers/db-service';
//import {Storage} from '@ionic/storage';
import { NativeStorage } from '@ionic-native/native-storage';

declare var analytics: any;

@Component({
    selector: 'tracker-list',
    templateUrl: 'tracker-list.html'
})
export class TrackerListPage {
  progressList: {};
  private user: any;
  private source: any;

    constructor(public nav: NavController, private nativeStorage: NativeStorage, public navParams: NavParams, public dbService: DbService) {
      this.nav = nav;
      //let selectedItem = navParams.get('item');
      //this.user = navParams.get('user');
      this.source = navParams.get('readySource');
    }

    ngOnInit() {
        // if login feature is activated then user is set with user's name
        this.dbService.getProperty('login').then(data => {
            if(data == 'true'){
            this.nativeStorage.getItem('userName').then(data => {   
                if (typeof data == "undefined" || data == null){
                this.user = "StudioMob";
                this.loadData(this.user);
                } else {
                this.user = data;
                this.loadData(this.user);
                }
            });
            } else {
            this.user = "StudioMob";
            this.loadData(this.user);
            }
      });
    }
    
    loadData(user){
        this.dbService.getProgressByUserId(user).then(data => {
          this.progressList = data
        });

        if(this.source == 'cordova') {
          analytics.trackView('Tracker-List');
        }
    }

    itemTapped(progressExam) {
        this.nav.push(TrackerExamDetailPage, {
            progressExam: progressExam,
            user: this.user,
        });
    }


}

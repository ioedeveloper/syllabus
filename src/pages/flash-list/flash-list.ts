import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DbService } from '../../providers/db-service';
import { FlashDetailsPage } from '../flash-details/flash-details';

@Component({
  selector: 'page-flash-list',
  templateUrl: 'flash-list.html',
})

export class FlashListPage {
  fclist: {};
  source: any;
  private user: any;
  private dbversion: any;
  private adId: any;

  constructor(private nav: NavController, public navParams: NavParams, public dbService: DbService) {
    this.nav = nav;
    //this.dbService = DbService;
    this.source = navParams.get('readySource');
    this.user = navParams.get('user');
    this.adId = navParams.get('adId');
    this.dbversion = navParams.get('dbVersion');
    
  }

  ionViewWillEnter(){
      if (this.dbversion < "3.3"){
        this.dbService.findAllEnabledExams(0).then(data => {
          this.fclist = data;
        });   
      } else {
        this.dbService.getFlashCardList().then(data => {
          this.fclist = data;
        });   
      }
  }

  itemTapped(event, fclist) {
    this.nav.push(FlashDetailsPage, {
        list: fclist,
        source: this.source,
        user: this.user,
        adId: this.adId,
        dbVersion: this.dbversion
    });
  }

}

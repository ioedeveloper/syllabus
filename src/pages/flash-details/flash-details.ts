import { Component } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';
import { DbService } from '../../providers/db-service';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { AdMobFree } from '@ionic-native/admob-free';

let _admob: boolean;
let _Paid;
let list;

@Component({
  selector: 'page-flash-details',
  templateUrl: 'flash-details.html',
})
export class FlashDetailsPage {
  private title;
  private list;
  private fcArrayID:{};
  private fc: any;
  private index: number;
  private front: any;
  private frontImg: any;
  private back: any;
  private backImg: any;
  private qty: any;
  private source: any;
  private adId: any;
  private dbversion: any;

  constructor(private admob: AdMobFree, private analytics: GoogleAnalytics, private nav: NavController, public events: Events, public navParams: NavParams, public dbService: DbService) {
    list = navParams.get('list');
    this.source = navParams.get('source');
    this.adId = navParams.get('adId');
    this.dbversion = navParams.get('dbVersion');
    //this.qty = list.Qty;
    //this.title = list.ExamTitle;
    this.index = 0;
  }

  loadFlashCards() {
    
    if(this.dbversion < "3.3"){
      if (this.index < this.qty) {  
        this.dbService.getQuestionById(this.fcArrayID[this.index]).then (data => { 
          this.fc = data;
          this.front = this.fc.Question;
          this.frontImg = this.fc.Image;
          this.back = this.fc.Explanation;
          this.backImg = "";
        });
      }
    } else {
      this.dbService.getFlashCardById(this.fcArrayID[this.index]).then (data => {
        this.fc = data;
        this.front = this.fc.FrontText;
        this.frontImg = this.fc.FrontImg;
        this.back = this.fc.BackText;
        this.backImg = this.fc.BackImg;
      })
    }  
      
  }

  nextFlashCard(){
    this.events.publish('card:change');
    this.index++;
    this.loadFlashCards();
  }

  previousFlashCard(){
    this.events.publish('card:change');
    this.index--;
    this.loadFlashCards();
  }

  ionViewDidLoad() {
    this.dbService.getPAIDValue().then(data => _Paid = data);
    this.dbService.getProperty('admob')
      .then(data => { 
        _admob=data == "true" ? true : false;
        if(_admob && !_Paid){
          if(this.source == 'cordova') {
            // present Admob banner
            this.admob.banner.prepare().then(() => {
              this.admob.banner.show();
            })
            .catch(e=> console.log(e));
          }
        } else {
          if(this.source == 'cordova') {
            this.admob.banner.remove();
          }
        }
        if(this.source == 'cordova') {
          this.analytics.trackView('FlashCard page on ' + this.title);
        }
    });
    this.fc = {};
    let categories = "";
    if(typeof list.CatId == "string") {
      categories = list.CatId.split(',');
    }
    
    if(this.dbversion < "3.3"){
      this.title = list.ExamTitle;
      this.qty = list.Qty;
      this.dbService.getQuestionsIdByCatAndQty(list.CatId,list.Qty).then(data => {this.fcArrayID = data; this.loadFlashCards()}); 
    } else {
      //database version is +3.3.0
      this.title = list.Title;
      //this.dbService.getQuestionsIdForExamId(list.Id,categories,list.QuestionsOrderBy,list.StartOnQID,list.Qty).then(data => {this.questionArrayID = data; this.loadFlashCards()});
      this.dbService.getFlashCardsId(categories,list.StartOnFCID,list.OrderBy).then(data=>{this.fcArrayID = data[0]; this.qty = data[1]; console.log(data[0],data[1]); this.loadFlashCards()});
    }
  }

}

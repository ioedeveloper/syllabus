import {Component} from '@angular/core';
import {NavController, Events, NavParams} from 'ionic-angular';
import {DbService} from '../../providers/db-service';
//import {Storage} from '@ionic/storage';

@Component({
  selector: 'developer',
  templateUrl: 'developer.html'
})

export class DeveloperPage {

  public _hlra: any;
  public _expla: any;
  public _admob: any;
  public _fullv: any;
  private _quantity: any;
  private _login: any;
  private _qId : any;
  private _cId : any;
  private _eId : any;
  private _npbutton: any;
  private _autoQJump: any;
  private _resultPage: any;
  private _previousBtn: any;
  private _store: any;
  private _MABtnUp: any;
  private onlineProgress: boolean;
  private _actionSheet: any;
  private _shuffle: any;
  private _stats: any;
  private dbversion: any;
  private DBSynchD: any;
  private sbPrDate: any;
  
  constructor(public nav: NavController, public events: Events, public navParams: NavParams, public dbService: DbService) {
    this.dbversion = this.navParams.get('dbVersion');
    this.dbService.getProperty('highlight').then(data => this._hlra = data);
    this.dbService.getProperty('admob').then(data => this._admob = data);
    this.dbService.getProperty('login').then(data => this._login = data);
    this.dbService.getProperty('fullversion').then(data => this._fullv = data);
    this.dbService.getProperty('explanation').then(data => this._expla = data);
    this.dbService.getProperty('explanationq').then(data => this._quantity = data);
    this.dbService.getProperty('qId').then(data => this._qId = data);
    this.dbService.getProperty('cId').then(data => this._cId = data);
    this.dbService.getProperty('eId').then(data => this._eId = data);
    this.dbService.getProperty('npButtons').then(data => this._npbutton = data);
    this.dbService.getProperty('previousBtn').then(data=> {if(data == "true") {this._previousBtn = true;} else {this._previousBtn = false;}});
    this.dbService.getProperty('onlineProgress').then(data=> {if(data == "true") {this.onlineProgress = true;} else {this.onlineProgress = false;}});
    this.dbService.getProperty('autoQuestionJump').then(data=> {if(data == "true") {this._autoQJump = true;} else {this._autoQJump = false;}});
    this.dbService.getProperty('resultPage').then(data=> {if(data == "true") {this._resultPage = true;} else {this._resultPage = false;}});
    this.dbService.getProperty('MABtnUp').then(data=> {if(data == "true") {this._MABtnUp = true;} else {this._MABtnUp = false;}});
    this.dbService.getProperty('actionSheet').then(data=> {if(data == "true") {this._actionSheet = true;} else {this._actionSheet = false;}});
    this.dbService.getProperty('shuffle').then(data=> {if(data == "true") {this._shuffle = true;} else {this._shuffle = false;}});
    this.dbService.getProperty('store').then(data=> {if(data == "true") {this._store = true;} else {this._store = false;}});
    if(this.dbversion < "3.3") {
      this.dbService.getProperty('statsOnExam').then(data => this._stats = data == "true"? true:false);
    }
    this.dbService.getProperty('DBSynchDate').then(data=> {this.DBSynchD = this.convertDate(data)});
    this.dbService.getProperty('submitProgressDate').then(data=> {this.sbPrDate=this.convertDate(data)});
  }

  convertDate(data){
    let date = new Date(data);
    let newDate = date.toISOString().substring(0,10);
    return newDate;
  }

  logEvent(e,pname) {
     console.log(e,pname);
    if (pname=='fullversion'){
      if (e.checked){
        this.dbService.setFullVersion();
      } else {
        this.dbService.setFreeVersion();
      }
    
    }

    if (e.checked){
      this.dbService.setProperty(pname,'true');
      if (pname=='store') this.events.publish('store',true);
    } else {
      this.dbService.setProperty(pname,'false');
      if (pname=='store') this.events.publish('store',false);
    }
   }

   update(value, key){
     if(value!='' && key =='submitProgressDate' || key =='DBSynchDate') {
      let temp = new Date(value).toISOString();
      this.dbService.setProperty(key,temp);
     } else {
      this.dbService.setProperty(key,value);
     }
   }

}

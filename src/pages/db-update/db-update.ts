import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Platform, AlertController, ViewController} from 'ionic-angular';
import { DbService } from '../../providers/db-service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {CONFIG} from '../../providers/app-config';


let oriTables: any;
let newTables: any;
let tables: any;
let time: any;

@Component({
  selector: 'page-db-update',
  templateUrl: 'db-update.html',
})

export class DbUpdatePage {
public source: any;
private flag: number;
public status: string;
public data: any;
private response: any;
public dateTime: any;
private updated: boolean;
private dbversion: any;


private url: string = CONFIG.requestUpdateURL; //"http://www.studiomob.ca/pin/requestUpdate.php";

  constructor(public platform: Platform, public alertCtrl: AlertController, public http: HttpClient, public viewCtrl: ViewController,public dbService: DbService, public navCtrl: NavController, public navParams: NavParams) {
    this.platform.ready().then((readySource) => {this.source = readySource});
    this.dbversion = this.navParams.get('dbVersion');
    this.status = "";
    this.flag=0;
    this.updated = false;
    oriTables=['Category','ExamType','Question'];
    newTables=['FlashCardList','FlashCard'];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DbUpdatePage'); 
  }

  updateStatus(text){
    this.status = this.status + text;
    console.log(text);
  }

  updateDB() {
    this.dbService.getProperty('DBSynchDate').then((data) => {
    //let time = '2016-01-01T00:00:00.00Z'; // leaving this line force update all time
    let time = data; //this uses the configured and updated DBSynchDate to update database content
    this.updated = false;
    console.log(time);
    if(this.flag == 0){
      this.flag = 1;
      this.updateStatus("Connecting to the server ...\n");
      this.queryTable("Category",time).then(data => {
        //console.log('Category retrieve: ',data);
        if (data == "") { 
          this.updateStatus("No new data from Category table...\n");
        } else {
          this.dbService.updateDB('Category',data);
          this.updated = true;
        }
          this.queryTable("Question",time).then(data => {
            //console.log('Question retrieve: ',data);
          if (data == "") { 
            this.updateStatus("No new data from Question table...\n");
          } else {
            this.updated = true;
            this.dbService.updateDB('Question',data);
          }
            this.queryTable("ExamType",time).then(data => {
              //console.log('Exam retrieve: ',data);
              if (data == "") { 
                this.updateStatus("No new data from ExamType table...\n");
              } else {
                this.updated = true;
                this.dbService.updateDB('ExamType',data);
              }
              if(this.dbversion >= '3.3'){
                this.queryTable("FlashCardList",time).then(data => {
                  
                  if (data == "") { 
                    this.updateStatus("No new data from FlasCardList table...\n");
                  } else {
                    this.updated = true;
                    this.dbService.updateDB('FlashCardList',data);
                  }
                  this.queryTable("FlashCard",time).then(data => {
                  
                    if (data == "") { 
                      this.updateStatus("No new data from FlashCard table...\n");
                    } else {
                      this.updated = true;
                      this.dbService.updateDB('FlashCard',data);
                    }
                    if (this.updated){
                      this.dateTime = new Date().toISOString();
                      this.dbService.setProperty('DBSynchDate',this.dateTime);
                      this.showAlert('Data update completed.');  
                    } else {
                      this.showAlert('No entries to update.');
                    }    
                  })
                })
              } else if (this.updated){
                  this.dateTime = new Date().toISOString();
                  this.dbService.setProperty('DBSynchDate',this.dateTime);
                  this.showAlert('Data update completed.');  
                } else {
                  this.showAlert('No entries to update.');
                }     
            })
        })
      })
    }
   });
    
  }

  showAlert(message){
    let alert = this.alertCtrl.create({
        title: 'Update DB Process',
        subTitle: message,
        buttons: [{
          text: 'Dismiss',
          handler: () => {
            this.viewCtrl.dismiss();
          }}]
      });
      this.updateStatus("Process completed, connection closed.\n");
    alert.present();
  }

  queryTable(table, tstamp){
    // Setting headers and content type for http post request
    let headers = new HttpHeaders();
    headers.append('Content-Type','application/json');
    // headers.append('Access-Control-Allow-Origin', 'http://localhost:8100');
    // headers.append('Access-Control-Allow-Credentials', 'true');
    // headers.append('Access-Control-Allow-Methods', 'POST');
    // headers.append('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    let requestMsg = { 
      table: table, 
      timestamp : tstamp
    };

    this.updateStatus("Retrieving " + table + " data from server...\n");
    // Create a promise for http.post
    return new Promise(resolve=>{
      this.response = this.http.post(this.url, JSON.stringify(requestMsg), {headers: headers})
      //this.subscription = this.response.subscribe(
      .subscribe(data => {
          this.data = data;
          
          resolve(this.data);
          //this.subscription.unsubscribe();
        }, (err) => {
          console.error(err);
          this.showAlert('Connection failed, try later.');
        }
      );
    });
  }

}
 
/*  updateDB() {
    //check db version
    if (this.dbversion < '3.3'){
      this.url = CONFIG.requestUpdateURL;
      tables = oriTables;
    } else {
      this.url = CONFIG.requestUpdateNewURL;
      tables = oriTables.concat(newTables);
    }
    console.log('URL: ' + this.url);
    this.updated = false;

    this.dbService.getProperty('DBSynchDate').then(data => {  
      time = data;
      //avoid rebound
      if(this.flag == 0){
        this.flag = 1;
        
        this.updateStatus("Connecting to the server ...\n");
        
        for(let i=0;i<tables.length;i++){
          this.checkTable(tables[i]).then(data=>{
            this.dbService.updateDB(tables[i],data);
          });
        }
        console.log(this.updated); 
        if (this.updated){
          this.dateTime = new Date().toISOString();
          this.dbService.setProperty('DBSynchDate',this.dateTime);
          this.showAlert('Data update completed.');  
        } else {
          this.showAlert('No entries to update.');
        }            
      }
    });
  }

  checkTable(table){
    return new Promise ((resolve,reject) => resolve(this.queryTable(table).then(data=>{
      
      resolve(data);
    }, (err) => {
    console.error(err);
    this.showAlert('Connection failed, try later.');
    })));
  }

  showAlert(message){
    let alert = this.alertCtrl.create({
        title: 'Update DB Process',
        subTitle: message,
        buttons: [{
          text: 'Dismiss',
          handler: () => {
            this.viewCtrl.dismiss();
          }}]
      });
      this.updateStatus("Process completed, connection closed.\n");
    alert.present();
  }

  queryTable(table){
    // Setting headers and content type for http post request
    let headers = new HttpHeaders();
    headers.append('Content-Type','application/json');
    // headers.append('Access-Control-Allow-Origin', 'http://localhost:8100');
    // headers.append('Access-Control-Allow-Credentials', 'true');
    // headers.append('Access-Control-Allow-Methods', 'POST');
    // headers.append('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    let requestMsg = { 
      table: table, 
      timestamp : time
    };

    
    // Create a promise for http.post
    return new Promise(resolve=>{
      this.response = this.http.post(this.url, JSON.stringify(requestMsg), {headers: headers})
   
      .subscribe(data => {
          this.updateStatus("Retrieving " + table + " data from server...\n");
          console.log(data);
          resolve(data);
          
        }, (err) => {
          console.error(err);
          this.showAlert('Connection failed, try later.');
        }
      );
    });
  }

}*/
 
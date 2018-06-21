import {Injectable} from '@angular/core';
import {Events, Platform} from 'ionic-angular';
import {CONFIG} from './app-config';
//import { SQLite } from '@ionic-native/sqlite';

//const QDB_NAME: string = 'Q3data.db';
//const PDB_NAME: string = 'Q3progress.db';
const win: any = window;

@Injectable()
export class DbService {
  local: any;
  source: string;
  private db: any;
  private dbp: any;
  private _shuffle: boolean;
  private dbVersion: any;
  
  constructor(
    public platform: Platform,
    public events: Events,
  ){
    this.platform.ready().then((readySource) => {this.source = readySource});
  }

  init(){
    if (win.sqlitePlugin) {
        this.db = win.sqlitePlugin.openDatabase({
            name: CONFIG.QDB_NAME,
            location: 'default',
            androidDatabaseImplementation: 2,
            createFromLocation: 0
        });
        this.dbp = win.sqlitePlugin.openDatabase({
            name: CONFIG.PDB_NAME,
            location: 'default'
        });
    } else {
        console.warn('Storage: SQLite plugin not installed, falling back to WebSQL. Make sure to install cordova-sqlite-storage in production!');
        this.db = win.openDatabase(CONFIG.QDB_NAME, '1.0', 'database1', 5 * 1024 * 1024);
        this.dbp = win.openDatabase(CONFIG.PDB_NAME, '1.0', 'database2', 5 * 1024 * 1024);
    }
    this.createProgressTable();
  }

  query(dbase: any, querys: string, params: any[] = []): Promise<any> {
        //console.log(querys,params);
        return new Promise((resolve, reject) => {
          try {
                  dbase.transaction((tx: any) => {
                      tx.executeSql(querys, params,
                          (tx: any, res: any) => resolve({ tx: tx, res: res }),
                          (tx: any, err: any) => reject({ tx: tx, err: err }));
                  },
                  (err: any) => reject({ err: err }));
          } catch (err) {
              reject({ err: err });
          }
      });
  }


  get(key: string): Promise<any> {
      return this.query(this.db,'select key, value from kv where key = ? limit 1', [key]).then(data => {
          if (data.res.rows.length > 0) {
              //console.warn(data.res.rows.item(0).value);
              return data.res.rows.item(0).value;
          }
      });
  }

  set(key: string, value: string): Promise<any> {
      return this.query(this.db,'insert or replace into kv(key, value) values (?, ?)', [key, value]);
  }


  remove(key: string): Promise<any> {
      return this.query(this.db,'delete from kv where key = ?', [key]);
  }


  clear(): Promise<any> {
      return this.query(this.db,'delete from kv');
  }

  // for future use
  getAllProducts() {
    let PRODUCTS = [];
    return new Promise ((resolve,reject) => resolve(this.query(this.db,"SELECT * FROM Product").then((data) => {
        if(data.res.rows.length > 0) {
            for(var i = 0; i < data.res.rows.length; i++) {
                //console.log(data.res.rows.item(i));
                PRODUCTS.push(data.res.rows.item(i));
            }
            //console.log("PRODUCTS -> " + JSON.stringify(this.PRODUCTS));
            return PRODUCTS;
        }
    }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error.err));
    })));
  }

  //----------------------------------------------------------

  // Full/Free version supportive functions ------------------


  getPAIDValue(){ //created for version 3.2.0
    return new Promise ((resolve,reject) => resolve(this.get('PAID').then((data)=> {
        if(data != null && data == '1') {
            return true;
          } else {
            return false;
          }
    })));
  }

  isFullVersion(){
    return new Promise ((resolve,reject) => resolve(this.get('PAID').then((data)=> {
        if(data != null && data == '1') {
          this.setFullVersion();
          return true;
        } else {
          this.setFreeVersion();
          return false;
        }
    })));
  }

  setFullVersion(){
      this.set('PAID', '1');
      this.events.publish('paid:full', 1);
      this.unlockAll();
  }

  setFreeVersion(){
      this.set('PAID', '0');
      this.events.publish('paid:free', 0);
      this.lockAll();
  }
  //----------------------------------------------------------

  // Lock and Unlock functions -------------------------------

  lockAll(){
    let qId,cId,eId;
    console.log('lock all for Free Version called');
    this.getProperty('qId').then(data => {qId=data});
    this.getProperty('cId').then(data => {cId=data});
    this.getProperty('eId').then(data => {eId=data;
      this.lockAllQuestions(qId).
        then(data => this.lockAllCategories(cId).
          then(data => this.lockAllExams(eId).
            then(data =>console.log('Lock completed for Free Version'))));
    });

  }

  lockAllQuestions(id){
    console.log('lockAllQuestions above question Id:'+id+' called');
    return new Promise ((resolve,reject) => resolve(this.query(this.db,'UPDATE Question SET Enabled=0 WHERE Enabled<2 AND Id>'+id).then((data) => {
        console.log("Questions locked");
        return;
    }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error.err));
    })));
  }

  lockAllCategories(id){
    console.log('lockAllCategories above category Id:'+id+' called');
    return new Promise ((resolve,reject) => resolve(this.query(this.db,'UPDATE Category SET Enabled=0 WHERE Enabled<2 AND CatId>'+id).then((data) => {
        console.log("Categories locked");
        return;
    }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error.err));
    })));
  }

  lockAllExams(id){
    console.log('lockAllExams above exam Id:'+id+' called');
    return new Promise ((resolve,reject) => resolve(this.query(this.db,'UPDATE ExamType SET Enabled=0 WHERE Enabled<2 AND Id>'+id).then((data) => {
        console.log("Exams locked");
        return;
    }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error.err));
    })));
  }

  unlockAll(){
    console.log('unlockAll called');
    this.unlockAllQuestions().
      then(data => this.unlockAllCategories().
        then(data => this.unlockAllExams().
          then(data =>console.log('All Unlocked'))));
  }

  unlockAllQuestions(){
    console.log('unlockAllQuestions called');
    return new Promise ((resolve,reject) => resolve(this.query(this.db,'UPDATE Question SET Enabled=1').then(() => {
        console.log("All questions unlocked");
        return;
    }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error.err));
    })));
  }

  unlockAllCategories(){
    console.log('unlockAllCategories called');
    return new Promise ((resolve,reject) => resolve(this.query(this.db,'UPDATE Category SET Enabled=1').then((data) => {
        console.log("All Categories unlocked");
        return;
    }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error.err));
    })));
  }

  unlockAllExams(){
    console.log('unlockAllExams called');
    return new Promise ((resolve,reject) => resolve(this.query(this.db,'UPDATE ExamType SET Enabled=1').then((data) => {
        console.log("All Exams unlocked");
        return;
    }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error.err));
    })));
  }

  unlockQuestionByCatId(Id){ //modified for version 3.2.0
    console.log('unlockQuestionByCatId('+Id+') called');
    return new Promise ((resolve,reject) => resolve(this.query(this.db,'UPDATE Question SET Enabled=2 WHERE (SELECT Q.Id FROM ExamType A, Question Q WHERE A.CatId=Q.CatId AND A.Id='+Id+')').then((data) => {
        console.log("Questions for Exam: " + Id + "unlocked");
        return data;
    }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error.err));
    })));
  }

  _unlockExamById(Id){//modified for version 3.2.0
    return new Promise ((resolve,reject) => resolve(this.query(this.db,"UPDATE ExamType SET Enabled=2 WHERE Id="+Id).then((data) => {
        return data;
    }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error.err));
    })));
  }

  unlockExamById(Id){
    console.log('unlockExamById('+Id+') called');
    let id = Id;
    this.unlockQuestionByCatId(id).then((data) => {
      console.log('questions unlocked: '+data);
      this._unlockExamById(id).then((res) => {
          console.log('Exam:'+id+' unlocked');
          return res;
        },(error) => {
          console.log("ERROR -> " + JSON.stringify(error.err));
        });
        return;
      },(error) => {
        console.log("ERROR -> " + JSON.stringify(error.err));
      });
  }

  getDBVersion(){
      return this.dbVersion;
  }

  //----------------------------------------------------------

  // From here supportive functions for exams-list.ts

  checkDBVersion(){
    this.getProperty('dbVersion').then(data=>{
        this.dbVersion = data;
        console.log('DB Version: ' + this.dbVersion);
    });
  }

  findAllEnabledExams(parent) {//modified for version 3.3.0
    let hierachy = "";
    if(this.dbVersion < '3.3.0') {
        hierachy = "";
    } else {
        if(typeof parent == undefined || parent == null) {
            parent = 0;    
        }
        hierachy = "AND Parent=" + parent; 
    }
    this.getProperty('shuffle').then(data => this._shuffle = data == 'true' ? true:false);
    let EXAMS = [];
    return new Promise ((resolve,reject) => resolve(this.query(this.db,"SELECT * FROM ExamType WHERE Enabled>=1 "+hierachy).then((data) => {
        if(data.res.rows.length > 0) {
            for(var i = 0; i < data.res.rows.length; i++) {
                //console.log(data.res.rows.item(i));
                EXAMS.push(data.res.rows.item(i));
            }
            //console.log("EXAMS -> " + JSON.stringify(EXAMS));
            return EXAMS;
        }
    }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error.err));
    })));   
  };
  

  //----------------------------------------------------------

  // From here supportive functions for exams-detail.ts

  getExamTitleByExamId(Id){//created for version 3.2.0
    return new Promise ((resolve,reject) => resolve(this.query(this.db,"SELECT * FROM ExamType WHERE Id="+Id).then((data) => {
        if(data.res.rows.length > 0) {
            return data.res.rows.item(0).ExamTitle;
        }
    }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error.err));
    })));
  }

 shuffle(QUESTION) {
    let array = [];
    let valid = [];
    let value = 1;
    // before shuffling we check if answer is multi-answer
    if(QUESTION.Answer.length > 1) {
        // if multi-answer we remove the commas
        QUESTION.Answer = QUESTION.Answer.replace(/,/g,"");    
    };  
    // we create question options array of options not null
    Object.keys(QUESTION).forEach(function(key) {
        if(key == 'A' || key == 'B' || key =='C' || key == 'D' || key == 'E') {
            if(QUESTION[key] != ''){
                array.push(QUESTION[key]);
                console.log(QUESTION.Answer);
                // is the key in the answer, if so add 1 to valid array
                if(QUESTION.Answer.indexOf(key) > -1){
                    valid.push(1);
                    value++;
                } else {
                    valid.push(0);
                }
                console.log("Valid",valid);
            }
        }
    });

    // this shuffle the options keys array
    let counter = array.length;
    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);
        // Decrease counter by 1
        counter--;
        // And swap the last element with it
        let temp = array[counter];
        let tv = valid[counter];
        array[counter] = array[index];
        valid[counter] = valid[index];
        array[index] = temp;
        valid[index] = tv;
    }
    console.log("Valid",valid);
    
    // after shuffling, we retrieve the new valid answer
    let i = 0;
    // reset previous QUESTION Answer
    QUESTION.Answer = "";
    // we scan the keys of shuffled array and put them back into QUESTION object
    Object.keys(QUESTION).forEach(function(key) {
        if(key == 'A' || key == 'B' || key =='C' || key == 'D' || key == 'E') {
            if(QUESTION[key] != ''){
                QUESTION[key] = array[i];
                // if key was marked with 1, it means that's part of the valid answer
                if(valid[i] == 1) {
                    QUESTION.Answer = QUESTION.Answer + key;
                }
                i++;
            }
        }
    });

    console.log('SHUFFLED: ', QUESTION);
    return QUESTION;
}

  getQuestionById(Id) {
    //console.log('received id' + Id + typeof(Id));
    let QUESTION = {};
    let shuffledArray = {};
    let shuffle = this._shuffle;
    return new Promise ((resolve,reject) => resolve(this.query(this.db,"SELECT * FROM Question WHERE Id="+Id).then((data) => {
        if(data.res.rows.length > 0) {
            QUESTION = data.res.rows.item(0);
            if(shuffle) {
                shuffledArray = this.shuffle(QUESTION);
                return shuffledArray;
            } else {
                return QUESTION;
            }        
        }
    }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error.err));
    })));
  }

  //new function introduced in version 3.3.0 for multicategory support
  getQuestionsIdForExamId(examid,categories,orderby,startonqid,qty){
    //dermine orderby
    let orderByOption = "";
    let startOption = "";
    switch (orderby) {
        case 'R': {
          orderByOption = "RANDOM ()";
          break;
        }
        case 'A': {
          orderByOption = "Id ASC";
          startOption = "AND Question.Id >= " + startonqid;
          break;
        }
        case 'D': {
          orderByOption = "Id DESC";
          startOption = "AND Question.Id <= " + startonqid;
          break;
        }
    }
    let QUESTIONS = [];
    if(this.source=='cordova'){
      return new Promise ((resolve,reject) => resolve(this.query(this.db,"SELECT * FROM Question WHERE Question.CatId IN (" + categories + ")" + startOption + " AND Question.Enabled>=1 AND Question.Status<2 ORDER BY " + orderByOption + " LIMIT " + qty).then((data) => {  
        if(data.res.rows.length > 0) {
              for(let i=0;i<data.res.rows.length;i++){
                QUESTIONS[i] = data.res.rows.item(i).Id;
                console.log('Record: ',data.res.rows.item(i).Id);
              }
              console.log("QUESTIONS IDs -> " + JSON.stringify(QUESTIONS));
              return QUESTIONS;
          }
      }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error));
      })));
    } else {
      let _tempQuestionsIDs=[];
      let randomNum;
      if(orderby == "R") {
        return new Promise ((resolve,reject) => resolve(this.query(this.db,"SELECT * FROM Question WHERE Question.CatId IN (" + categories + ")" + startOption + " AND Question.Enabled>=1 AND Question.Status<2").then((data) => {
            if(data.res.rows.length > 0) {
                for(let i=0;i<data.res.rows.length;i++){
                  _tempQuestionsIDs[i] = data.res.rows.item(i).Id;
                }
                for(let i=0; i<qty; i++) {
                  randomNum = Math.floor(Math.random() * _tempQuestionsIDs.length);
                  QUESTIONS[i] = _tempQuestionsIDs[randomNum];
                }
                console.log("QUESTIONS IDs -> " + JSON.stringify(QUESTIONS));
                return QUESTIONS;
            }
        }, (error) => {
            console.log("ERROR -> " + JSON.stringify(error.err));
        })));
      } else {
        return new Promise ((resolve,reject) => resolve(this.query(this.db,"SELECT * FROM Question WHERE Question.CatId IN (" + categories + ")" + startOption + " AND Question.Enabled>=1 AND Question.Status<2 ORDER BY " + orderByOption + " LIMIT " + qty).then((data) => {
            if(data.res.rows.length > 0) {
                for(let i=0;i<data.res.rows.length;i++){
                    QUESTIONS[i] = data.res.rows.item(i).Id;
                }
                console.log("QUESTIONS IDs -> " + JSON.stringify(QUESTIONS));
                return QUESTIONS;
            }
        }, (error) => {
            console.log("ERROR -> " + JSON.stringify(error.err));
        })));  
      }
    }
  }
  
  getQuestionsIdByCatAndQty(Cat,Qty) {//modified for version 3.2.0
    console.log('CATEGORY: ', Cat, "QUANTITY: ",Qty);
    let QUESTIONS = [];
    if(this.source=='cordova'){
      return new Promise ((resolve,reject) => resolve(this.query(this.db,"SELECT * FROM Question WHERE Question.CatId=" + Cat + " AND Question.Enabled>=1 AND Question.Status<2 ORDER BY RANDOM() LIMIT " + Qty).then((data) => {  
        if(data.res.rows.length > 0) {
              for(let i=0;i<data.res.rows.length;i++){
                QUESTIONS[i] = data.res.rows.item(i).Id;
                console.log('Record: ',data.res.rows.item(i).Id);
              }
              console.log("QUESTIONS IDs -> " + JSON.stringify(QUESTIONS));
              return QUESTIONS;
          }
      }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error));
      })));
    } else {
      let _tempQuestionsIDs=[];
      let randomNum;
      return new Promise ((resolve,reject) => resolve(this.query(this.db,"SELECT * FROM Question WHERE Question.CatId=" + Cat + " AND Question.Enabled>=1 AND Question.Status<2").then((data) => {
          if(data.res.rows.length > 0) {
              for(let i=0;i<data.res.rows.length;i++){
                _tempQuestionsIDs[i] = data.res.rows.item(i).Id;
              }
              for(let i=0; i<Qty; i++) {
                randomNum = Math.floor(Math.random() * _tempQuestionsIDs.length);
                QUESTIONS[i] = _tempQuestionsIDs[randomNum];
              }
              console.log("QUESTIONS IDs -> " + JSON.stringify(QUESTIONS));
              return QUESTIONS;
          }
      }, (error) => {
          console.log("ERROR -> " + JSON.stringify(error.err));
      })));
    }
  }

  getQuestionsById(Qty, Id) {
    let randomNum, qId;
    let ArrayQ=[];
    for(let i=0; i<Qty; i++) {
      randomNum = Math.floor(Math.random() * Id.length);
      qId = Id[randomNum];
      this.getQuestionById(qId).then(res=>{
        ArrayQ.push(res);
      });
    }
    return ArrayQ;
  }

  updateExplaShownInQuestionId(Id){
      this.query(this.db,"UPDATE Question SET ExplanationShown='Y' WHERE Id="+Id).then((data) => {
        console.log('Question Id: '+Id+' was updated');
      });
  }

  //-------------------------------------------------------------

  // Get and Set Property functions used accross Quizionic2

  getProperty(property) {
    let value;
    return new Promise ((resolve,reject) => resolve(this.query(this.db,"SELECT * FROM Config WHERE property=?",[property]).then((data) => {
        value = data.res.rows.item(0).value;
        console.log("PROPERTY GET -> " + property + " = " + value);
        return value;
    }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error.err));
    }))).catch(console.log.bind(console));
  }

  setProperty(nameP,value) {
    return new Promise ((resolve,reject) => resolve(this.query(this.db,"UPDATE Config SET value='" + value + "' WHERE property='" + nameP + "'").then((data) => {
          console.log("PROPERTY SET -> " + nameP + " = " + value);
          return 0;
    }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error.err));
    })));
  }

  //-------------------------------------------------------------

  // Tracker supportive functions

  createProgressTable() {
    return new Promise ((resolve,reject) => resolve(this.query(this.dbp,"CREATE TABLE 'Progress' ('UserName' TEXT NOT NULL, 'Email' TEXT NOT NULL, 'ExamId' INTEGER NOT NULL, 'ExamTitle' TEXT NOT NULL, 'StartDate' INTEGER NOT NULL, 'EndDate' INTEGER NOT NULL, 'Scored' INTEGER NOT NULL, 'Time' INTEGER NOT NULL, 'qTimes' TEXT NOT NULL)").then((data) => {
        console.log("PROGRESS table created");
    }, (error) => {
        //console.log("ERROR -> " + JSON.stringify(error.err));
    })));
  }

  loadProgress(user, lsr, examid) {
    let PROGRESS = [];
    let querys;
    if(examid) {
      querys = "SELECT StartDate, Scored, ExamId, Time, CASE WHEN (Scored<80) THEN 'NO' ELSE 'YES' END AS Passed FROM Progress where UserName='"+user+"' and ExamId=" + examid + " ORDER BY StartDate DESC limit " + lsr;
    } else {
      querys="SELECT StartDate, Scored, ExamId, Time, CASE WHEN (Scored<80) THEN 'NO' ELSE 'YES' END AS Passed FROM Progress where UserName='"+user+"' ORDER BY StartDate DESC limit " + lsr;
    }
    return new Promise ((resolve,reject) => resolve(this.query(this.dbp,querys).then((data) => {
        if(data.res.rows.length > 0) {
          for(let i=0;i<data.res.rows.length;i++){
            PROGRESS.push(data.res.rows.item(i));
          }
          console.log("PROGRESS -> " + JSON.stringify(PROGRESS));
          return PROGRESS;
        }
    }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error.err));
    })));
  }

  //this.dbService.updateProgress(this.user, this.examid, this.title, this.examStartTime, this.examEndTime, testScore, this.spentTime, this.qTimes
  updateProgress(user, email, examid, examTitle, start, end, testScore, spentTime, qTimes) { 
    let querys = "INSERT INTO Progress VALUES('" + user + "','" + email + "'," + examid + ",'" + examTitle + "'," + start + ","  + end + "," + testScore + "," + spentTime + ",'" + qTimes + "');";
    return new Promise ((resolve,reject) => resolve(this.query(this.dbp,querys).then((data) => {
        //console.log("INSERTED Score:" + testScore + " for User: " + user + " with email: " + email + " in Test: " + examid + " started at: " + start + " and finished at " + end + " in " + spentTime + "s and question times " + qTimes);
        querys=null;
    }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error.err));
    })));
  }

  getProgressByUserId(user) {
    let PROGRESS = [];
    let querys = "SELECT DISTINCT ExamId, ExamTitle FROM Progress WHERE UserName='" + user + "' ORDER BY ExamId";
    return new Promise ((resolve,reject) => resolve(this.query(this.dbp,querys).then((data) => {
        if(data.res.rows.length > 0) {
          for(let i=0;i<data.res.rows.length;i++){
            PROGRESS.push(data.res.rows.item(i));
          }
          //console.log("PROGRESS -> " + JSON.stringify(PROGRESS));
          return PROGRESS;
        }
    }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error.err));
    })));
  }

  //-------------------------------------------------------------

  // UpdateDB supportive functions

  insertCategory(data) {
    let querys = "INSERT INTO Category VALUES (" + data.CatId + ",'" + data.Category + "'," + data.Enabled + ")";
    return new Promise ((resolve,reject) => resolve(this.query(this.db,querys).then((data) => {
        console.log("INSERTED Category: " + data.CatId + " " + data.Category);
        querys=null;
    }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error.err));
    })));
  }

  insertQuestion(data) {
    let querys = "INSERT INTO Question VALUES (" + data.Id + "," + data.CatId + ",'" + data.Question + "','" + data.Answer + "','" + data.A + "','" + data.B + "','" + data.C + "','" + data.D + "','" + data.E + "'," + data.Status + "," + data.Enabled + ",'" + data.Explanation + "','" + data.Image + "','" + data.ExplanationShown + "')";
    return new Promise ((resolve,reject) => resolve(this.query(this.db,querys).then((data) => {
        console.log("INSERTED Question: " + data.Id + " " + data.Question);
        querys=null;
    }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error.err));
    })));
  }

  insertExamType(data) {
    let querys = "INSERT INTO ExamType VALUES ('" + data.ExamTitle + "'," + data.CatId + "," + data.Qty + "," + data.MinScore + "," + data.Duration + "," + data.Enabled + ",'" + data.Icon + "','" + data.Progress + "'," + data.NextExam + ")";
    return new Promise ((resolve,reject) => resolve(this.query(this.db,querys).then((data) => {
        console.log("INSERTED ExamType: " + data.Id + " " + data.ExamTitle);
        querys=null;
    }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error.err));
    })));
  }

  insertFlashCard(data) {
    let querys = "INSERT INTO FlashCard VALUES (" + data.Id + "," + data.CatId + ",'" + data.FrontText + "','" + data.FrontImg + "','" + data.BackText + "','" + data.BackImg + "'," + data.Enabled + ")";
    console.log(querys);
    return new Promise ((resolve,reject) => resolve(this.query(this.db,querys).then((res) => {
      console.log('INSERTED FlashCard Id: ' + data.Id);
    }, (error) => {
       console.log("ERROR -> " + JSON.stringify(error.err));
    })));
  }

  insertFlashCardList(data) {
    let querys = "INSERT INTO FlashCardList VALUES (" + data.Id + ",'" + data.Title + "','" + data.CatId + "','" + data.OrderBy + "','" + data.StartOnFCID + "'," + data.Enabled + ")";
    console.log(querys);
    return new Promise ((resolve,reject) => resolve(this.query(this.db,querys).then((res) => {
      console.log('INSERTED FlashCardList Id: ' + data.Id );
    }, (error) => {
       console.log("ERROR -> " + JSON.stringify(error.err));
    })));
  }

  updateCategory(data) {
      let querys = "REPLACE INTO Category (CatId, Category, Enabled) VALUES (" + data.CatId + ",'" + data.Category + "'," + data.Enabled + ")";
      return new Promise ((resolve,reject) => resolve(this.query(this.db,querys).then((res) => {
        resolve(res);
      }, (error) => {
         console.log("ERROR -> " + JSON.stringify(error.err));
      })));
  }

  updateQuestion(data) {
      if(data.Image == null || data.Image == 'null') data.Image = "";
      if(data.C == null || data.C == 'null') data.C = "";
      if(data.D == null || data.D == 'null') data.D = "";
      if(data.E == null || data.E == 'null') data.E = "";
      if(data.Explanation == null || data.Explanation == 'null') data.Explanation = "";
      let querys = "REPLACE INTO Question (Id, CatId, Question, Answer, A, B, C, D, E, Status, Enabled, Explanation, Image, ExplanationShown) VALUES (" + data.Id + "," + data.CatId + ",'" + data.Question + "','" + data.Answer + "','" + data.A + "','" + data.B + "','" + data.C + "','" + data.D + "','" + data.E + "'," + data.Status + "," + data.Enabled + ",'" + data.Explanation + "','" + data.Image + "','" + data.ExplanationShown + "')";
      return new Promise ((resolve,reject) => resolve(this.query(this.db,querys).then((res) => {
        resolve(res);
      }, (error) => {
         console.log("ERROR -> " + JSON.stringify(error.err));
      })));
  }

  updateExamType(data) {
    let querys = "REPLACE INTO ExamType (Id, ExamTitle, CatId, Qty, MinScore, Duration, Enabled, Icon, Progress, NextExam) VALUES (" + data.Id + ",'" + data.ExamTitle + "'," + data.CatId + "," + data.Qty + "," + data.MinScore + "," + data.Duration + "," + data.Enabled + ",'" + data.Icon + "','" + data.Progress + "'," + data.NextExam + ")";
    return new Promise ((resolve,reject) => resolve(this.query(this.db,querys).then((res) => {
       resolve(res);
    }, (error) => {
       console.log("ERROR -> " + JSON.stringify(error.err));
    })));
  }

  updateFlashCard(data) {
    let querys = "REPLACE INTO FlashCard (Id, CatId, FrontText, FrontImg, BackText, BackImg, Enabled) VALUES (" + data.Id + "," + data.CatId + ",'" + data.FrontText + "','" + data.FrontImg + "','" + data.BackText + "','" + data.BackImg + "'," + data.Enabled + ")";
    return new Promise ((resolve,reject) => resolve(this.query(this.db,querys).then((res) => {
      resolve(res);
    }, (error) => {
       console.log("ERROR -> " + JSON.stringify(error.err));
    })));
  }

  updateFlashCardList(data) {
    let querys = "REPLACE INTO FlashCardList (Id, Title, CatId, OrderBy, StartOnFCID, Enabled) VALUES (" + data.Id + ",'" + data.Title + "','" + data.CatId + "','" + data.OrderBy + "','" + data.StartOnFCID + "'," + data.Enabled + ")";
    return new Promise ((resolve,reject) => resolve(this.query(this.db,querys).then((res) => {
      resolve(res);
    }, (error) => {
       console.log("ERROR -> " + JSON.stringify(error.err));
    })));
  }

  updateDB(table,data){
    let sizeArray = Object.keys(data).length;
    if(sizeArray > 0 ) {
      switch (table) {
        case 'Category': {
          for (let n=0; n<sizeArray; n++) {
            this.updateCategory(data[n]).then(res=>{return res;});
          }
          break;
        }
        case 'Question': {
          for (let m=0; m<sizeArray; m++) {
            this.updateQuestion(data[m]).then(res=>{return res;});
          }
          break;
        }
        case 'ExamType': {
          for (let o=0; o<sizeArray; o++) {
            this.updateExamType(data[o]).then(res=>{return res;});
          }
          break;
        }
        case 'FlashCard': {
            for (let o=0; o<sizeArray; o++) {
              this.updateFlashCard(data[o]).then(res=>{return res;});
            }
            break;
        }
        case 'FlashCardList': {
            for (let o=0; o<sizeArray; o++) {
              this.updateFlashCardList(data[o]).then(res=>{return res;});
            }
            break;
        }
      }
    }
  }

// Flash Card support functions
//-----------------------------

getFlashCardList() {//created for version 3.3.0
    let FCLIST = [];
    return new Promise ((resolve,reject) => resolve(this.query(this.db,"SELECT * FROM FlashCardList WHERE Enabled>=1 ").then((data) => {
        if(data.res.rows.length > 0) {
            for(var i = 0; i < data.res.rows.length; i++) {
                FCLIST.push(data.res.rows.item(i));
            }
            return FCLIST;
        }
    }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error.err));
    })));   
  };

getFlashCardsId(categories,id,orderby){
    let FCARDS = [];
    let orderByOption = "";
    let startOption = "";
    switch (orderby) {
        case 'R': {
          orderByOption = "RANDOM ()";
          break;
        }
        case 'A': {
          orderByOption = "Id ASC";
          startOption = "AND Id >= " + id;
          break;
        }
        case 'D': {
          orderByOption = "Id DESC";
          startOption = "AND Id <= " + id;
          break;
        }
    }
    if (this.source == 'cordova'){
        return new Promise ((resolve,reject) => resolve(this.query(this.db,"SELECT * FROM FlashCard WHERE Enabled>=1 " + startOption + " AND CatId IN (" + categories + ") " + "ORDER BY " + orderByOption).then((data) => {
            if(data.res.rows.length > 0) {
                let qty = data.res.rows.length;
                console.log('CANTIDAD: ' + qty);
                for(var i = 0; i < data.res.rows.length; i++) {
                    FCARDS.push(data.res.rows.item(i).Id);
                }
                return [FCARDS,qty];
            }
        }, (error) => {
            console.log("ERROR -> " + JSON.stringify(error.err));
        })));   
    } else {
        let _tempIDs=[];
        let randomNum;
        if( orderby == 'R') {
            return new Promise ((resolve,reject) => resolve(this.query(this.db,"SELECT * FROM FlashCard WHERE Enabled>=1 " + startOption + " AND CatId IN (" + categories + ") ").then((data) => {
                if(data.res.rows.length > 0) {
                    let qty = data.res.rows.length;
                    for(let i=0;i<data.res.rows.length;i++){
                        _tempIDs[i] = data.res.rows.item(i).Id;
                    }
                    for(let i=0; i<qty; i++) {
                        randomNum = Math.floor(Math.random() * _tempIDs.length);
                        FCARDS[i] = _tempIDs[randomNum];
                    }
                    console.log("FLASH CARDS IDs -> " + JSON.stringify(FCARDS));
                    return [FCARDS,qty];
                }
            }, (error) => {
                console.log("ERROR -> " + JSON.stringify(error.err));
            })));          
        } else {
            return new Promise ((resolve,reject) => resolve(this.query(this.db,"SELECT * FROM FlashCard WHERE Enabled>=1 " + startOption + " AND CatId IN (" + categories + ") " + "ORDER BY " + orderByOption).then((data) => {
                if(data.res.rows.length > 0) {
                    let qty = data.res.rows.length;
                    console.log('CANTIDAD: ' + qty);
                    for(var i = 0; i < data.res.rows.length; i++) {
                        FCARDS.push(data.res.rows.item(i).Id);
                    }
                    return [FCARDS,qty];
                }
            }, (error) => {
                console.log("ERROR -> " + JSON.stringify(error.err));
            })));      
        }
        
    }
  }
  
  getFlashCardById(Id) {//created for version 3.3.0
    let FC = {};
    return new Promise ((resolve,reject) => resolve(this.query(this.db,"SELECT * FROM FlashCard WHERE Id=" + Id).then((data) => {
        if(data.res.rows.length > 0) {
            FC = data.res.rows.item(0);
            return FC;
        }
    }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error.err));
    })));   
  };
}
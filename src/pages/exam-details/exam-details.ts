import {Component, ViewChild} from '@angular/core';
import { Content } from 'ionic-angular';
import {NavController, NavParams, ModalController, AlertController, ActionSheetController} from 'ionic-angular';
import {DbService} from '../../providers/db-service';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { AdMobFree } from '@ionic-native/admob-free';
//import {Storage} from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
//import { map } from 'rxjs/operators/map';
import {CONFIG} from '../../providers/app-config';
import {ResultPage} from '../result/result';
import { NativeStorage } from '@ionic-native/native-storage';

let _highlight: boolean;
let _qID;
let _score;
let _timeOver;
let _lastQuestion;
let _timed;
let _click;
let _admob: boolean;
let _Paid;
let _exam;
let _examOver;
let _nextView;
let _explanation: boolean;
let _expQuantity;
let _explaAvailabilty;
let _npbutton: boolean;
let _eet; 
let _est;
let _resultPage: boolean;
let _autoQJump: boolean;

@Component({
    selector: 'exam-details',
    templateUrl: 'exam-details.html',
    //directives: [NgClass]
})

export class ExamDetailsPage {
  private _nextID: any;
  private _previousBtn: boolean;
  private resultArray: any;
  private questionArrayID:{};
  private scoreArrayID: Array<number>;
  //private questionsDetail: any;
  public question: any;
  private qStatus: number;
  private ExplaAvailable: Boolean;
  private indexQ: any;
  private source: any;
  public timed: Boolean;
  private time: string;
  private diff: number;
  private spentTime: number;
  private minutes: any;
  private seconds: any;
  private multiAnswer: Boolean;
  private timerTimeout: any;
  private testTime: any;
  private duration: any;
  public title: string;
  private qty: number;
  private score: number;
  private user: any;
  private email: any;
  private examid: any;
  private recordProgress: any;
  private isNormal: any;
  private isOut: any;
  private adId: any;
  private expQty: any;
  private nextExam: any;
  private minScore: any;
  private npb: any;
  private qTS: any; 
  private qTE: any;
  private qTime: any; 
  private examStartTime: any;
  private examEndTime: any;
  private examPassed: any;
  private uAnswer: string;
  private onlineProgress: boolean;
  private examStatus: number; //0=quit,1=timeOver,2=completed
  private questionsDetail: {qID: number,time: number,uAnswer: string,qStatus: number} [];
  private _MABtnUp: boolean;
  private _actionSheet: boolean;
  private stats: boolean;
  private qc: number;
  private qi: number;
  private dbversion: any;
  
  @ViewChild('cont') content: Content;
  

    constructor(private analytics: GoogleAnalytics, private modal: ModalController, public http: HttpClient, private admob: AdMobFree, public actionSheetCtrl: ActionSheetController, public alertCtrl: AlertController, public nav: NavController, public navParams: NavParams, private nativeStorage: NativeStorage, public dbService: DbService) {
    _click = false;
      _examOver = false;
      _timeOver = false;
      _nextView='back';
      _score = 1;
      this.nav = nav;
      this.score = 0;
      this.isNormal = true;
      this.isOut = false;
      _exam = navParams.get('exam');
      this.source = navParams.get('source');
      this.adId = navParams.get('adId');
      this.dbversion = navParams.get('dbVersion');
      this.examid = _exam.Id;
      this.duration = _exam.Duration;
      this.title = _exam.ExamTitle;
      this.qty = _exam.Qty;    
      this.resultArray = new Array(this.qty);
      this.scoreArrayID = new Array(this.qty);
      this.questionsDetail = new Array(this.qty);
      this.recordProgress = _exam.Progress;
      this.nextExam = _exam.NextExam;
      this.minScore = _exam.MinScore;
      _timed = this.duration>0? true:false;
      this.timed=_timed;
      this.qc = 0;
      this.qi = 0;
      this.dbService.getProperty('statsOnExam').then(data => this.stats = data == 'true'? true:false);
      this._nextID=0;
      this.dbService.getProperty('explanationq').then(data => {_expQuantity = data;this.expQty = _expQuantity;});
      this.onlineProgress = false;
      this.dbService.getProperty('onlineProgress').then(data => {if (data == 'true') this.onlineProgress = true});
      //this.dbService.getQuestionsIdByCatAndQty(_exam.CatId,_exam.Qty).then(data => {this.questionArrayID = data; this.initQuestionsDetailArray()});
    }

    initQuestionsDetailArray(){
     for(var m=0;m<this.qty;m++){
      //this.dbService.getQuestionById(this.questionArrayID[m]).then(data => {this.questionArray.push(data)});
      //this.questionArrayID[m] = 1;
      this.questionsDetail[m]={"qID": 0, "time":0, "uAnswer":'',"qStatus":0};
      }
    }

    // this is the main timer function to update time left in GUI
    onTimerTimeout(){
      this.diff = this.duration--;
      this.spentTime = this.testTime-this.diff;
      if (this.diff === 0) {
        _timeOver = true;
      }
      // format timer value
      this.minutes = (this.diff / 60) | 0;
      this.seconds = (this.diff % 60) | 0;
      this.minutes = this.minutes < 10 ? "0" + this.minutes : this.minutes;
      this.seconds = this.seconds < 10 ? "0" + this.seconds : this.seconds;
      this.time = this.minutes + ":" + this.seconds;

      if (this.diff <= 10) {
        //used to change CSS property (color green to red when time <10s)
        this.isOut = true;
        this.isNormal = false;
      }

      // if there is time left, then we call it again
      if (!_timeOver) {
        this.timerTimeout = setTimeout(()=> {
          this.onTimerTimeout();
        },1000);
        // otherwise, we cancel the timer and pop-up the alert
      } else {
        clearTimeout(this.timerTimeout);
        this.examStatus=0; 
        this.alert("timeOut");
      }
    }

    showQuestion(questionId){
      this.qStatus=1;
      this.uAnswer='';
      this.qTS = new Date();
      console.log("Question Start: " + this.qTS);
      this.multiAnswer = false;
      this.content.setElementAttribute('margin-bottom',"0 !important");
      this.content.setScrollElementStyle('margin-bottom','0');
      this.content.setElementStyle('margin-bottom','0');
      this.content.resize();
      
      // initialize timer count if we have a timed exam
      // if timer is not in use yet, then we create it
      if(this.timed && typeof this.timerTimeout === 'undefined') {
        this.testTime = this.duration;
        this.timerTimeout = setTimeout(() => {this.onTimerTimeout()},1000);
      }
      this.scoreArrayID[this._nextID] = 0;
      
      // get question to show
      this.dbService.getQuestionById(questionId).then(data => {
        this.question = data;
        this.resultArray[this._nextID] = this.question;
        if(this.question.Answer.length > 1) {
          this.multiAnswer = true;
          this.content.setElementAttribute('margin-bottom','44px');
          this.content.resize();
          let temp = this.question.Answer.replace(/,/g,"");
          // if we have same option twice, it forces validation for single answer
          if (temp[0]!=temp[1]){
            this.question.Answer = temp;
          } else {
            this.question.Answer = temp[0];
          }
          console.log("QUESTION ANSWER TEMP "+this.question.Answer);
        };  
        this.question._f = {'A':0,'B':0,'C':0,'D':0,'E':0};
        // check if there is explanation text in this question
        // and if overal explanation flag is enabled
        if (this.question.Explanation !== '' && _explanation){
          this.ExplaAvailable = true;
          // then check if explanation has been shown before,
          _explaAvailabilty = this.question.ExplanationShown? true:false;
        } else {
          this.ExplaAvailable = false;
        }
      });
      this.content.resize();
      this.content.scrollToTop();
    }

    reportProgress(pdata){
      
      let headers = new HttpHeaders();
      headers.append('Content-Type','application/json');

      let url = CONFIG.reportProgressURL;
      
      this.http.post(url, JSON.stringify(pdata), {headers: headers})
        //(map(res => res.json()));
        .subscribe(data =>{
        console.log('WebService Response: '+ data);
        let alert;
        if(data == 200){ //Success
           alert = this.alertCtrl.create({
            title: 'Progress reported',
            subTitle: 'Your score has been reported to remote server.',  
          });
        } else { //You might want to do something else when failure is detected.
          alert = this.alertCtrl.create({
            title: 'Progress not reported',
            subTitle: 'There was an error when attempting to report the score.',  
          });
        }
        //alert.present();
      });
    }

    alert(condition){
      // calculate 
      this.recordTime();
      for(var i=0;i<this.qty;i++){
        this.score = this.score + this.scoreArrayID[i];
      }
      let testScore=Math.floor((this.score/this.qty)*100);
      console.log('testScore '+testScore+' minScore: '+this.minScore);
      this.examPassed = 0;
      if(testScore >= this.minScore) {
        this.examPassed = 1;
        console.log('MinScore reached!');
        if(this.nextExam){
          //unlock linked exam
          this.dbService.unlockExamById(this.nextExam);
          this.dbService.getExamTitleByExamId(this.nextExam).then((data)=>{
            let alert = this.alertCtrl.create({
              title: 'EXAM UNLOCKED!',
              subTitle: 'Unlocked: ' + data,
              buttons: [{text: 'Close'}]
            });
            alert.present();
          });
        }
      }
      this.examEndTime = new Date().getTime();
      _eet = new Date().toISOString();
      
      //is full version and recordProgress enabled for this exam?
      if (_Paid && this.recordProgress == "Y"){
        if(!this.spentTime){
          this.spentTime=0;
        }

        //updating local and remote progress tables
        this.spentTime = this.examEndTime - this.examStartTime;
        var jsonString = JSON.stringify(this.questionsDetail);

        //update local table 
        this.dbService.updateProgress(this.user, this.email, this.examid, this.title, this.examStartTime, this.examEndTime, testScore, this.spentTime, jsonString);
        
        //update remote table if remote progress is Enabled in Config table
        let progressData = {userName: this.user, userEmail: this.email, examId: this.examid, examTitle: this.title, examStarted: _est, examFinished: _eet, examScore: testScore, examTime: this.spentTime, examStatus: this.examStatus, examPass: this.examPassed, questionsDetail: jsonString}; 
        if(this.onlineProgress) {
          this.reportProgress(progressData);
        }
      }

      //let's configure the alert based on condition
      let tit: string;
      let subTit: string;

      switch (condition) {
        case "timeOut":
              tit='Time Over';
              subTit='Your Score was: ' + testScore + '%';
              for(let l=this._nextID;l<this.qty;l++){
                
                this.dbService.getQuestionById(this.questionArrayID[l]).then(data => {
                  this.resultArray[l]=data; 
                  this.resultArray[l]._f = {'A':0,'B':0,'C':0,'D':0,'E':0};
                  this.resultArray[l].uAnswer = '';
                });  
              }
              break;
        case "lastQuestion":
              tit='Exam completed';
              subTit='Your Score: ' + testScore + '%';
              break;
      }

      //cancel the timer if is it not yet cancelled.
      if (typeof this.timerTimeout !== 'undefined'){
        clearTimeout(this.timerTimeout);
      }

      let alert;

      if (_resultPage) {
        let result = this.modal.create(ResultPage, {data: this.resultArray, eTitle: this.title, qty: this.qty, score: testScore});
        alert = this.alertCtrl.create({
          title: tit,
          subTitle: subTit,
          buttons: [
            {
              text: 'Close',
              handler: () => {
                _examOver = true;
                let alertTransition = alert.dismiss();
                alertTransition.then(()=>{
                  this.nav.pop();
                });
                return false;
              }
          },
            {
              text: 'View Results',
              handler: () => {
                _examOver = true;
                let alertTransition = alert.dismiss();
                alertTransition.then(()=>{
                  result.present();
                  this.nav.pop();
                });
                return false;
              }
          }]
        });
      } else { 
        alert = this.alertCtrl.create({
            title: tit,
            subTitle: subTit,
            buttons: [
              {
                text: 'OK',
                handler: () => {
                  _examOver = true;
                  let alertTransition = alert.dismiss();
                  alertTransition.then(()=>{
                    this.nav.pop();
                  });
                  return false;
                }
            }]
        });
      }
      alert.present();
    }

    getNextQuestionId(){
      if (!_timeOver && !_examOver){
        if (this.indexQ <= this.qty) {
          this._nextID = this.indexQ - 1;
          if (typeof this.questionArrayID == 'undefined'){
            _qID = 0;
          } else {
            console.log(this.indexQ, this._nextID,this.questionArrayID,this.questionArrayID[this._nextID]);
            _qID = this.questionArrayID[this._nextID];
          }
          return _qID;
        } else {
          _lastQuestion = true;
          this.alert("lastQuestion");
          if (_admob && !_Paid){
            // customize interstitial
            this.admob.interstitial.prepare().then(()=>{
              this.admob.interstitial.show();
            }).catch(e=>console.log(e));
          }
        }
      } else {
        this.recordTime();
        _timeOver = true;
        this.alert("timeOut");
        if (_admob && !_Paid){
          // customize interstitial
          this.admob.interstitial.prepare().then(()=>{
            this.admob.interstitial.show();
          }).catch(e=>console.log(e));
        }
      }
    }

    clickedRow(rowId){
      // check for multiAnswer
      if(this.multiAnswer){
        if(this.question._f[rowId]==0){
          this.question._f[rowId] = 2;  
        } else {
          this.question._f[rowId] = 0;
        }
      } // only one answer 
      else if(!_click && !_examOver){
        //we avoid rebounce of touch/tap events
        _click = true;
        console.log("ROWID: "+rowId);
        this.uAnswer = rowId;
        this.resultArray[this._nextID].uAnswer = this.uAnswer;
        if(this.question.Answer === rowId) {
          this.question._f[rowId] = 1;
          this.resultArray[this._nextID].Status = 1;
          this.qStatus=3;
          this.scoreArrayID[this.indexQ-1]= _score;
          this.qc++;
        } else {
          this.question._f[rowId] = -1;
          this.qi++;
          this.resultArray[this._nextID].Status = -1;
          this.qStatus=2;
          this.scoreArrayID[this.indexQ-1]= 0;
          console.log('_highlight ' + _highlight);
          if(_highlight) {
            this.question._f[this.question.Answer] = 1;
          }
        }
        
        this.continueExam(); 
      }
    }

    validateAnswer(){
      let answerTemp="";
      for(var rowId = "A".charCodeAt(0); rowId < "F".charCodeAt(0); rowId++) {
          if (this.question._f[String.fromCharCode(rowId)]==2){
            answerTemp=answerTemp+String.fromCharCode(rowId);
          }
      }
      this.content.setElementAttribute('margin-bottom',"0 !important");
      this.content.setScrollElementStyle('margin-bottom','0');
      this.content.setElementStyle('margin-bottom','0');
      this.content.resize();
      let highlightAnswer=this.question.Answer.split("");
      let userHighlight=answerTemp.split("");
      console.log("MultiAnswer: "+answerTemp);
      this.uAnswer = answerTemp;
      this.resultArray[this._nextID].uAnswer = this.uAnswer;
      if(this.question.Answer === answerTemp){
        console.log('CORRECT ANSWERED');
        this.qStatus=3;
        this.scoreArrayID[this.indexQ-1]= _score;
        this.resultArray[this._nextID].Status = 1;
        this.qc++;
      } else {
        console.log('INCORRECT ANSWERED');
        this.qi++;
        // Highlight wrong answers
        this.scoreArrayID[this.indexQ-1]= 0;
        this.qStatus=2;
        this.resultArray[this._nextID].Status = -1;
        if(_highlight) {
          for(var k=0; k<userHighlight.length; k++){
            if(userHighlight[k] != highlightAnswer[k]) {
              this.question._f[userHighlight[k]]=-1;
            }
          }
        }
      }

      // Highlight correct answers
      if(_highlight) {
        for(var j=0; j<highlightAnswer.length; j++){
            this.question._f[highlightAnswer[j]]=1;
        }
      }
      this.multiAnswer = false;
      this.continueExam();
    }

    continueExam(){
      if (this.indexQ === this.qty) {
          _examOver = true;
          _lastQuestion = true;
          this.alert("lastQuestion");
          if (_admob && !_Paid){
            // customize interstitial
            this.admob.interstitial.prepare().then(()=>{
              var that = this;
              setTimeout(function(){
                that.admob.interstitial.show()
              },1000)             
            }).catch(e=>console.log(e));
          }

      } else {
        if (_autoQJump) {
          setTimeout(()=>{
            _click=false; 
            this.nextQuestion();
          },CONFIG.delayForNextQuestion);  //1000 mileseconds
        } else {
          this.npb = true;
        }
      }
    }

    explanation(qId) {
      // handle the explanation button functionality
      // if the exam is not over
      let actionSheet;
      let explaAlert;
      if(!_timeOver && !_examOver){
        // if we have explanations left and if question has an explanation,
        // then we configure the actionsheet to show the explanation text
        if(_expQuantity > 0 || _explaAvailabilty){

           actionSheet = this.actionSheetCtrl.create({
              buttons: [
                  {text: this.question.Explanation,
                   handler: () => {
                        let navTransition = actionSheet.dismiss();
                        navTransition.then(()=>{
                            //
                        });
                        console.log('Explanation viewed');
                        return false;
                   }}]
          });

          explaAlert = this.alertCtrl.create({
            title: "Explanation",
            message: this.question.Explanation,
            buttons: ['Dismiss']
          });

          // we update question record to indicate that explanation was displayed
          this.dbService.updateExplaShownInQuestionId(qId);
          // we decrease the available quantity only if explanation was not displayed before
          // i.e. only the first time that explanation is displayed, we decrease
          // 1 from available explanations (qty)

          if (!_explaAvailabilty){
            // we decrease quantity in memory and in database
            _expQuantity --;
            this.expQty--;
            _explaAvailabilty = true;
            this.dbService.setProperty('explanationq', _expQuantity);
            // logging for debugging purpose
            console.log('Available Explanations: '+_expQuantity);
          }

        } else {
          actionSheet = this.actionSheetCtrl.create({
             buttons: [
                 {text: 'Ups... You don\'t have any explanation available. Buy them from Store Main Menu option',
                  handler: () => {
                    let navTransition = actionSheet.dismiss();
                    navTransition.then(()=>{})
                    console.log('No explanations available');
                    return false;}
              }]});
          explaAlert = this.alertCtrl.create({
            title: "Explanation",
            message: this.question.Explanation,
            buttons: ['Dismiss']
          });
        }

        if(this._actionSheet) {
          actionSheet.present();
        } else {
          explaAlert.present();
        }
      }
    }

    ionViewWillEnter(){
      this.indexQ=1;
      this._nextID=0;
      for(var j=0;j<this.qty;j++){
        this.scoreArrayID[j]= 0;
      }
       
      this.dbService.getPAIDValue().then(data => _Paid = data);

      // read Config parameters
      this.dbService.getProperty('highlight').then(data => _highlight = data == "true" ? true : false);
      this.dbService.getProperty('explanation').then(data => _explanation = data == "true" ? true : false);
      this.dbService.getProperty('npButtons').then(data=> {if(data == "true") {_npbutton = true;} else {_npbutton = false;}this.npb = _npbutton;});
      this.dbService.getProperty('previousBtn').then(data=> {if(data == "true") {this._previousBtn = true;} else {this._previousBtn = false;}});
      this.dbService.getProperty('autoQuestionJump').then(data=> {if(data == "true") {_autoQJump = true;} else {_autoQJump = false; this.npb = false;}});
      this.dbService.getProperty('resultPage').then(data=> {if(data == "true") {_resultPage = true;} else {_resultPage = false;}});
      this.dbService.getProperty('MABtnUp').then(data=> {if(data == "true") {this._MABtnUp = true;} else {this._MABtnUp = false;}});
      this.dbService.getProperty('actionSheet').then(data=> {if(data == "true") {this._actionSheet = true;} else {this._actionSheet = false;}});
      this.dbService.getProperty('admob')
      .then(data => { _admob=data == "true" ? true : false;
      console.log('npb: ',this.npb,' autoQjump: ',_autoQJump,' previousBtn: ',this._previousBtn);
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
          this.analytics.trackView('Exam-Detail Page for ' + this.title);
        }
      });
     

      // this is executed when entering in the component (i.e. this view)
      // when in device, source='cordova' if not, source='dom' (aka browser)
      
      // if login feature is activated then user is set with user's name
      this.dbService.getProperty('login').then(data => {
        if(data == 'true'){
          this.nativeStorage.getItem('userName').then(data => {   
            if (typeof data == "undefined" || data == null){
              this.user = "StudioMob";
            } else {
              this.user = data;
            }
          });
          this.nativeStorage.getItem('email').then(data => {   
            if (typeof data == "undefined" || data == null){
              this.email = "support@studiomob.ca";
            } else {
              this.email = data;
            }
          });
        } else {
          this.user = "StudioMob";
          this.email = "support@studiomob.ca";
        }
      });
      
      // inserted in version 3.3.0 to support multicategory and keep backward compatibilty with db version 3.2
      let categories = "";
      if(typeof _exam.CatId == "string") {
        categories = _exam.CatId.split(',');
      }
      
      if (typeof _exam.QuestionsOrderBy == undefined || _exam.QuestionsOrderBy == null) {
        //database version is inferior to 3.3.0
        console.log('DB version < 3.3.0');
        this.dbService.getQuestionsIdByCatAndQty(_exam.CatId,_exam.Qty).then(data => {this.questionArrayID = data; this.initQuestionsDetailArray()});
      } else {
        //database version is +3.3.0
        console.log('DB version >= 3.3.0');
        this.dbService.getQuestionsIdForExamId(_exam.Id,categories,_exam.QuestionsOrderBy,_exam.StartOnQID,_exam.Qty).then(data => {this.questionArrayID = data; this.initQuestionsDetailArray()});
      }
      
      setTimeout(()=>{
          this.examStartTime = new Date().getTime();
          _est = new Date().toISOString();
          this.showQuestion(this.getNextQuestionId());
      }, CONFIG.delayForStartingExam);
    }

    recordTime(){
      this.qTE = new Date();
      this.qTime = this.qTE - this.qTS;
      if(typeof (this.questionsDetail[this.indexQ-1]) != "undefined"){
        this.qTime += this.questionsDetail[this.indexQ-1].time;
      }
      this.questionsDetail[this.indexQ-1]={'qID': this.question.Id, 'time':this.qTime, 'uAnswer':this.uAnswer,'qStatus':this.qStatus};
   
      if(this.questionsDetail[this.qty-1].qStatus > 1) {
        this.examStatus=2;
      } else {
        this.examStatus=1;
      }
    }

    previousQuestion() {
      if(!_click || _click && !_timeOver && !_examOver){
        this.recordTime();
        if (this.indexQ > 1) {
           this.indexQ--;
        }
        //removing score if user goes back
        this.scoreArrayID[this.indexQ-1]=0;
        this.qi = this.qi == 0 ? 0:this.qi-1;
        this.qc = this.qc == 0 ? 0:this.qc-1;
        this.showQuestion(this.getNextQuestionId());
      }
    }

    nextQuestion() {
      if(!_click || _click && !_timeOver && !_examOver){
        this.recordTime();
        if (this.indexQ < this.qty) {
          this.indexQ++;
        }
        if (!_autoQJump) {
          this.npb = false;
          _click=false; 
        }
        this.showQuestion(this.getNextQuestionId());
      }
    }

    // when exiting the view, we cancel the timer and clear tracking variables
    ionViewWillLeave(){
      
      if(this.source == 'cordova') {
        if (_admob) this.admob.banner.hide();
      }
      clearTimeout(this.timerTimeout);
      _timeOver = false;
      _examOver = false;
      _timed = false;

      this.questionArrayID=null;
      this._nextID=null;
      this.qty=null;
      this.indexQ=null;
      this.question=null;
    }
}

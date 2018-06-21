import { Component, ViewChild } from '@angular/core';
import { Content } from 'ionic-angular';
import {DbService} from '../../providers/db-service';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Chart } from 'chart.js';

@Component({
  selector: 'page-result',
  templateUrl: 'result.html',
})
export class ResultPage {
  @ViewChild(Content) content: Content;
  private resultData: any;
  private questionArray: Array<any>;
  private qty: number;
  private title: string;
  private score: string;

  public ChartData:Array<any> = [];
    
  public ChartLegend:boolean = true;
  public progressData: any;
  
  constructor(public dbService: DbService, public navCtrl: NavController, private navParams: NavParams, public view: ViewController) {
    this.questionArray = [{Id:Number},{qText:String},{answer:String},{A:String},{B:String},{C:String},{D:String},{E:String},{uAnswer:String}];
  }

  closeModal(){
    this.view.dismiss();
  }

  ionViewWillLoad() {
    this.resultData = this.navParams.get('data');
    this.qty = this.navParams.get('qty');
    this.title = this.navParams.get('eTitle');
    this.score = this.navParams.get('score');
    console.log(this.resultData);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ResultPage');
    this.content.resize();
    this.content.scrollToTop();
  
    //let correctf, incorrectf;
    let qcorrect, qincorrect, na;
    qcorrect = 0;
    qincorrect = 0;
    na = 0;
    
    for(let i=0;i<this.resultData.length;i++){
      if(this.resultData[i].Status == 1) {
        ++qcorrect;
      } else if(this.resultData[i].Status == -1) {
        ++qincorrect;
      } else {
        ++na;
      }  
    }
    
    this.ChartData[0] = qcorrect;
    this.ChartData[1] = qincorrect;
    this.ChartData[2] = na;
    Chart.defaults.global.defaultFontColor = 'white'; 
    this.showChart();
  }
    
  showChart(){
    let myChart;
    myChart = new Chart(document.getElementById("myChart2"),{
      "type":"doughnut",
      "data":{
        "labels":["Correct","Incorrect","NoAnswered"],
        "datasets":[{
          "label":"Exams Result",
          "data":this.ChartData,
          "backgroundColor":["rgb(54, 235, 45)","rgb(255, 99, 132)","rgb(54, 162, 235)"]
        }]
      }
    });
  }
}



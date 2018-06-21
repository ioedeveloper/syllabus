import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {DbService} from '../../providers/db-service';

declare var Chart: any;

@Component({
  selector: 'tracker-details',
  templateUrl: 'tracker-details.html'
})
export class TrackerExamDetailPage {
  public ChartData:Array<any> = [
      {
        data: [],
        label: '',
        backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(54, 112, 135, 0.2)',
                'rgba(255, 106, 186, 0.2)',
        ],
        borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(54, 112, 135, 1)',
                'rgba(255, 106, 186, 1)',
        ],
        borderWidth: 1
      }
    ];
  public ChartLabels:Array<any> = [];
  public ChartOptions:any = {
    animation: {
      duration: 1000,
      easing: 'easeInQuad'
    },
    responsive: true,
    scales: {
            yAxes: [{
                ticks: {
                    max: 100,
                    min: 0,
                    stepSize: 20
                }
            }]
        }

  };
  public ChartColours: Array<any>=[
    {
      backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(54, 112, 135, 0.2)',
                'rgba(255, 106, 186, 0.2)',
      ],
      borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(54, 112, 135, 1)',
                'rgba(255, 106, 186, 1)',
      ],
      borderWidth: 1
    }
  ];

  public ChartLegend:boolean = true;
  public ChartType:string = 'bar';
  private title: string;
  private examid: number;
  private user: string;
  public progressData: any;

  constructor(public nav: NavController, public navParams: NavParams, public dbService: DbService) {
    this.nav = nav;
    let progressExam = navParams.get('progressExam');
    this.title = progressExam.ExamTitle;
    this.examid = progressExam.ExamId;
    this.user = navParams.get('user'); 
  }

  ionViewWillEnter(){
      //let progressData: any = [];
      this.dbService.loadProgress(this.user, 8, this.examid).then((data)=>{
        this.progressData = data;
        // we invert array to represent values based on time
        this.progressData.reverse();
        for(let i=0;i<this.progressData.length;i++){
          this.ChartData[0].data.push(this.progressData[i].Scored);
          var t = new Date(this.progressData[i].StartDate).toString();
          this.progressData[i].StartDate = t;
          console.log(t);
          this.ChartLabels.push('#'+(i+1));
          this.progressData[i].index=i+1;
        }
        this.ChartData[0].label = this.title;
        Chart.defaults.global.defaultFontColor = 'white';
        // we reinvert the array to present most recent score first in
        this.progressData.reverse();
        this.showChart();
      });  
  }

  showChart(){
    let ctx, myChart;
    ctx=document.getElementById("myChart");
    myChart = new Chart(ctx, {
        type: this.ChartType,
        options: this.ChartOptions,
        data: {
          labels: this.ChartLabels,
          datasets: this.ChartData,
        }
      }
    );
  }
}

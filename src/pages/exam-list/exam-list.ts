import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {ExamModePage} from '../exam-mode/exam-mode';
import {DbService} from '../../providers/db-service';


@Component({
    selector: 'exam-list',
    templateUrl: 'exam-list.html'
})

export class ExamListPage {
  exams: {};
  source: any;
  private user: any;

  private adId: any;

    constructor(private nav: NavController, public navParams: NavParams, public dbService: DbService) {
        this.nav = nav;

        //this.dbService = DbService;
        this.source = navParams.get('readySource');
        this.user = navParams.get('user');
        this.adId = navParams.get('adId');

        //console.log(source);
    }

    ionViewWillEnter(){
        this.dbService.findAllEnabledExams(0).then(data => {
          this.exams = data
        });
    }

    itemTapped(event, exam) {
        this.nav.push(ExamModePage, {
            exam: exam,
            source: this.source,
            user: this.user,
            adId: this.adId,
        });
    }

}

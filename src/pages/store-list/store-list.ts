//import {OnInit} from '@angular/core';
import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {StoreDetailPage} from '../store-details/store-details';
import {StoreService} from '../../providers/store-service';

@Component({
    templateUrl: 'store-list.html'
})
export class StoreListPage {
  products: {};
  storeready: Boolean;
  explanationQ: {};

    constructor(public nav: NavController, public navParams: NavParams, public storeService: StoreService) {
      this.nav = nav;
      this.storeready =true;
      this.storeService = storeService;
      //let selectedItem = navParams.get('item');
    }

    ionViewWillEnter() {
      this.storeService.getConsumableQuantity('explanationq').then(value => this.explanationQ = value);

      this.storeService.findAll().subscribe(
          data => {
            console.log(JSON.stringify(data));
            this.products = data;
          });
      /*if(analytics) {
        analytics.trackView('Store-List');
      }*/
    }

    itemTapped(product) {
        this.nav.push(StoreDetailPage, {
            product: product,
            condition: 'purchase'
        });
    }

    restoreTapped() {
        this.nav.push(StoreDetailPage, {
            product: '',
            condition: 'restore'
        });
    }


}

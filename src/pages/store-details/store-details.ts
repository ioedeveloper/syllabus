import {Component} from '@angular/core';
//import {OnInit} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {StoreService} from '../../providers/store-service';


@Component({
    selector: 'store-details',
    templateUrl: 'store-details.html'
})
export class StoreDetailPage {
    private product: any;
    public condition: any;

    constructor(public nav: NavController, public navParams: NavParams, public storeService: StoreService) {
      this.nav = nav;
      this.storeService = storeService;
      this.product = navParams.get('product');
      this.condition = navParams.get('condition');
    }

    restoreTapped() {
        this.storeService.restorePurchases().subscribe(
          data => console.log('Restored purchases: ' + data)
        );
    }

    purchaseTapped(product) {
      console.log('Purchase button clicked on: ' + product.productId);
      this.storeService.purchaseProduct(product, success =>{
        setTimeout(()=>this.nav.pop(),1000);
      }, error =>{
        console.log('Purchase not completed');
      });
    }

}

import {Injectable} from '@angular/core';
import {PRODUCTS} from './mock-store';
import {Observable} from 'rxjs/Observable';
import {DbService} from './db-service';
import {Platform} from 'ionic-angular';
import {CONFIG} from './app-config';

declare var iap: any;

let androidApplicationLicenseKey;
let productIds;
let existing_purchases;
let product_info;
let productType;

@Injectable()
export class StoreService {

    source: string;

    
    constructor(public dbservice: DbService, private platform: Platform) {
      this.dbservice = dbservice;

      this.platform.ready().then((readySource) => {this.source = readySource});

      // Set androidApplicationLicenseKey for In App Purchase, please change this value with yours.
      
      androidApplicationLicenseKey = CONFIG.androidApplicationLicenseKey;
      
      // Set productIds with exactly same names as in your store (Google/Itunes)!
      //productIds = ["quiz2_exam_x3","quiz2_exam_x1","quiz2_expla_x5","quiz2_expla_x10","quiz2_expla_x50","quiz2_f_version","quiz2_no_ads"];
      productIds = CONFIG.productIds;
      
      // For each listed product in productIds array, corresponds a productType below, either as consumable or non_consumable.
      //productType = ["non_consumable","non_consumable","consumable","consumable","consumable","non_consumable","non_consumable"];
      productType = CONFIG.productType;

      // Some variables reserved for product management
      existing_purchases = [];
      product_info = [];
    }

    init() {
      // Initialize InAppPurchase (IAP) plugin
      // if we are on device, we use IAP plugin, otherwise we simulate it in browser
      try {
        if (typeof iap != 'undefined') {
          // Set up de AndroidBillingKey for IAP Plugin
          iap.setUp(androidApplicationLicenseKey);

          // Request product list
          iap.requestStoreListing(productIds, function (result){
            for (var i = 0 ; i < result.length; ++i){
                var p = result[i];
                product_info[i] = {productId: p.productId, title: p.title, price: p.price, description: p.description, type: productType[productIds.indexOf(p.productId)]};
            }
          }, function (error){
                // error to use store
                alert("Store not available at this time: " + error);
          });
        }
      } catch (err) {
          console.log('No IAP Plugin, using PRODUCTS mock');
      }
    }

    findAll() {
      // retrieve all available products
        return Observable.create(observer => {
            // We check if we are on device and IAP plugin is available
            try{
              if(iap) {
              observer.next(product_info);
              }
            } catch(err) {
              // if we are in browser, then we get product list from PRODUCTS "JSON" file
              console.log('FOR BROWSER ONLY');
              observer.next(PRODUCTS);
            }
            observer.complete();
        });
    }

    purchaseProduct(product, resultCallback, errorCallback){
      // Proceed with product purchase
      if (typeof iap != 'undefined') {
          iap.purchaseProduct(product.productId, result => {
            //alert("Product purchased: "+product.productId);
            // Check if product is consumable and therefore call consumeProduct
            if (product.type === 'consumable') {
              this.consumeProduct(product);
            } else {
              if(product.productId == CONFIG.fullVersionProductID){ // "quiz2_f_version"
                //We call all the actions to be taken when purchasing the full Version
                //This may be different in your case depending your needs.
                this.dbservice.setProperty('fullversion','true');
                this.dbservice.setFullVersion();
                this.dbservice.setProperty('admob','false');
              }
              if(product.productId == CONFIG.noAdsProductID){ //"quiz2_no_ads"
                //This is the action that we call when purchasing this product No Ads.
                this.dbservice.setProperty('admob','false');
              }
              if(product.productId == CONFIG.examX1ProductID){ //"quiz2_exam_x1"
                //This is the action that we call when purchasing this product Exam x1.
                this.dbservice.unlockExamById(4); //Exam Id shall be passed as parameter
              }
              if(product.productId == CONFIG.examX3ProductID){ //"quiz2_exam_x3"
                //This is the action that we call when purchasing this product Exam x3.
                this.dbservice.unlockExamById(4); //Exam Id shall be passed as parameter
                this.dbservice.unlockExamById(5); //Exam Id shall be passed as parameter
                this.dbservice.unlockExamById(6); //Exam Id shall be passed as parameter
              }
            }
            return resultCallback("PurchasedDone");
          }, error => {
              console.log("error: "+error);
              return errorCallback("noProductIdPurchased");
          });
      } else {
          alert("Product purchased (Simulated): "+product.productId);
          if (product.type === 'consumable') {
            this.consumeProduct(product);
          } else {
            if(product.productId == CONFIG.fullVersionProductID){alert('full version purchased'); this.dbservice.setProperty('fullversion','true'); this.dbservice.setFullVersion(); this.dbservice.setProperty('admob','false'); }
            if(product.productId == CONFIG.noAdsProductID){alert('no ads purchased'); this.dbservice.setProperty('admob','false');}
            if(product.productId == CONFIG.examX1ProductID){alert('Exam ID: 4 Unlocked');this.dbservice.unlockExamById(4);} //Exam Id shall be passed as parameter
            if(product.productId == CONFIG.examX3ProductID){
                //This is the action that we call when purchasing this product Exam x3.
                alert('Exams ID: 4/5/6 Unlocked');
                this.dbservice.unlockExamById(4); //Exam Id shall be passed as parameter
                this.dbservice.unlockExamById(5); //Exam Id shall be passed as parameter
                this.dbservice.unlockExamById(6); //Exam Id shall be passed as parameter
            }
          }
          console.log("Simulating Purchasing of product: "+product.productId);
          return resultCallback("PurchasedDone");
      }
    }

    consumeProduct(product){
      // Consume purchased product when consumable type is detected
      if (typeof iap != 'undefined') {
            iap.consumeProduct(product.productId, result => {
              //alert("Consumed Product: "+product.productId);
              this.updateConsumable(product);
          },error => {
              console.log("error: "+error);
          });
        } else {
          this.updateConsumable(product);
          console.log("Simulating consume product: "+product.productId);
      }
    }

    restorePurchases(){
      // Restore all purchases
      return Observable.create(observer => {
        if (this.source == 'cordova'){
         if (typeof iap != 'undefined') {
          iap.restorePurchases(result => {
              console.log('Restore log: ' + JSON.stringify(result));
              for (var i = 0 ; i < result.length; ++i){
                  var p = result[i];
                  if(result[i].productId == CONFIG.fullVersionProductID){
                    alert('full version restored');
                    this.dbservice.setProperty('fullversion','true');
                    this.dbservice.setFullVersion();
                    this.dbservice.setProperty('admob','false');
                  }
                  if(result[i].productId == CONFIG.noAdsProductID){
                    alert('no ads restored');
                    this.dbservice.setProperty('admob','false');
                  }
                  if(result[i].productId == CONFIG.examX1ProductID){
                    //This is the action that we call when purchasing this product Exam x1.
                    this.dbservice.unlockExamById(4); //Exam Id shall be passed as parameter
                    alert('Exam Id 4: Restored');
                  }
                  if(result[i].productId == CONFIG.examX3ProductID){
                    //This is the action that we call when purchasing this product Exam x3.
                    this.dbservice.unlockExamById(4); //Exam Id shall be passed as parameter
                    this.dbservice.unlockExamById(5); //Exam Id shall be passed as parameter
                    this.dbservice.unlockExamById(6); //Exam Id shall be passed as parameter
                    alert('Exam Id 4/5/6: Restored');
                  }
                  if (existing_purchases.indexOf(p['productId']) === -1)
                      existing_purchases.push(p['productId']);
              }
              observer.next(existing_purchases);
          }, error => {
              alert("Error when attempting to restore purchases: "+error);
          });
        }
      } else {
        // Simulate store restore when in browser execution
        for (var i = 0 ; i < PRODUCTS.length; ++i){
            var p = PRODUCTS[i];
            if (existing_purchases.indexOf(p['productId']) === -1)
                existing_purchases.push(p['productId']);
            console.log("productId: "+p['productId']);
        }
        observer.next(existing_purchases);
      }
    });
  }

  getConsumableQuantity(name){
    return this.dbservice.getProperty(name);
  }

  updateConsumable(product){
    let value, consumable;
    let addQuantity = 0;

    // determine the consumable
    switch(product.productId) {
      case CONFIG.explaX5ProductID:
            addQuantity = 5; // this has to corresponds with the product id configured in productIds array
            consumable = 'explanationq';
            break;
      case CONFIG.explaX10ProductID: // this has to corresponds with the product id configured in productIds array
            addQuantity = 10;
            consumable = 'explanationq';
            break;
      case CONFIG.explaX50ProductID: // this has to corresponds with the product id configured in productIds array
            addQuantity = 50;
            consumable = 'explanationq';
            break;
    }

    // obtain consumbable remaining amount
    this.dbservice.getProperty(consumable).then(data=>{
      // increase consumbable quantity based on purchased item
      value=Number(data) + addQuantity;
      // update database accordingly
      return this.dbservice.setProperty(consumable,value.toString()).then(result=>{
        alert('You have added: ' + addQuantity + " explanations. Qty left: "+value.toString());
      });
    });
  }

  findById(id) {
      return Observable.create(observer => {
          observer.next(PRODUCTS[id - 1]);
          observer.complete();
      });
  }

}

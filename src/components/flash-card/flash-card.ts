import { Component } from '@angular/core';
import { Events } from 'ionic-angular';

@Component({
  selector: 'flash-card',
  templateUrl: 'flash-card.html'
})
export class FlashCardComponent {

  flipped: boolean;

  constructor(public events: Events) {
    events.subscribe('card:change', () => {this.flipped=false;});    
  }

  flip() {
    this.flipped = !this.flipped;
    
  }

}

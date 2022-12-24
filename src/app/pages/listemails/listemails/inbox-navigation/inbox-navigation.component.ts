import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'fury-inbox-navigation',
  templateUrl: './inbox-navigation.component.html',
  styleUrls: ['./inbox-navigation.component.scss']
})
export class InboxNavigationComponent implements OnInit {

  @Input() responsive: boolean;

  @Output() onListTypeChange = new EventEmitter<any>();
  checkIt:string;
  constructor(private router:Router) {
  }

  ngOnInit() {
  }

  navigateToInboxList(){
    // this.listType = 'receive';
    this.onListTypeChange.emit('receive');
    // this.router.navigateByUrl('/listemails/primary');
  }
  
  navigateToSentList(){
    // this.listType = 'sent';
    this.onListTypeChange.emit('sent');
    // this.router.navigateByUrl('/listemails/primary');
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'fury-view-text',
  templateUrl: './view-text.component.html',
  styleUrls: ['./view-text.component.scss']
})
export class ViewTextComponent implements OnInit {

  txtContent:string;

  constructor(@Inject(MAT_DIALOG_DATA) data:string) {
    this.txtContent = data['dialogData'];
   }

  ngOnInit(): void {
    

  }

}

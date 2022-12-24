import { Component, OnInit } from '@angular/core';
import { ClientSelectionService } from '../shared/services/client-selection.service';
import { SummaryChartService } from './summary-chart.service'
@Component({
  selector: 'fury-summary-chart',
  templateUrl: './summary-chart.component.html',
  styleUrls: ['./summary-chart.component.scss']
})
export class SummaryChartComponent implements OnInit {

  lstType:any[];
  type:string='';
  showSpinner: boolean = false;

  lstMeter = {};

  constructor(private summaryChartService: SummaryChartService,
    private clientSelectionService: ClientSelectionService) { }

  ngOnInit(): void {
    this.clientSelectionService.setIsClientVisible(false);

    this.getTypes();
    this.showSpinner = false;
  }

  getTypes(){
    this.showSpinner = true;
    this.summaryChartService.getTypes().subscribe({next: (response: any) => {

      if(response){
        this.lstType = response['gateWayTypeList']; // get volt types
        this.type = this.lstType[0].name;
        this.onTypeChange(this.type);
        this.showSpinner = false;
      }      
    },
    error: (err) => {
      this.showSpinner = false;
    }
  })
  }

  onTypeChange(item){
    this.summaryChartService.getPageContent(this.type).subscribe((response: any) => {

      if(response){
        this.lstMeter = response;
      }
      else{
        this.lstMeter = {};
      }
    })
  }
}

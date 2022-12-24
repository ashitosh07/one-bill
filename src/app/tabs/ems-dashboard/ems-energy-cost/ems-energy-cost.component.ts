import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import * as moment from 'moment';
import { CookieService } from 'ngx-cookie-service';
import { EnvService } from 'src/app/env.service';
import { environment } from 'src/environments/environment';
import { getClientDataFormat } from '../../shared/utilities/utility';
import { EmsDashboardService } from '../ems-dashboard.service';

@Component({
  selector: 'fury-ems-energy-cost',
  templateUrl: './ems-energy-cost.component.html',
  styleUrls: ['./ems-energy-cost.component.scss']
})
export class EmsEnergyCostComponent implements OnInit {

  showSpinner: boolean = false; //true;  
  frequency = ['Daily','Weekly','Monthly','Yearly'];
  buttons = ['Today','Yesterday'];
  selectedValue: string = 'Daily';
  reportType: string = 'Today';
  previousLabel: string = '';
  currentLabel: string = '';
  forecastLabel: string = '';
  estimatedSavingsLabel: string = 'Estimated Savings';
  previousEnergyCost: number = 0;
  currentEnergyCost: number = 0;
  forecastEnergyCost: number = 0;
  estimatedSavings: number = 0;
  clientId: string = '0';
  meterTypes = [];
  energyCostComparison = [];
  costComparisonChart = [];
  stackedBarChartOptions: any
  energyCost = [];
  isCurrent: boolean = true;
  currency ='';
  
  constructor(private cookieService: CookieService,
              private emsDashboardService: EmsDashboardService,
              private envService: EnvService) {
                this.currency = getClientDataFormat('Currency') ?? envService.currencyFormat;
               }

  ngOnInit(): void {

    const filterData = this.cookieService.get('filterData');
    if (filterData) {
      let dataArray = JSON.parse(filterData);
      if (dataArray['strClientId'] == '') {
        this.clientId = this.cookieService.get('globalClientId');
      }
      else {
        this.clientId = dataArray['strClientId'];
      }
    }
    
    this.setConsumptionLables();
    this.getUtilities();  
  }

  getUtilities()
  {
    this.emsDashboardService.getUtilities(this.clientId).subscribe((response: any) => {
      if (response) {
        this.meterTypes = [];
        response.forEach(item => {
          this.meterTypes.push(item.description);
        });
        this.getEnergyCost();
      }
    });
  }

  public onValChange(event: any) {
    if(event != null)
    {
      this.selectedValue = event.value;
      this.setConsumptionLables(event.value);
      this.reportType = this.buttons[0];
      this.isCurrent = true;
    }

    this.getEnergyCost();
  }

  ngAfterViewChecked()
  {
    let selectedButton = document.getElementById(this.reportType);
    this.buttons.forEach(button => {
      let btn = document.getElementById(button);
      btn.className = 'mat-raised-button';
    });
    selectedButton.className = 'mat-raised-button-checked';
  }

  public onButtonChange(event: any) {
    if(event != null)
      this.reportType = event.value;
    else
      this.reportType = this.buttons[0];    
         
    if(this.buttons[0] == this.reportType)  
      this.isCurrent = true;
    else
      this.isCurrent = false;
    this.setConsumptionLables(this.selectedValue);    
    this.getEnergyCost();
  }

  setButtonColor()
  {
    let selectedButton = document.getElementById(this.reportType);
    if(selectedButton)
    {
      this.buttons.forEach(button => {
        let btn = document.getElementById(button);
        btn.className = 'mat-raised-button';
      });
      if(selectedButton)
      selectedButton.className = 'mat-raised-button-checked';
    }      
  }

  setConsumptionLables(reportType: string='Daily') {    
    this.previousLabel = '';
    this.currentLabel = '';
    this.forecastLabel = '';
    let previousDate = new Date();
    
    if (reportType === 'Daily') 
    {
      if(this.isCurrent == true)
      {
        this.currentLabel = "So far Today";
        this.previousLabel = "Yesterday";
        this.forecastLabel = "Predicted Today";
      }
      else {
        this.currentLabel = "Yesterday";
        this.previousLabel = "Day Before Yesterday";
        this.forecastLabel = "Today";
      }
      this.buttons = ['Today','Yesterday'];      
    } 
    else if (reportType === 'Weekly') {
      if(this.isCurrent == true)
      {
        this.currentLabel = 'So far This Week';
        this.previousLabel = 'Last Week';
        this.forecastLabel = 'Predicted This Week';
      }
      else {
        this.currentLabel = 'Last Week';
        this.previousLabel = 'Second Last Week';
        this.forecastLabel = 'This Week';
      }      
      this.buttons = ['This Week','Last Week'];
    } 
    else if (reportType === 'Monthly') {
      if(this.isCurrent == true)
      {
        previousDate.setDate(1);
        previousDate.setMonth(previousDate.getMonth() - 1);
        this.currentLabel = 'So far This Month';
        this.previousLabel = 'Last Month'; //previousDate.toLocaleString('en-us', { month: 'long' });
        this.forecastLabel = 'Predicted This Month';
      }
      else {
        previousDate.setDate(1);
        previousDate.setMonth(previousDate.getMonth() - 2);
        this.currentLabel = 'Last Month';
        this.previousLabel = 'Secons Last Month'; //previousDate.toLocaleString('en-us', { month: 'long' });
        this.forecastLabel = 'This Month';
      }
      
      this.buttons = ['This Month','Last Month'];
    } 
    else {
      if(this.isCurrent == true)
      {
        this.currentLabel = 'So far This Year';
        this.previousLabel = 'Last Year';
        this.forecastLabel = 'Predicted This Year';
      }
      else {
        this.currentLabel = 'Last Year';
        this.previousLabel = 'Second Last Year';
        this.forecastLabel = 'This Year';
      }
      
      this.buttons = ['This Year','Last Year'];
    }
  }

  getEnergyCost()
  {
    this.showSpinner = false; //true;  
    this.energyCostComparison = [];
    this.costComparisonChart = [];
    let chartData: any[];
    let xAxisLabel = [];
    this.currentEnergyCost = 0;
    this.previousEnergyCost = 0;
    this.forecastEnergyCost = 0;
    this.estimatedSavings = 0;

    this.stackedBarChartOptions = this.setStackedCostComparisonChart(this.energyCostComparison,this.costComparisonChart,xAxisLabel);
    let eccontainer1 = document.getElementById('eccontainer1');
    if(eccontainer1)
      Highcharts.chart('eccontainer1', this.stackedBarChartOptions);

    if(this.meterTypes && this.meterTypes.length > 0)
    {      
      let utilityTypes = this.meterTypes.join(",");    

      this.emsDashboardService.getOverallEnergyCost(this.clientId,utilityTypes,this.selectedValue,this.isCurrent).subscribe({next:(energyCost: any[]) => {
        if(energyCost)
        {
          this.showSpinner = false; //true; 
          this.energyCost = energyCost     
          chartData = energyCost['energyCostStacks'];
          xAxisLabel = energyCost['categories']; 

          this.stackedBarChartOptions = this.setStackedCostComparisonChart(this.energyCostComparison,chartData,xAxisLabel);
          eccontainer1 = document.getElementById('eccontainer1');
          if(eccontainer1)
            Highcharts.chart('eccontainer1', this.stackedBarChartOptions);               

          this.emsDashboardService.getGroupWiseEnergyCost(this.clientId,utilityTypes,this.selectedValue).subscribe({next:(groupWiseEnergyCost: any[]) => {
            if(groupWiseEnergyCost)
            {
              this.showSpinner = false; //true;  
              //Tile Data
              if(this.isCurrent == true)
              {
                this.currentEnergyCost = groupWiseEnergyCost['currentTotalCost'];
                this.previousEnergyCost = groupWiseEnergyCost['previousTotalCost'];
                this.forecastEnergyCost = groupWiseEnergyCost['forecastTotalCost'];
                this.estimatedSavings = groupWiseEnergyCost['currentEstimatedSavings']; //Number((this.previousEnergyCost - this.currentEnergyCost));//.toPrecision(2));   
              }
              else {
                this.currentEnergyCost = groupWiseEnergyCost['previousTotalCost'];
                this.previousEnergyCost = groupWiseEnergyCost['lastPreviousTotalCost'];
                this.forecastEnergyCost = groupWiseEnergyCost['currentTotalCost'];
                this.estimatedSavings = groupWiseEnergyCost['previousEstimatedSavings']; //Number((this.previousEnergyCost - this.currentEnergyCost));//.toPrecision(2));
              }      
              this.showSpinner = false;        
            }
            else {
              this.showSpinner = false;  
            }
          },
          error: (err) => {
            this.showSpinner = false;
          }          
          });
        }
        else {
          this.showSpinner = false;  
        }
      },
      error: (err) => {
        this.showSpinner = false;
      }
    });
  }
  else {
    this.showSpinner = false;
  }
}

  setStackedCostComparisonChart(dctStackTempData=null,costComparisonChart,xAxisLabel=[]) {
    let current = '';
    let previous = '';
    let today = new Date();
    let previousDate = new Date();
    let chartHeading = "Today's Energy Cost";
    let xAxisTitle = '';

    if(this.selectedValue == 'Monthly')
    {
      xAxisTitle = 'Day';
      previousDate.setDate(1);
      previousDate.setMonth(previousDate.getMonth() - 1);
      current = today.toLocaleString('en-us', { month: 'long' });       
      previous = previousDate.toLocaleString('en-us', { month: 'long' });
      if(this.isCurrent == true) 
      {
        chartHeading = current + " Month Energy Cost";
      }      
      else {
        chartHeading = previous + " Month Energy Cost";
      }
    }
    else if(this.selectedValue == 'Daily')
    {
      xAxisTitle = 'Hour';
      if(this.isCurrent == true) 
      {
        chartHeading = "Today's Energy Cost";
      }
      else {
        chartHeading = "Yesterday's Energy Cost";
      }
    }
    else if(this.selectedValue == 'Weekly')
    {
      xAxisTitle = 'Date';
      if(this.isCurrent == true) 
      {
        chartHeading = "This Week Energy Cost";
      }
      else {
        chartHeading = "Last Week Energy Cost";
      }
    }
    else if(this.selectedValue == 'Yearly')
    {
      xAxisTitle = 'Month';
      if(this.isCurrent == true) 
      {
        chartHeading = "This Year Energy Cost";
      }
      else {
        chartHeading = "Last Year Energy Cost";
      }
      // current = today.getFullYear().toString();
      // previousDate.setFullYear(previousDate.getFullYear()-1);
      // previous = previousDate.getFullYear().toString();
    }

    let chartOptions = {
      chart: {
          type: 'spline',
          marginLeft:90
      },
      title: {
          text: chartHeading, //'Energy Cost Comparison',
          style: {
            fontWeight: 'bolder',
            fontFamily: 'Roboto'
          }
      },
      credits: {
        enabled: false
      },
      colors: ['#1fd286','#1e5eff','#ffda44','#d80027','#808080', '#0d233a', '#8bbc21', '#910000', '#1aadce',
        '#492970', '#f28f43', '#77a1e5', '#c42525', '#a6c96a'],
      xAxis: {
          categories: xAxisLabel,//[previous, current], //['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas']
          //stackLabels: {enabled: false},
          //labels: {enabled: false},
        visible: true,
        title: {text: xAxisTitle}
      },
      yAxis: {
          title: {
              text: 'Total Cost'
          }
          // ,stackLabels: {
          //     enabled: false,
          //     style: {
          //         fontWeight: 'bold',
          //         color: ( // theme
          //             Highcharts.defaultOptions.title.style &&
          //             Highcharts.defaultOptions.title.style.color
          //         ) || 'gray'
          //     }
          // }
      },
      legend: {
          align: 'center',
          x: 30,
          verticalAlign: 'bottom',
          y: 20,
          floating: false,
          backgroundColor:
              Highcharts.defaultOptions.legend.backgroundColor || 'white',
          // borderColor: '#CCC',
          // borderWidth: 1,
          shadow: false
      },
      tooltip: {
          headerFormat: '<b>{point.x}</b><br/>',
          pointFormat: '{series.name}: ' +  this.currency + ' {point.y}' //+  '<br/>Total: ' + this.currency + ' {point.stackTotal}'
      },
      plotOptions: {
          series: {
            pointWidth: 50
          },
          column: {
              //marginLeft: 10,
              pointWidth: 20,
              stacking: 'normal',
              dataLabels: {
                  enabled: false
              }
          }
      },
      series: costComparisonChart,
      // series: [{
      //     name: 'John',
      //     data: [5, 3, 4, 7, 2]
      // }, {
      //     name: 'Jane',
      //     data: [2, 2, 3, 2, 1]
      // }, {
      //     name: 'Joe',
      //     data: [3, 4, 4, 2, 5]
      // }]
    }    
    return chartOptions;
  }
  
}

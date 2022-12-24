import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { Item } from '@syncfusion/ej2-angular-navigations';
import * as Highcharts from 'highcharts';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
import { getClientDataFormat } from '../../shared/utilities/utility';
import { MasterService } from '../../shared/services/master.service';
import { EmsDashboardService } from '../ems-dashboard.service';
import { MatDialog } from '@angular/material/dialog';
import { EnvService } from 'src/app/env.service';


@Component({
  selector: 'fury-ems-groupwise-energycost',
  templateUrl: './ems-groupwise-energycost.component.html',
  styleUrls: ['./ems-groupwise-energycost.component.scss']
})
export class EmsGroupwiseEnergycostComponent implements OnInit {

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
  currency = '';
  private groupWiseEnergyCost: any[];
  donutChartOptions = {};
  meterGroup: any = [];
  lstMeterGroup: any[] = [];
  lstFilterMeterGroup: any = [];
  form: FormGroup;

  @ViewChild('allMeterGroupsSelected') private allMeterGroupsSelected: MatOption; 
  
  constructor(private cookieService: CookieService,
              private fb: FormBuilder,
              private masterService: MasterService,
              private emsDashboardService: EmsDashboardService,
              private envService:EnvService) {
               this. currency = getClientDataFormat('Currency') ?? envService.currencyFormat;
               }

  ngOnInit(): void {

    this.form = this.fb.group({
      meterGroup: ['']
    });

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
    //this.getUtilities();  
    this.getDeviceGroups();
    this.getGroupwiseEnergyCost();
  }

  getUtilities()
  {
    this.emsDashboardService.getUtilities(this.clientId).subscribe((response: any) => {
      if (response) {
        this.meterTypes = [];
        response.forEach(item => {
          this.meterTypes.push(item.description);
        })
        //this.getGroupwiseEnergyCost();
      }
    });
  }

  getDeviceGroups() {
    this.lstMeterGroup = [];
    this.masterService.getUserMasterdata(71, 0).subscribe(meterGroups => {
      this.lstMeterGroup = this.lstFilterMeterGroup = meterGroups;  
      this.lstMeterGroup.forEach(item => {        
          this.meterGroup.push(item.id);
      });      
      this.getGroupwiseEnergyCost();
    });
  }

  public onValChange(event: any) {
    if(event != null)
    {
      this.selectedValue = event.value;      
    }
    else {
      this.selectedValue = this.frequency[0];
    }
    this.reportType = this.buttons[0];
    this.isCurrent = true;

    this.setConsumptionLables(event.value);
    this.getGroupwiseEnergyCost();
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

    let selectedButton = document.getElementById(this.reportType);
    this.buttons.forEach(button => {
      let btn = document.getElementById(button);
      btn.className = 'mat-raised-button';
    });
    selectedButton.className = 'mat-raised-button-checked';

    if(this.buttons[0] == this.reportType)  
      this.isCurrent = true;
    else
      this.isCurrent = false;
    this.getGroupwiseEnergyCost();
  }

  setConsumptionLables(reportType: string='Daily') {    
    this.previousLabel = '';
    this.currentLabel = '';
    this.forecastLabel = '';
    let previousDate = new Date();
    
    if (reportType === 'Daily') 
    {
      this.currentLabel = "So far Today";
      this.previousLabel = "Yesterday";
      this.forecastLabel = "Predicted Today";
      this.buttons = ['Today','Yesterday'];
      this.reportType = this.buttons[0];
    } 
    else if (reportType === 'Weekly') {
      this.currentLabel = 'So far This Week';
      this.previousLabel = 'Last Week';
      this.forecastLabel = 'Predicted This Week';
      this.buttons = ['This Week','Last Week'];
      this.reportType = this.buttons[0];
    } 
    else if (reportType === 'Monthly') {
      previousDate.setDate(1);
      previousDate.setMonth(previousDate.getMonth() - 1);
      this.currentLabel = 'So far This Month';
      this.previousLabel = previousDate.toLocaleString('en-us', { month: 'long' });
      this.forecastLabel = 'Predicted This Month';
      this.buttons = ['This Month','Last Month'];
      this.reportType = this.buttons[0];
    } 
    else {
      this.currentLabel = 'So far This Year';
      this.previousLabel = 'Last Year';
      this.forecastLabel = 'Predicted This Year';
      this.buttons = ['This Year','Last Year'];
      this.reportType = this.buttons[0];
    }
  }

  toggleMeterGroupsAllSelection()
  {
    if (this.allMeterGroupsSelected.selected) {
      this.form.controls.meterGroup
        .patchValue([...this.lstMeterGroup.map(item => item.id), 0]);
      this.getGroupwiseEnergyCost();
    } else {
      this.form.controls.meterGroup.patchValue([]);
      this.getGroupwiseEnergyCost();
    }
  }

  toggleMeterGroupPerOne()
  {
    if (this.allMeterGroupsSelected.selected) {
      this.allMeterGroupsSelected.deselect();
      //return false;
    }
    if (this.form.controls.meterGroup.value.length == this.lstMeterGroup.length)
    {
      this.allMeterGroupsSelected.select();
    }
    this.getGroupwiseEnergyCost();
  }

  search(query: string) {
    let result = this.select(query)
    this.lstMeterGroup = result;
  }

  select(query: string): any[] {
    let result: any[] = [];
    if (query) {
      for (let a of this.lstMeterGroup) {
        if (a.description.toLowerCase().indexOf(query) > -1) {
          result.push(a)
        }
      }
    } else {
      result = this.lstFilterMeterGroup;
    }
    return result
  }

  getGroupwiseEnergyCost()
  {
    this.showSpinner = false; //true;
    let dctDonutTempData = {};
    //this.energyCostComparison = [];
    this.costComparisonChart = [];
    let chartData: any[];
    let xAxisLabel = [];
    dctDonutTempData['chartValues'] = []; 
    this.currentEnergyCost = 0;

    this.stackedBarChartOptions = this.setStackedCostComparisonChart(this.costComparisonChart,xAxisLabel);
    let egecontainer1 = document.getElementById('egecontainer1');
    if(egecontainer1)
      Highcharts.chart('egecontainer1', this.stackedBarChartOptions);

    this.donutChartOptions = this.setDonutChart(dctDonutTempData);
    let egecontainer2 = document.getElementById('egecontainer2');
    if(egecontainer2)
      Highcharts.chart('egecontainer2', this.donutChartOptions);

    if(this.meterGroup && this.meterGroup.length > 0)
    {
      let index = this.meterGroup.findIndex((meter) => meter == 0)
      if (index >= 0) {
        this.meterGroup.splice(index, 1);
      }
      let meterGroupId = this.meterGroup.join(",");
      
       this.emsDashboardService.getOverallGroupWiseEnergyCost(this.clientId,meterGroupId,this.selectedValue,this.isCurrent).subscribe({next:(groupWiseEnergyCost: any[]) => {
         if(groupWiseEnergyCost)
         {   
           this.showSpinner = false; //true;        
            this.groupWiseEnergyCost = groupWiseEnergyCost
            chartData = groupWiseEnergyCost['energyCostStacks'];
            xAxisLabel = groupWiseEnergyCost['categories'];  

            this.stackedBarChartOptions = this.setStackedCostComparisonChart(chartData,xAxisLabel);
            egecontainer1 = document.getElementById('egecontainer1');
            if(egecontainer1)
              Highcharts.chart('egecontainer1', this.stackedBarChartOptions);  

            this.currentEnergyCost = this.groupWiseEnergyCost['totalCost'];
            
            //2D Donut Chart - UtilityWiseEnergyCost
            dctDonutTempData['chartValues'] = [];
            this.groupWiseEnergyCost['energyCost'].forEach(item => {
              dctDonutTempData['chartValues'].push([item.utilityType,item.currentCost])    
            });        
            
            this.donutChartOptions = this.setDonutChart(dctDonutTempData);
            egecontainer2 = document.getElementById('egecontainer2');
            if(egecontainer2)
              Highcharts.chart('egecontainer2', this.donutChartOptions);
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

  setDonutChart(dctPieTempData) {

    let donutOptions = {

      chart: {
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        backgroundColor: '#fafafa',
        height: 350,
        type: 'pie',
        options3d: {
          enabled: false,
          alpha: 45          
        }
      },      
      title: {
        text: '', //this.selectedValue + ' Energy Cost',
        align: 'left',
        style: {
          fontFamily: 'Roboto',
          fontWeight: 'bolder'
        }
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
      noData: {
        style: {
          fontWeight: 'bold',
          fontSize: '15px'
        }
      },
      legend: {
        floating: false,
        align: 'left',
        verticalAlign: 'bottom',
        layout: 'horizontal',
        fontFamily: 'Roboto'
      },

      plotOptions: {
        series: {
          shadow: false,
        },
        marginLeft: 0,
        pointPadding: 0.25,
        
        pie: {
          startAngle: -90,
          endAngle: 90,
          innerSize: 100,
          depth: 25,
          colors: ['#1fd286','#1e5eff','#ffda44','#d80027','#808080', '#0d233a', '#8bbc21', '#910000', '#1aadce',
                    '#492970', '#f28f43', '#77a1e5', '#c42525', '#a6c96a'],
        },
      },      
      series: [{
        name: 'Amount in ' + this.currency,
        type: 'pie',
        allowPointSelect: true,
        dataLabels: {
          connectorWidth: 0,
          crookDistance: '10%',
          enabled: true,
        },
        keys: ['name', 'y', 'selected', 'sliced'],
        data: dctPieTempData['chartValues'],
        //showInLegend: true
      }]
    }
    
    return donutOptions;
  }

  setStackedCostComparisonChart(costComparisonChart,xAxisLabel=[]) {
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
        chartHeading = current + " Energy Cost";
      }      
      else {
        chartHeading = previous + " Energy Cost";
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
          text: chartHeading, 
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
          categories: xAxisLabel,
          visible: true,
          title: {text: xAxisTitle}
      },
      yAxis: {
          title: {
              text: 'Total Cost'
          }
      },
      legend: {
          align: 'center',
          x: 30,
          verticalAlign: 'bottom',
          y: 20,
          floating: false,
          backgroundColor:
              Highcharts.defaultOptions.legend.backgroundColor || 'white',
          shadow: false
      },
      tooltip: {
          headerFormat: '<b>{point.x}</b><br/>',
          pointFormat: '{series.name}: ' +  this.currency + ' {point.y}' +  '<br/>Total: ' + this.currency + ' {point.stackTotal}'
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
    }    
    return chartOptions;
  }

}

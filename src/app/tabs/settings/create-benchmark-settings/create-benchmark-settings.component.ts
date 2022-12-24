import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { BenchmarkSettingService } from '../../shared/services/benchmark-settings.service';
import { BenchmarkSetting } from '../create-benchmark-settings/benchmark-settings-create-update/benchmark-settings.model';
import { BenchmarkSettingsCreateUpdateComponent } from '../create-benchmark-settings/benchmark-settings-create-update/benchmark-settings-create-update.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { UserConfirmationPopupComponent } from '../../shared/components/user-confirmation-popup/user-confirmation-popup.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'fury-create-benchmark-settings',
  templateUrl: './create-benchmark-settings.component.html',
  styleUrls: ['./create-benchmark-settings.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation]
})
export class CreateBenchmarkSettingsComponent implements OnInit, AfterViewInit, OnDestroy 
{
  subject$: ReplaySubject<BenchmarkSetting[]> = new ReplaySubject<BenchmarkSetting[]>(1);
  data$: Observable<BenchmarkSetting[]> = this.subject$.asObservable();
  private benchmarkSettings: BenchmarkSetting[];   
  clientId: string;

  @Input()
  columns: ListColumn[] = [    
    { name: 'Meter', property: 'meter', visible: true, isModelProperty: true },
    { name: 'Parameter', property: 'parameterName', visible: true, isModelProperty: true },
    { name: 'Type', property: 'type', visible: true, isModelProperty: true },
    { name: 'Target', property: 'target', visible: true, isModelProperty: true },
    { name: 'Actions', property: 'actions', visible: true }
  ] as ListColumn[];

  public pageSize = 8;
  public dataSource: MatTableDataSource<BenchmarkSetting>;
  public columnsProps: string[] = this.columns.map((column: ListColumn) => {
    return column.property;
  });

  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort){
       this.dataSource.sort = this.sort;  
    }
  }

  constructor(private dialog: MatDialog,     
              private snackbar: MatSnackBar,   
              private date: DatePipe,
              private benchmarkSettingService: BenchmarkSettingService,
              private cookieService:CookieService
            ) { }

  get visibleColumns() 
  {
    return this.columns.filter(column => column.visible).map(column => column.property);
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
    this.getBenchmarkSettings();
  }

  notificationMessage(message: string, cssClass: string) 
  {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  getBenchmarkSettings()
  {    
    this.benchmarkSettingService.getv1BenchmarkSettings(this.clientId).subscribe((benchmarkSettings: BenchmarkSetting[]) => {
      benchmarkSettings = benchmarkSettings.map(benchmarkSetting => new BenchmarkSetting(benchmarkSetting));
      this.benchmarkSettings = benchmarkSettings;
      this.subject$.next(this.benchmarkSettings);
    });

    this.dataSource = new MatTableDataSource(this.benchmarkSettings);
    
    this.data$.pipe(
      filter(data => !!data)
    ).subscribe((benchmarkSettings) => {
      this.benchmarkSettings = benchmarkSettings;      
      this.dataSource.data = benchmarkSettings;
    });
    this.ngAfterViewInit();
  }

  onFilterChange(value) 
  {
    if (!this.dataSource) 
    {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

  ngAfterViewInit() 
  {
    if(this.dataSource)
    {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  createBenchmarkSetting() 
  {     
    this.dialog.open(BenchmarkSettingsCreateUpdateComponent).afterClosed().subscribe((benchmarkSetting: BenchmarkSetting) => {       
      /**
      * BillPeriod is the updated billPeriod (if the user pressed Save - otherwise it's null)
      */
      if (benchmarkSetting) 
      {
        /**
        * Here we are updating our local array.
        * You would probably make an HTTP request here.
        */         
        this.benchmarkSettingService.createBenchmarkSetting(benchmarkSetting).subscribe((benchmarkSetting: BenchmarkSetting) => {
        this.snackbar.open('Benchmark Setting created successfully.', null, {
          duration: 5000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['green-snackbar'],
        });
        this.getBenchmarkSettings();
        });
      }
    });
  }

  deleteBenchmarkSettings(benchmarkSetting) 
  {
    this.dialog.open(UserConfirmationPopupComponent).afterClosed().subscribe((message: any) => {
      if(message)
      {    
        /* Here we are updating our local array.
        * You would probably make an HTTP request here.
        */
        if(benchmarkSetting)
        {
          this.benchmarkSettingService.deleteBenchmarkSettingById(benchmarkSetting.rowid).subscribe((data) => {
            this.snackbar.open('Benchmark Setting deleted successfully', null, {
              duration: 5000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
              panelClass: ['green-snackbar'],
            });
            this.getBenchmarkSettings();
          });
        }
      }
    })
  }

  ngOnDestroy() { }

}

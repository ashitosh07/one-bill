import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog,MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { MasterDetailsService } from '../../shared/services/masterdetails.service';
import { MasterDetails } from '../create-masterdetails/masterdetails-create-update/masterdetails.model';
import { MasterdetailsCreateUpdateComponent } from '../create-masterdetails/masterdetails-create-update/masterdetails-create-update.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ClientSelectionService } from '../../shared/services/client-selection.service';

@Component({
  selector: 'fury-create-masterdetails',
  templateUrl: './create-masterdetails.component.html',
  styleUrls: ['./create-masterdetails.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation]
})

export class CreateMasterdetailsComponent implements OnInit, AfterViewInit, OnDestroy 
{
  subject$: ReplaySubject<MasterDetails[]> = new ReplaySubject<MasterDetails[]>(1);
  data$: Observable<MasterDetails[]> = this.subject$.asObservable();
  private masterDetails: MasterDetails[]; 

  @Input()
  displayedColumns: ListColumn[] = [    
    { name: 'Mode', property: 'mode', visible: false, isModelProperty: true },   
    { name: 'Mode Name', property: 'modeName', visible: true, isModelProperty: true },   
    { name: 'Description', property: 'description', visible: true, isModelProperty: true },
    { name: 'Parent Id', property: 'parentId', visible: false, isModelProperty: true },
    { name: 'Parent Name', property: 'parentName', visible: true, isModelProperty: true },
    { name: 'Actions', property: 'actions', visible: true }
  ] as ListColumn[];

  public pageSize = 7;
  public dataSource: MatTableDataSource<MasterDetails>;
  public columnsProps: string[] = this.displayedColumns.map((column: ListColumn) => {
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
              private clientSelectionService: ClientSelectionService,
              private masterDetailsService: MasterDetailsService) { }

  get visibleColumns() 
  {
    return this.displayedColumns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit()
  {
    this.clientSelectionService.setIsClientVisible(false);
    this.getMasterDetails();
  }

  ngAfterViewInit() 
  {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  createMasterDetails() 
  {     
    this.dialog.open(MasterdetailsCreateUpdateComponent).afterClosed().subscribe((masterDetails: MasterDetails) => {
      /**
      * MasterDetails is the updated MasterDetails (if the user pressed Save - otherwise it's null)
      */
      if (masterDetails) 
      {
        /**
        * Here we are updating our local array.
        * You would probably make an HTTP request here.
        */
        this.masterDetailsService.createMasterDetails(masterDetails).subscribe({next: (masterDetailsObj: MasterDetails) => {
        this.snackbar.open('Master Details created successfully.', null, {
          duration: 5000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['green-snackbar'],
        });
        this.getMasterDetails();
        },
        error: (err: HttpErrorResponse) => {
        this.notificationMessage('Master Details creation failed.', 'red-snackbar');
      }
      });
      }
    });
  } 

  updateMasterDetails(masterDetails) 
  {    
    this.dialog.open(MasterdetailsCreateUpdateComponent, {
      data: masterDetails
    }).afterClosed().subscribe((masterDetails: MasterDetails) => {
      /**
       * BillPeriod is the updated billPeriod (if the user pressed Save/Update - otherwise it's null)
       */
      if (masterDetails) 
      {
        /**
         * Here we are updating our local array.
         * You would probably make an HTTP request here.
         */
        this.masterDetailsService.updateMasterDetails(masterDetails.id,masterDetails).subscribe({next: (masterDetails: MasterDetails) => {
          this.snackbar.open('Master Details updated successfully.', null, {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['green-snackbar'],
          });
          this.getMasterDetails();
        },
        error: (err: HttpErrorResponse) => {
          this.notificationMessage('Master Details updation failed.', 'red-snackbar');
        }
      });
      }
    });
  } 

  getMasterDetails()
  {
    this.masterDetailsService.getMasterDetails().subscribe({next:(masterDetails: MasterDetails[]) => {
      masterDetails = masterDetails.map(masterDetails => new MasterDetails(masterDetails));
      this.subject$.next(masterDetails);
    },
    error: (err) => {
      this.notificationMessage('Master details Not Found.', 'red-snackbar');
    }
  });

    this.dataSource = new MatTableDataSource(this.masterDetails);
    
    this.data$.pipe(
      filter(data => !!data)
    ).subscribe((masterDetails) => {
      this.masterDetails = masterDetails;      
      this.dataSource.data = masterDetails;
    });
    
    this.ngAfterViewInit();
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

  ngOnDestroy() { }

}

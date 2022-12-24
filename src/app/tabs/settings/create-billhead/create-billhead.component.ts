import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ListColumn } from '../../../../@fury/shared/list/list-column.model';
import { Billhead } from "./billhead-create-update/billhead.model";
import { fadeInRightAnimation } from '../../../../@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from '../../../../@fury/animations/fade-in-up.animation';
import { BillheadService } from "../../shared/services/bill-head.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import { MetadataService } from 'src/app/tabs/shared/services/metadata.service';
import { MetadataBillHeadTypes } from '../../shared/models/metadata.billHead-types.model';
import { MetadataUtilityType } from '../../shared/models/metadata.utility-type.model';
import { MetadataBillFormula } from '../../shared/models/metadata.bill-formula.model';
import { Metadata } from '../../shared/models/metadata.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { defaults } from 'chart.js';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { BillheadCreateUpdateComponent } from './billhead-create-update/billhead-create-update.component';
import { HttpErrorResponse } from '@angular/common/http';
import { CopyBillLinesComponent } from './copy-bill-lines/copy-bill-lines.component';
import { UserConfirmationPopupComponent } from '../../shared/components/user-confirmation-popup/user-confirmation-popup.component';
import { CookieService } from 'ngx-cookie-service';
import { getClientDataFormat } from '../../shared/utilities/utility';
import { environment } from 'src/environments/environment';
import { ClientSelectionService } from '../../shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'create-billHead',
  templateUrl: './create-billHead.component.html',
  styleUrls: ['./create-billHead.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation]
})
export class CreateBillheadComponent implements OnInit, AfterViewInit, OnDestroy {

  static id = 100;
  public defaults: Billhead;
  form: FormGroup;
  mode: 'create' | 'update' = 'create';

  dateFormat = getClientDataFormat('DateFormat');
  currency = '';
  roundFormat = '';

  subject$: ReplaySubject<Billhead[]> = new ReplaySubject<Billhead[]>(1);
  data$: Observable<Billhead[]> = this.subject$.asObservable();
  billHeads: Billhead[];
  clientId: number;

  @Input()
  columns: ListColumn[] = [
    //{name:'#' ,property:'id',visible:true,isModelProperty:true},
    { name: 'Bill Line Name', property: 'accountHeadName', visible: true, isModelProperty: true },
    { name: 'Bill Line Type', property: 'headType', visible: true, isModelProperty: true },
    { name: 'Contract Type', property: 'contractType', visible: true, isModelProperty: true },
    { name: 'Position', property: 'position', visible: true, isModelProperty: true },
    { name: 'Fixed Amount', property: 'fixedAmountLocal', visible: true, isModelProperty: false },
    { name: 'Actions', property: 'actions', visible: true },
    //{ name: 'Checkbox', property: 'checkbox', visible: true }
  ] as ListColumn[];

  pageSize = 8;
  dataSource: MatTableDataSource<Billhead> | null;

  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  constructor(private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private date: DatePipe,
    private currencyPipe: CurrencyPipe,
    private billHeadService: BillheadService,
    private clientSelectionService: ClientSelectionService,
    private cookieService: CookieService,
    private envService: EnvService) {
    this.currency = getClientDataFormat('Currency') ?? envService.currencyFormat;
    this.roundFormat = getClientDataFormat('RoundOff') ?? envService.roundOffFormat;
  }

  get visibleColumns() {
    return this.columns.filter(columns => columns.visible).map(columns => columns.property);
  }

  ngOnInit() {
    this.clientSelectionService.setIsClientVisible(true);
    this.getBillHeads();
  }


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  copyBillLines() {
    this.dialog.open(CopyBillLinesComponent).afterClosed().subscribe();
  }

  createBillHead() {
    this.dialog.open(BillheadCreateUpdateComponent).afterClosed().subscribe((billhead: Billhead) => {
      /**
       * BillHead is the updated billHead (if the user pressed Save - otherwise it's null)
       */
      if (billhead) {
        /**
         * Here we are updating our local array.
         * You would probably make an HTTP request here.
         */
        this.billHeadService.createBillHead(billhead).subscribe((billHeadObj: Billhead) => {
          this.snackbar.open('Bill Line created successfully.', null, {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['green-snackbar'],
          });
          this.getBillHeads();
        });
        //this.getBillHeads();
      }
      //this.getBillHeads();
    });
    this.getBillHeads();
  }

  updateBillHead(billHead) {
    this.dialog.open(BillheadCreateUpdateComponent, {
      data: billHead
    }).afterClosed().subscribe((billHead: Billhead) => {
      /**
       * BillPeriod is the updated billPeriod (if the user pressed Save/Update - otherwise it's null)
       */
      if (billHead) {
        /**
         * Here we are updating our local array.
         * You would probably make an HTTP request here.
         */
        this.billHeadService.updateBillHeadById(billHead.id, billHead).subscribe((billHead: Billhead) => {
          this.snackbar.open('Bill Line updated successfully.', null, {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['green-snackbar'],
          });
          this.getBillHeads();
        });
      }
    });
    this.getBillHeads();
  }

  deleteBillHead(billHead) {
    this.dialog.open(UserConfirmationPopupComponent).afterClosed().subscribe((message: any) => {
      if (message) {
        /* Here we are updating our local array.
        * You would probably make an HTTP request here.
        */
        if (billHead) {
          this.billHeadService.deleteBillHeadById(billHead.id).subscribe({
            next: (data) => {
              this.snackbar.open('Bill Line deleted successfully.', null, {
                duration: 5000,
                verticalPosition: 'top',
                horizontalPosition: 'center',
                panelClass: ['green-snackbar'],
              });
              this.getBillHeads();
            },
            error: (err: HttpErrorResponse) => {
              this.notificationMessage('Bill Line deletion failed.', 'red-snackbar');
            }
          });
        }
      }
    })
  }


  // createBillHead(){

  //   Object.assign(this.defaults, this.form.value);
  //   if( this.defaults.id >= 100)
  //   {
  //     this.updateBillHeadFromForm(this.defaults);
  //   }
  //   else{
  //     this.billHeadService.createBillHead(this.defaults).subscribe((billHead:Billhead)=>{
  //       this.snackbar.open('created Bill head Successfully',null,{
  //         duration:5000,
  //         verticalPosition:'top',
  //         horizontalPosition:'center',
  //         panelClass:['green-snackbar'],
  //       });
  //       this.billHeads.unshift(new Billhead(billHead));
  //       this.subject$.next(this.billHeads);
  //     })
  //   }
  // }



  //   updateBillHeadFromForm(defaults){
  //         this.billHeadService.updateBillHeadById(defaults.id,defaults).subscribe((billHead:Billhead)=>{
  //           this.snackbar.open('updated Bill head successfully',null,{
  //             duration:5000,
  //             verticalPosition:'top',
  //             horizontalPosition:'center',
  //             panelClass:['green-snackbar'],
  //           });
  //          const index=this.billHeads.findIndex((existingBillhead)=>existingBillhead.id===billHead.id);
  //        this.billHeads[index]=new Billhead(billHead);
  //        this.billHeadService.getBillHeads().subscribe((billHeads:Billhead[])=>{
  //         billHeads=billHeads.map(billHead =>new Billhead(billHead));
  //         this.subject$.next(billHeads);
  //       });
  //          })
  //      }

  //      updateBillHead(billHead){
  //       this.form.setValue(billHead);
  //      }
  //   deleteBillHead(billHead) {
  //     this.billHeadService.deleteBillHeadById(billHead.id).subscribe(() => {
  //     this.billHeads.splice(this.billHeads.findIndex((existingBillhead) => existingBillhead.id === billHead.id), 1);
  //     this.subject$.next(this.billHeads);
  //   })
  // }

  onFilterChange(value) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

  getBillHeads() {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.billHeadService.getBillHeads(this.clientId).subscribe((billHeads: Billhead[]) => {
      billHeads = billHeads.map(billHead => new Billhead(billHead));
      this.dateFormat = getClientDataFormat('DateFormat');
      this.roundFormat = getClientDataFormat('RoundOff');
      this.currency = getClientDataFormat('Currency');
      billHeads.forEach(billHead => {
        billHead.fixedAmountLocal = this.currencyPipe.transform(billHead.fixedAmount, this.currency.toString(), true, this.roundFormat);
        billHead.discountAmountLocal = this.currencyPipe.transform(billHead.discountAmount, this.currency.toString(), true, this.roundFormat);
      });
      this.subject$.next(billHeads);
    }
      // ,error: (err) => {
      //   this.notificationMessage('Bill Line Not Found.', 'red-snackbar');
      // }
    );

    this.dataSource = new MatTableDataSource(this.billHeads);

    this.data$.pipe(
      filter(data => !!data)
    ).subscribe((billHeads) => {
      this.billHeads = billHeads;
      this.dataSource.data = billHeads;
    });

    this.ngAfterViewInit();
  }

  ngOnDestroy() {
  }

}

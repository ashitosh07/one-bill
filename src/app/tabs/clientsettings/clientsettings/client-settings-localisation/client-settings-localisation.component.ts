import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { CookieService } from 'ngx-cookie-service';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { GeneraldashboardService } from 'src/app/pages/generaldashboard/generaldashboard.service';
import { CreateUserMasterComponent } from 'src/app/tabs/shared/components/create-user-master/create-user-master.component';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { MasterService } from 'src/app/tabs/shared/services/master.service';
import { ClientsettingsService } from '../../clientsettings.service';

@Component({
  selector: 'fury-client-settings-localisation',
  templateUrl: './client-settings-localisation.component.html',
  styleUrls: ['./client-settings-localisation.component.scss']
})
export class ClientSettingsLocalisationComponent implements OnInit {

  localisationSettings: FormGroup;

  blnShow='none';

  dateFormatId: Number;
  roundOff: string;
  currency: string;
  utilityTypeId: number;
  utilityType: string;
  isDuplicateUtilityType: boolean = false;
  consumptionRoundOff: string;
  keyId: number;
  localisationSaved: boolean = false;

  lstDateFormat: Master[];
  lstRoundOff: Master[];
  lstCurrency: Master[];
  lstUtilityTypes: Master[];
  lstConsumptionRoundOff = [];
  lstUtilityRoundOff = [];
  objEditRow: any;
  duplicatePrefix: string;
  isFormvalid: boolean = false;
  isUtilitiesMapped: boolean = false;

  consumptionRoundOffDataSource = new MatTableDataSource([]);

  clientId: Number;

  consumptionRoundOffColumns: ListColumn[] = [
    { name: 'Utility Type', property: 'utilityType', visible: true, isModelProperty: true },
    { name: 'Consumption RoundOff', property: 'consumptionRoundOff', visible: true, isModelProperty: false }
    //{ name: 'Delete', property: 'actions', visible: true },
    //{ name: 'Modify', property: 'modify', visible: true },
  ] as ListColumn[];

  constructor(private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private masterService: MasterService,
    private generalDashBoardService: GeneraldashboardService,
    private clientSettingService: ClientsettingsService,
    private cookieService: CookieService) {
    this.localisationSettings = fb.group({
      'dateFormatId': [0],  //Validators.required
      'roundOff': [null, Validators.pattern("^[1-5]\d*$")],//"[1-5]\d")], //Validators.pattern("[1-9]\d{0,1}\.[0-9]\d{0,1}\-[0-9]\d{0,1}")
      'currency': [null, Validators.required],
      'utilityTypeId': [null],
      'consumptionRoundOff': [null,Validators.pattern("^[1-5]\d*$")]  //[1-9]\d{0,1}\.[0-9]\d{0,1}\-[0-9]\d{0,1}
    });
  }
  
  get localisationVisibleColumns() {
    return this.consumptionRoundOffColumns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit(): void {
    //this.getMetaData();
    this.clientId = Number(this.cookieService.get('globalClientId'));
    this.masterService.getSystemMasterdata(48, 0).subscribe((data: Master[]) => {
      this.lstDateFormat = data;
    });

    this.getUtilities();
    
    // this.masterService.getSystemMasterdata(16, 0).subscribe((data: Master[]) => {
    //   this.lstUtilityTypes = data;
    // });
    // this.masterService.getSystemMasterdata(50, 0).subscribe((data: Master[]) => {
    //   this.lstRoundOff = data;
    // });
    this.masterService.getUserMasterdata(31, 0).subscribe((data: Master[]) => {
      this.lstCurrency = data;
    });
    this.initialData();
  }

  getUtilities()
  {
    this.generalDashBoardService.getUtilities(this.clientId).subscribe((response: any) => {
      if (response) {
        this.lstUtilityTypes = [];
        this.lstUtilityTypes = response;
        if (this.utilityTypeId == undefined)
          this.utilityTypeId = 0;
      }
    });
  }

  initialData() {

    this.lstConsumptionRoundOff = [];
    this.dateFormatId = 0;
    this.roundOff = null;
    this.currency = null;
    this.localisationSaved = false;
    this.clientSettingService.localisationData(this.clientId).subscribe((data: any) => {
        if (data) {
          //this.dateFormatId = data['dateFormatId'];
          this.roundOff = data['currencyRoundOff'];
          this.currency = data['currency'];
          this.lstConsumptionRoundOff = data["utilityTypeRoundOff"];
          this.localisationSettings.controls.currency.setValue(this.currency);
          this.localisationSettings.controls.roundOff.setValue(this.roundOff);

          if(this.roundOff && this.roundOff != '')
          {
            this.localisationSettings.controls.currency.disable();
            this.localisationSettings.controls.roundOff.disable();
            this.localisationSaved = true;
          }

          this.consumptionRoundOffDataSource = new MatTableDataSource(this.lstConsumptionRoundOff);
          if(this.lstConsumptionRoundOff && this.lstUtilityTypes && this.lstConsumptionRoundOff.length == this.lstUtilityTypes.length)
          {
            this.isUtilitiesMapped = true;
          }
          if(this.lstConsumptionRoundOff.length>0){
            this.blnShow = 'block';
          }
          this.validateForm();
        }      
    });
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  onUtilityType(event)
  {
    this.utilityType = event.source.triggerValue;

    this.isDuplicateUtilityType = false;
    this.lstConsumptionRoundOff.forEach(element => {
      if(element.utilityType == event.source.triggerValue) {
        //this.notificationMessage('Utility Type already added', 'red-snackbar');
        this.isDuplicateUtilityType = true;
        this.utilityTypeId = null;
        this.utilityType = '';
        this.keyId = null;
        return;
      }
    })
  }

  saveConsumptionRoundOff(){

     if(this.utilityTypeId && this.consumptionRoundOff){
      let dctConsumptionRoundOff = {
        client :  Number(this.cookieService.get('globalClientId')),
        utilityTypeId : this.utilityTypeId,
        utilityType : this.utilityType,
        consumptionRoundOff : this.consumptionRoundOff.toString()
      }
      this.lstConsumptionRoundOff.push(dctConsumptionRoundOff);

      this.utilityTypeId = null;
      this.utilityType = '';
      this.consumptionRoundOff = '';
      this.keyId = null;
      this.objEditRow = null;
    }

    this.consumptionRoundOffDataSource = new MatTableDataSource(this.lstConsumptionRoundOff);
    if(this.lstConsumptionRoundOff.length>0){
      this.blnShow = 'block';
    }
    if(this.lstUtilityTypes.length == this.lstConsumptionRoundOff.length)
    {
      this.isUtilitiesMapped = true;
    }
    this.validateForm();
  }

  validateForm()
  {
    this.isFormvalid = false;
    if((this.lstUtilityTypes && this.lstConsumptionRoundOff && this.lstUtilityTypes.length == this.lstConsumptionRoundOff.length)&&(this.localisationSettings.valid))
    {
      this.isFormvalid = true;
    }
  }

  modifyConsumptionRoundOff(row)
  {
    if((this.objEditRow) && (this.lstConsumptionRoundOff))
    {
      this.lstConsumptionRoundOff.push(this.objEditRow);
      this.consumptionRoundOffDataSource = new MatTableDataSource(this.lstConsumptionRoundOff);
    }
    
    this.utilityTypeId = row['id'];
    this.utilityType = row['utilityType'];

    
    this.lstConsumptionRoundOff.filter((item: Master) => {
      if(item.description == this.utilityType)
        this.keyId = item.id;
    })
    
    this.utilityType = row['utilityType'];
    this.utilityTypeId = row['utilityTypeId'];
    this.consumptionRoundOff = row['consumptionRoundOff'];

    this.objEditRow = row;
    this.duplicatePrefix = '';
    this.deleteConsumptionRoundOff(row);
  }
  
  deleteConsumptionRoundOff(row)
  {
    let index = this.lstConsumptionRoundOff.findIndex((element) => element.id === row.id);
    if(index>=0)
    this.lstConsumptionRoundOff.splice(index, 1);
    this.consumptionRoundOffDataSource = new MatTableDataSource(this.lstConsumptionRoundOff);
    if(this.lstConsumptionRoundOff.length==0){
      this.blnShow = 'none';
    }
  }

  createCurrency() {
    let modes = [this.currency,31];
    this.dialog.open(CreateUserMasterComponent, { data: modes }).afterClosed().subscribe((message: any) => {
      if (message && message == 'Success') {
        this.masterService.getUserMasterdata(31, 0).subscribe((data: Master[]) => {
          this.lstCurrency = data;
        });
      }
    });
  }

  //getMetaData(){
  // this.clientSettingService.getMetadata().subscribe((data: any) => {
  //   if(data) {
  //   this.lstDateFormat = data['dateFormats'];  
  //   this.lstRoundOff = data['roundOff'];
  //   this.lstCurrency = data['currencyTypes'];        
  //   } 
  // })
  //}

}

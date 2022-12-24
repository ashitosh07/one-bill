import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { MasterService } from 'src/app/tabs/shared/services/master.service';
import { ClientsettingsService } from '../../clientsettings.service';
import { UserConfirmationPopupComponent } from '../../../shared/components/user-confirmation-popup/user-confirmation-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'fury-sequencenumber',
  templateUrl: './sequencenumber.component.html',
  styleUrls: ['./sequencenumber.component.scss']
})
export class SequencenumberComponent implements OnInit {

  sequenceSettings: FormGroup;


  sequenceDataSource = new MatTableDataSource([]);

  blnShow='none';

  lstSequence=[];
  objEditRow: any;

  sequenceKeyId:Number;
  sequenceKey:String='';
  keyId: number;

  lstSequenceKey: Master[];
  lastSequence:Number;
  sequenceFormat:String='';
  zeroPadToDigits:Number;
  incrementBy:Number;
  duplicatePrefix: string = '';
  clientId:Number;
  
  sequenceColumns: ListColumn[] = [
    { name: 'Sequence Key', property: 'sequenceKey', visible: true, isModelProperty: true },
    { name: 'Last Sequence', property: 'lastSequence', visible: true, isModelProperty: true },
    { name: 'Sequence Format', property: 'sequenceFormat', visible: true, isModelProperty: true },
    { name: 'Zero Pad To Digits', property: 'zeroPadToDigits', visible: true, isModelProperty: true },
    { name: 'Increment By', property: 'incrementBy', visible: true, isModelProperty: true },
    { name: 'Delete', property: 'actions', visible: true },
    { name: 'Modify', property: 'modify', visible: true },

  ] as ListColumn[];

  constructor(private fb: FormBuilder,
    private dialog: MatDialog,
    private masterService: MasterService,
    private clientSettingService: ClientsettingsService,
    private snackbar: MatSnackBar,
    private cookieService: CookieService) {
    this.sequenceSettings = fb.group({
      'sequenceKey': [''],
      'lastSequence': [null],
      'sequenceFormat': [null],
      'zeroPadToDigits': [''],
      'incrementBy': [''],
    });
   }

  ngOnInit(): void {

    this.clientId = Number(this.cookieService.get('globalClientId'));
    this.getSequenceKeys();
    this.gridList();
  }

  gridList(){
    this.clientSettingService.sequenceGrid(this.clientId).subscribe((data: any) => {
      if(data) {
        this.lstSequence = data;   
        this.sequenceDataSource = new MatTableDataSource(this.lstSequence);
        if(this.lstSequence.length>0){
          this.blnShow = 'block';
        }
        
      } 
    })
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  getSequenceKeys(){
    this.masterService.getSystemMasterdata(58, 0).subscribe((data: Master[]) => {
      this.lstSequenceKey = data;
    });

    // this.clientSettingService.getMetadata().subscribe((data: any) => {
    //   if(data) {
    //   this.lstSequenceKey = data['sequenceKey'];  
    //   } 
    // })
  }

  onSequenceKey(event: MatSelectChange){
    
      this.sequenceKey=event.source.triggerValue;


      this.lstSequence.forEach(element=>{
        if(element.sequenceKey == event.source.triggerValue){
          this.notificationMessage('Sequence key already added', 'red-snackbar');
          this.sequenceKeyId = null;
          this.sequenceKey= '';
          this.keyId = null;
          return;
        }
      })
  
  }

  saveSequence(){

    if(this.sequenceKey && this.lastSequence && this.sequenceFormat && this.zeroPadToDigits >= 0 && this.incrementBy ){
      let dctSequence = {
        client :  Number( this.cookieService.get('globalClientId') ),
        sequenceKeyId : this.sequenceKeyId,
        sequenceKey : this.sequenceKey,
        lastSequence : this.lastSequence,
        sequenceFormat : this.sequenceFormat.indexOf('#') >= 0 ? this.sequenceFormat : this.sequenceFormat + '-[#]',
        zeroPadToDigits : this.zeroPadToDigits,
        incrementBy : this.incrementBy
      }
      this.lstSequence.push(dctSequence);

      this.sequenceKey = '';
      this.sequenceKeyId = null;
      this.keyId = null;
      this.lastSequence = null;
      this.sequenceFormat = '';
      this.zeroPadToDigits = null;
      this.incrementBy = null;
      this.objEditRow = null;
      this.duplicatePrefix = '';
    }

    this.sequenceDataSource = new MatTableDataSource(this.lstSequence);
    if(this.lstSequence.length>0){
      this.blnShow = 'block';
    }
  }

  get sequenceVisibleColumns() {
    return this.sequenceColumns.filter(column => column.visible).map(column => column.property);
  }

  deleteSequence(row){
    this.dialog.open(UserConfirmationPopupComponent).afterClosed().subscribe((message: any) => {
      if(message)
      {
        this.deleteSequenceRow(row);
      }
    })
  }

  deleteSequenceRow(row) {
    let index = this.lstSequence.findIndex((element) => element.id === row.id);
    if(index>=0)
    this.lstSequence.splice(index, 1);
    this.sequenceDataSource = new MatTableDataSource(this.lstSequence);
    if(this.lstSequence.length==0){
      this.blnShow = 'none';
    }
  }

  modifySequence(row){
    if((this.objEditRow) && (this.lstSequence))
    {
      this.lstSequence.push(this.objEditRow);
      this.sequenceDataSource = new MatTableDataSource(this.lstSequence);
    }
    
    this.sequenceKeyId = row['id'];
    //this.sequenceKeyId = row['sequenceKeyId'];
    this.sequenceKey = row['sequenceKey'];

    
    this.lstSequenceKey.filter((item: Master) => {
      if(item.description == this.sequenceKey)
        this.keyId = item.id;
    })

    this.lastSequence = row['lastSequence'];
    this.sequenceFormat = row['sequenceFormat'];
    this.zeroPadToDigits = row['zeroPadToDigits'];
    this.incrementBy = row['incrementBy'];
    this.objEditRow = row;
    this.duplicatePrefix = '';
    this.deleteSequenceRow(row);
    //this.checkDuplicatePrefix();
  }

  checkDuplicatePrefix() {
    this.duplicatePrefix = "";
    if ((this.sequenceKey != '') && (this.sequenceKey != null) && (this.sequenceFormat != '') && (this.sequenceFormat != null)) {
      let prefix = this.sequenceFormat.indexOf('#') >= 0 ? this.sequenceFormat : this.sequenceFormat + '-[#]';
      this.clientSettingService.checkForDuplicatePrefix(prefix,this.clientId).subscribe(data => {
        if (data && data > 0) {
          this.duplicatePrefix = "Prefix already exists.";
        }
      })
    }
  }

}

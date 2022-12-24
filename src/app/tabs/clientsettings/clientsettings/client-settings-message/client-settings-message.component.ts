import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { ClientsettingsService } from '../../clientsettings.service';
import { UserConfirmationPopupComponent } from '../../../shared/components/user-confirmation-popup/user-confirmation-popup.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'fury-client-settings-message',
  templateUrl: './client-settings-message.component.html',
  styleUrls: ['./client-settings-message.component.scss']
})
export class ClientSettingsMessageComponent implements OnInit {

  messageSettings: FormGroup;

  lstMessage=[];
  messageDataSource : MatTableDataSource<[]>;
  blnShow='none';

  inputType = 'password';
  visible = false;
  senderId:string='';
  apiLink:string='';
  userName:string='';
  password:string='';

  messageType:String = '';
  messageTypes=['SMS','Whats App'];

  clientId:Number;

  messageColumns: ListColumn[] = [
    { name: 'Message Type', property: 'messagetype', visible: true, isModelProperty: true },
    { name: 'Sender Id', property: 'senderId', visible: true, isModelProperty: true },
    { name: 'Username', property: 'username', visible: true, isModelProperty: true },
    { name: 'Password', property: 'password', visible: true, isModelProperty: true },
    { name: 'ApiLink', property: 'apiLink', visible: true, isModelProperty: true },
    { name: 'Delete', property: 'actions', visible: true },
    { name: 'Modify', property: 'modify', visible: true },
  ] as ListColumn[];
  
  constructor(private fb: FormBuilder,
    private dialog: MatDialog,private cd: ChangeDetectorRef,
    private clientSettingService: ClientsettingsService,
    private snackbar: MatSnackBar,
    private cookieService: CookieService
    ) {
    this.messageSettings = fb.group({
      'senderId': [''],
      'apiLink': [null],
      'userName': [null],
      'password': [''],
      'messageType': ['']

    });

   }

  ngOnInit(): void {

    this.clientId = Number(this.cookieService.get('globalClientId'));

    this.gridList();
 
  }
  
  get messageVisibleColumns() {
    return this.messageColumns.filter(column => column.visible).map(column => column.property);
  }

  gridList(){
    this.clientSettingService.messageGrid(this.clientId).subscribe((data: any) => {
      if(data) {
        this.lstMessage = data;   
        this.messageDataSource = new MatTableDataSource(this.lstMessage);
        if(this.lstMessage.length>0){
          this.blnShow = 'block';
        }
        
      } 
    })
  }
  
  onMessageTypeChange(){
    this.lstMessage.forEach(element=>{
      if(element.messagetype == this.messageType){
        this.notificationMessage('Message Type already added', 'red-snackbar');
        this.messageType  = '';
        return;
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

  saveMessage(){

    if(this.senderId && this.apiLink && this.userName && this.password && this.messageType){
      let dctMessage={
        clientId : Number( this.cookieService.get('globalClientId') ),
        senderId : this.senderId,
        apiLink : this.apiLink,
        username : this.userName,
        password : this.password,
        messagetype : this.messageType
      }
      this.lstMessage.push(dctMessage);

     this.senderId ='';
     this.apiLink ='';
     this.userName ='';
     this.password ='';
     this.messageType='';
    }
    this.messageDataSource = new MatTableDataSource(this.lstMessage);
    if(this.lstMessage.length>0){
      this.blnShow = 'block';
    }
  }

  deleteMessage(row){
    this.dialog.open(UserConfirmationPopupComponent).afterClosed().subscribe((message: any) => {
      if(message)
      {
        this.removeFromGrid(row);
      }
    })
  }

  removeFromGrid(row)
  {
    this.lstMessage.splice(this.lstMessage.findIndex((element) => element.senderId === row.senderId), 1);
        this.messageDataSource = new MatTableDataSource(this.lstMessage);
        if(this.lstMessage.length==0){
          this.blnShow = 'none';
        }
  }

  modifyMessage(row){

    this.senderId = row['senderId'];
    this.apiLink = row['apiLink'];
    this.userName = row['username'];
    this.password = row['password'];
    this.messageType = row['messagetype'];

    this.removeFromGrid(row);
  }

  onChangeClientId(value){

  }

  toggleVisibility() {
    if (this.visible) {
      this.inputType = 'password';
      this.visible = false;
      this.cd.markForCheck();
    } else {
      this.inputType = 'text';
      this.visible = true;
      this.cd.markForCheck();
    }
  }

}

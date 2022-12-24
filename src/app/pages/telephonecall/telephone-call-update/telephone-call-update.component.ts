import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { MasterService } from 'src/app/tabs/shared/services/master.service';
import { TelephonecallService } from '../telephonecall.service';
import { CreateUserMasterComponent } from '../../../tabs/shared/components/create-user-master/create-user-master.component';
import { MatDialog } from '@angular/material/dialog';
import { ClientSelectionService } from 'src/app/tabs/shared/services/client-selection.service';

@Component({
  selector: 'fury-telephone-call-update',
  templateUrl: './telephone-call-update.component.html',
  styleUrls: ['./telephone-call-update.component.scss']
})
export class TelephoneCallUpdateComponent implements OnInit {

  public txtForm: FormGroup;

  lstCallType = [];
  callType = '';
  textData = '';

  constructor(private fb: FormBuilder,
    private snackbar: MatSnackBar, private masterService: MasterService,
    private telephoneCallService: TelephonecallService,
    private router: Router, private dialog: MatDialog,
    private clientSelectionService: ClientSelectionService,
    private cookieService: CookieService
  ) { }

  ngOnInit(): void {
    this.clientSelectionService.setIsClientVisible(true);
    this.txtForm = this.fb.group({
      callType: [null, Validators.compose([Validators.required])],
      textData: [null, Validators.compose([Validators.required])],
    });

    this.getCallTypes();
  }

  getCallTypes() {
    this.lstCallType = [];
    this.masterService.getUserMasterdata(57, 0).subscribe((data: Master[]) => {
      this.lstCallType = data;
    });

    // this.telephoneCallService.getCallTypes().subscribe((data: any) => {
    //   if(data) {

    //    this.lstCallType=[];   
    //    this.lstCallType=data['callTypes'];

    //   } 
    // })

  }

  popupMsg(type, msg) {

    let snackbarColor;
    if (type == 'error') {
      snackbarColor = 'red-snackbar';
    }
    else if (type == 'success') {
      snackbarColor = 'green-snackbar';
    }
    this.snackbar.open(msg, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: [snackbarColor],
    });
  }


  saveData() {

    let dctTelephone = {};

    dctTelephone['callTypeId'] = this.callType;
    dctTelephone['textdata'] = this.textData;
    dctTelephone['datetime'] = new Date();
    dctTelephone['userId'] = this.cookieService.get('userId');
    dctTelephone['tenantId'] = parseInt(this.cookieService.get('ownerId'));

    this.telephoneCallService.updateTelephonecallById(dctTelephone).subscribe((data: any) => {
      this.popupMsg('success', 'Call log entry saved successfully');
      this.cancelData();
      this.router.navigateByUrl('telephonecall/view-call-logs')
    })

  }

  cancelData() {
    this.callType = '';
    this.textData = '';
    this.txtForm = this.fb.group({
      callType: [null, Validators.compose([Validators.required])],
      textData: [null, Validators.compose([Validators.required])],
    });
  }

  createCallType()
  {
    let modes = [0,57];
      this.dialog.open(CreateUserMasterComponent, { data: modes }).afterClosed().subscribe((message: any) => {
        if (message && message == 'Success') {
          this.getCallTypes();
        }
      });
  }

}

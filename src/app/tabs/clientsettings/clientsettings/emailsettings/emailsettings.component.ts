import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { ClientsettingsService } from '../../clientsettings.service';

@Component({
  selector: 'fury-emailsettings',
  templateUrl: './emailsettings.component.html',
  styleUrls: ['./emailsettings.component.scss']
})
export class EmailsettingsComponent implements OnInit {

  emailSettings: FormGroup;

  clientId:Number;

  smtpServer:String;
  smtpPort:Number;
  smtpUsername:String;
  smtpPassword:String;
  popServer:String;
  popPort:Number;
  noreplyUsername:String;
  noreplyPassword:String;
  visible = false;
  inputType = 'password';
  inputTypeNoReply = 'password';
  visibleNoReply = false;

  constructor(private fb: FormBuilder,private cd: ChangeDetectorRef,
    private clientSettingService: ClientsettingsService,
    private cookieService:CookieService) { 
    // this.emailSettings = fb.group({
    //   'smtpServer': ['', Validators.required],
    //   'smtpPort': [null, Validators.required],
    //   'smtpUsername': [null, Validators.required],
    //   'smtpPassword': ['', Validators.required],
    //   'popServer': ['', Validators.required],
    //   'popPort': ['', Validators.required],
    //   'noreplyUsername': [null, Validators.required],
    //   'noreplyPassword': ['', Validators.required]
    // });
    this.emailSettings = fb.group({
      'smtpServer': [''],
      'smtpPort': [''],
      'smtpUsername': [''],
      'smtpPassword': [''],
      'popServer': [''],
      'popPort': [''],
      'noreplyUsername': [''],
      'noreplyPassword': ['']
    });
  }

  ngOnInit(): void {
    this.initialData();
  }

  initialData(){
    this.clientId = Number( this.cookieService.get('globalClientId') );

    this.clientSettingService.emailData(this.clientId).subscribe((data: any) => {
      if(data) {
        this.smtpServer = data['smtpServer'];
        this.smtpPort = data['smtpPort'] == 0 ? '' : data['smtpPort'];
        this.smtpUsername = data['smtpUsername'];
        this.smtpPassword = data['smtpPassword'];
        this.popServer = data['popServer'];
        this.popPort = data['popPort'] == 0 ? '' : data['popPort'];
        this.noreplyUsername=data['noreplyUsername'];
        this.noreplyPassword=data['noreplyPassword'];
      } 
    }    
    )
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
  
  toggleVisibilityNoReply()
  {
    if (this.visibleNoReply) {
      this.inputTypeNoReply = 'password';
      this.visibleNoReply = false;
      this.cd.markForCheck();
    } else {
      this.inputTypeNoReply = 'text';
      this.visibleNoReply = true;
      this.cd.markForCheck();
    }
  }

}

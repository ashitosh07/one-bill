import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientSettingsLedgerRelationComponent } from './client-settings-ledger-relation/client-settings-ledger-relation.component';
import { ClientSettingsLocalisationComponent } from './client-settings-localisation/client-settings-localisation.component';
import { ClientSettingsMessageComponent } from './client-settings-message/client-settings-message.component';
import { ClientsettingsService } from '../clientsettings.service';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';
import { GeneralComponent } from './general/general.component';
import { SequencenumberComponent } from './sequencenumber/sequencenumber.component';
import { EmailsettingsComponent } from './emailsettings/emailsettings.component';
import { CopyClientSettingsComponent } from './copy-client-settings/copy-client-settings.component';
import { MatDialog } from '@angular/material/dialog';
import { ClientInvoiceTermsComponent } from './client-invoice-terms/client-invoice-terms.component';
import { ClientFormats } from '../../shared/models/client-formats.model';
import { MasterService } from '../../shared/services/master.service';
import { ClientSelectionService } from '../../shared/services/client-selection.service';

@Component({
  selector: 'fury-clientsetting',
  templateUrl: './clientsettings.component.html',
  styleUrls: ['./clientsettings.component.scss']
})
export class ClientsettingsComponent implements OnInit {


  generalFormGroup: FormGroup;
  sequenceFormGroup: FormGroup;
  emailFormGroup: FormGroup;
  clientSettingsFormGroup: FormGroup;
  clientSettingsLedgerFormGroup: FormGroup;
  clientSettingsLocalisationFormGroup: FormGroup;
  clientSettingsInvoiceTermsFormGroup: FormGroup;

  private _gap = 16;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`;

  utilityTypes: ListItem[] = [];
  parameters: ListItem[] = [];
  weekTypes: ListItem[] = [];
  peakTypes: ListItem[] = [];
  seasons: ListItem[] = [];
  slabs: ListItem[] = [];

  utilityTypeId: number = 0;
  parameterId: number = 0;
  passwordInputType = 'password';
  tariffName: string = '';
  rate: number = 0;
  peakTypeId: number = 0;
  weekTypeId: number = 0;
  from: number = 0;
  to: number = 0;
  tariffDate: Date = new Date();
  isDisable = true;
  // tariffMaster: TariffMaster = {};

  peakSettingsHide = true;
  slabSettingsHide = true;

  @ViewChild(ClientSettingsMessageComponent, { static: true }) clientSettingsMessageComponent: ClientSettingsMessageComponent;
  @ViewChild(ClientSettingsLedgerRelationComponent, { static: true }) clientSettingsLedgerRelationComponent: ClientSettingsLedgerRelationComponent;
  @ViewChild(ClientSettingsLocalisationComponent, { static: true }) clientSettingsLocalisationComponent: ClientSettingsLocalisationComponent;
  @ViewChild(GeneralComponent, { static: true }) generalComponent: GeneralComponent;
  @ViewChild(SequencenumberComponent, { static: true }) sequencenumberComponent: SequencenumberComponent;
  @ViewChild(EmailsettingsComponent, { static: true }) emailsettingsComponent: EmailsettingsComponent;
  @ViewChild(ClientInvoiceTermsComponent, { static: true}) clientInvoiceTermsComponent: ClientInvoiceTermsComponent;

  isCompleted = true;

  constructor(private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private snackbar: MatSnackBar,
    private masterService: MasterService,
    private clientSettingService: ClientsettingsService,
    private clientSelectionService: ClientSelectionService,
    private dialog: MatDialog
  ) { }

  ngAfterViewChecked() {
    this.cd.detectChanges();
   }

  ngOnInit(): void {
    this.clientSelectionService.setIsClientVisible(true);
    this.clientSettingsFormGroup = this.clientSettingsMessageComponent.messageSettings;
    //this.clientSettingsLedgerFormGroup = this.clientSettingsLedgerRelationComponent.ledgerSettings;
    this.clientSettingsLocalisationFormGroup = this.clientSettingsLocalisationComponent.localisationSettings;
    this.generalFormGroup = this.generalComponent.generalSettings;
    this.sequenceFormGroup = this.sequencenumberComponent.sequenceSettings;
    this.emailFormGroup = this.emailsettingsComponent.emailSettings;
    this.clientSettingsInvoiceTermsFormGroup = this.clientInvoiceTermsComponent.invoiceTerms;
  }

  saveDatas() {
    let validationStatus = true;

    //Saving GENERAL
    let dctGeneral = {};

    dctGeneral["clientId"] = this.generalComponent.clientId;
    dctGeneral["WorkingHours"] = this.generalComponent.workingHrs;
    dctGeneral["SupportMail"] = this.generalComponent.supportMail;
    dctGeneral["Website"] = this.generalComponent.website;
    dctGeneral["BillSettingsId"] = this.generalComponent.billSettingsId;
    dctGeneral["isBilledbyClient"] = this.generalComponent.isBilledbyClient;

    this.clientSettingService.saveGeneral(dctGeneral).subscribe((response: any) => {
      if (response) {
        validationStatus = true;
      }

    }
    )

    //Saving SEQUENCE NUMBER
    let lstSequenceNumber = [];
    lstSequenceNumber = this.sequencenumberComponent.lstSequence;

    if (lstSequenceNumber.length > 0) {
      this.clientSettingService.saveSequenceNumber(lstSequenceNumber).subscribe((response: any) => {
        if (response) {
          validationStatus = true;
        }

      }
      )
    }


    //Saving EMAIL 
    let dctEmail = {};

    dctEmail["clientId"] = this.generalComponent.clientId;
    dctEmail["SmtpServer"] = this.emailsettingsComponent.smtpServer;
    dctEmail["SmtpPort"] = Number(this.emailsettingsComponent.smtpPort);
    dctEmail["SmtpUsername"] = this.emailsettingsComponent.smtpUsername;
    dctEmail["SmtpPassword"] = this.emailsettingsComponent.smtpPassword;
    dctEmail["PopServer"] = this.emailsettingsComponent.popServer;
    dctEmail["PopPort"] = Number(this.emailsettingsComponent.popPort);
    dctEmail["NoreplyUsername"] = this.emailsettingsComponent.noreplyUsername;
    dctEmail["NoreplyPassword"] = this.emailsettingsComponent.noreplyPassword;

    this.clientSettingService.saveEmail(dctEmail).subscribe((response: any) => {
      if (response) {
        validationStatus = true;
      }
    }
    )


    //Saving MESSAGE

    let lstMessage = [];
    lstMessage = this.clientSettingsMessageComponent.lstMessage;
    this.clientSettingService.deleteMessage(this.generalComponent.clientId).subscribe((response: any) => {
      if (response) {
        validationStatus = true;
      }
    });

    if (lstMessage.length > 0) {
      this.clientSettingService.saveMessage(lstMessage).subscribe((response: any) => {
        if (response) {
          validationStatus = true;
        }
      });
    }

    //Saving Invoice Terms & Conditions
    let dctInvoiceTerms = {};
    dctInvoiceTerms["name"] = this.clientInvoiceTermsComponent.name;
    dctInvoiceTerms["termsAndCondition"] = this.clientInvoiceTermsComponent.termsAndCondition;
    dctInvoiceTerms["clientId"] = this.clientInvoiceTermsComponent.clientId;

    this.clientSettingService.saveInvoiceTerms(dctInvoiceTerms).subscribe((response: any) => {
      if (response) {
        validationStatus = true;
      }
    })
    

    // //Saving LOCALISATION

    let dctLocalisation = {};
    let lstConsumptionRoundOff = [];

    dctLocalisation["DateFormatId"] = this.clientSettingsLocalisationComponent.dateFormatId;
    dctLocalisation["CurrencyRoundOff"] = this.clientSettingsLocalisationComponent.roundOff.toString();
    dctLocalisation["Currency"] = this.clientSettingsLocalisationComponent.currency;
    dctLocalisation["ClientId"] = this.generalComponent.clientId;
    dctLocalisation["UtilityTypeRoundOff"] = this.clientSettingsLocalisationComponent.lstConsumptionRoundOff;
    

    this.clientSettingService.saveLocalisation(dctLocalisation).subscribe((response: any) => {
      if (response) {
        validationStatus = true;
        this.setClientDataFormats(this.generalComponent.clientId);
        if(this.clientSettingsLocalisationComponent?.roundOff && this.clientSettingsLocalisationComponent?.roundOff != '')
          {            
            this.clientSettingsLocalisationComponent.localisationSettings.controls.currency.disable();
            this.clientSettingsLocalisationComponent.localisationSettings.controls.roundOff.disable();
          }
      }
    })

    // //Saving MAP LEDGER

    // let lstLedger = [];
    // lstLedger = this.clientSettingsLedgerRelationComponent.lstLedger;
    // this.clientSettingService.deleteLedger(this.generalComponent.clientId).subscribe((response: any) => {
    //   if (response) {
    //     validationStatus = true;
    //   }
    // });
    // if (lstLedger.length > 0) {

    //   this.clientSettingService.saveLedger(lstLedger).subscribe((response: any) => {
    //     if (response) {
    //       validationStatus = true;
    //     }
    //   })
    // }

    if (validationStatus == true) {
      this.notificationMessage('Client Config saved successfully', 'green-snackbar');
    }

  }

  setClientDataFormats(clientId)
  {
    this.masterService.getClientDataFormats(parseInt(clientId)).subscribe((dataFormat: ClientFormats[]) => {
      if (dataFormat) {
        localStorage.setItem('data_formats', JSON.stringify(dataFormat));
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

  isSlabSettingsAdded(event: boolean) {
    this.slabSettingsHide = event;
  }

  isPeakSettingsAdded(event: boolean) {
    this.peakSettingsHide = event;
  }

  copyClientSettings() {
    this.dialog.open(CopyClientSettingsComponent).afterClosed().subscribe();
  }
}

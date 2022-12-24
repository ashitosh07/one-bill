import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { fadeInRightAnimation } from '../../../../@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from '../../../../@fury/animations/fade-in-up.animation';
import { FormBuilder, FormGroup, FormGroupDirective, NumberValueAccessor, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertSettingsEMS } from "./alert-settings-ems.model";
import { AlertSettingsEMSService } from '../../shared/services/alert-settings-ems.service';
import { Metadata } from '../../shared/models/metadata.model';
import { MetadataWeekDays } from '../../shared/models/metadata.weekdays.model';
import { MasterService } from '../../shared/services/master.service';
import { Master } from '../../shared/models/master.model';
import { MatTableDataSource } from '@angular/material/table';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MatOption } from '@angular/material/core';
import { EstidamaChartService } from '../../estidama-chart/estidama-chart.service';
import { ParameterChartService } from '../../shared/services/parameter-chart.service';
import { MeterReplacementService } from '../../shared/services/meterreplacement.service';
import { UserConfirmationPopupComponent } from '../../shared/components/user-confirmation-popup/user-confirmation-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'fury-create-alert-settings-ems',
  templateUrl: './create-alert-settings-ems.component.html',
  styleUrls: ['./create-alert-settings-ems.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation]
})
export class CreateAlertSettingsEMSComponent implements OnInit {

  private _gap = 16;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`;

  static id: number = 1000;
  public defaults: AlertSettingsEMS;
  form: FormGroup;
  mode: 'create' | 'update' = 'create';

  alarmTypeId: number = 0;
  weekDayId: number = 0;
  dateId: number = 0;
  hourId: number = 0;
  minuteId: number = 0;
  feederId: number = 0;
  parameterId: number = 0;
  conditionId: number = 0;
  mobile: string;
  emailTo: string;
  groupName: string;
  groupAdminNumber: string;
  isHide: boolean = false;
  isSms: boolean = false;
  isWhatsapp: boolean = false;
  isGroup: boolean = false;
  isEmail: boolean = false;
  metadataDays: MetadataWeekDays[];
  metadata: Metadata;
  selectedMeters = [];
  selectedUserMeter: any = [];

  clientId: string;
  alarmTypes: Master[];
  alarmType: string;
  days: Master[];
  dates: Master[];
  hours: Master[];
  minutes: Master[];
  feeders: Master[];
  parameters: Master[];
  conditions: Master[];
  filterMeterType: any[] = [];
  meterType: string = '';
  meterTypes: Master[];
  meterTypeId: number;
  meterTypeName: string;
  clients: Master[] = [];
  client: number=0;

  subject$: ReplaySubject<AlertSettingsEMS[]> = new ReplaySubject<AlertSettingsEMS[]>(1);
  data$: Observable<AlertSettingsEMS[]> = this.subject$.asObservable();
  private alertSettingsEMS: AlertSettingsEMS[];

  @Input()
  displayedColumns: ListColumn[] = [
    { name: 'Alarm Type', property: 'alarmType', visible: true, isModelProperty: true },
    { name: 'Alarm Name', property: 'alarmName', visible: true, isModelProperty: true },
    { name: 'Week Day', property: 'weekDay', visible: true, isModelProperty: true },
    { name: 'Date', property: 'date', visible: true, isModelProperty: true },
    { name: 'Hour', property: 'hour', visible: true, isModelProperty: true },
    { name: 'Minute', property: 'minutes', visible: true, isModelProperty: true },
    { name: 'Parameter', property: 'parameterName', visible: true, isModelProperty: true },
    { name: 'Actions', property: 'actions', visible: true }
  ] as ListColumn[];

  public pageSize = 8;
  public dataSource: MatTableDataSource<AlertSettingsEMS>;
  public columnsProps: string[] = this.displayedColumns.map((column: ListColumn) => {
    return column.property;
  });

  get visibleColumns() {
    return this.displayedColumns.filter(column => column.visible).map(column => column.property);
  }

  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort){
       this.dataSource.sort = this.sort;  
    }
  }
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;
  @ViewChild('allMeterTypesSelected') private allMeterTypesSelected: MatOption;

  constructor(private fb: FormBuilder, private snackbar: MatSnackBar,
    private masterService: MasterService,
    private dialog: MatDialog,
    private estidamaChartService: EstidamaChartService,
    private parameterChartService: ParameterChartService,
    private meterReplacementService: MeterReplacementService,
    private alertSettingsEmsService: AlertSettingsEMSService,
    private cookieService: CookieService) { }

  ngOnInit() {
    this.defaults = new AlertSettingsEMS({});

    const filterData = this.cookieService.get('filterData');
    if (filterData) {
      let dataArray = JSON.parse(filterData);
      if (dataArray['strClientId'] == '') {
        this.clientId = '0'; //this.cookieService.get('globalClientId');    
      }
      else {
        this.clientId = dataArray['strClientId'];
      }
    }
    //this.clientId = this.cookieService.get('globalClientId');
    this.masterService.getSystemMasterdata(66, 0).subscribe((data: Master[]) => {
      this.alarmTypes = data;
    });

    this.masterService.getSystemMasterdata(32, 0).subscribe((data: Master[]) => {
      this.days = data
    })

    this.masterService.getSystemMasterdata(70, 0).subscribe((data: Master[]) => {
      this.dates = data
    })

    this.masterService.getSystemMasterdata(67, 0).subscribe((data: Master[]) => {
      this.hours = data
    })
    this.masterService.getSystemMasterdata(68, 0).subscribe((data: Master[]) => {
      this.minutes = data
    })
    this.masterService.getSystemMasterdata(69, 0).subscribe((data: Master[]) => {
      this.conditions = data
    })

    // this.alertSettingsEmsService.getParametersList().subscribe((data: Master[]) => {
    //   this.parameters = data
    // })

    // this.alertSettingsEmsService.getMeterList(this.clientId).subscribe((data: Master[]) => {
    //   this.feeders = data
    //   this.filterMeterType = data
    // })    

    this.form = this.fb.group({
      id: [this.defaults.id || CreateAlertSettingsEMSComponent.id++],
      clientId: [this.defaults.clientId || '', Validators.required],
      alarmTypeId: [this.defaults.alarmTypeId || '', Validators.required],
      alarmType: [this.defaults.alarmType || ''],
      alarmName: [this.defaults.alarmName || '', Validators.required],
      dateId: [this.defaults.dateId || ''],
      date: [this.defaults.date || ''],
      weekDayId: [this.defaults.weekDayId || ''],
      weekDay: [this.defaults.weekDay || ''],
      hourId: [this.defaults.hourId || ''],
      hour: [this.defaults.hour || ''],
      minuteId: [this.defaults.minuteId || ''],
      minutes: [this.defaults.minutes || ''],
      meterTypeId: [''],
      meterType: [''],
      feederId: [this.defaults.feederId || '', Validators.required],
      feeder: [this.defaults.feeder || ''],
      parameterId: [this.defaults.parameterId || ''],
      parameter: [this.defaults.parameter || ''],
      conditionId: [this.defaults.conditionId],
      condition: [this.defaults.condition],
      conditionValue: [this.defaults.conditionValue],
      sMSMobileNumber: [this.defaults.sMSMobileNumber || ''],
      emailId: [this.defaults.emailId || ''],
      whatsAppGroupName: [this.defaults.whatsAppGroupName || ''],
      whatsAppGroupAdminNumber: [this.defaults.whatsAppGroupAdminNumber || ''],
      isSms: [this.defaults.isSms || ''],
      isWhatsapp: [this.defaults.isWhatsapp || ''],
      isWhatsAppGroup: [this.defaults.isWhatsAppGroup || ''],
      isEmail: [this.defaults.isEmail || '']
    })

    this.getClients();
    this.getAlertSettingsEMS();
    this.getMeterTypes();
  }

  getMeterTypes() {
    this.meterTypes = [];
    this.estidamaChartService.getMeterTypes().subscribe((response: any) => {
      if (response) {
        const meterTypes = response['meterTypeList'];
        if (meterTypes) {
          meterTypes.forEach(element => {
            this.meterTypes.push({ id: element.meterTypeID, description: element.meterTypeName });
          });
        }
        this.meterTypeId = this.meterTypes[0].id;
        this.meterTypeName = this.meterTypes[0].description;
        this.onMeterTypeChange();
      }
    });
  }

  onMeterTypeChange(event = null) {
    if (event) {
      this.meterTypeName = event.value;
    }
    this.meterTypes.find((meter) => {
      if (meter.description == this.meterTypeName)
        this.meterTypeId = meter.id
    })
    
    this.getMeters();
    this.getParameters();
  }

  getClients() {
    this.clients = [];
    this.meterReplacementService.getClients().subscribe((clients: Master[]) => {
      if (clients) {
        this.clients = clients;
      }
    });
  }

  onChangeClient(event)
  {
    this.getMeters();
  }


  getMeters() {
    this.feeders = [];
    this.selectedMeters = [];
    this.filterMeterType = [];
    if(this.client != null && this.client != 0)
    {
      this.meterReplacementService.getV1DeviceGroupMeterList(this.meterTypeId ?? 0, 0, this.client.toString()).subscribe((response: any) => {
        if (response) {
          this.feeders = this.filterMeterType = response;
        }
      });
    }    
  }

  getParameters() {
    this.parameters = [];
    this.parameterChartService.getParameters(this.meterTypeName).subscribe((response: any) => {
      if (response) {
        this.parameters = response;
      }
    });
  }

  setValidators() {
    if ((this.form.controls["clientId"].value == '') || (this.form.controls["clientId"].value == null)) {
      this.form.controls["clientId"].setErrors({ required: true });
      this.form.controls["clientId"].markAsTouched();
    }
    else {
      this.form.controls["clientId"].clearValidators();
    }

    if ((this.form.controls["alarmTypeId"].value == '') || (this.form.controls["alarmTypeId"].value == null)) {
      this.form.controls["alarmTypeId"].setErrors({ required: true });
      this.form.controls["alarmTypeId"].markAsTouched();
    }
    else {
      this.form.controls["alarmTypeId"].clearValidators();
    }

    if ((this.form.controls["alarmName"].value == '') || (this.form.controls["alarmName"].value == null)) {
      this.form.controls["alarmName"].setErrors({ required: true });
      this.form.controls["alarmName"].markAsTouched();
    }
    else {
      this.form.controls["alarmName"].clearValidators();
      //this.form.controls["alarmName"].markAsUntouched();
    }

    if (this.alarmType && this.alarmType.toLowerCase() == "hourly") {
      if ((this.form.controls["minuteId"].value == '') || (this.form.controls["minuteId"].value == null)) {
        this.form.controls["minuteId"].setErrors({ required: true });
        this.form.controls["minuteId"].markAsTouched();
      }
      else {
        this.form.controls["minuteId"].clearValidators();
      }

      if ((this.form.controls["feederId"].value == '') || (this.form.controls["feederId"].value == null)) {
        this.form.controls["feederId"].setErrors({ required: true })
        this.form.controls["feederId"].markAsTouched();
      }
      else {
        this.form.controls["feederId"].clearValidators();
      }

      if ((this.form.controls["parameterId"].value == '') || (this.form.controls["parameterId"].value == null)) {
        this.form.controls["parameterId"].setErrors({ required: true })
        this.form.controls["parameterId"].markAsTouched();
      }
      else {
        this.form.controls["parameterId"].clearValidators();
      }
    }
    else if (this.alarmType && this.alarmType.toLowerCase() == "daily") {
      if ((this.form.get('hourId').value == '') || (this.form.get('hourId').value == null)) {
        this.form.get('hourId').setErrors({ required: true });
        this.form.get('hourId').markAsTouched();
      }
      else {
        this.form.get('hourId').clearValidators();
      }

      if ((this.form.get('minuteId').value == '') || (this.form.get('minuteId').value == null)) {
        this.form.get('minuteId').setErrors({ required: true });
        this.form.get('minuteId').markAsTouched();
      }
      else {
        this.form.get('minuteId').clearValidators();
      }

      if ((this.form.controls["feederId"].value == '') || (this.form.controls["feederId"].value == null)) {
        this.form.controls["feederId"].setErrors({ required: true })
        this.form.controls["feederId"].markAsTouched();
      }
      else {
        this.form.controls["feederId"].clearValidators();
      }

      if ((this.form.get('parameterId').value == '') || (this.form.get('parameterId').value == null)) {
        this.form.get('parameterId').setErrors({ required: true });
        this.form.get('parameterId').markAsTouched();
      }
      else {
        this.form.get('parameterId').clearValidators();
      }
    }
    else if (this.alarmType && this.alarmType.toLowerCase() == "weekly") {
      if ((this.form.controls["weekDayId"].value == '') || (this.form.controls["weekDayId"].value == null)) {
        this.form.controls["weekDayId"].setErrors({ required: true });
        this.form.controls["weekDayId"].markAsTouched();
      }
      else {
        this.form.controls["weekDayId"].clearValidators();
      }

      if ((this.form.controls["hourId"].value == '') || (this.form.controls["hourId"].value == null)) {
        this.form.controls["hourId"].setErrors({ required: true });
        this.form.controls["hourId"].markAsTouched();
      }
      else {
        this.form.controls["hourId"].clearValidators();
      }

      if ((this.form.controls["minuteId"].value == '') || (this.form.controls["minuteId"].value == null)) {
        this.form.controls["minuteId"].setErrors({ required: true });
        this.form.controls["minuteId"].markAsTouched();
      }
      else {
        this.form.controls["minuteId"].clearValidators();
      }

      if ((this.form.controls["feederId"].value == '') || (this.form.controls["feederId"].value == null)) {
        this.form.controls["feederId"].setErrors({ required: true })
        this.form.controls["feederId"].markAsTouched();
      }
      else {
        this.form.controls["feederId"].clearValidators();
      }
      if ((this.form.controls["parameterId"].value == '') || (this.form.controls["parameterId"].value == null)) {
        this.form.controls["parameterId"].setErrors({ required: true });
        this.form.controls["parameterId"].markAsTouched();
      }
      else {
        this.form.controls["parameterId"].clearValidators();
      }
    }
    else if (this.alarmType && this.alarmType.toLowerCase() == "monthly") {
      if ((this.form.controls["dateId"].value == '') || (this.form.controls["dateId"].value == null)) {
        this.form.controls["dateId"].setErrors({ required: true });
        this.form.controls["dateId"].markAsTouched();
      }
      else {
        this.form.controls["dateId"].clearValidators();
      }
      if ((this.form.controls["hourId"].value == '') || (this.form.controls["hourId"].value == null)) {
        this.form.controls["hourId"].setErrors({ required: true });
        this.form.controls["hourId"].markAsTouched();
      }
      else {
        this.form.controls["hourId"].clearValidators();
      }

      if ((this.form.controls["minuteId"].value == '') || (this.form.controls["minuteId"].value == null)) {
        this.form.controls["minuteId"].setErrors({ required: true });
        this.form.controls["minuteId"].markAsTouched();
      }
      else {
        this.form.controls["minuteId"].clearValidators();
      }

      if ((this.form.controls["feederId"].value == '') || (this.form.controls["feederId"].value == null)) {
        this.form.controls["feederId"].setErrors({ required: true })
        this.form.controls["feederId"].markAsTouched();
      }
      else {
        this.form.controls["feederId"].clearValidators();
      }

      if ((this.form.controls["parameterId"].value == '') || (this.form.controls["parameterId"].value == null)) {
        this.form.controls["parameterId"].setErrors({ required: true });
        this.form.controls["parameterId"].markAsTouched();
      }
      else {
        this.form.controls["parameterId"].clearValidators();
      }
    }
    else if (this.alarmType && this.alarmType.toLowerCase() == "offline") {
      if ((this.form.controls["feederId"].value == '') || (this.form.controls["feederId"].value == null)) {
        this.form.controls["feederId"].setErrors({ required: true })
        this.form.controls["feederId"].markAsTouched();
      }
      else {
        this.form.controls["feederId"].clearValidators();
      }
    }
    else if (this.alarmType && this.alarmType.toLowerCase() == "realtime") {
      if ((this.form.controls["feederId"].value == '') || (this.form.controls["feederId"].value == null)) {
        this.form.controls["feederId"].setErrors({ required: true })
        this.form.controls["feederId"].markAsTouched();
      }
      else {
        this.form.controls["feederId"].clearValidators();
      }
      
      if ((this.form.controls["parameterId"].value == '') || (this.form.controls["parameterId"].value == null)) {
        this.form.controls["parameterId"].setErrors({ required: true });
        this.form.controls["parameterId"].markAsTouched();
      }
      else {
        this.form.controls["parameterId"].clearValidators();
      }

      if ((this.form.controls["conditionId"].value == '') || (this.form.controls["conditionId"].value == null)) {
        this.form.controls["conditionId"].setErrors({ required: true });
        this.form.controls["conditionId"].markAsTouched();
      }
      else {
        this.form.controls["conditionId"].clearValidators();
      }

      if ((this.form.controls["conditionValue"].value == '') || (this.form.controls["conditionValue"].value == null)) {
        this.form.controls["conditionValue"].setErrors({ required: true });
        this.form.controls["conditionValue"].markAsTouched();
      }
      else {
        this.form.controls["conditionValue"].clearValidators();
      }
    }
    if (this.isGroup) {
      if ((this.form.controls["whatsAppGroupName"].value == '') || (this.form.controls["whatsAppGroupName"].value == null)) {
        this.form.controls["whatsAppGroupName"].setErrors({ required: true });
        this.form.controls["whatsAppGroupName"].markAsTouched();
      }
      else {
        this.form.controls["whatsAppGroupName"].clearValidators();
      }

      if ((this.form.controls["whatsAppGroupAdminNumber"].value == '') || (this.form.controls["whatsAppGroupAdminNumber"].value == null)) {
        this.form.controls["whatsAppGroupAdminNumber"].setErrors({ required: true });
        this.form.controls["whatsAppGroupAdminNumber"].markAsTouched();
      }
      else {
        this.form.controls["whatsAppGroupAdminNumber"].clearValidators();
      }
    }
    if ((this.isEmail) && ((this.form.controls["emailId"].value == '') || (this.form.controls["emailId"].value == null))) {
      this.form.controls["emailId"].setErrors({ required: true });
      this.form.controls["emailId"].markAsTouched();
    }
    else {
      this.form.controls["emailId"].clearValidators();
    }

    if ((this.isWhatsapp) && ((this.form.controls.sMSMobileNumber.value == '') || (this.form.controls.sMSMobileNumber.value == null))) {
      //if(this.form.controls["sMSMobileNumber"].value == '')
      this.form.controls["sMSMobileNumber"].setErrors({ required: true });
      this.form.controls["sMSMobileNumber"].markAsTouched();
    }
    else {
      this.form.controls["sMSMobileNumber"].clearValidators();
    }

    if ((this.isSms) && ((this.form.controls.sMSMobileNumber.value == '') || (this.form.controls.sMSMobileNumber.value == null))) {
      //if(this.form.controls["sMSMobileNumber"].value == '')
      this.form.controls["sMSMobileNumber"].setErrors({ required: true });
      this.form.controls["sMSMobileNumber"].markAsTouched();
    }
    else {
      this.form.controls["sMSMobileNumber"].clearValidators();
    }

    if(this.alarmType && this.alarmType.toLowerCase() == 'mismatch reading')
    {
      if(this.form.controls["meterTypeId"].value == '' ||  this.form.controls["meterTypeId"].value == null)
      {
        this.form.controls["meterTypeId"].setErrors({ required: true });
        this.form.controls["meterTypeId"].markAsTouched();
      }
      else {
        this.form.controls["meterTypeId"].clearValidators();
      }
      if(this.form.controls["feederId"].value == '' || this.form.controls["feederId"].value == null)
      {
        this.form.controls["feederId"].setErrors({ required: true });
        this.form.controls["feederId"].markAsTouched();
      }
      else {
        this.form.controls["feederId"].clearValidators();
      }
    }

    if(this.alarmType && (this.alarmType.toLowerCase() == 'meter reading report' || this.alarmType.toLowerCase() == 'meter health report'))
    {
      if(this.form.controls["emailId"].value == '' || this.form.controls["emailId"].value == null)
      {
        this.form.controls["emailId"].setErrors({ required: true });
        this.form.controls["emailId"].markAsTouched();
      }
      else {
        this.form.controls["emailId"].clearValidators();
      }      
      this.isSms = false;
      this.isWhatsapp = false;
      this.isGroup = false;
      this.form.controls["meterTypeId"].setValue(false);
      this.form.controls["feederId"].setValue(false);
      this.form.controls["parameterId"].setValue(false);      
      this.form.controls["isSms"].setValue(false);
      this.form.controls["isWhatsapp"].setValue(false);
      this.form.controls["isWhatsAppGroup"].setValue(false);
      this.form.controls["meterTypeId"].clearValidators();
      this.form.controls["feederId"].clearValidators();
      this.form.controls["parameterId"].clearValidators();
      this.form.controls["sMSMobileNumber"].clearValidators();
      this.form.controls["whatsAppGroupName"].clearValidators();
      this.form.controls["whatsAppGroupAdminNumber"].clearValidators();
    }    
  }

  ngAfterViewInit() {
    if (this.dataSource != undefined) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  getAlertSettingsEMS() {
    this.alertSettingsEmsService.getv1AlertSettings(this.clientId).subscribe((alertSettings: AlertSettingsEMS[]) => {
      this.alertSettingsEMS = alertSettings;
      this.subject$.next(alertSettings);
    });
    this.dataSource = new MatTableDataSource(this.alertSettingsEMS);

    this.data$.pipe(
      filter(data => !!data)
    ).subscribe((alertSettings) => {
      this.alertSettingsEMS = alertSettings;
      this.dataSource.data = alertSettings;
    });
    this.ngAfterViewInit();
  }

  onSave() {
    // if ((this.alarmType == undefined) || (this.alarmType == '') || (this.alarmType == null)) {
    //   //this.form.controls["alarmTypeId"].setErrors({required: true});
    //   //this.form.controls["alarmTypeId"].markAsTouched();
    //   this.notificationMessage("Please enter all mandatory fields.", "red-snackbar");
    // }
    // else {
    //   this.form.controls["alarmTypeId"].clearValidators();
    //   this.form.controls["alarmTypeId"].markAsUntouched();
      this.setValidators();
      if ((this.isSms) || (this.isWhatsapp) || (this.isEmail) || (this.isGroup)) {
        if (this.form.valid) {
          this.createAlertSettingsEMS();
        }
      }
      else {
        this.notificationMessage("Please select Notification Type", "red-snackbar");
      }
    //}
  }

  createAlertSettingsEMS() {
    Object.assign(this.defaults, this.form.value);
    this.defaults.id = 0;
    for (let i = 0; i < this.selectedMeters.length; i++) {
      if (this.selectedMeters[i] != 0) {
        this.selectedUserMeter.push({
          alarmId: this.defaults.id,
          meterId: this.selectedMeters[i]
        });
      }
    }

    this.defaults.weekDayId = this.form.controls.weekDayId.value == '' || this.form.controls.weekDayId.value == null ? 0 : this.defaults.weekDayId;
    this.defaults.dateId = this.form.controls.dateId.value == '' || this.form.controls.dateId.value == null ? 0 : this.defaults.dateId;
    this.defaults.hourId = this.form.controls.hourId.value == '' || this.form.controls.hourId.value == null ? 0 : this.defaults.hourId;
    this.defaults.minuteId = this.form.controls.minuteId.value == '' || this.form.controls.minuteId.value == null ? 0 : this.defaults.minuteId;
    this.defaults.parameterId = this.form.controls.parameterId.value == '' || this.form.controls.parameterId.value == null ? 0 : this.defaults.parameterId;
    this.defaults.conditionId = this.form.controls.conditionId.value == '' || this.form.controls.conditionId.value == null ? 0 : this.defaults.conditionId;
    this.defaults.conditionValue = this.form.controls.conditionValue.value == '' || this.form.controls.conditionValue.value == null ? 0 : this.defaults.conditionValue;
    this.defaults.alarmMeters = this.selectedUserMeter;
    this.defaults.isSms = this.form.controls.isSms.value == '' || this.form.controls.isSms.value == null ? false : this.form.controls.isSms.value;
    this.defaults.isWhatsapp = this.form.controls.isWhatsapp.value == '' || this.form.controls.isWhatsapp.value == null ? false : this.form.controls.isWhatsapp.value;
    this.defaults.isWhatsAppGroup = this.form.controls.isWhatsAppGroup.value == '' || this.form.controls.isWhatsAppGroup.value == null ? false : this.form.controls.isWhatsAppGroup.value;
    this.defaults.isEmail = this.form.controls.isEmail.value == '' || this.form.controls.isEmail.value == null ? false : this.form.controls.isEmail.value;
    this.defaults.clientId = this.client;
    if (this.alarmType && this.alarmType.toLowerCase() == 'hourly') {
      this.defaults.weekDayId = 0;
      this.defaults.dateId = 0;
      this.defaults.hourId = 0;
      this.defaults.conditionId = 0;
    }
    else if (this.alarmType && this.alarmType.toLowerCase() == 'daily') {
      this.defaults.weekDayId = 0;
      this.defaults.dateId = 0;
      this.defaults.conditionId = 0;
    }
    else if (this.alarmType && this.alarmType.toLowerCase() == 'weekly') {
      this.defaults.dateId = 0;
      this.defaults.conditionId = 0;
    }
    else if (this.alarmType && this.alarmType.toLowerCase() == 'monthly') {
      this.defaults.weekDayId = 0;
      this.defaults.conditionId = 0;
    }
    else if (this.alarmType && this.alarmType.toLowerCase() == 'offline') {
      this.defaults.hourId = 0;
      this.defaults.minuteId = 0;
      this.defaults.weekDayId = 0;
      this.defaults.dateId = 0;
      this.defaults.conditionId = 0;
    }
    else if (this.alarmType && this.alarmType.toLowerCase() == 'realtime') {
      this.defaults.hourId = 0;
      this.defaults.minuteId = 0;
      this.defaults.weekDayId = 0;
      this.defaults.dateId = 0;
    }
    else if(this.alarmType && (this.alarmType.toLowerCase() == 'meter reading report' || this.alarmType.toLowerCase() == 'mismatch reading' || this.alarmType.toLowerCase() == 'meter health report')) {
      this.defaults.hourId = 0;
      this.defaults.minuteId = 0;
      this.defaults.weekDayId = 0;
      this.defaults.dateId = 0;
      this.defaults.weekDayId = 0;
      this.defaults.conditionId = 0;
      this.defaults.conditionValue = 0;
    }
    if(this.alarmType && (this.alarmType.toLowerCase() == 'meter reading report' || this.alarmType.toLowerCase() == 'meter health report'))
    {
      this.defaults.feederId = 0;
      this.defaults.parameterId = 0;
    }

    this.alertSettingsEmsService.createAlertSettingsEMS(this.defaults).
      subscribe((alertSettingsEms: AlertSettingsEMS) => {
        this.notificationMessage('Alert Settings Created Successfully','green-snackbar');
        this.resetControls();
        this.getAlertSettingsEMS();
      });
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: "top",
      horizontalPosition: "end",
      panelClass: [cssClass],
    });
  }

  resetControls() {
    this.selectedMeters = [];
    this.selectedUserMeter = [];
    this.alarmType = '';
    this.client = 0;
    this.isSms = false;
    this.isWhatsapp = false;
    this.isGroup = false;
    this.isEmail = false;
    setTimeout(() => this.formGroupDirective.resetForm(), 0);
    this.getMeterTypes();
    this.getClients();
  }

  onChangeAlarmType(event) {
    this.alarmTypes.filter((item) => {
      if (item.id === event.value) {
        this.alarmType = item.description;
        this.alarmTypeId = item.id;
      }
    })
    //this.setValidators();
    this.form.controls["weekDayId"].clearValidators();
    this.form.controls["weekDayId"].markAsUntouched();
    this.form.controls["dateId"].clearValidators();
    this.form.controls["dateId"].markAsUntouched();
    this.form.controls["hourId"].clearValidators();
    this.form.controls["hourId"].markAsUntouched();
    this.form.controls["minuteId"].clearValidators();
    this.form.controls["minuteId"].markAsUntouched();
    this.form.controls["feederId"].clearValidators();
    this.form.controls["feederId"].markAsUntouched();
    this.form.controls["parameterId"].clearValidators();
    this.form.controls["parameterId"].markAsUntouched();
    this.form.controls["conditionId"].clearValidators();
    this.form.controls["conditionId"].markAsUntouched();
    this.form.controls["conditionValue"].clearValidators();
    this.form.controls["conditionValue"].markAsUntouched();
    this.form.controls["whatsAppGroupName"].clearValidators();
    this.form.controls["whatsAppGroupName"].markAsUntouched();
    this.form.controls["whatsAppGroupAdminNumber"].clearValidators();
    this.form.controls["whatsAppGroupAdminNumber"].markAsUntouched();
    this.form.controls["emailId"].clearValidators();
    this.form.controls["emailId"].markAsUntouched();
    this.form.controls["sMSMobileNumber"].clearValidators();
    this.form.controls["sMSMobileNumber"].markAsUntouched();
    if(this.alarmType && (this.alarmType.toLowerCase() == 'meter reading report' || this.alarmType.toLowerCase() == 'meter health report'))
    {
      this.form.controls["sMSMobileNumber"].setValue('');
      this.form.controls["whatsAppGroupName"].setValue('');
      this.form.controls["whatsAppGroupAdminNumber"].setValue('');
      this.form.controls["isSms"].setValue(false);
      this.form.controls["isWhatsapp"].setValue(false);
      this.form.controls["isWhatsAppGroup"].setValue(false);
    }
  }

  onChangeDay(event) {
    this.days.filter((item) => {
      if (item.id == event.value)
        this.weekDayId = item.id
    })
  }

  onChangeDate(event) {
    this.dates.filter((item) => {
      if (item.id == event.value)
        this.dateId = item.id
    })
  }

  onChangeHour(event) {
    this.hours.filter((item) => {
      if (item.id == event.value)
        this.hourId = item.id
    })
  }

  onChangeMinutes(event) {
    this.minutes.filter((item) => {
      if (item.id == event.value)
        this.minuteId = item.id
    })
  }

  onChangeFeeder(event) {
    this.feeders.filter((item) => {
      if (item.id == event.value)
        this.feederId = item.id
    })
  }

  onChangeParameter(event) {
    this.parameters.filter((item) => {
      if (item.id == event.value)
        this.parameterId = item.id
    })
  }

  onChangeCondition(event) {
    this.conditions.filter((item) => {
      if (item.id == event.value)
        this.conditionId = item.id
    })
  }

  selectDays(event) {
    this.days.filter(item => {
      if (event.value == item.id) {
        this.weekDayId = item.id;
      }
    })
  }

  toggleSMS(value) {
    this.isSms = !value;
    if ((this.isSms) && ((this.form.controls.sMSMobileNumber.value == '') || (this.form.controls.sMSMobileNumber.value == null))) {
      //if(this.form.controls["sMSMobileNumber"].value == '')
      this.form.controls["sMSMobileNumber"].setErrors({ required: true });
    }
    else if (!this.isWhatsapp) {
      this.form.controls["sMSMobileNumber"].clearValidators();
      this.form.controls["sMSMobileNumber"].markAsUntouched();
    }
  }

  toggleWhatsapp(value) {
    this.isWhatsapp = !value;
    if ((this.isWhatsapp) && ((this.form.controls.sMSMobileNumber.value == '') || (this.form.controls.sMSMobileNumber.value == null))) {
      //if(this.form.controls["sMSMobileNumber"].value == '')
      this.form.controls["sMSMobileNumber"].setErrors({ required: true });
    }
    else if (!this.isSms) {
      this.form.controls["sMSMobileNumber"].clearValidators();
      this.form.controls["sMSMobileNumber"].markAsUntouched();
    }
  }

  toggleWhatsappGroup(value) {
    this.isGroup = !value;
    if (this.isGroup) {
      if ((this.form.controls["whatsAppGroupName"].value == '') || (this.form.controls["whatsAppGroupName"].value == null))
        this.form.controls["whatsAppGroupName"].setErrors({ required: true });
      if ((this.form.controls["whatsAppGroupAdminNumber"].value == '') || (this.form.controls["whatsAppGroupAdminNumber"].value == null))
        this.form.controls["whatsAppGroupAdminNumber"].setErrors({ required: true });
    }
    else {
      this.form.controls["whatsAppGroupName"].clearValidators();
      this.form.controls["whatsAppGroupName"].markAsUntouched();
      this.form.controls["whatsAppGroupAdminNumber"].clearValidators();
      this.form.controls["whatsAppGroupAdminNumber"].markAsUntouched();
    }
  }

  toggleEmail(value) {
    this.isEmail = !value;
    if ((this.isEmail) && ((this.form.controls["emailId"].value == '') || (this.form.controls["emailId"].value == null))) {
      this.form.controls["emailId"].setErrors({ required: true });
    }
    else {
      this.form.controls["emailId"].clearValidators();
      this.form.controls["emailId"].markAsUntouched();
    }
  }

  deleteAlertSetting(alertSetting) {
    this.dialog.open(UserConfirmationPopupComponent).afterClosed().subscribe((message: any) => {
      if (message) {
        if (alertSetting) {
          this.alertSettingsEmsService.deleteAlertSettings(alertSetting.id).subscribe((data) => {
            this.notificationMessage('Alert Settings deleted successfully.','green-snackbar');
            this.getAlertSettingsEMS();
          })
        }
      }
    })
  }

  toggleMeterTypesAllSelection() {
    if (this.allMeterTypesSelected.selected) {
      this.form.controls.feederId
        .patchValue([...this.feeders.map(item => item.id), 0]);
    } else {
      this.form.controls.feederId.patchValue([]);
    }
  }

  toggleMeterTypesPerOne(all) {
    if (this.allMeterTypesSelected.selected) {
      this.allMeterTypesSelected.deselect();
      return false;
    }
    if (this.form.controls.feederId.value.length == this.feeders.length)
      this.allMeterTypesSelected.select();
  }

  searchMeterType(query: string) {
    let result = this.selectMeterType(query)
    this.feeders = result;
  }

  selectMeterType(query: string) {
    let result = [];
    for (let a of this.filterMeterType) {
      if (a.deviceName && a.deviceName.toLowerCase().indexOf(query) > -1) {
        result.push(a)
      }
    }
    return result
  }


  onFilterChange(value) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

}

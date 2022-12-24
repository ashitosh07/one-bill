import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { MatOption } from '@angular/material/core'
import { MatPaginator, PageEvent } from '@angular/material/paginator'
import { MatSelectChange } from '@angular/material/select'
import { MatTableDataSource } from '@angular/material/table'
import { height } from '@fortawesome/free-brands-svg-icons/faFacebook'
import { TreeViewComponent } from '@syncfusion/ej2-angular-navigations'
import { Observable } from 'rxjs'
import { MeterReadingService } from './meter-reading.service'
import { MeterReading } from '../shared/models/meter-reading.model'
import { ParameterChartService } from '../shared/services/parameter-chart.service'
import { EstidamaChartService } from '../estidama-chart/estidama-chart.service'
import { MeterReplacementService } from '../shared/services/meterreplacement.service'
import { CookieService } from 'ngx-cookie-service'
import { JwtHelperService } from '@auth0/angular-jwt'
import { ClientSelectionService } from '../shared/services/client-selection.service'
import { getClientDataFormat } from '../shared/utilities/utility'
import { DecimalPipe } from '@angular/common'
import { GeneraldashboardService } from 'src/app/pages/generaldashboard/generaldashboard.service'

@Component({
  selector: 'fury-meter-reading',
  templateUrl: './meter-reading.component.html',
  styleUrls: ['./meter-reading.component.scss'],
})
export class MeterReadingComponent implements OnInit {
  obs: Observable<any>
  showSpinner: boolean = false
  meterTypeConfig = {
    displayKey: 'meterName',
    search: true,
    height: '200px',
    customComparator: () => {},
    placeholder: 'Meter Type',
    searchOnKey: 'meterName',
    clearOnSelection: true,
  }
  meterGroupList: any[] = []
  lstMeterGroup: any[] = []
  group: number = null
  lstGroup: any[]
  subGroup: number = null
  lstSubGroup: any[]
  meterType: string = ''
  lstMeterType: any[]
  filterMeterType: any[] = []
  lstMeter: any[]

  consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff')
  blnSubroup: boolean = true
  blnMeterType: boolean = true
  meterData: MeterReading = {}

  @ViewChild('treeelement') tree: TreeViewComponent
  divHeight: string = '129px;'
  blnTreeView: boolean = false
  showCheckBox: boolean = true
  public hierarchicalData: Object[] = []
  public field: Object = {
    dataSource: this.hierarchicalData,
    id: 'id',
    text: 'name',
    child: 'subChild',
  }

  txtSearch: string = ''
  voltType = []

  lstpageNo = []

  lstvoltType = []

  fliterVoltType: any[] = []

  cardData = []

  @ViewChild(MatPaginator) paginator: MatPaginator
  dataSource = new MatTableDataSource(this.cardData)
  length: string = ''
  pageSize = '12'
  // MatPaginator Output
  pageEvent: PageEvent
  meterTypeName: string
  meterTypeId: number
  meterTypes: any[] = []
  clientId: string
  role: string

  public txtForm: FormGroup

  dropdownSettings = {
    singleSelection: false,
    idField: 'meterID',
    textField: 'meterName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: false,
  }

  @ViewChild('allMeterTypesSelected') private allMeterTypesSelected: MatOption
  @ViewChild('allParamtersSelected') private allParamtersSelected: MatOption

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private meterService: MeterReadingService,
    private parameterChartService: ParameterChartService,
    private decimalPipe: DecimalPipe,
    private generalDashBoardService: GeneraldashboardService,
    //private estidamaChartService: EstidamaChartService,
    private meterReplacementService: MeterReplacementService,
    private clientSelectionService: ClientSelectionService,
    private fb: FormBuilder,
    private jwtHelperService: JwtHelperService,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.clientSelectionService.setIsClientVisible(true)
    this.txtForm = this.fb.group({
      // group: [null, Validators.compose([Validators.required ])],
      // subGroup: [null, Validators.compose([Validators.required ])],
      meterType: ['', Validators.compose([Validators.required])],
      voltType: [null, Validators.compose([Validators.required])],
    })
    this.getClientId()
    // this.getVoltandMeterTypes();
    this.getMeterTypes()
    //this.getMeterListByClientId();
  }

  getClientId() {
    let token = this.cookieService.get('access_token')
    const decodedToken = this.jwtHelperService.decodeToken(token)
    if (decodedToken) {
      this.role =
        decodedToken[
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
        ]
    }

    if (this.role && this.role.toLowerCase() == 'ems') {
      const filterData = this.cookieService.get('filterData')
      if (filterData) {
        let dataArray = JSON.parse(filterData)
        if (dataArray['strClientId'] == '') {
          this.clientId = '0' //this.cookieService.get('globalClientId');
        } else {
          this.clientId = dataArray['strClientId']
        }
      }
    } else {
      this.clientId = this.cookieService.get('globalClientId')
    }
  }

  // onGroupChange(group) {
  //   this.lstSubGroup = [];
  //   this.lstSubGroup.push(...group['meterSubGroupList']);
  //   if (this.lstSubGroup.length > 0) {
  //     this.blnSubroup = false;
  //     this.onSubGroupChange(this.lstSubGroup[0]);
  //   }
  // }

  // optionClicked(event) {
  // }

  // onSubGroupChange(subgroup) {
  //   this.lstMeterType = [];
  //   this.lstMeter = [];
  //   // this.lstMeterType.push('Select All');
  //   this.lstMeterType.push(...subgroup['meterList']);
  //   if (this.lstMeterType.length > 0)
  //     this.blnMeterType = false;
  // }

  // getVoltandMeterTypes() {
  //   this.meterService.getVolts().subscribe((response: any) => {
  //     if (response) {
  //       this.lstvoltType = this.fliterVoltType = response['parameterList']; // get volt types
  //       this.voltType = this.lstvoltType[0].groupName;
  //       this.hierarchicalData = response['meterGroupList']; //get tree structure

  //       this.lstGroup = [];
  //       this.lstSubGroup = [];
  //       this.lstMeterType = [];

  //       this.hierarchicalData.forEach(element => {
  //         let dctGroup = {
  //           groupID: element['groupID'],
  //           groupName: element['groupName']
  //         }
  //         this.lstGroup.push(element); //Push data to Group list
  //       });
  //     }
  //   })
  // }

  // getMeterTypes() {
  //   this.meterTypes = [];
  //   this.estidamaChartService.getMeterTypes().subscribe((response: any) => {
  //     if (response) {
  //       this.meterTypes = response['meterTypeList'];
  //       if (this.meterTypes.length > 0) {
  //         this.meterTypeId = this.meterTypes[0].meterTypeID;
  //         this.meterTypeName = this.meterTypes[0].meterTypeName;
  //       }
  //     }
  //   })
  // }

  getMeterTypes() {
    this.meterTypes = []
    this.lstMeterType = []
    this.lstvoltType = []
    //this.estidamaChartService.getMeterTypes().subscribe((response: any) => {
    this.generalDashBoardService
      .getUtilities(this.clientId)
      .subscribe((response: any) => {
        if (response) {
          // const meterTypes = response['meterTypeList'];
          // if (meterTypes) {
          //   meterTypes.forEach(element => {
          //     this.meterTypes.push({ id: element.meterTypeID, description: element.meterTypeName });
          //   });
          // }
          this.meterTypes = response
          this.meterTypeId = this.meterTypes[0].id
          this.meterTypeName = this.meterTypes[0].description
          this.meterGroupList = response['meterGroupList']
          this.onMeterTypeChange()
        }
      })
  }

  // onMeterTypeChange(event = null) {
  //   if (event) {
  //     this.meterTypeId = event.value;
  //   }
  //   this.meterTypes.find((meter) => {
  //     if(meter.meterTypeID == this.meterTypeId)
  //       this.meterTypeName = meter.meterTypeName
  //   })
  //   this.getMeterListByClientId();
  //   this.getParameters();
  // }

  // onMeterTypeChange(event = null) {
  //   if (event) {
  //     this.meterTypeId = event.value;
  //   }
  //   this.meterTypes.find((meter) => {
  //     if(meter.id == this.meterTypeId)
  //       this.meterTypeName = meter.description
  //   })

  //   this.meterGroupList.forEach(group => {
  //     if (group.meterTypeID == this.meterTypeId) {
  //       if (!this.lstMeterGroup.some(meterGroup => meterGroup.groupID == group.groupID)) {
  //         this.lstMeterGroup.push({ groupID: group.groupID, groupName: group.groupName })
  //       }
  //     }
  //   })

  //   if (this.lstMeterGroup.length > 0)
  //     this.group = this.lstMeterGroup[0].groupID; //Initialise group list
  //   this.onMeterGroupChange();
  //   this.cardData = [];
  //   this.changeDetectorRef.detectChanges();
  //   this.dataSource = new MatTableDataSource(this.cardData)
  //   this.dataSource.paginator = this.paginator;
  //   this.obs = this.dataSource.connect();
  // }

  onMeterTypeChange(event = null) {
    if (event) {
      this.meterTypeName = event.value
    }
    this.meterTypes.find((meter) => {
      if (meter.description == this.meterTypeName) this.meterTypeId = meter.id
    })
    this.getMeters()
    this.getParameters()
  }

  getMeters() {
    this.lstMeterType = []
    this.lstMeter = []
    //this.meterReplacementService.getV1DeviceGroupMeterList(this.meterTypeId ?? 0, 0, this.clientId)
    this.meterReplacementService
      .getV1DeviceGroupMeterListWithoutFlowTypeFilter(
        this.meterTypeId ?? 0,
        0,
        this.clientId
      )
      .subscribe((response: any) => {
        if (response) {
          this.lstMeterType = this.filterMeterType = response
        }
      })
  }

  // onMeterGroupChange() {
  //   this.lstMeterType = [];
  //   this.meterType = '';
  //   this.meterGroupList.forEach(group => {
  //     if (group.meterTypeID == this.meterTypeId && group.groupID == this.group) {
  //       if (!this.lstMeterType.some(meterName => meterName.id == group.meterID)) {
  //         this.lstMeterType.push({ id: group.meterID, description: group.meterName })
  //       }
  //     }
  //   })
  //   //Initialise meter list
  //   this.getParameters();
  // }

  getParameters() {
    this.lstvoltType = []
    this.voltType = []
    this.parameterChartService
      .getParameters(this.meterTypeName)
      .subscribe((response: any) => {
        if (response) {
          this.lstvoltType = this.fliterVoltType = response
        }
      })
  }

  // getMeterListByClientId() {
  //   this.meterService.getMeterListByClientId(this.clientId).subscribe((response: any) => {

  //     if (response) {
  //       this.lstMeterType = []
  //       //this.lstvoltType = []
  //       //this.lstvoltType = this.fliterVoltType = response['parameterList'];
  //       this.lstMeterType.push(...response['meterList']);
  //       this.filterMeterType = this.lstMeterType;
  //       this.blnMeterType = false;
  //     }
  //   });
  // }

  getMeterData() {
    this.cardData = []
    this.showSpinner = true
    this.meterType = ''
    let count = 0
    this.lstMeter.forEach((meter) => {
      count++
      this.meterType += meter
      if (this.lstMeter.length != count) this.meterType += ','
    })
    let index = this.voltType.indexOf(0)
    if (index >= 0) this.voltType.splice(index, 1)
    let voltType = this.voltType.join(',')

    this.meterData.MeterId = this.meterType
    this.meterData.ParameterId = voltType
    this.meterService.getMeterData(this.meterData).subscribe({
      next: (response: any) => {
        if (response) {
          console.log(response)
          this.cardData = []
          this.cardData = response

          if (this.cardData && this.cardData.length > 0) {
            this.consumptionRoundOffFormat = getClientDataFormat(
              'ConsumptionRoundOff',
              0,
              this.meterTypeName
            )
            this.cardData.forEach((card) => {
              card.meterParameters.forEach((parameter) => {
                let unit = parameter.pramValue.substring(
                  parameter.pramValue.indexOf(' ') + 1,
                  parameter.pramValue.length
                )
                let parameterValue = parameter.pramValue.substring(
                  0,
                  parameter.pramValue.indexOf(' ')
                )
                parameter.pramValue =
                  this.decimalPipe.transform(
                    parameterValue,
                    this.consumptionRoundOffFormat
                  ) +
                  ' ' +
                  unit
              })
            })
          }

          this.length = this.cardData.length.toString()
          this.changeDetectorRef.detectChanges()
          this.dataSource = new MatTableDataSource(this.cardData)
          this.dataSource.paginator = this.paginator
          this.obs = this.dataSource.connect()
          this.showSpinner = false
        } else {
          this.cardData = []
          this.changeDetectorRef.detectChanges()
          this.dataSource = new MatTableDataSource(this.cardData)
          this.dataSource.paginator = this.paginator
          this.obs = this.dataSource.connect()
          this.showSpinner = false
        }
      },
      error: (err) => {
        this.cardData = []
        this.changeDetectorRef.detectChanges()
        this.dataSource = new MatTableDataSource(this.cardData)
        this.dataSource.paginator = this.paginator
        this.obs = this.dataSource.connect()
        this.showSpinner = false
      },
    })
  }

  openTreeView() {
    if (this.blnTreeView == true) {
      this.divHeight = '129px'
      this.blnTreeView = false
    } else {
      this.divHeight = '259px'
      this.blnTreeView = true
    }
  }

  toggleMeterTypesAllSelection() {
    if (this.allMeterTypesSelected.selected) {
      this.txtForm.controls.meterType.patchValue([
        ...this.lstMeterType.map((item) => item.id),
        0,
      ])
    } else {
      this.txtForm.controls.meterType.patchValue([])
    }
  }

  toggleMeterTypesPerOne(all) {
    if (this.allMeterTypesSelected.selected) {
      this.allMeterTypesSelected.deselect()
      return false
    }
    if (
      this.txtForm.controls.meterType.value.length == this.lstMeterType.length
    )
      this.allMeterTypesSelected.select()
  }

  toggleParametersAllSelection() {
    if (this.allParamtersSelected.selected) {
      this.txtForm.controls.voltType.patchValue([
        ...this.lstvoltType.map((item) => item.id),
        0,
      ])
    } else {
      this.txtForm.controls.voltType.patchValue([])
    }
  }

  toggleParametersPerOne(all) {
    if (this.allParamtersSelected.selected) {
      this.allParamtersSelected.deselect()
      return false
    }
    if (this.txtForm.controls.voltType.value.length == this.lstvoltType.length)
      this.allParamtersSelected.select()
  }

  searchParameters(query: string) {
    let result = this.selectParameters(query.toLowerCase())
    this.lstvoltType = result
  }

  selectParameters(query: string): string[] {
    let result: string[] = []
    for (let a of this.fliterVoltType) {
      if (a.description.toLowerCase().indexOf(query) > -1) {
        result.push(a)
      }
    }
    return result
  }

  searchMeterType(query: string) {
    let result = this.selectMeterType(query.toLowerCase())
    this.lstMeterType = result
  }

  selectMeterType(query: string): string[] {
    let result: string[] = []
    for (let a of this.filterMeterType) {
      if (a.deviceName.toLowerCase().indexOf(query) > -1) {
        result.push(a)
      }
    }
    return result
  }

  handleInput(event: KeyboardEvent): void {
    event.stopPropagation()
  }
}

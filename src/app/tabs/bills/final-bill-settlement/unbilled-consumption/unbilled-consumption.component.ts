import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { ListColumn } from 'src/@fury/shared/list/list-column.model'
import { BillSettlement } from 'src/app/tabs/shared/models/bill-settlement.model'
import { BillMaster } from 'src/app/tabs/shared/models/bill-master.model'
import { environment } from 'src/environments/environment'
import { DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common'
import { MatDialog } from '@angular/material/dialog'
import { AccountHeadDetailsComponent } from '../account-head-details/account-head-details.component'
import { JwtHelperService } from '@auth0/angular-jwt'
import { CookieService } from 'ngx-cookie-service'
import { getClientDataFormat } from 'src/app/tabs/shared/utilities/utility'
import { EnvService } from 'src/app/env.service'

@Component({
  selector: 'app-unbilled-consumption',
  templateUrl: './unbilled-consumption.component.html',
  styleUrls: ['./unbilled-consumption.component.scss'],
})
export class UnbilledConsumptionComponent implements OnInit {
  columns: any[] = []
  innerColumns: any[] = []
  columnNames: ListColumn[] = []

  unBilledConsumptions: BillMaster[] = []
  selectedRows: BillMaster[] = []

  innerTableName: string = 'bills'

  @Input() banks: any[] = []
  @Input() paymentModes: any[] = []
  @Input() isHide = true
  @Input() hideHeader = true

  format = ''
  currency = ''
  roundFormat = ''
  consumptionRoundOffFormat = ''

  @Input()
  set dataSource(value: BillSettlement) {
    if (value && value.unbBilledConsumptions) {
      this.unBilledConsumptions = this.updateDataFormats(
        value.unbBilledConsumptions
      )
      const succeedCount: number =
        this.unBilledConsumptions.filter((x) => x.status === 'Succeed')
          .length ?? 0
      const failedCount: number =
        this.unBilledConsumptions.filter((x) => x.status === 'Failed').length ??
        0
      if (succeedCount > 0 || failedCount > 0) {
        this.succeedCount = ' - ' + succeedCount.toString()
        this.failedCount = ' - ' + failedCount.toString()
      } else {
        this.succeedCount = ''
        this.failedCount = ''
      }
    }
  }

  @Output() saveClicked = new EventEmitter<boolean>()
  @Output() printDataRows = new EventEmitter<BillMaster>()

  role: string = ''
  succeedCount: string = ''
  failedCount: string = ''
  cssStyledColumn: string = 'status'
  billNumberCoulmnName = 'Bill Number'
  accountNumberColumnName = 'Account Number'
  billDateCoulmnName = 'BillDate'
  tenantNameColumnName = 'Tenant Name'
  unitColumnName = 'Unit'
  fromDateColumnName = 'From Date'
  toDateColumnName = 'To Date'
  dueDateColumnName = 'Due Date'
  billAmountColumnName = 'Bill Amount'

  utilityTypeCoulmnNmae = 'Utility Type'
  meterNumberCoulmnNmae = 'Meter Number'
  previousReadingColumnName = 'Previous'
  presentReadingColumnName = 'Present'
  currentConsumptionColumnName = 'Cur-Consumption'
  consumptionChargeColumnName = 'Consumption Charge'

  constructor(
    private date: DatePipe,
    private currencyPipe: CurrencyPipe,
    private dialog: MatDialog,
    private jwtHelperService: JwtHelperService,
    private cookieService: CookieService,
    private decimalPipe: DecimalPipe,
    private envService: EnvService
  ) {
    this.format = getClientDataFormat('DateFormat') ?? envService.dateFormat
    this.currency = getClientDataFormat('Currency') ?? envService.currencyFormat
    this.roundFormat =
      getClientDataFormat('RoundOff') ?? envService.roundOffFormat
    this.consumptionRoundOffFormat =
      getClientDataFormat('ConsumptionRoundOff') ??
      envService.consumptionRoundOffFormat
  }

  ngOnInit(): void {
    let token = this.cookieService.get('access_token')
    const decodedToken = this.jwtHelperService.decodeToken(token)
    if (decodedToken) {
      this.role =
        decodedToken[
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
        ]
    }
    this.createColumnNames()
    this.createGridColumns()
    this.createInnerGridColumns()
    if (this.isHide) {
      this.updateTableColumns()
    }
  }

  createGridColumns() {
    this.columns = [
      'select',
      'accountNumber',
      'ownerName',
      'unitNumber',
      'fromDateLocal',
      'toDateLocal',
      'dueDateLocal',
      'billAmountLocal',
      'button',
      'print',
    ]
  }

  createInnerGridColumns() {
    this.innerColumns = [
      'utilityType',
      'deviceName',
      'previousReadingLocal',
      'presentReadingLocal',
      'consumptionLocal',
      'consumptionCharge',
    ]
  }

  createColumnNames() {
    this.columnNames = [
      { name: this.billNumberCoulmnName, property: 'billNumber' },
      { name: this.accountNumberColumnName, property: 'accountNumber' },
      { name: this.billDateCoulmnName, property: 'billDate' },
      { name: this.tenantNameColumnName, property: 'ownerName' },
      { name: this.unitColumnName, property: 'unitNumber' },
      { name: this.fromDateColumnName, property: 'fromDateLocal' },
      { name: this.toDateColumnName, property: 'toDateLocal' },
      { name: this.dueDateColumnName, property: 'dueDateLocal' },
      {
        name: this.billAmountColumnName,
        property: 'billAmountLocal',
        columnAlign: { 'text-align': 'right' },
      },
      { name: this.utilityTypeCoulmnNmae, property: 'utilityType' },
      { name: this.meterNumberCoulmnNmae, property: 'deviceName' },
      {
        name: this.previousReadingColumnName,
        property: 'previousReadingLocal',
      },
      { name: this.presentReadingColumnName, property: 'presentReadingLocal' },
      { name: this.currentConsumptionColumnName, property: 'consumptionLocal' },
      {
        name: this.consumptionChargeColumnName,
        property: 'consumptionCharge',
        columnAlign: { 'text-align': 'right' },
      },
    ] as ListColumn[]
  }

  updateTableColumns() {
    this.columns.splice(0, 1)
  }

  onSave() {
    this.saveClicked.emit(true)
  }

  onSelectedRows(selectedRows: BillMaster[]) {
    this.selectedRows = []
    this.selectedRows = selectedRows
  }

  onViewDataRow(row: BillMaster) {
    this.dialog
      .open(AccountHeadDetailsComponent, { data: row })
      .afterClosed()
      .subscribe()
  }

  onPrintRows(row: BillMaster) {
    this.printDataRows.emit(row)
  }

  updateDataFormats(unBilledConsumptions: BillMaster[]) {
    if (unBilledConsumptions) {
      this.format = getClientDataFormat('DateFormat')
      this.roundFormat = getClientDataFormat('RoundOff')
      this.currency = getClientDataFormat('Currency')
      unBilledConsumptions.forEach((billMaster) => {
        billMaster.fromDateLocal = this.date.transform(
          billMaster.fromDate.toString(),
          this.format.toString()
        )
        billMaster.toDateLocal = this.date.transform(
          billMaster.toDate.toString(),
          this.format.toString()
        )
        billMaster.dueDateLocal = this.date.transform(
          billMaster.dueDate.toString(),
          this.format.toString()
        )
        billMaster.billAmountLocal = this.currencyPipe.transform(
          billMaster.billAmount,
          this.currency.toString(),
          true,
          this.roundFormat
        )
        billMaster.bills.forEach((bill) => {
          this.consumptionRoundOffFormat =
            getClientDataFormat('ConsumptionRoundOff', bill.utilityTypeId) ??
            this.envService.consumptionRoundOffFormat
          bill.previousReadingLocal = this.decimalPipe.transform(
            bill.previousReading,
            this.consumptionRoundOffFormat
          )
          bill.presentReadingLocal = this.decimalPipe.transform(
            bill.presentReading,
            this.consumptionRoundOffFormat
          )
          bill.consumptionLocal = this.decimalPipe.transform(
            bill.consumption,
            this.consumptionRoundOffFormat
          )
          bill.billAmountLocal = bill.consumptionCharge =
            this.currencyPipe.transform(
              bill.billAmount,
              this.currency.toString(),
              true,
              this.roundFormat
            )
        })
      })
    }
    return unBilledConsumptions
  }
}

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { ListColumn } from 'src/@fury/shared/list/list-column.model'
import { DatePipe, CurrencyPipe } from '@angular/common'
import { BillSettlement } from 'src/app/tabs/shared/models/bill-settlement.model'
import { Bill } from 'src/app/tabs/shared/models/bill.model'
import { BillMaster } from 'src/app/tabs/shared/models/bill-master.model'
import { environment } from 'src/environments/environment'
import { getClientDataFormat } from 'src/app/tabs/shared/utilities/utility'
import { EnvService } from 'src/app/env.service'

@Component({
  selector: 'app-outstanding-bills',
  templateUrl: './outstanding-bills.component.html',
  styleUrls: ['./outstanding-bills.component.scss'],
})
export class OutstandingBillsComponent implements OnInit {
  outStandingBills: BillMaster[] = []
  selectedRows: BillMaster[] = []
  columns: ListColumn[] = []

  dateColumnName = 'Date'
  billNumberConsumptionColumnName = 'Bill No'
  unitColumnName = 'Unit'
  consumptionColumnName = 'Consumption'
  amountColumnName = 'Net Amount'
  creditNoteAmount = 'Credit Note Amount'
  paidColumnName = 'Paid'
  toPayColumnName = 'To Pay'

  format = ''
  currency = ''
  roundFormat = ''

  @Input() isHide = true
  @Input() isAutoSelect = false
  @Input() disableCheckBox = false
  @Input()
  set dataSource(value: BillSettlement) {
    if (value) {
      if (value.outstandingBills && value.outstandingBills.length) {
        this.outStandingBills = this.updateDataFormats(value.outstandingBills)
      } else {
        this.outStandingBills = []
      }
    }
  }

  @Output() rowsSelected = new EventEmitter<BillMaster[]>()

  constructor(
    private date: DatePipe,
    private currencyPipe: CurrencyPipe,
    private envService: EnvService
  ) {
    this.format = getClientDataFormat('DateFormat') ?? envService.dateFormat
    this.currency = getClientDataFormat('Currency') ?? envService.currencyFormat
    this.roundFormat =
      getClientDataFormat('RoundOff') ?? envService.roundOffFormat
  }

  ngOnInit(): void {
    this.createGridColumns()
    if (this.isHide) {
      this.updateTableColumns()
    }
  }

  createGridColumns(): any {
    this.columns = [
      { name: 'Checkbox', property: 'checkbox', visible: true },
      {
        name: this.dateColumnName,
        property: 'billDateLocal',
        visible: true,
        isModelProperty: true,
      },
      {
        name: this.billNumberConsumptionColumnName,
        property: 'billNumber',
        visible: true,
        isModelProperty: true,
      },
      {
        name: this.unitColumnName,
        property: 'unitNumber',
        visible: true,
        isModelProperty: true,
      },
      {
        name: this.amountColumnName,
        property: 'netAmountLocal',
        visible: true,
        isModelProperty: true,
        columnAlign: { 'text-align': 'right' },
      },
      // { name: this.creditNoteAmount, property: 'creditNoteAmountLocal', visible: true, isModelProperty: true },
      {
        name: this.paidColumnName,
        property: 'paidLocal',
        visible: true,
        isModelProperty: true,
        columnAlign: { 'text-align': 'right' },
      },
      {
        name: this.toPayColumnName,
        property: 'toPayLocal',
        visible: true,
        isModelProperty: true,
        columnAlign: { 'text-align': 'right' },
      },
    ] as ListColumn[]
  }

  updateTableColumns() {
    this.columns.splice(0, 1)
  }

  onSelectedRows(selectedRows: BillMaster[]) {
    this.selectedRows = []
    this.selectedRows = selectedRows
    this.rowsSelected.emit(this.selectedRows)
  }

  updateDataFormats(outstandingBills: BillMaster[]) {
    if (outstandingBills) {
      this.format = getClientDataFormat('DateFormat')
      this.roundFormat = getClientDataFormat('RoundOff')
      this.currency = getClientDataFormat('Currency')
      outstandingBills.forEach((billMaster) => {
        billMaster.billDateLocal = this.date.transform(
          billMaster.billDate.toString(),
          this.format.toString()
        )
        billMaster.billAmountLocal = this.currencyPipe.transform(
          billMaster.billAmount,
          this.currency.toString(),
          true,
          this.roundFormat
        )
        billMaster.netAmountLocal = this.currencyPipe.transform(
          billMaster.billAmount - billMaster.creditNoteAmount,
          this.currency.toString(),
          true,
          this.roundFormat
        )
        billMaster.creditNoteAmountLocal = this.currencyPipe.transform(
          billMaster.creditNoteAmount,
          this.currency.toString(),
          true,
          this.roundFormat
        )
        billMaster.toPayLocal = this.currencyPipe.transform(
          billMaster.toPay,
          this.currency.toString(),
          true,
          this.roundFormat
        )
        billMaster.paidLocal = this.currencyPipe.transform(
          billMaster.paid,
          this.currency.toString(),
          true,
          this.roundFormat
        )
      })
    }
    return outstandingBills
  }
}

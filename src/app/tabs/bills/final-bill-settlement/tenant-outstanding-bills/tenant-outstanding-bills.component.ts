import { CurrencyPipe, DatePipe } from '@angular/common'
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { ListColumn } from 'src/@fury/shared/list/list-column.model'
import { getClientDataFormat } from 'src/app/tabs/shared/utilities/utility'
import { BillMaster } from 'src/app/tabs/shared/models/bill-master.model'
import { BillSettlement } from 'src/app/tabs/shared/models/bill-settlement.model'
import { environment } from 'src/environments/environment'
import { EnvService } from 'src/app/env.service'
import { env } from 'process'

@Component({
  selector: 'fury-tenant-outstanding-bills',
  templateUrl: './tenant-outstanding-bills.component.html',
  styleUrls: ['./tenant-outstanding-bills.component.scss'],
})
export class TenantOutstandingBillsComponent implements OnInit {
  outStandingBills: BillMaster[] = []
  selectedRows: BillMaster[] = []
  columns: ListColumn[] = []

  dateColumnName = 'Date'
  billNumberConsumptionColumnName = 'Bill No'
  unitColumnName = 'Unit'
  amountColumnName = 'Amount'
  paidColumnName = 'Paid'
  toPayColumnName = 'To Pay'

  format = ''
  currency = ''
  roundFormat = ''

  @Input() isHide = true

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
        property: 'billAmountLocal',
        visible: true,
        isModelProperty: true,
      },
      {
        name: this.paidColumnName,
        property: 'paidLocal',
        visible: true,
        isModelProperty: true,
      },
      {
        name: this.toPayColumnName,
        property: 'toPayLocal',
        visible: true,
        isModelProperty: true,
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

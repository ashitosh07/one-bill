import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core'
import { BillService } from '../../shared/services/bill.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation'
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation'
import { ManageParams } from '../../shared/models/manage-params.model'
import { BillSettlement } from '../../shared/models/bill-settlement.model'
import { UnbilledConsumptionComponent } from '../final-bill-settlement/unbilled-consumption/unbilled-consumption.component'
import { BillSettlementService } from '../../shared/services/billsettlement.service'
import { CreateBillToolbarComponent } from './create-bill-toolbar/create-bill-toolbar.component'
import { BillMaster } from '../../shared/models/bill-master.model'
import { CookieService } from 'ngx-cookie-service'
import { Tenant } from '../../shared/models/tenant.model'
import { BillGenerateParameter } from '../../shared/models/bill-generate-parameter.model'
import { ClientSelectionService } from '../../shared/services/client-selection.service'
import { BillType } from '../../shared/utilities/utility'
import { PDFDocument } from 'pdf-lib'

@Component({
  selector: 'app-create-bill',
  templateUrl: './create-bill.component.html',
  styleUrls: ['./create-bill.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation],
})
export class CreateBillComponent implements OnInit {
  private _gap = 16
  gap = `${this._gap}px`
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`

  clientId: number

  utilityTypes: any[] = [{ label: 'Select', value: 0 }]
  billPeriods: any[] = [{ label: 'Select', value: 0 }]
  tenants: Tenant[] = []
  showSpinner: boolean = false

  billSettlement: BillSettlement = { unbBilledConsumptions: [] }

  @ViewChild(UnbilledConsumptionComponent, { static: true })
  unbilledConsumptionComponent: UnbilledConsumptionComponent
  @ViewChild(CreateBillToolbarComponent, { static: true })
  createBillToolbarComponent: CreateBillToolbarComponent

  constructor(
    private billService: BillService,
    private billSettlementService: BillSettlementService,
    private snackbar: MatSnackBar,
    private clientSelectionService: ClientSelectionService,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.clientSelectionService.setIsClientVisible(true)
    this.clientId = parseInt(this.cookieService.get('globalClientId'))
    this.getTenants()
    this.getUtilityTypes()
    this.getBillPeriods()
  }

  getTenants() {
    this.tenants = []
    this.billSettlementService
      .getTenantsDetails(this.clientId)
      .subscribe((data) => {
        this.tenants = data
      })
  }

  onSaveBills(event: boolean) {
    this.showSpinner = true
    let billMasterDetails: BillMaster[] = []
    billMasterDetails = this.unbilledConsumptionComponent.selectedRows
    if (billMasterDetails != null && billMasterDetails.length) {
      this.billSettlementService
        .saveUnBilledConsumptions(billMasterDetails)
        .subscribe({
          next: (response) => {
            if (response) {
              this.showSpinner = false
              this.notificationMessage(
                'Bill saved successfully',
                'green-snackbar'
              )
              this.reset(false, billMasterDetails)
            } else {
              this.showSpinner = false
              this.notificationMessage('Bill save failed', 'red-snackbar')
            }
          },
          error: (err) => {
            this.showSpinner = false
          },
        })
    } else {
      this.showSpinner = false
      this.notificationMessage('Please select bills', 'red-snackbar')
    }
  }

  reset(reset: boolean = true, billMasterDetails: BillMaster[] = []) {
    let existingUnBilledConsumptions =
      this.unbilledConsumptionComponent.unBilledConsumptions
    if (
      !reset &&
      existingUnBilledConsumptions &&
      existingUnBilledConsumptions.length
    ) {
      billMasterDetails.forEach((billMaster) => {
        existingUnBilledConsumptions = existingUnBilledConsumptions.filter(
          (x) => x.unitId != billMaster.unitId
        )
      })
      this.unbilledConsumptionComponent.unBilledConsumptions =
        existingUnBilledConsumptions
    } else if (
      reset ||
      (existingUnBilledConsumptions &&
        billMasterDetails &&
        existingUnBilledConsumptions.length == billMasterDetails.length)
    ) {
      this.unbilledConsumptionComponent.unBilledConsumptions = []
      this.createBillToolbarComponent.billPeriodId = 0
      this.createBillToolbarComponent.utilityTypeId = 0
      this.unbilledConsumptionComponent.failedCount = ''
      this.unbilledConsumptionComponent.succeedCount = ''
      this.createBillToolbarComponent.isHide = true
    }
  }

  getUtilityTypes() {
    this.utilityTypes = [{ label: 'Select', value: 0 }]
    this.billService.getUtilityTypes().subscribe((utilityTypes) => {
      utilityTypes.forEach((x) => {
        this.utilityTypes.push({ label: x.description, value: x.id })
      })
    })
  }

  getBillPeriods() {
    this.billPeriods = [
      {
        label: 'Select',
        value: 0,
        fromDate: Date.now.toString(),
        ToDate: Date.now.toString(),
      },
    ]
    this.billService.getBillPeriods(this.clientId).subscribe((billPeriods) => {
      billPeriods.forEach((x) => {
        this.billPeriods.push({
          label: x.periodDescription,
          value: x.id,
          fromDate: x.periodStart,
          toDate: x.periodEnd,
        })
      })
    })
  }

  onGenerate(manageParams: ManageParams) {
    const billGenerateParameter: BillGenerateParameter = {
      billPeriodId: Number(manageParams.billPeriodId),
      unitNumber: manageParams.unitNumber,
      settlementDate: manageParams.settlementDate,
      billDate: manageParams.processDate,
      billType: manageParams.billType
        ? manageParams.billType
        : BillType.NormalBill,
      clientId: manageParams.clientId,
      tenantIds: manageParams.tenantIds,
    }
    this.showSpinner = true
    this.billSettlementService
      .generateBillDetails(billGenerateParameter)
      .subscribe({
        next: (billMasterDetails: BillMaster[]) => {
          this.showSpinner = false
          this.billSettlement = {}
          this.billSettlement.unbBilledConsumptions = billMasterDetails
        },
        error: (err) => {
          this.showSpinner = false
          this.notificationMessage(err, 'red-snackbar')
        },
      })
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    })
  }

  invoiceView(billMaster: BillMaster) {
    this.billService.invoicePreview(billMaster).subscribe({
      next: (data) => {
        if (data) {
          this.downloadFile(data)
        } else {
          this.notificationMessage('No data to print', 'red-snackbar')
        }
      },
      error: (err) => {
        this.notificationMessage('No data to print', 'red-snackbar')
      },
    })
  }

  async downloadFile(data: any[]) {
    const mergedPdf = await PDFDocument.create()
    for (const pdfCopyDoc of data) {
      const pdf = await PDFDocument.load(pdfCopyDoc)
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page)
      })
    }
    const mergedPdfFile = await mergedPdf.save()
    const blob = new Blob([mergedPdfFile], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    window.open(url)
  }
}

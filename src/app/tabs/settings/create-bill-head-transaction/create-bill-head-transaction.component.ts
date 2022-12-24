import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { Observable, ReplaySubject } from 'rxjs'
import { filter } from 'rxjs/operators'
import { ListColumn } from '../../../../@fury/shared/list/list-column.model'
import { BillHeadTransaction } from './bill-head-transaction.model'
import { fadeInRightAnimation } from '../../../../@fury/animations/fade-in-right.animation'
import { fadeInUpAnimation } from '../../../../@fury/animations/fade-in-up.animation'
import { BillHeadTransactionService } from '../../shared/services/bill-head-transaction.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MetadataService } from 'src/app/tabs/shared/services/metadata.service'
import { MetadataBillHeads } from '../../shared/models/metadata.billheads.model'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { MetadataBillSettings } from '../../shared/models/metadata.bill-settings.model'
import { Master } from '../../shared/models/master.model'
import { MasterService } from '../../shared/services/master.service'

@Component({
  selector: 'create-bill-head-transaction',
  templateUrl: './create-bill-head-transaction.component.html',
  styleUrls: ['./create-bill-head-transaction.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation],
})
export class CreateBillHeadTransactionComponent implements OnInit {
  static id: number
  public defaults: BillHeadTransaction
  form: FormGroup
  mode: 'create' | 'update' = 'create'

  metadataBillHeads: Master[]
  metadataBillSettings: Master[]
  filteredBillHeads: Master[]
  filteredBillSettings: Master[]

  subject$: ReplaySubject<BillHeadTransaction[]> = new ReplaySubject<
    BillHeadTransaction[]
  >(1)
  data$: Observable<BillHeadTransaction[]> = this.subject$.asObservable()
  billHeadTransactions: BillHeadTransaction[]

  @Input()
  columns: ListColumn[] = [
    { name: '#', property: 'id', visible: true, isModelProperty: true },
    {
      name: 'Bill Head Name',
      property: 'accountHeadName',
      visible: true,
      isModelProperty: true,
    },
    {
      name: 'Formula',
      property: 'formula',
      visible: true,
      isModelProperty: true,
    },
    { name: 'Actions', property: 'actions', visible: true },
    { name: 'Checkbox', property: 'checkbox', visible: true },
  ] as ListColumn[]

  pageSize = 10
  dataSource: MatTableDataSource<BillHeadTransaction> | null

  sort
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content
    if (this.sort) {
      this.dataSource.sort = this.sort
    }
  }

  constructor(
    private billHeadTransactionService: BillHeadTransactionService,
    private fb: FormBuilder,
    private masterService: MasterService,
    private snackbar: MatSnackBar,
    private metadataService: MetadataService
  ) {}

  get visibleColumns() {
    return this.columns
      .filter((columns) => columns.visible)
      .map((columns) => columns.property)
  }

  ngOnInit() {
    //this.metadataService.invokeMetadata();
    this.billHeadTransactionService
      .getBillHeadTransactions()
      .subscribe((billHeadTransactions: BillHeadTransaction[]) => {
        billHeadTransactions = billHeadTransactions.map(
          (billHeadTransaction) => new BillHeadTransaction(billHeadTransaction)
        )
        this.subject$.next(billHeadTransactions)
      })

    this.billHeadTransactionService
      .getBillSettings()
      .subscribe((data: Master[]) => {
        if (data) {
          this.metadataBillSettings = data
          this.filteredBillSettings = data
        }
      })

    this.masterService
      .getSystemMasterdata(25, 0)
      .subscribe((data: Master[]) => {
        this.metadataBillHeads = data
        this.filteredBillHeads = data
      })

    //this.metadataBillHeads = this.metadataService.getMetadata().billHeads;
    //this.filteredBillHeads = this.metadataService.getMetadata().billHeads;
    // this.metadataBillSettings = this.metadataService.getMetadata().billSettings;
    // this.filteredBillSettings = this.metadataService.getMetadata().billSettings;

    this.dataSource = new MatTableDataSource(this.billHeadTransactions)

    this.data$
      .pipe(filter((data) => !!data))
      .subscribe((billHeadTransactions) => {
        this.billHeadTransactions = billHeadTransactions
        this.dataSource.data = billHeadTransactions
      })

    if (this.defaults) {
      this.mode = 'update'
    } else {
      this.defaults = new BillHeadTransaction({})
    }

    this.form = this.fb.group({
      id: [this.defaults.id || CreateBillHeadTransactionComponent.id++],
      accountHeadId: [this.defaults.accountHeadId || '', Validators.required],
      accountHeadName: [
        this.defaults.accountHeadName || '',
        Validators.required,
      ],
      billSettingsId: [this.defaults.billSettingsId || '', Validators.required],
      billSettingsName: [
        this.defaults.billSettingsName || '',
        Validators.required,
      ],
      fixedAmount: [this.defaults.fixedAmount || '', Validators.required],
      formula: [this.defaults.formula || '', Validators.required],
    })
    this.form.controls.billSettingsName.valueChanges.subscribe(
      (newBillSettings) => {
        this.filteredBillSettings = this.filterBillSettings(newBillSettings)
      }
    )
    this.form.controls.accountHeadName.valueChanges.subscribe(
      (newAccountHeadName) => {
        this.filteredBillHeads = this.filterBillHeads(newAccountHeadName)
      }
    )
  }

  filterBillSettings(name: string) {
    return this.metadataBillSettings.filter(
      (billSettings) =>
        billSettings.description.toLowerCase().indexOf(name.toLowerCase()) === 0
    )
  }

  filterBillHeads(name: string) {
    return this.metadataBillHeads.filter(
      (billHeads) =>
        billHeads.description.toLowerCase().indexOf(name.toLowerCase()) === 0
    )
  }

  save() {
    if (this.mode === 'create') {
      this.createBillHeadTransaction()
    } else if (this.mode === 'update') {
      this.updateBillHeadTransaction(this.billHeadTransactions)
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort
  }

  createBillHeadTransaction() {
    Object.assign(this.defaults, this.form.value)
    if (this.defaults.id == null) {
      this.defaults.id = 0
    }
    if (this.defaults.id != 0) {
      this.updateBillHeadTransactionFromForm(this.defaults)
    } else {
      this.billHeadTransactionService
        .createBillHeadTransaction(this.defaults)
        .subscribe((billHeadTransaction: BillHeadTransaction) => {
          this.snackbar.open(
            'created Bill head Transaction Successfully',
            null,
            {
              duration: 5000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
              panelClass: ['green-snackbar'],
            }
          )
          this.billHeadTransactions.unshift(
            new BillHeadTransaction(billHeadTransaction)
          )
          this.subject$.next(this.billHeadTransactions)
          this.form.reset()
        })
    }
  }

  updateBillHeadTransactionFromForm(defaults) {
    this.billHeadTransactionService
      .updateBillHeadTransactionById(defaults.id, defaults)
      .subscribe((billHeadTransaction: BillHeadTransaction) => {
        this.snackbar.open('updated Bill head Transaction successfully', null, {
          duration: 5000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['green-snackbar'],
        })
        const index = this.billHeadTransactions.findIndex(
          (existingbillHeadTransactions) =>
            existingbillHeadTransactions.id === billHeadTransaction.id
        )
        this.billHeadTransactions[index] = new BillHeadTransaction(
          billHeadTransaction
        )

        this.billHeadTransactionService
          .getBillHeadTransactions()
          .subscribe((billHeadTransactions: BillHeadTransaction[]) => {
            billHeadTransactions = billHeadTransactions.map(
              (billHeadTransaction) =>
                new BillHeadTransaction(billHeadTransaction)
            )
            this.subject$.next(billHeadTransactions)
            this.form.reset()
          })
      })
  }

  updateBillHeadTransaction(billHeadTransaction) {
    this.form.setValue(billHeadTransaction)
  }

  deleteBillHeadTransaction(billHeadTransaction) {
    this.billHeadTransactionService
      .deleteBillHeadTransactionById(billHeadTransaction.id)
      .subscribe(() => {
        this.billHeadTransactions.splice(
          this.billHeadTransactions.findIndex(
            (existingbillHeadTransactions) =>
              existingbillHeadTransactions.id === billHeadTransaction.id
          ),
          1
        )
        this.subject$.next(this.billHeadTransactions)
      })
  }

  onFilterChange(value) {
    if (!this.dataSource) {
      return
    }
    value = value.trim()
    value = value.toLowerCase()
    this.dataSource.filter = value
  }

  selectBillHeads(event) {
    this.metadataBillHeads.forEach((accountHeadName) => {
      if (event.option.value == accountHeadName.description) {
        this.form.controls.accountHeadId.setValue(accountHeadName.id)
      }
    })
  }

  selectBillSettings(event) {
    this.metadataBillSettings.forEach((billSettingsName) => {
      if (event.option.value == billSettingsName.description) {
        this.form.controls.billSettingsId.setValue(billSettingsName.id)
      }
    })
  }

  ngOnDestroy() {}
}

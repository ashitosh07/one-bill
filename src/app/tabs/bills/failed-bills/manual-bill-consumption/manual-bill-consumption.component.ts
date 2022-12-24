import { Component, OnInit, Inject } from '@angular/core';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';
import { BillMaster } from 'src/app/tabs/shared/models/bill-master.model';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BillSettlementService } from 'src/app/tabs/shared/services/billsettlement.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MasterService } from 'src/app/tabs/shared/services/master.service';
import { VariablePay } from 'src/app/tabs/bill/create-variablepay/variablepay-create-update/variablepay.model';
import { VariablePayService } from 'src/app/tabs/shared/services/variablepay.service';
import { FormGroup } from '@angular/forms';
import { BillType } from 'src/app/tabs/shared/utilities/utility';
import { Master } from 'src/app/tabs/shared/models/master.model';

@Component({
  selector: 'fury-manual-bill-consumption',
  templateUrl: './manual-bill-consumption.component.html',
  styleUrls: ['./manual-bill-consumption.component.scss']
})
export class ManualBillConsumptionComponent implements OnInit {

  consumption: string = '';
  accountHeadId: number = 0;
  utilityTypeId: number = 0;
  meterId: number = 0;
  accountHeads: ListItem[] = [{ label: 'Select', value: 0 }];
  utilityTypes: ListItem[] = [{ label: 'Select', value: 0 }];
  meterNumbers: ListItem[] = [{ label: 'Select', value: 0 }];
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: BillMaster,
    private billSettlementService: BillSettlementService,
    private snackbar: MatSnackBar,
    private masterService: MasterService,
    private variablePayService: VariablePayService,
    private dialogRef: MatDialogRef<ManualBillConsumptionComponent>) {
  }

  ngOnInit(): void {
    this.getUtilityTypes();
  }


  onSave() {
    if (this.consumption && this.utilityTypeId) {
      let variablePays: VariablePay[] = [];
      const varaiablePay: VariablePay = {
        utilityTypeId: this.utilityTypeId,
        amount: Number(this.consumption),
        billPeriodId: this.data.billPeriodId,
        tenantId: this.data.ownerId,
        unitId: this.data.unitId,
        clientId: this.data.clientId,
        meterId: this.meterId,
        isDeduction: false
      }
      variablePays.push(varaiablePay);

      this.variablePayService.createOtherTypeConsumptionVariablePay(variablePays, 'manual').subscribe({
        next: (response) => {
          if (response.isSuccess) {
             this.onSaveOtherTypeConsumptionBills();
          } else {
            if (response.message) {
              this.notificationMessage(response.message, 'red-snackbar');
            } else {
              this.notificationMessage('No consumption to save', 'red-snackbar');
            }
          }
        },
        error: (err) => {
          this.notificationMessage('Manual consumption save failed', 'red-snackbar');
        }
      });
    }
  }


  getUtilityTypes() {
    this.utilityTypes = [{ label: 'Select', value: 0 }];
    this.masterService.getSystemMasterdata(16, 0).subscribe((utilityTypes: Master[]) => {
      if (utilityTypes) {
        const failedBills = this.data.bills.filter(x => x.isFailed == true);
        if (failedBills && failedBills.length) {
          failedBills.forEach(failedBill => {
            const utilityType = utilityTypes.find(x => x.id === failedBill.utilityTypeId);
            if (utilityType) {
              let existingUtility = this.utilityTypes.find(x => x.value == utilityType.id)
              if (existingUtility) {
                existingUtility.subListItems.push({ description: failedBill.deviceName, id: failedBill.meterId });
              } else {
                this.utilityTypes.push({ label: utilityType.description, value: utilityType.id, subListItems: [{ description: failedBill.deviceName, id: failedBill.meterId }] })
              }
            }
          })
        }
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

  onUtilityChange(event) {
    this.utilityTypeId = event;
    this.meterNumbers = [{ label: 'Select', value: 0 }];
    if (this.utilityTypeId) {
      const utilityType = this.utilityTypes.find(x => x.value == this.utilityTypeId);
      if (utilityType) {
        utilityType.subListItems.forEach(x => {
          this.meterNumbers.push({ label: x.description, value: x.id });
        });
      }
    }
  }

  onAccountHeadChange(event) {
    this.accountHeadId = event?.option?.value ?? event;
  }

  onSaveOtherTypeConsumptionBills() {
    const billMasterDetails: BillMaster[] = [];
    this.data.billTypeId = BillType.ManualBill;
    billMasterDetails.push(this.data);
    this.billSettlementService.updateOtherTypeConsumption(billMasterDetails).subscribe({
      next: response => {
        if (response) {
          //this.notificationMessage('Manual consumption saved successfully', 'green-snackbar');
          this.dialogRef.close(true);
          
        } else {          
          //this.notificationMessage('Manual consumption save failed', 'red-snackbar');
        }      
        
      },
      error: (err) => {        
        this.notificationMessage('Manual consumption save failed', 'red-snackbar');
      }
    });
  }

  close() {
    this.dialogRef.close(false);
  }

}

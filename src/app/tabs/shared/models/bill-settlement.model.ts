import { AccountHead } from '../models/account-head.model';
import { BillMaster } from './bill-master.model';
import { AdvancePayment } from './advance-payment.model';
import { OpeningBalance } from './opening-balance.model';

export class BillSettlement {
    unbBilledConsumptions?: BillMaster[];
    outstandingBills?: BillMaster[];
    accountHeads?: AccountHead[];
    advance?: AdvancePayment;
    openingBalance?: OpeningBalance;
}
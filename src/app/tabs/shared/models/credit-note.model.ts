import { CreditNoteTransaction } from '../models/credit-note-transaction.model';
import { Client } from './client.model ';
import { ReceiverDetail } from './receiver-detail.model';

export class CreditNote {
    id?: number;
    creditNoteDate?: Date;
    creditNoteDateLocal?: string;
    creditNoteNumber?: string;
    billMasterId?: number;
    creditNoteAmount?: number;
    creditNoteTransactions?: CreditNoteTransaction[];
    billNumber?: string;
    billDate?: Date;
    billDateLocal?: string;
    billAmount?: number;
    billAmountLocal?: string;
    creditNoteAmountLocal?: string;
    ownerName?: string;
    accountNumber?: string;
    clientId?: number;
    transactionMode?: string;
    unitNumber?: string;
    client?: Client;
    trn?: string;
    previousDueAmount?: number;
    vat?: number;
    ownerId?: number;
    isSynced?: boolean;
    vatAccountHeadId?: number;
    currency?: string;
    periodDescription?: string;
    periodStart?: Date;
    periodEnd?: Date;
    receiverDetails?: ReceiverDetail[];
}
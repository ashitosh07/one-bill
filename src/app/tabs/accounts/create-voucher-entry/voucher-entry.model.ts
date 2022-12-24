
export class VoucherEntry {
    id?: number;
    voucherDate?: Date;
    voucherDateLocal?: string;
    voucherNo?: string;
    voucherGroup?: number;
    voucherType?: string;
    voucherTypeName?: string;
    debitOrCredit?: string;
    ledgerName?: string;
    amount?: number;
    narration?: string;
    amountLocal?: string;
    debitAmount?: number;
    creditAmount?: number;
    debitAmountLocal?: string;
    creditAmountLocal?: string;
    clientId?: number;

    constructor(voucherEntry) {
        this.id = voucherEntry.id || 0;
        this.voucherDate = voucherEntry.voucherDate || '';
        this.voucherNo = voucherEntry.voucherNo || '';
        this.voucherGroup = voucherEntry.voucherGroup || 0;
        this.voucherType = voucherEntry.voucherType || '';
        this.voucherTypeName = voucherEntry.voucherTypeName || '';
        this.debitOrCredit = voucherEntry.debitOrCredit || '';
        this.amount = voucherEntry.amount || 0;
        this.amountLocal = voucherEntry.amountLocal || '';
        this.narration = voucherEntry.narration || '';
        this.debitAmount = voucherEntry.debitAmount || 0;
        this.creditAmount = voucherEntry.creditAmount || 0;
        this.debitAmountLocal = voucherEntry.debitAmountLocal || '';
        this.creditAmountLocal = voucherEntry.creditAmountLocal || '';
        this.clientId = voucherEntry.clientId || 0;
        this.ledgerName = voucherEntry.ledgerName || '';
    }
}        
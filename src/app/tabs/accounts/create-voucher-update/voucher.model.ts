import { VoucherTransaction } from './voucher-transaction.model';

export class Voucher {
    id: number;
    billDate: Date;
    bllDateLocal?: string;
    billNumber: string;
    ledgerDescription: string;                     
    modeDescription?: string;
    billAmount: number;
    billAmountLocal?: string;
    clientId?: number;
    voucherType?: string;
    voucherTransactions: VoucherTransaction[];

    constructor(voucher) {
        this.id = voucher.id || 0;
        this.billDate = voucher.billDate || '';
        this.billNumber = voucher.billNumber || '';
        this.ledgerDescription = voucher.ledgerDescription || '';
        this.modeDescription = voucher.modeDescription || '';
        this.billAmount = voucher.billAmount || 0;
        this.clientId = voucher.clientId || 0;
        this.voucherType = voucher.voucherType || '';
        this.voucherTransactions = voucher.voucherTransactions || [];
    }
}   
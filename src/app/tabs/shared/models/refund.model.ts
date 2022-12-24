import { Client } from './client.model ';
import { RefundTransaction } from './refund-transaction.model';
export class Refund {
    id?: number;
    refundNumber?: string;
    refundDate?: Date;
    refundDateLocal?: string;
    paymentId?: number;
    ownerId?: number;
    ownerName?: string;
    unitNumber?: string
    refundAmount?: number;
    refundAmountLocal?: string;
    billType?: number;
    modeOfPayment?: number;
    refundReference?: string;
    remarks?: string;
    email?: string;
    clientId?: number;
    client?: Client;
    paymentAmount?: number;
    accountNumber?: string;
    paymentAmountLocal?: string;
    paymentMode?: string;
    isSynced?: boolean;
    refundTransactions?:RefundTransaction[]
}
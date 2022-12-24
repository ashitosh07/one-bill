import { FinalBillTransaction } from "./final-bill-transaction.model";

export class FinalBill {
    id?: number;
    billNo?: number;
    billDate?: Date;
    ownerId?: number;
    tenantId?: number;
    unitId?: number;
    paymentAmount?: number;
    bankId?: number;
    modeofPayment?: number;
    paymentReference?: string;
    remarks?: string;
    unitNumber?: string;
    consumption?: string;
    paid?: number;
    toPay?: number;
    securityDeposit?: number;
    amount?: number;
    paymentDate?: Date;
    finalBillTransactions?: FinalBillTransaction[];
}
import { RevenueDailyData } from '../models/revenue-daily-data.model';

export class RevenueData {
    revenueDailyDatas?: RevenueDailyData[];
    totalCurrentMonthInvoiceAmount?: number;
    totalCurrentMonthOutStandingAmount?: number;
    totalCurrentMonthPaymentAmount?: number;
    totalInvoiceAmountTillYesterday?: number;
    totalOutStandingAmountTillYesterday?: number;
    totalPaymentAmountTillYesterday?: number;
    totalPreviousMonthInvoiceAmount?: number;
    totalPreviousMonthOutStandingAmount?: number;
    totalPreviousMonthPaymentAmount?: number;
}

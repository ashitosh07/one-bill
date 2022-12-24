
export class ConsolidatedReport {
    billNumber: string;
    billDate?: Date;
    billDateLocal?: string;
    customerName: string;
    unitNumber: string;
    meterNumber: string;
    consumptions: number;
    consumptionsLocal?: string;
    consumption: number;
    consumptionLocal?: string;
    billCharge: number;
    billChargeLocal?: string;
    vat: number;
    vatLocal?: string;
    billAmount: number;
    billAmountLocal?: string;

    constructor(consolidatedReport) {
        this.billNumber = consolidatedReport.billNumber || '';
        this.billDate = consolidatedReport.billDate || '';
        this.customerName = consolidatedReport.customerName || '';
        this.unitNumber = consolidatedReport.unitNumber || '';
        this.meterNumber = consolidatedReport.meterNumber || '';
        this.consumptions = consolidatedReport.consumptions || 0;
        this.consumption = consolidatedReport.consumption || 0;
        this.billCharge = consolidatedReport.billCharge || 0;
        this.vat = consolidatedReport.vat || 0;
        this.billAmount = consolidatedReport.billAmount || 0;
    }
}
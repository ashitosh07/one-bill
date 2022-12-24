
export class BillPeriod {
    id: number;
    clientId: number;
    billSettingsId: number;
    billSettingsName: string;
    periodDescription: string;
    periodStart: string;
    periodStartLocal?: string;
    periodEnd: string;
    periodEndLocal?: string;


    constructor(billPeriod) {
        this.id = billPeriod.id || 0;
        this.clientId = billPeriod.clientId || 0;
        this.billSettingsId = billPeriod.billSettingsId || '';
        this.billSettingsName = billPeriod.billSettingsName || '';
        this.periodDescription = billPeriod.periodDescription || '';
        this.periodStart = billPeriod.periodStart || '';
        this.periodEnd = billPeriod.periodEnd || '';
    }
}  
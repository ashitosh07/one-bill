export class BillSettings {
    id: number;
    billSettingsName: string;
    billPeriodTypeId: number;
    billPeriodType: string;
    averageMonthsNumber: number;
    billAmountType: number;
    amountType: string;
    // billFormatId: number;
    billFormat: string;
    billDueDays: number;
    penaltyAfter: number;
    termsAndConditionId: number;
    termsAndCondition: string;
    taxId: number;
    taxName: string;
    file?: File;
    constructor(billSettings) {
        this.id = billSettings.id || 0;
        this.billSettingsName = billSettings.billSettingsName || '';
        this.billPeriodTypeId = billSettings.billPeriodTypeId || 0;
        this.billPeriodType = billSettings.billPeriodType || '';
        this.averageMonthsNumber = billSettings.averageMonthsNumber || 0;
        this.billAmountType = billSettings.billAmountType || 0;
        this.amountType = billSettings.amountType || '';
        // this.billFormatId = billSettings.billFormatId || 0;
        this.billFormat = billSettings.billFormat || '';
        this.billDueDays = billSettings.billDueDays || 0;
        this.penaltyAfter = billSettings.penaltyAfter || 0;
        this.termsAndConditionId = billSettings.termsAndConditionId || 0;
        this.termsAndCondition = billSettings.termsAndCondition || '';
        this.taxId = billSettings.taxId || 0;
        this.taxName = billSettings.taxName || '';
        this.file = billSettings.file || null;
    }
}


export class VariablePay {
    id?: number;
    billPeriodId?: number;
    periodDescription?: string;
    tenantId?: number;
    tenantName?: string;
    tenantNumber?: string;
    unitId?: number;
    unitNumber?: string;
    accountHeadId?: number;
    accountHeadName?: string;
    billType?: number;
    // billTypeName?: string;
    meterId?:number;
    isDeduction?: boolean;
    amount?: number;
    amountLocal?: string;
    utilityTypeId?: number;
    clientId?: number;
    isVariablePayUsed?:boolean;
    unit?: string;

    constructor(variablePay) {
        this.id = variablePay.id || 0;
        this.billPeriodId = variablePay.billPeriodId || 0;
        this.periodDescription = variablePay.periodDescription || '';
        this.tenantId = variablePay.tenantId || 0;
        this.tenantName = variablePay.tenantName || '';
        this.tenantNumber = variablePay.tenantNumber || '';
        this.unitId = variablePay.unitId || 0;
        this.unitNumber = variablePay.unitNumber || '';
        this.accountHeadId = variablePay.accountHeadId || 0;
        this.accountHeadName = variablePay.accountHeadName || '';
        // this.billType = variablePay.billType || 0;
        // this.billTypeName = variablePay.billTypeName || '';
        this.isDeduction = variablePay.isDeduction || false;
        this.amount = variablePay.amount || 0;
        this.utilityTypeId = variablePay.utilityTypeId || 0;
        this.clientId = variablePay.clientId || 0;
        this.isVariablePayUsed = variablePay.isVariablePayUsed || false;
        this.unit = variablePay.unit || '';
    }
}        
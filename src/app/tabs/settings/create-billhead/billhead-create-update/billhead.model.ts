export class Billhead {
    id: number;
    clientId: number;
    accountHeadName: string;
    accountHeadType: number;
    headType: string;
    utilityTypeId: number;
    utilityType: string;
    formulaField: number;
    formulaFieldName: string;
    operator: number;
    operatorName: string;
    tariffId: number;
    tariff: string;
    fixedAmount: number;
    fixedAmountLocal?: string;
    accountNumber: number;
    accountNumberName: string;
    noOfDays: number;
    position: number;
    isVAT: boolean;
    isDiscount: boolean;
    measuringUnitId: number;
    discountAmount: number;
    discountAmountLocal?: string;
    discountType: string;
    contractTypeId: number;
    contractType: string;
    isProportional: boolean;

    constructor(billhead) {
        this.id = billhead.id || 0;
        this.clientId = billhead.clientId || 0;
        this.accountHeadName = billhead.accountHeadName || '';
        this.accountHeadType = billhead.accountHeadType || '';
        this.headType = billhead.headType || '';
        this.utilityTypeId = billhead.utilityTypeId || 0;
        this.utilityType = billhead.utilityType || '';
        this.formulaField = billhead.formulaField || 0;
        this.formulaFieldName = billhead.formulaFieldName || '';
        this.operator = billhead.operator || 0;
        this.operatorName = billhead.operatorName || '';
        this.tariffId = billhead.tariffId || 0;
        this.tariff = billhead.tariff || '';
        this.fixedAmount = billhead.fixedAmount || 0;
        this.accountNumber = billhead.accountNumber || '';
        this.accountNumberName = billhead.accountNumberName || '';
        this.noOfDays = billhead.noOfDays || 0;
        this.position = billhead.position || 0;
        this.isVAT = billhead.isVAT || false;
        this.isDiscount = billhead.isDiscount || false;
        this.measuringUnitId = billhead.measuringUnitId || 0;
        this.discountAmount = billhead.discountAmount || 0;
        this.discountType = billhead.discountType || '';
        this.contractType = billhead.contractType || '';//'0'
        this.contractTypeId = billhead.contractTypeId || 0;
        this.isProportional = billhead.isProportional || false;
    }
}

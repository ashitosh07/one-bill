export class BillHeadTransaction {
    id:number;
    accountHeadId:number;
    accountHeadName:string;
    billSettingsId:number;
    billSettingsName:string;
    fixedAmount:number;
    formula:string;

    constructor(billheadtransaction){
        this.id=billheadtransaction.id || 0;
        this.accountHeadId=billheadtransaction.accountHeadId || '';
        this.accountHeadName=billheadtransaction.accountHeadName || '';
        this.billSettingsId=billheadtransaction.billSettingsId || '';
        this.billSettingsName=billheadtransaction.billSettingsName || '';
        this.fixedAmount=billheadtransaction.fixedAmount || '';
        this.formula=billheadtransaction.formula || '';
    }
}

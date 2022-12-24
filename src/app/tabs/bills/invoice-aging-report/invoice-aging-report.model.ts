export class InvoiceAgingReport{
    accountNumber:string;
    billDate:Date;
    billDatelocal?:string;
    owner:string;
    totalBalance:number;
    totalBalancelocal?:string;
    balance30:number;
    balance30Local?: string;
    balance60:number;
    balance60Local?: string;
    balance90:number;
    balance90Local?:string;
    balance180:number;
    balance180Local?:string;
    balanceAbove180:number;
    balanceAbove180Local?:string;

    constructor(invoiceAgingReport){
        this.accountNumber=invoiceAgingReport.accountNumber;
        this.billDate=invoiceAgingReport.billDate;
        this.billDatelocal=invoiceAgingReport.billDatelocal;
        this.owner=invoiceAgingReport.owner;
        this.totalBalance=invoiceAgingReport.totalBalance;
        this.totalBalancelocal=invoiceAgingReport.totalBalancelocal;
        this.balance30=invoiceAgingReport.balance30;
        this.balance60=invoiceAgingReport.balance60;
        this.balance90=invoiceAgingReport.balance90;
        this.balance180=invoiceAgingReport.balance180;
        this.balanceAbove180=invoiceAgingReport.balanceAbove180;
    }
}
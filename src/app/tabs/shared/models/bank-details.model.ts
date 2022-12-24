export class BankDetails {
    id: string;
    bankName: string;
    accountName: string;
    accountNo: string;
    swiftCode: string;
    ibanNumber: string;
    bankAddress: string;
    
    constructor(bankDetails) {
        this.id = bankDetails.id || 0;
        this.bankName = bankDetails.bankName || '';
        this.accountName = bankDetails.accountName || '';
        this.accountNo = bankDetails.accountNo || '';
        this.swiftCode = bankDetails.swiftCode || '';
        this.ibanNumber = bankDetails.ibanNumber || '';
        this.bankAddress = bankDetails.bankAddress || '';
               
    }
}

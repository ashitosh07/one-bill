
export class VoucherTransaction 
{
    id: number;
    description: string;
    headAmount: number;    

    constructor(voucherTransaction) 
    {
        this.id = voucherTransaction.id || 0;
        this.description = voucherTransaction.description || '';
        this.headAmount = voucherTransaction.headAmount || 0;
    }
}   
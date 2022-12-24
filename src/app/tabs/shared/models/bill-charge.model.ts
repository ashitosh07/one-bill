
export class BillCharge {
    id?: number;
    billNumber?: string;
    billHeadId?: number;
    headDisplay?: string;
    headAmount?: number;
    isVAT?: boolean;
    position?: number;
    isDiscount?: boolean;
    discountOnBillLine?: number;
}
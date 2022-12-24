export class BillTransaction {
    id?: number;
    billMasterId?: number;
    billHeadId?: number;
    accountHeadName?: string;
    headDisplay?: string;
    headAmount?: number;
    isVAT?: boolean;
    tariffId?: number;
    measuringUnitId?: number;
    position?: number;
    isDiscount?: boolean;
    discountOnBillLine?: number;
    rate?: number;
    measuringUnit?: string;
    consumption?: number;
}
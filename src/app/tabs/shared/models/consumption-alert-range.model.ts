export class ConsumptionAlertRange {
    id?: number
    consumptionTypeId?: number;
    utilityTypeId?: number
    fromBillPeriodId?: number;
    toBillPeriodId?: number;
    percentage?: number;
    clientId?: number
    fromDate?: Date;
    startDate?: Date;
    endDate?: Date;
    consumptionType?: string;
    utilityType?: string;
    fromBillPeriod?: string;
    toBillPeriod?: string;
}

export class MeterReading {
    MeterId?: string;
    ParameterId?: string;
    FromDate?: string;
    ToDate?: string;
    LastReading?: string;   
    isDataFrequency?: boolean;
    dataFrequency?: number;
    isZeroValueReading?: boolean;
    clientId?: number;
    utilityTypeId?: number;
}
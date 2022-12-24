
export class MeterErrorDetails {
    ownerName: string;
    deviceName: string;
    unitNumber: string;
    errorCode: number;
    errorType: string;
    errorDate: Date;
    errorDateLocal: string;

    constructor(meterErrorDetails) {
        this.ownerName = meterErrorDetails.ownerName || '';
        this.deviceName = meterErrorDetails.deviceName || '';
        this.unitNumber = meterErrorDetails.unitNumber || '';
        this.errorCode = meterErrorDetails.errorCode || '';
        this.errorType = meterErrorDetails.errorType || '';
        this.errorDate = meterErrorDetails.errorDate || '';
    }
}
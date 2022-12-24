
export class MeterReplacement {
    id: number;
    replacementDate: Date;
    replacementDateLocal: string;
    deviceName: string;
    utilityTypeId: number;
    utilityType: string;
    unitId: number;
    unitNumber: string;
    reading: number;
    deviceStatus: number;
    isConnected: boolean;
    remarks: string;
    clientId: number;

    constructor(meterReplacement) {
        this.id = meterReplacement.id || 0;
        this.replacementDate = meterReplacement.replacementDate || '';
        this.deviceName = meterReplacement.deviceName || '';
        this.utilityTypeId = meterReplacement.utilityTypeId || 0;
        this.utilityType = meterReplacement.utilityType || '';
        this.unitId = meterReplacement.unitId || 0;
        this.unitNumber = meterReplacement.unitNumber || '';
        this.reading = meterReplacement.reading || '';
        this.deviceStatus = meterReplacement.deviceStatus || '';
        this.isConnected = meterReplacement.isConnected || false;
        this.remarks = meterReplacement.remarks || '';
        this.clientId = meterReplacement.clientId || 0;
    }
}  
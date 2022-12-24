export class ServiceDisconnection 
{
    id: number;
    date: Date;
    dateLocal?: string;
    utilityTypeId: number;
    utilityType: string;
    unitId: number;
    unitNumber: string;
    meterId: number;
    meterName: string;
    isConnected: boolean;
    isConnectedString: string;
    remarks: string;

    constructor(serviceDisconnection) 
    {
      this.id = serviceDisconnection.id || 0;
      this.date = serviceDisconnection.date || '';
      this.utilityTypeId = serviceDisconnection.utilityTypeId || 0;
      this.utilityType = serviceDisconnection.utilityType || '';
      this.unitId = serviceDisconnection.unitId || 0;
      this.unitNumber = serviceDisconnection.unitNumber || '';
      this.meterId = serviceDisconnection.meterId || 0;
      this.meterName = serviceDisconnection.meterName || '';
      this.isConnected = serviceDisconnection.isConnected || false;
      this.isConnectedString = serviceDisconnection.isConnectedString || '';
      this.remarks = serviceDisconnection.remarks || '';
    }
}

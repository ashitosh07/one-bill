export class OwnerBillGroup {
    id?: number;
    contractId?: number;
    ownerId?: number;
    utilityTypeId?: number;
    utilityType?: string;
    groupId?: number;
    meterNumber?: string;
    meterId?: number;
    isDifferenciateConsumption?: boolean;
    constructor(ownerBillGroup) {
        this.id = ownerBillGroup.id || 0;
        this.contractId = ownerBillGroup.contractId || 0;
        this.ownerId = ownerBillGroup.ownerId || 0;
        this.utilityTypeId = ownerBillGroup.utilityTypeId || '';
        this.utilityType = ownerBillGroup.utilityType || '';
        this.groupId = ownerBillGroup.groupId || '';
        this.meterNumber = ownerBillGroup.meterNumber || '';
        this.meterId = ownerBillGroup.meterId || 0;
        this.isDifferenciateConsumption = ownerBillGroup.isDifferenciateConsumption || false;
    }
}
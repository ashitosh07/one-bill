export class UnitUtility {
    id: number;
    unitId: number;
    utilityTypeId: number;
    utilityType: string;
    meterId: number;
    meterType: string;
    meterReading: number;
    securityDeposit: number;    
    securityDepositLocal?: string; 

    constructor(utility) {
        this.id = utility.id || 0;
        this.unitId = utility.unitId || 0;
        this.utilityTypeId = utility.utilityTypeId || 0;
        this.utilityType = utility.utilityType || '';
        this.meterId = utility.meterId || 0;  
        this.meterType = utility.meterType || '';
        this.meterReading = utility.meterReading || 0;
        this.securityDeposit = utility.securityDeposit || 0;  
    }
}

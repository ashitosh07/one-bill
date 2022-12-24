export class Utility {
    clientId: number;
    utilityTypeId: number;
    
    constructor(utility) {
        this.clientId = utility.clientId || 0;
        this.utilityTypeId = utility.utilityTypeId || 0;
    }
}

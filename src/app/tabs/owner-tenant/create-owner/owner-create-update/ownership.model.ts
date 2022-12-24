

export class Ownership {
    id: number;
    unitId:number;
    unit:string;
    startDate: Date;
    startDateLocal?: string;
    
    
    constructor(ownership) {
        this.id = ownership.id || 0;
        this.unitId = ownership.unitId || 0;
        this.unit = ownership.unit || '';
        this.startDate = ownership.startDate || '';
       
            
    }
}

export class MetadataBillPeriod {
    id: number;
    description: string;

    constructor(billPeriod) {
        this.id = billPeriod.id || 0;
        this.description = billPeriod.description || '';
    }
}

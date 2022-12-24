export class MetadataBillPeriodTypes {
    id: number;
    description: string;

    constructor(billPeriodType) {
        this.id = billPeriodType.id || '';
        this.description = billPeriodType.description || '';
    }
}
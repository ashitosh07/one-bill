export class MetadataBillAmountType {
    id: number;
    description: string;

    constructor(billAmountType) {
        this.id = billAmountType.id || '';
        this.description = billAmountType.description || '';
    }
}
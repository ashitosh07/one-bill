export class MetadataBillType {
    id: number;
    description: string;

    constructor(billType) {
        this.id = billType.id || '';
        this.description = billType.description || '';
    }
}
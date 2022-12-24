export class MetadataBillFormat {
    id: number;
    description: string;

    constructor(billFormat) {
        this.id = billFormat.id || 0;
        this.description = billFormat.description || '';
    }
}

export class MetadataCurrencyTypes {
    id: number;
    description: string;

    constructor(currencyType) {
        this.id = currencyType.id || '';
        this.description = currencyType.description || '';
    }
}
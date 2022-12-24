export class MetadataCurrencyDecimal {
    id: number;
    description: string;

    constructor(currencyDecimal) {
        this.id = currencyDecimal.id || 0;
        this.description = currencyDecimal.description || '';
    }
}

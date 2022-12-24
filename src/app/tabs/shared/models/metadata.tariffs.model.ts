export class MetadataTariffs {
    id: number;
    description: string;

    constructor(tariff) {
        this.id = tariff.id || '';
        this.description = tariff.description || '';
        
    }
}
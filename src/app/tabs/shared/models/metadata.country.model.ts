export class MetadataCountry {
    id: number;
    description: string;

    constructor(country) {
        this.id = country.id || '';
        this.description = country.description || '';
    }
}
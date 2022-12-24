export class MetadataUnitTypes {
    id: number;
    description: string;

    constructor(unitType) {
        this.id = unitType.id || '';
        this.description = unitType.description || '';
        
    }
}
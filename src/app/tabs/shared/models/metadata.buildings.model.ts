export class MetadataBuildings {
    id: number;
    description: string;

    constructor(building) {
        this.id = building.id || '';
        this.description = building.description || '';
        
    }
}
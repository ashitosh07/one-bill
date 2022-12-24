export class MetadataFloors {
    id: number;
    description: string;

    constructor(floor) {
        this.id = floor.id || '';
        this.description = floor.description || '';
        
    }
}
export class MetadataUnit {
    id: number;
    description: string;

    constructor(unit) {
        this.id = unit.id || 0;
        this.description = unit.description || '';
        
    }
}

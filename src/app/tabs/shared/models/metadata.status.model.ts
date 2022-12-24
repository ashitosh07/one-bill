export class MetadataStatus {
    id: number;
    description: string;

    constructor(status) {
        this.id = status.id || '';
        this.description = status.description || '';
        
    }
}
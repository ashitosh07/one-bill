export class MetadataMode {
    id: number;
    description: string;

    constructor(mode) {
        this.id = mode.id || '';
        this.description = mode.description || '';
        
    }
}
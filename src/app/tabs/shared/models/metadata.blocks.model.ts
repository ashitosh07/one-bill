export class MetadataBlocks {
    id: number;
    description: string;

    constructor(blocks) {
        this.id = blocks.id || '';
        
        this.description = blocks.description || '';
    }
}
export class MetadataParentModes {
    id: number;
    description: string;

    constructor(parentModes) {
        this.id = parentModes.id || '';
        this.description = parentModes.description || '';        
    }
}
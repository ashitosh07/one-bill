export class MetadataOwner {
    id: number;
    description: string;

    constructor(owner) {
        this.id = owner.id || 0;
        this.description = owner.description || '';
    }
}

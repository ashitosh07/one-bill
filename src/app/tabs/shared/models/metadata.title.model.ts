export class MetadataTitle {
    id: number;
    description: string;

    constructor(title) {
        this.id = title.id || '';
        this.description = title.description || '';
    }
}
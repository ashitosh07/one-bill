export class MetadataDateFormat {
    id: number;
    description: string;

    constructor(dateFormat) {
        this.id = dateFormat.id || '';
        this.description = dateFormat.description || '';
    }
}
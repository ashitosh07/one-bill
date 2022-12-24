export class MetadataBillSettings {
    id: number;
    description: string;

    constructor(billSettings) {
        this.id = billSettings.id || 0;
        this.description = billSettings.description || '';
    }
}

export class MetadataAccountHead {
    id: number;
    description: string;
    defaultValue?: string;
    constructor(accountHead) {
        this.id = accountHead.id || 0;
        this.description = accountHead.description || '';
        this.defaultValue = accountHead.defaultValue || '';
    }
}

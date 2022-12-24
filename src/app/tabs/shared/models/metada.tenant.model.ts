export class MetadataTenant {
    id: number;
    description: string;

    constructor(tenant) {
        this.id = tenant.id || 0;
        this.description = tenant.description || '';
    }
}

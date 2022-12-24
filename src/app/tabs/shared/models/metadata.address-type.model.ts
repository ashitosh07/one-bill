export class MetadataAddressType {
    id: number;
    description: string;

    constructor(addressType) {
        this.id = addressType.id || '';
        this.description = addressType.description || '';
    }
}
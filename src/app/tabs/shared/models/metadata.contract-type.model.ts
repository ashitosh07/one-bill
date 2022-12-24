export class MetadataContractType {
    id: number;
    description: string;

    constructor(contractType) {
        this.id = contractType.id || 0;
        this.description = contractType.description || '';
    }
}

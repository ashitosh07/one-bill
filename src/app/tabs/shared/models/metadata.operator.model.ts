export class MetadataOperator {
    id: number;
    description: string;

    constructor(operator) {
        this.id = operator.id || 0;
        this.description = operator.description || '';
    }
}

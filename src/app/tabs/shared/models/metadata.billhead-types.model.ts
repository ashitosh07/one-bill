export class MetadataBillHeadTypes {
    id: number;
    description: string;

    constructor(billHeadType) {
        this.id = billHeadType.id || '';
        this.description = billHeadType.description || '';
    }
}
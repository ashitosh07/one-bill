export class MetadataBillHeads {
    id: number;
    description: string;

    constructor(billHead) {
        this.id = billHead.id || '';
        this.description = billHead.description || '';
    }
}
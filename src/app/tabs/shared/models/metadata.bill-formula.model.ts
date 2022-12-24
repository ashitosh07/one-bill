export class MetadataBillFormula {
    id: number;
    description: string;

    constructor(billFormula) {
        this.id = billFormula.id || 0;
        this.description = billFormula.description || '';
    }
}

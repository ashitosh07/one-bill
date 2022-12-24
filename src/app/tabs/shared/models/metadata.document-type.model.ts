export class MetadataDocumentType {
    id: number;
    //code: string;
    description: string;

    constructor(documentType) {
        this.id = documentType.id || '';
        //this.code = documentType.code || '';
        this.description = documentType.description || '';
    }
}
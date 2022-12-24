export class Documents {
    id: string;
    document: string;
    documentTypeId: number;
    documentType: string;
    documentPath: string;
    
    constructor(document) {
        this.id = document.id || 0;
        this.document = document.document || '';
        this.documentTypeId = document.documentTypeId || '';
        this.documentType = document.documentType || '';
        this.documentPath = document.documentPath || '';    
    }
}

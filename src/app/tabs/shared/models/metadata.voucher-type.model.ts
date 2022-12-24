export class MetadataVoucherType {
    id: number;
    description: string;

    constructor(voucherType) {
        this.id = voucherType.id;
        this.description = voucherType.description;
        
    }
}

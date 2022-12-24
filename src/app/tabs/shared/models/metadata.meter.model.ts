export class MetadataMeter {
    id: number;
    description: string;

    constructor(meter) {
        this.id = meter.id || '';
        this.description = meter.description || '';
        
    }
}
export class MetadataDeviceStatus {
    id: number;
    description: string;

    constructor(deviceStatus) {
        this.id = deviceStatus.id || 0;
        this.description = deviceStatus.description || '';
        
    }
}

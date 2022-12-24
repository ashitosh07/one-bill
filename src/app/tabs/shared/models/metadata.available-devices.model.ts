export class MetadataAvailableDevices {
    id: number;
    description: string;

    constructor(availableDevices) {
        this.id = availableDevices.id || 0;
        this.description = availableDevices.description || '';
    }
}

export class MetadataBillingLedger {
    id: number;
    description: string;

    constructor(billingLedger) {
        this.id = billingLedger.id || '';
        this.description = billingLedger.description || '';
    }
}
import { TaxMapGroup } from '../../../shared/models/tax-map-group.model';

export class TaxSettings {
    id?: number;
    taxName?: string;
    computationType?: number;
    computationTypeName?: string;
    value?: number;
    taxDisplayName?: string;
    effectiveFrom?: Date;
    effectiveFromLocal?: string;
    showAgainstBillLine?: boolean;
    taxMapGroups: TaxMapGroup[];
}
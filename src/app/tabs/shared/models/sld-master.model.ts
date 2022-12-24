import { SLDTransaction } from './sld-transaction.model';

export class SLDMaster {
    id?: number;
    masterId?: number;
    sldPath?: string;
    clientId?: number;
    sldTransactions?: SLDTransaction[];
    isDeleted?: boolean;
}
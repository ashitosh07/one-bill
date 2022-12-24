export class BillTariffDetail {
    id?: number;
    billId?: number;
    tariffId?: number
    peakTypeId?: number;
    weekTypeId?: number;
    seasonId?:number;
    slabSettingsId?:number;
    consumption?: number;
    rate?: number;
    amount?: number;
    season?: string;
    peakType?: string;
    weekType?: string;
}
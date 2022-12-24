import { SeasonPeakSettings } from "../models/season-peak-settings.model";
import { TariffConsumptionSettings } from "../models/tariff-consumption-settings.model";
import { TariffClient } from './tariff-client.model';

export class TariffMaster {
    id?: number;
    tariffName?: string;
    utilityTypeId?: number;
    utility?: string;
    parameterId?: number;
    parameter?: string;
    wefDate?: Date;
    wefDateLocal?: string;
    isTariffUsed?: boolean;
    tariffClients?: TariffClient[];
    seasonPeakSettings?: SeasonPeakSettings[];
    tariffConsumptionSettings?: TariffConsumptionSettings[];
}
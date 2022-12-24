import { TariffSettings } from "./tariff-settings.model";
import { Master } from './master.model';

export interface TariffItem {
    type?: string;
    tariffSettings?: TariffSettings[];
    subItems?: Master[];
}
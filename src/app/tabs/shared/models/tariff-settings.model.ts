import { Master } from './master.model';

export interface TariffSettings {
    id?: number;
    typeName?: string;
    typeId?: number;
    subTypeId?: number;
    type?: number;
    subItemNames?: string;
    subItems?: Master[];
}
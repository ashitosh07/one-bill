import { Master } from './master.model';

export class ListItem {
    value?: number;
    label?: string;
    selected?: boolean;
    subListItems?: Master[];
}
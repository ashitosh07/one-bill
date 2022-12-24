import { AlertSetting } from './alert-setting.model';
import { BillMaster } from './bill-master.model';
export interface NotificationAlert {
    alertSettings?: AlertSetting[];
    billMasters?: BillMaster[];
}
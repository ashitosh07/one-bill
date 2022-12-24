import { BillMaster } from '../../shared/models/bill-master.model';
import { Payment } from './payment.model';
import { EntityNotification } from './entity-notification.model';
import { Attachment } from './attachments.model';
import { ReceiverDetail } from './receiver-detail.model';
export class TemplateContent {
    clientId?: number;
    templateName?: string;
    templateType?: string;
    notificationType?: string;
    notificationMode?: string;
    billMasterDetails?: BillMaster[];
    payments?: Payment[];
    notificationEntities?: EntityNotification[];
    subject?: string;
    content?: string;
    externalVariable?: string;
    attachments?: Attachment[];
    receiverDetails?: ReceiverDetail[];
    isManual?: boolean;
    isSkipExisting?: boolean;
}
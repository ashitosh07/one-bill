export class AlertSetting {
    id?: number;
    notificationTemplateId?: number;
    notificationCategoryId?: number;
    notificationModeId?: number;
    notificationTypeId?: number;
    //notificationTemplate?: string;
    notificationCategory?: string;
    notificationMode?: string;
    notificationType?: string;
    isEnableAutoSend?: boolean;
    conditionId?: number;
    condition?: string;
    clientId?: number;
    days?: number;
    isEnable?: boolean;
    clientName?: string;
}
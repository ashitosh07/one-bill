export class NotificationLog {
    id?: number;
    sentDate?: Date;
    sentDatelocal?: string;
    transactionId?: number;
    description?: string;
    transactionType?: number;
    clientId?: number;
    notificationTypeId?: number;
    notificationModeId?: number;
    notificationMode?: string;
    isSuccess?: boolean;
    status?: string;
    reason?: string;
    notificationType?: string;
    isSkipExisting?: boolean;
    transactionNumber?: string;
    accountNumber?: string;
    constructor(notificationLogs) {
        this.id = notificationLogs.id;
        this.sentDate = notificationLogs.sentDate;
        this.sentDatelocal = notificationLogs.sentDatelocal;
        this.transactionId = notificationLogs.transactionId;
        this.transactionType = notificationLogs.transactionType;
        this.description = notificationLogs.description;
        this.clientId = notificationLogs.clientId;
        this.notificationTypeId = notificationLogs.notificationTypeId;
        this.notificationModeId = notificationLogs.notificationModeId;
        this.notificationMode = notificationLogs.notificationMode;
        this.isSuccess = notificationLogs.isSuccess;
        this.status = notificationLogs.status;
        this.reason = notificationLogs.reason;
        this.notificationType = notificationLogs.notificationType;
        this.isSkipExisting = notificationLogs.isSkipExisting;
        this.transactionNumber = notificationLogs.transactionNumber;
        this.accountNumber = notificationLogs.accountNumber;
    }
}

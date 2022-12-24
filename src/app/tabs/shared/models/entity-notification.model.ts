import { ReceiverDetail } from './receiver-detail.model';


export class EntityNotification {
    id: number;
    entityName: string;
    email: string;
    phoneNumber: string;
    accountNumber: string;
    unitNumber: string;
    userId?: string;
    receiverDetails?: ReceiverDetail[];
    constructor(entityNotification) {
        this.id = entityNotification.id;
        this.entityName = entityNotification.entityName;
        this.email = entityNotification.email;
        this.phoneNumber = entityNotification.phoneNumber;
        this.accountNumber = entityNotification.accountNumber;
        this.unitNumber = entityNotification.unitNumber;
        this.userId = entityNotification.userId;
        this.receiverDetails = entityNotification.receiverDetails;
    }
}
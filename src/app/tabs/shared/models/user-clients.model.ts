
export class UserClients {
    id?: number;
    userId?: string;
    clientId?: number;
    clientName?:string;

    constructor(userclients){
        this.id=userclients.id;
        this.userId=userclients.userId;
        this.clientId=userclients.clientId;
        this.clientName=userclients.clientName;
    }
}
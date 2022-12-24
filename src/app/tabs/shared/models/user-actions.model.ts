
export class UserActions {
    id?: number;
    userId?: number;
    roleId?: number;
    actionId?: number;
    actionName?:string;

    constructor(userActions) {
        this.id = userActions.id;
        this.userId = userActions.userId;
        this.roleId = userActions.clientId;
        this.actionId = userActions.actionId;
        this.actionName =userActions.actionName;
    }
}
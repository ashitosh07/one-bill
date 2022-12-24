import { UserClients } from "../models/user-clients.model";
import { UserActions } from "../models/user-actions.model";
export class UserDetails {
    public id?: string;
    public username?: string;
    public email?: string;
    public password?: string;
    public role?: string;
    public roleId?: number;
    public designation?: string;
    public image?: string;
    public isLoginEnabled?: boolean;
    // for checking whether the user has login activated
    public isLoginActivated?: boolean;
    userClients?: UserClients[];
    userActions?: UserActions[];
    constructor(userDetails) {
        this.id = userDetails.id || '';
        this.username = userDetails.username || '';
        this.email = userDetails.email || '';
        this.password = userDetails.password || '';
        this.role = userDetails.role || '';
        this.roleId = userDetails.roleId || 0;
        this.designation = userDetails.designation || '';
        this.image = userDetails.image || '';
        this.userClients = (userDetails.userClients || []).map(userClient => new UserClients(userClient));
        this.userActions = (userDetails.userActions || []).map(userAction => new UserActions(userAction));
    }
}
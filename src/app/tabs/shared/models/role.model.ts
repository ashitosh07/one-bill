export class Role {
    id?: number;
    description?: string;

    constructor(role) {
        this.id = role.id;
        this.description = role.description;
    }
}
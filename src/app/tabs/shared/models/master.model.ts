
export class Master {
    id?: number;
    description?: string;
    defaultValue?: string;
    parentId?: number;
    masters?: Master[];

    constructor(master) {
        this.id = master.id || 0;
        this.description = master.description || '';
        this.defaultValue = master.defaultValue || '';
        this.parentId = master.parentId || 0;
        this.masters = master.masters || [];
    }
}


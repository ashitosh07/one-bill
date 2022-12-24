export class MasterDetails 
{
    id: number;
    description: string;
    defaultValue: string;
    parentId: number;
    parentName: string;
    mode: number;    
    modeName: string;
    sequence: number;

    constructor(masterDetails) 
    {
        this.id = masterDetails.id || 0;
        this.description = masterDetails.description || '';
        this.defaultValue = masterDetails.defaultValue || '1';
        this.parentId = masterDetails.parentId || 0;
        this.parentName = masterDetails.parentName || '';
        this.mode = masterDetails.mode || 0;
        this.modeName = masterDetails.modeName || '';
        this.sequence = masterDetails.sequence || 0;
    }
}
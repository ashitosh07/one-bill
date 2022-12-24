export class MetadataUtilityType {
    id: number;
    description: string;

    constructor(utility) {
        this.id = utility.id;
        this.description = utility.description;
        
    }
}

export class MetadataProjects {
    id: number;
    description: string;

    constructor(projects) {
        this.id = projects.id || '';
        this.description = projects.description || '';
        
    }
}
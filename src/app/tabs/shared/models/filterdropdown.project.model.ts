export class FilterDropDownProject{
    id:number;
    description:string;

    constructor(project){
        
        this.id=project.id || '';
        this.description=project.description || '';
    }
}
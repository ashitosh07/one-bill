export class FilterDropDownFloor{
    id:number;
    description:string;

    constructor(floor){
        
        this.id=floor.id || '';
        this.description=floor.description || '';
    }
}
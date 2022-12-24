export class FilterDropDownUnit{
    id:number;
    description:string;

    constructor(unit){
        
        this.id=unit.id || '';
        this.description=unit.description || '';
    }
}
export class FilterDropDownBlock{
    id:number;
    description:string;

    constructor(block){
        
        this.id=block.id || '';
        this.description=block.description || '';
    }
}
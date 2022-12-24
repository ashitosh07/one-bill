export class FilterDropDownClient{
    id:number;
    description:string;

    constructor(client){
        this.id=client.id || '';
        this.description=client.description || '';
    }
}
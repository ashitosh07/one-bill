import { FilterDropDownBlock } from './filterdropdown.block.model';
import { FilterDropDownClient } from './filterdropdown.clients.model';
import { FilterDropDownProject } from "./filterdropdown.project.model";
import { FilterDropDownBuilding } from "./filterdropdown.building.model";
import {  FilterDropDownFloor } from "./filterdropdown.floor.model";
import { FilterDropDownUnit  } from "./filterdropdown.unit.model";
export class UserFilter{
    id:number;
    clientId:number;
    projectId:number;
    blockId:number;
    buildingId:number;
    floorId:number;
    unitTypeId:number;
    userId:number;

    clients:FilterDropDownClient[];
    projects:FilterDropDownProject[];
    blocks:FilterDropDownBlock[];
    buildings:FilterDropDownBuilding[];
    floors:FilterDropDownFloor[];
    units:FilterDropDownUnit[];

    constructor(userfilter)
    {
        this.id=userfilter.id;
        this.clientId=userfilter.clientId;
        this.projectId=userfilter.projectId;
        this.blockId=userfilter.blockId;
        this.buildingId=userfilter.buildingId;
        this.floorId=userfilter.floorId;
        this.unitTypeId=userfilter.unitTypeId;
        this.userId=userfilter.userId;
        

        this.clients = (userfilter.clients || []).map(client => new FilterDropDownClient(client));
        this.projects = (userfilter.projects || []).map(project => new FilterDropDownProject(project));
        this.buildings = (userfilter.buildings || []).map(building => new FilterDropDownBuilding(building));
        this.blocks = (userfilter.blocks || []).map(block => new FilterDropDownBlock(block));
        this.floors = (userfilter.floors || []).map(floor => new FilterDropDownFloor(floor));
        this.units = (userfilter.units || []).map(unit => new FilterDropDownUnit(unit));

    
    }

}
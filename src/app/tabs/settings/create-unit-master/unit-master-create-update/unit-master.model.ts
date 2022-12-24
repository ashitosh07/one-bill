import { UnitUtility } from '../../../shared/models/utilities.model';

export class UnitMaster {
  id: number;
  unitNumber: string;
  aliasName: string;
  posession: string;
  clientId: number;
  // projectId: number;
  // projectName: string;
  // blockId: number;
  // blockName: string;
  // buildingId: number;
  // buildingName: string;
  // floorId: number;
  // floorNumber: string;
  tenantId: number;
  meterNumber: string;
  ownerName: string;
  tenantName: string;
  unitTypeId: number;
  unitType: string;
  areaSqFt: number;
  capacityTon: number;
  accountNumber: string;
  isDeleted: boolean;
  unitUtilityList: UnitUtility[];

  constructor(unit) {
    this.id = unit.id || 0;
    this.unitNumber = unit.unitNumber || '';
    this.aliasName = unit.aliasName || '';
    this.posession = unit.posession || '';
    this.clientId = unit.clientId || 1;
    // this.projectId = unit.projectId || 0;
    // this.projectName = unit.projectName || '';
    // this.blockId = unit.blockId || 0;
    // this.blockName = unit.blockName || '';      
    // this.buildingId = unit.buildingId || 0;
    // this.buildingName = unit.buildingName || '';
    // this.floorId = unit.floorId || 0;
    // this.floorNumber = unit.floorNumber || '';
    this.tenantId = unit.tenantId || 0;
    this.meterNumber = unit.meterNumber || '';
    this.ownerName = unit.ownerName || '';
    this.tenantName = unit.tenantName || '';
    this.unitTypeId = unit.unitTypeId || 0;
    this.unitType = unit.unitType || '';
    this.areaSqFt = unit.areaSqFt || 0;
    this.capacityTon = unit.capacityTon || 0;
    this.accountNumber = unit.accountNumber || '';
    this.isDeleted = unit.isDeleted || false;
    this.unitUtilityList = (unit.unitUtilityList || []).map(utility => new UnitUtility(utility));
  }
}
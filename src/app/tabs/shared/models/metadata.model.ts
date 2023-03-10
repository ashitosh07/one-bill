import { MetadataCountry } from './metadata.country.model';
import { MetadataDocumentType } from './metadata.document-type.model';
import { MetadataTitle } from './metadata.title.model';
import { MetadataTenant } from 'src/app/tabs/shared/models/metada.tenant.model';
import { MetadataUnit } from 'src/app/tabs/shared/models/metadata.unit.model';
import { MetadataUtilityType } from 'src/app/tabs/shared/models/metadata.utility-type.model';
import { MetadataContractType } from 'src/app/tabs/shared/models/metadata.contract-type.model';
import { MetadataBillFormat } from 'src/app/tabs/shared/models/metadata.bill-format.model';
import { MetadataBillFormula } from 'src/app/tabs/shared/models/metadata.bill-formula.model';
import { MetadataAddressType } from './metadata.address-type.model';
import { MetadataBuildings } from './metadata.buildings.model';
import { MetadataProjects } from './metadata.projects.model';
import { MetadataFloors } from './metadata.floors.model';
import { MetadataBlocks } from './metadata.blocks.model';
import { MetadataUnitTypes } from './metadata.unit-type.model';
import { MetadataMeter } from './metadata.meter.model';
import { MetadataBillAmountType } from './metadata.billamount-type.model';
import {  MetadataCurrencyTypes } from './metadata.currency.model';
import {  MetadataBillPeriodTypes } from './metadata.billperiod-type.model';
import {  MetadataWeekDays } from './metadata.weekdays.model';
import { MetadataBillSettings } from './metadata.bill-settings.model';
import { MetadataBillPeriod } from './metadata.bill-period.model';
import { MetadataAccountHead } from './metadata.account-head.model';
import { MetadataBillHeadTypes } from "./metadata.billhead-types.model";
import { MetadataTariffs } from "./metadata.tariffs.model";
import { MetadataBillHeads } from "./metadata.billheads.model";
import { MetadataDeviceStatus } from './metadata.device-status.model';
import { MetadataAvailableDevices } from './metadata.available-devices.model';
import { MetadataMode } from './metadata.mode.model';
import { MetadataStatus} from './metadata.status.model';
import { Role } from './role.model';
import { MetadataDateFormat } from '../models/metadata.date-format.model';
import { MetadataCurrencyDecimal } from './metadata.currency-decimal.model';
import { MetadataOwner } from '../models/metadata.owner.model';
import { MetadataOperator } from '../models/metadata.operator.model';
import { MetadataBillType } from '../../shared/models/metadata.bill-type.model';
import { MetadataVoucherType } from '../models/metadata.voucher-type.model';
import { MetadataBillingLedger } from '../models/metadata.billing-ledgers.model';
import { Master } from '../models/master.model';

export class Metadata {
    countries: MetadataCountry[];
    documentTypes: MetadataDocumentType[];
    titles: MetadataTitle[];
    tenants: MetadataTenant[];
    units: MetadataUnit[];
    utilityTypes: MetadataUtilityType[];
    contractTypes: MetadataContractType[];
    billFormats: MetadataBillFormat[];
    billFormulas: MetadataBillFormula[];
    addressTypes: MetadataAddressType[];
    buildings: MetadataBuildings[];
    projects: MetadataProjects[];
    floors: MetadataFloors[];
    blocks: MetadataBlocks[];
    unitTypes: MetadataUnitTypes[];
    meterTypes: MetadataMeter[];
    billAmountTypes: MetadataBillAmountType[];
    currencyTypes: MetadataCurrencyTypes[];
    billPeriodTypes:MetadataBillPeriodTypes[];
    weekDays:MetadataWeekDays[];
    billSettings: MetadataBillSettings[];
    billPeriods: MetadataBillPeriod[];
    accountHeads: MetadataAccountHead[];
    billHeadTypes:MetadataBillHeadTypes[];
    tariffs:MetadataTariffs[];
    billHeads:MetadataBillHeads[];
    deviceStatus: MetadataDeviceStatus[];
    availableDevices: MetadataAvailableDevices[];
    modes: MetadataMode[];
    roles:Role[];
    dateFormats: MetadataDateFormat[];
    currencyDecimal: MetadataCurrencyDecimal[];
    status:MetadataStatus[];
    owners: MetadataOwner[];
    operators: MetadataOperator[];
    billTypes: MetadataBillType[];
    voucherTypes: MetadataVoucherType[];
    billingLedgers: MetadataBillingLedger[];
    designations: Master[];

    constructor(metadata) {
        this.countries = (metadata.countries || []).map(country => new MetadataCountry(country));
        this.documentTypes = (metadata.documentTypes || []).map(documentType => new MetadataDocumentType(documentType));
        this.titles = (metadata.titles || []).map(title => new MetadataTitle(title));
        this.tenants = (metadata.tenants || []).map(tenant => new MetadataTenant(tenant));
        this.units = (metadata.units || []).map(unit => new MetadataUnit(unit));
        this.utilityTypes = (metadata.utilityTypes || []).map(utilityType => new MetadataUtilityType(utilityType));
        this.contractTypes = (metadata.contractTypes || []).map(contractType => new MetadataContractType(contractType));
        this.billFormats = (metadata.billFormats || []).map(billFormat => new MetadataBillFormat(billFormat));
        this.billFormulas = (metadata.billFormulas || []).map(billFormula => new MetadataBillFormula(billFormula));
        this.addressTypes = (metadata.addressTypes || []).map(addressType => new MetadataAddressType(addressType));
        this.buildings = (metadata.buildings || []).map(building => new MetadataBuildings(building));
        this.projects = (metadata.projects || []).map(project => new MetadataProjects(project));
        this.floors = (metadata.floors || []).map(floor => new MetadataFloors(floor));
        this.blocks = (metadata.blocks || []).map(block => new MetadataBlocks(block));
        this.unitTypes = (metadata.unitTypes || []).map(unitType => new MetadataUnitTypes(unitType));
        this.meterTypes = (metadata.meterTypes || []).map(meter => new MetadataMeter(meter));
        this.billAmountTypes=(metadata.billAmountTypes || []).map(billAmountType => new MetadataBillAmountType(billAmountType));
        this.currencyTypes=(metadata.currencyTypes || []).map(currencyType => new MetadataCurrencyTypes(currencyType));
        this.billPeriodTypes=(metadata.billPeriodTypes || []).map(billPeriodType => new MetadataBillPeriodTypes(billPeriodType));
        this.weekDays=(metadata.weekDays || []).map(weekDay => new MetadataWeekDays(weekDay));
        this.billSettings = (metadata.billSettings || []).map(billSetting => new MetadataBillSettings(billSetting));
        this.billPeriods = (metadata.billPeriods || []).map(billPeriod => new MetadataBillPeriod(billPeriod));
        this.accountHeads = (metadata.accountHeads || []).map(accountHead => new MetadataAccountHead(accountHead));
        this.billHeadTypes=(metadata.billHeadTypes || []).map(billHeadType => new MetadataBillHeadTypes(billHeadType));
        this.tariffs=(metadata.tariffs || []).map(tariff => new MetadataTariffs(tariff));
   		this.billHeads=(metadata.billHeads || []).map(billHead => new MetadataBillHeads(billHead));
        this.deviceStatus = (metadata.deviceStatus || []).map(deviceStatus => new MetadataDeviceStatus(deviceStatus));
        this.availableDevices = (metadata.availableDevices || []).map(availableDevice => new MetadataAvailableDevices(availableDevice));
        this.modes = (metadata.modes || []).map(mode => new MetadataMode(mode)); 
        this.roles = (metadata.roles || []).map(role => new Role(role)); 
        this.dateFormats = (metadata.dateFormats || []).map(dateFormat => new MetadataDateFormat(dateFormat)); 
        this.currencyDecimal = (metadata.currencyDecimal || []).map(currencyDecimal => new MetadataCurrencyDecimal(currencyDecimal)); 
        this.status = (metadata.status || []).map(status => new MetadataStatus(status)); 
        this.owners = (metadata.owners || []).map(owner => new MetadataOwner(owner));
        this.operators = (metadata.operators || []).map(operator => new MetadataOperator(operator));
        this.billTypes = (metadata.billTypes || []).map(billType => new MetadataBillType(billType));
        this.voucherTypes = (metadata.voucherTypes || []).map(voucherType => new MetadataVoucherType(voucherType));
        this.billingLedgers = (metadata.billingLedgers || []).map(billingLedger => new MetadataBillingLedger(billingLedger));
        this.designations = (metadata.designations || []).map(designation => new Master(designation));
    }
}